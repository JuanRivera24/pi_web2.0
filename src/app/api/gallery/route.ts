// En: /app/api/gallery/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import Papa from 'papaparse';

// --- RUTA CORREGIDA ---
const csvFilePath = path.join(process.cwd(), 'src', 'data', 'gallery.csv');

interface CsvRow {
  id: string;
  fileName: string;
  description: string;
  category: string;
}

export async function GET() {
  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf8');
    
    const parsedData = Papa.parse<CsvRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value, header) => {
        if (header === 'id') {
          return parseInt(value, 10);
        }
        return value;
      }
    });

    return NextResponse.json(parsedData.data.reverse());

  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json([]);
    }
    console.error("Error en GET /api/gallery:", error);
    return NextResponse.json({ message: 'Error al leer los datos de la galería' }, { status: 500 });
  }
}