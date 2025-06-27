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

    // Obtener todas las categorías para mapeo
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;

      try {
        // Parsear línea CSV (manejo básico de comillas)
        const values = [];
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
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header.toLowerCase()] = values[index] || '';
        });

        // Validar campos requeridos
        const nombre = rowData.nombre || rowData.name || '';
        const sku = rowData.sku || '';
        const precio = parseFloat(rowData.precio || rowData.price || '0');
        const costo = parseFloat(rowData.costo || rowData.cost || '0');
        const stock = parseInt(rowData.stock || '0');

        if (!nombre || !sku || precio <= 0 || costo <= 0) {
          results.errors++;
          results.details.push(`Fila ${i + 2}: Campos requeridos faltantes o inválidos`);
          continue;
        }

        // Verificar si el SKU ya existe
        const existingSku = await prisma.product.findUnique({
          where: { sku }
        });

        if (existingSku) {
          results.skipped++;
          results.details.push(`Fila ${i + 2}: SKU "${sku}" ya existe, omitido`);
          continue;
        }

        // Buscar categoría
        const categoriaNombre = (rowData.categoria || rowData.category || '').toLowerCase();
        const categoryId = categoryMap.get(categoriaNombre) || null;

        // Crear producto
        const productData: any = {
          name: nombre,
          description: rowData.descripcion || rowData.description || null,
          sku,
          price: precio,
          cost: costo,
          stock,
          minStock: parseInt(rowData['stock mínimo'] || rowData['stock minimo'] || rowData.minstock || '5'),
        };

        // Solo agregar categoryId si existe
        if (categoryId) {
          productData.categoryId = categoryId;
        }

        await prisma.product.create({
          data: productData
        });

        // Crear movimiento de inventario inicial
        if (stock > 0) {
          await prisma.stockMovement.create({
            data: {
              type: 'IN',
              quantity: stock,
              reason: 'Importación masiva',
              productId: (await prisma.product.findUnique({ where: { sku } }))!.id,
              createdBy: 'sistema',
            }
          });
        }

        results.success++;
        results.details.push(`Fila ${i + 2}: Producto "${nombre}" importado exitosamente`);

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
    console.error('Error al importar productos:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo de importación' },
      { status: 500 }
    );
  }
}
