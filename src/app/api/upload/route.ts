// En: /app/api/upload/route.ts
import { writeFile, readFile, appendFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import Papa from 'papaparse';

// --- RUTA CORREGIDA ---
const csvFilePath = path.join(process.cwd(), 'src', 'data', 'gallery.csv');

async function getNextId(): Promise<number> {
    try {
        const fileContent = await readFile(csvFilePath, 'utf8');
        const parsedData = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
        if (parsedData.data.length === 0) return 1;
        const lastId = Math.max(...parsedData.data.map((row: any) => parseInt(row.id, 10)));
        return isFinite(lastId) ? lastId + 1 : 1;
    } catch (error) {
        return 1;
    }
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('image') as unknown as File;
  const description = data.get('description') as string;
  const category = data.get('category') as string;

  if (!file || !description || !category) {
    return NextResponse.json({ success: false, message: 'Faltan datos en el formulario' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const filePath = path.join(process.cwd(), 'public/gallery', fileName);
    await writeFile(filePath, buffer);

    const newRowData = {
        id: await getNextId(),
        fileName: fileName,
        description: description,
        category: category,
    };

    const newRowCsv = Papa.unparse([newRowData], { header: false }) + '\n';
    
    await appendFile(csvFilePath, newRowCsv, 'utf8');
    
    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error("Error en POST /api/upload:", error);
    return NextResponse.json({ success: false, message: 'Error en el servidor al subir la imagen' }, { status: 500 });
  }
}