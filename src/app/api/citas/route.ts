import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// --- Interfaces para los datos que tu aplicación espera ---
interface Cita {
  id: string;
  title: string;
  start: string;
  end: string;
  barberId: string;
  sedeId: string;
  services: string;
  totalCost: string;
  clienteId: string;
}

// --- Interfaces temporales para leer los CSV con sus nombres de columna reales ---
interface BarberoFromCSV {
  ID_Barbero: string;
  Nombre_Barbero: string;
  Apellido_Barbero: string;
}

interface ServicioFromCSV {
  ID_Servicio: string;
  Nombre_Servicio: string;
}

// --- Función para leer cualquier archivo CSV ---
const readCsvFile = async (fileName: string): Promise<any[]> => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    await fs.stat(filePath);
    const fileContent = await fs.readFile(filePath, 'utf8');
    if (fileContent.trim() === '') return [];
    const records = parse(fileContent, { columns: true, skip_empty_lines: true, cast: true });
    return records;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`El archivo ${fileName} no existe...`);
      return [];
    }
    console.error(`Error al leer el archivo ${fileName}:`, error);
    throw error;
  }
};

// --- Función para escribir en los archivos CSV ---
const writeCsvFile = async (fileName: string, data: Cita[]) => {
  const filePath = path.join(process.cwd(), 'src', 'data', fileName);
  const csvString = stringify(data, {
    header: true,
    columns: ['id', 'title', 'start', 'end', 'barberId', 'sedeId', 'services', 'totalCost', 'clienteId'],
  });
  await fs.writeFile(filePath, csvString, 'utf8');
};


// --- FUNCIÓN GET COMPLETA Y CORREGIDA ---
export async function GET() {
  try {
    const [citas, barberosData, serviciosData] = await Promise.all([
      readCsvFile('nuevas_citas.csv') as Promise<Cita[]>,
      readCsvFile('barberos.csv') as Promise<BarberoFromCSV[]>,
      readCsvFile('servicios.csv') as Promise<ServicioFromCSV[]>,
    ]);

    const barberosMap = new Map(barberosData.map(b => [b.ID_Barbero.toString(), `${b.Nombre_Barbero} ${b.Apellido_Barbero}`.trim()]));
    const serviciosMap = new Map(serviciosData.map(s => [s.ID_Servicio.toString(), s.Nombre_Servicio]));

    const citasEnriquecidas = citas.map(cita => {
      const nombreBarbero = barberosMap.get(cita.barberId.toString()) || `Barbero Desconocido`;
      
      let serviciosInfo: { id: string; nombre: string }[] = [];
      
      if (cita.services && cita.services.trim() !== '') {
        // --- Lógica robusta para limpiar los IDs de servicio ---
        let serviciosIds: string[] = [];
        const servicesString = cita.services.toString();

        try {
          // Intenta interpretar el string como JSON (ej: ["201"])
          const parsed = JSON.parse(servicesString);
          if (Array.isArray(parsed)) {
            serviciosIds = parsed.map(String);
          } else {
            serviciosIds = [String(parsed)];
          }
        } catch (e) {
          // Si no es JSON (ej: "201,202"), lo separa por comas
          serviciosIds = servicesString.split(',').map(id => id.trim());
        }

        // Busca cada ID limpio en el mapa de servicios
        serviciosInfo = serviciosIds.map(id => ({
          id: id,
          nombre: serviciosMap.get(id) || `Servicio (ID: ${id}) No Encontrado`
        }));
      }

      return {
        ...cita,
        title: `Cliente ID: ${cita.clienteId}`,
        barberoInfo: {
          id: cita.barberId,
          nombre: nombreBarbero
        },
        serviciosInfo: serviciosInfo // Garantiza que siempre sea un array
      };
    });
    
    return NextResponse.json(citasEnriquecidas);

  } catch (error) {
    console.error('Error en GET /api/citas:', error);
    return NextResponse.json({ message: 'Error al procesar los datos de las citas' }, { status: 500 });
  }
}


