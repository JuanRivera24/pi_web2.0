
// En: /app/api/gallery/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idToUpdate = parseInt(params.id);
    const { description, category } = await request.json();

    const fileContent = await fs.readFile(csvFilePath, 'utf8');
    const parsed = Papa.parse<CsvRow>(fileContent, { header: true, skipEmptyLines: true });
    
    let updated = false;
    const updatedData = parsed.data.map((row) => {
      if (parseInt(row.id) === idToUpdate) {
        updated = true;
        return { ...row, description, category };
      }
      return row;
    });

    if (!updated) {
      return NextResponse.json({ message: 'ID de imagen no encontrado' }, { status: 404 });
    }

    const newCsvContent = Papa.unparse(updatedData, { header: true });
    await fs.writeFile(csvFilePath, newCsvContent, 'utf8');

    const updatedRow = updatedData.find((row) => parseInt(row.id) === idToUpdate);
    return NextResponse.json(updatedRow);

  } catch (error) {
    console.error(`Error en PUT /api/gallery/${params.id}:`, error);
    return NextResponse.json({ message: 'Error al actualizar los datos' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idToDelete = parseInt(params.id);

    const fileContent = await fs.readFile(csvFilePath, 'utf8');
    const parsed = Papa.parse<CsvRow>(fileContent, { header: true, skipEmptyLines: true });

    const imageToDelete = parsed.data.find((row) => parseInt(row.id) === idToDelete);

    if (!imageToDelete) {
      return NextResponse.json({ message: 'Imagen no encontrada para eliminar' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public/gallery', imageToDelete.fileName);
    try {
        await fs.unlink(filePath);
    } catch (fileError) {
        console.warn(`No se pudo borrar el archivo de imagen ${filePath}. Puede que ya no existiera.`);
    }

    const remainingData = parsed.data.filter((row) => parseInt(row.id) !== idToDelete);
    const newCsvContent = Papa.unparse(remainingData, { header: true });
    await fs.writeFile(csvFilePath, newCsvContent, 'utf8');

    return NextResponse.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error(`Error en DELETE /api/gallery/${params.id}:`, error);
    return NextResponse.json({ message: 'Error al eliminar la imagen' }, { status: 500 });
  }
}