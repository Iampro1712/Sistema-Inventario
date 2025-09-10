import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'El archivo debe contener al menos una fila de datos' },
        { status: 400 }
      );
    }

    // Parsear CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(1);

    const results = {
      success: 0,
      errors: 0,
      skipped: 0,
      details: [] as string[]
    };

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;

      try {
        // Parsear línea CSV (manejo básico de comillas)
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        // Mapear valores a campos
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header.toLowerCase()] = values[index] || '';
        });

        // Validar campos requeridos
        const nombre = rowData.nombre || rowData.name || '';
        const color = rowData.color || '#3B82F6';

        if (!nombre) {
          results.errors++;
          results.details.push(`Fila ${i + 2}: Nombre es requerido`);
          continue;
        }

        // Verificar si el nombre ya existe
        const existingName = await prisma.category.findUnique({
          where: { name: nombre }
        });

        if (existingName) {
          results.skipped++;
          results.details.push(`Fila ${i + 2}: Categoría "${nombre}" ya existe, omitida`);
          continue;
        }

        // Validar formato de color (debe ser hexadecimal)
        const colorRegex = /^#[0-9A-F]{6}$/i;
        const finalColor = colorRegex.test(color) ? color : '#3B82F6';

        // Crear categoría
        await prisma.category.create({
          data: {
            name: nombre,
            description: rowData.descripcion || rowData.description || null,
            color: finalColor,
          }
        });

        results.success++;
        results.details.push(`Fila ${i + 2}: Categoría "${nombre}" importada exitosamente`);

      } catch (error) {
        results.errors++;
        results.details.push(`Fila ${i + 2}: Error al procesar - ${error}`);
      }
    }

    return NextResponse.json({
      message: 'Importación completada',
      results
    });

  } catch (error) {
    console.error('Error al importar categorías:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo de importación' },
      { status: 500 }
    );
  }
}