// --- El resto de funciones (POST, PUT, DELETE) no cambian ---
export async function POST(request: Request) {
    try {
      const newAppointmentData = await request.json();
      const requiredFields: (keyof Cita)[] = ['title', 'start', 'end', 'barberId', 'sedeId', 'services', 'totalCost', 'clienteId'];
      for (const field of requiredFields) {
        if (!newAppointmentData[field]) {
          return NextResponse.json({ message: `Dato requerido faltante: ${field}` }, { status: 400 });
        }
      }
      const existingAppointments = await readCsvFile('nuevas_citas.csv');
      const newAppointment: Cita = {
        id: `cita_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ...newAppointmentData,
      };
      const updatedAppointments = [...existingAppointments, newAppointment];
      await writeCsvFile('nuevas_citas.csv', updatedAppointments);
      return NextResponse.json({ message: 'Cita guardada con éxito', data: newAppointment }, { status: 201 });
    } catch (error) {
      console.error('Error en POST /api/citas:', error);
      return NextResponse.json({ message: 'Error al guardar la nueva cita' }, { status: 500 });
    }
}
  
export async function PUT(request: Request) {
    try {
      const { id, ...updatedData } = await request.json();
      if (!id) {
        return NextResponse.json({ message: 'El ID de la cita es requerido para actualizar' }, { status: 400 });
      }
      let appointmentFound = false;
      let fileToUpdate: 'citas.csv' | 'nuevas_citas.csv' | null = null;
      let allAppointments: Cita[] = [];
      let newAppointments = await readCsvFile('nuevas_citas.csv') as Cita[];
      let appointmentIndex = newAppointments.findIndex(cita => cita.id === id);
      if (appointmentIndex !== -1) {
        newAppointments[appointmentIndex] = { ...newAppointments[appointmentIndex], ...updatedData };
        appointmentFound = true;
        fileToUpdate = 'nuevas_citas.csv';
        allAppointments = newAppointments;
      } else {
        let historicalAppointments = await readCsvFile('citas.csv') as Cita[];
        appointmentIndex = historicalAppointments.findIndex(cita => cita.id === id);
        if (appointmentIndex !== -1) {
          historicalAppointments[appointmentIndex] = { ...historicalAppointments[appointmentIndex], ...updatedData };
          appointmentFound = true;
          fileToUpdate = 'citas.csv';
          allAppointments = historicalAppointments;
        }
      }
      if (appointmentFound && fileToUpdate) {
        await writeCsvFile(fileToUpdate, allAppointments);
        return NextResponse.json({ message: 'Cita actualizada con éxito', data: allAppointments[appointmentIndex] });
      } else {
        return NextResponse.json({ message: `No se encontró la cita con ID ${id}` }, { status: 404 });
      }
    } catch (error) {
      console.error('Error en PUT /api/citas:', error);
      return NextResponse.json({ message: 'Error al actualizar la cita' }, { status: 500 });
    }
}
  
export async function DELETE(request: Request) {
    try {
      const { id } = await request.json();
      if (!id) {
        return NextResponse.json({ message: 'El ID de la cita es requerido para eliminar' }, { status: 400 });
      }
      let appointmentFound = false;
      let fileToUpdate: 'citas.csv' | 'nuevas_citas.csv' | null = null;
      let appointmentsAfterDeletion: Cita[] = [];
      const newAppointments = await readCsvFile('nuevas_citas.csv') as Cita[];
      const filteredNew = newAppointments.filter(cita => cita.id !== id);
      if (filteredNew.length < newAppointments.length) {
        appointmentFound = true;
        fileToUpdate = 'nuevas_citas.csv';
        appointmentsAfterDeletion = filteredNew;
      } else {
        const historicalAppointments = await readCsvFile('citas.csv') as Cita[];
        const filteredHistorical = historicalAppointments.filter(cita => cita.id !== id);
        if (filteredHistorical.length < historicalAppointments.length) {
          appointmentFound = true;
          fileToUpdate = 'citas.csv';
          appointmentsAfterDeletion = filteredHistorical;
        }
      }
      if (appointmentFound && fileToUpdate) {
        await writeCsvFile(fileToUpdate, appointmentsAfterDeletion);
        return NextResponse.json({ message: `Cita con ID ${id} eliminada con éxito` });
      } else {
        return NextResponse.json({ message: `No se encontró la cita con ID ${id} para eliminar` }, { status: 404 });
      }
    } catch (error) {
      console.error('Error en DELETE /api/citas:', error);
      return NextResponse.json({ message: 'Error al eliminar la cita' }, { status: 500 });
    }
}