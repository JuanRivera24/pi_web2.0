// src/app/api/citas/route.ts

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// --- Definimos la estructura de una Cita para mayor claridad ---
interface Cita {
  id: string;
  title: string;
  start: string;
  end: string;
  barberId: string;
  sedeId: string;
  services: string; // JSON string de los servicios
  totalCost: string;
  clienteId: string;
}

// --- Función para leer un archivo CSV y devolver sus registros ---
const readCsvFile = async (fileName: string): Promise<Cita[]> => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    await fs.stat(filePath); // Verifica si el archivo existe
    const fileContent = await fs.readFile(filePath, 'utf8');

    if (fileContent.trim() === '') {
      return []; // Archivo vacío
    }
    
    // Parseamos el contenido a un array de objetos
    const records: Cita[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      cast: true, // Intenta convertir tipos de datos automáticamente
    });

    return records;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Si el archivo no existe, lo tratamos como si estuviera vacío
      console.log(`El archivo ${fileName} no existe, se creará al guardar la primera cita.`);
      return [];
    }
    console.error(`Error al leer el archivo ${fileName}:`, error);
    throw error;
  }
};

// --- Handler para GET ---
// Lee las citas de ambos archivos (historial y nuevas) y las combina
export async function GET() {
  try {
    // Leemos las citas de ambos archivos en paralelo para más eficiencia
    const [historicalAppointments, newAppointments] = await Promise.all([
      readCsvFile('citas.csv'),
      readCsvFile('nuevas_citas.csv')
    ]);

    const allAppointments = [...historicalAppointments, ...newAppointments];
    
    return NextResponse.json(allAppointments);
  } catch (error) {
    console.error('Error en GET /api/citas:', error);
    return NextResponse.json({ message: 'Error al procesar los datos de citas' }, { status: 500 });
  }
}

// --- Handler para POST ---
// Guarda una nueva cita en el archivo nuevas_citas.csv
export async function POST(request: Request) {
  try {
    const newAppointmentData = await request.json();

    // --- Validación robusta de los datos recibidos ---
    const requiredFields: (keyof Cita)[] = ['title', 'start', 'end', 'barberId', 'sedeId', 'services', 'totalCost', 'clienteId'];
    
    for (const field of requiredFields) {
      // Verificamos que cada campo requerido exista y no esté vacío
      if (!newAppointmentData[field]) {
        return NextResponse.json({ message: `Dato requerido faltante: ${field}` }, { status: 400 });
      }
    }

    const filePath = path.join(process.cwd(), 'src', 'data', 'nuevas_citas.csv');
    
    // Leemos las citas que ya existen en el archivo
    const existingAppointments = await readCsvFile('nuevas_citas.csv');

    // Creamos la nueva cita con un ID único (timestamp + número aleatorio)
    const newAppointment: Cita = {
      id: `cita_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...newAppointmentData,
    };

    // Añadimos la nueva cita a la lista
    const updatedAppointments = [...existingAppointments, newAppointment];

    // Convertimos la lista completa de citas a formato CSV
    const csvString = stringify(updatedAppointments, {
      header: true, // Siempre escribimos el encabezado para asegurar la consistencia del archivo
      columns: ['id', 'title', 'start', 'end', 'barberId', 'sedeId', 'services', 'totalCost', 'clienteId'],
    });

    // Escribimos el archivo completo, sobrescribiendo el anterior
    await fs.writeFile(filePath, csvString, 'utf8');

    return NextResponse.json({ message: 'Cita guardada con éxito', data: newAppointment }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/citas:', error);
    return NextResponse.json({ message: 'Error al guardar la nueva cita' }, { status: 500 });
  }
}