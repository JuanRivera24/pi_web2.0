// src/app/api/citas/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'citas.csv');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error al leer el archivo citas.csv:', error);
    return NextResponse.json({ message: 'Error al procesar los datos de citas' }, { status: 500 });
  }
}