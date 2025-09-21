// src/app/api/contact/route.ts

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';

// Definimos la estructura de los datos que vamos a guardar
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string; // Para saber cuándo se recibió
}

const csvFilePath = path.join(process.cwd(), 'src', 'data', 'contactanos.csv');

// --- Handler para POST ---
// Recibe un nuevo mensaje y lo añade al archivo contactanos.csv
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, message } = data;

    // Validación simple para asegurarnos de que los datos llegaron
    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Nombre, email y mensaje son requeridos.' }, { status: 400 });
    }

    const newMessage: ContactMessage = {
      id: `msg_${Date.now()}`,
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
    };

    // Preparamos la línea que se añadirá al CSV
    const csvRow = stringify([newMessage], {
      // Si el archivo ya existe, no añadimos la cabecera de nuevo
      header: false, 
      columns: ['id', 'name', 'email', 'message', 'timestamp'],
    });

    // Verificamos si el archivo existe para crear la cabecera si es necesario
    try {
      await fs.access(csvFilePath);
    } catch {
      // El archivo no existe, lo creamos y le ponemos la cabecera
      const header = stringify([], {
        header: true,
        columns: ['id', 'name', 'email', 'message', 'timestamp'],
      });
      await fs.writeFile(csvFilePath, header, 'utf8');
    }

    // Usamos 'appendFile' para añadir la nueva línea sin borrar las anteriores
    await fs.appendFile(csvFilePath, csvRow, 'utf8');

    return NextResponse.json({ message: 'Mensaje guardado con éxito' }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/contact:', error);
    return NextResponse.json({ message: 'Error al guardar el mensaje' }, { status: 500 });
  }
}