// src/app/api/citas/route.ts

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// --- La interfaz no cambia ---
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

// --- La función readCsvFile no cambia ---
const readCsvFile = async (fileName: string): Promise<Cita[]> => {
  // ... (tu código original aquí, no necesita cambios)
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    await fs.stat(filePath);
    const fileContent = await fs.readFile(filePath, 'utf8');
    if (fileContent.trim() === '') return [];
    const records: Cita[] = parse(fileContent, { columns: true, skip_empty_lines: true, cast: true });
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

// --- La función writeCsvFile no cambia ---
const writeCsvFile = async (fileName: string, data: Cita[]) => {
  // ... (tu código original aquí, no necesita cambios)
  const filePath = path.join(process.cwd(), 'src', 'data', fileName);
  const csvString = stringify(data, {
    header: true,
    columns: ['id', 'title', 'start', 'end', 'barberId', 'sedeId', 'services', 'totalCost', 'clienteId'],
  });
  await fs.writeFile(filePath, csvString, 'utf8');
};


// --- AQUÍ ESTÁ EL ÚNICO CAMBIO ---
// Lee SOLO las citas del archivo nuevas_citas.csv
export async function GET() {
  try {
    // Leemos únicamente el archivo de las nuevas citas.
    const newAppointments = await readCsvFile('nuevas_citas.csv');
    
    // Devolvemos directamente el contenido de ese archivo.
    return NextResponse.json(newAppointments);

  } catch (error) {
    console.error('Error en GET /api/citas:', error);
    return NextResponse.json({ message: 'Error al procesar los datos de las nuevas citas' }, { status: 500 });
  }
}
// --- FIN DEL CAMBIO ---


// --- El resto de funciones (POST, PUT, DELETE) no cambian ---
// --- y seguirán funcionando como antes. ---

export async function POST(request: Request) {
  // ... (tu código original aquí, no necesita cambios)
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
  // ... (tu código original aquí, no necesita cambios)
  try {
    const { id, ...updatedData } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'El ID de la cita es requerido para actualizar' }, { status: 400 });
    }
    let appointmentFound = false;
    let fileToUpdate: 'citas.csv' | 'nuevas_citas.csv' | null = null;
    let allAppointments: Cita[] = [];
    let newAppointments = await readCsvFile('nuevas_citas.csv');
    let appointmentIndex = newAppointments.findIndex(cita => cita.id === id);
    if (appointmentIndex !== -1) {
      newAppointments[appointmentIndex] = { ...newAppointments[appointmentIndex], ...updatedData };
      appointmentFound = true;
      fileToUpdate = 'nuevas_citas.csv';
      allAppointments = newAppointments;
    } else {
      let historicalAppointments = await readCsvFile('citas.csv');
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
  // ... (tu código original aquí, no necesita cambios)
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'El ID de la cita es requerido para eliminar' }, { status: 400 });
    }
    let appointmentFound = false;
    let fileToUpdate: 'citas.csv' | 'nuevas_citas.csv' | null = null;
    let appointmentsAfterDeletion: Cita[] = [];
    const newAppointments = await readCsvFile('nuevas_citas.csv');
    const filteredNew = newAppointments.filter(cita => cita.id !== id);
    if (filteredNew.length < newAppointments.length) {
      appointmentFound = true;
      fileToUpdate = 'nuevas_citas.csv';
      appointmentsAfterDeletion = filteredNew;
    } else {
      const historicalAppointments = await readCsvFile('citas.csv');
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