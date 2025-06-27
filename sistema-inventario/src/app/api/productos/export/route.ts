import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener todos los productos con sus categorías
    const productos = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Convertir a formato CSV
    const csvHeaders = [
      'ID',
      'Nombre',
      'Descripción',
      'SKU',
      'Precio',
      'Costo',
      'Stock',
      'Stock Mínimo',
      'Categoría',
      'Color Categoría',
      'Fecha Creación',
      'Fecha Actualización'
    ];

    const csvRows = productos.map(producto => [
      producto.id,
      `"${producto.name}"`,
      `"${producto.description || ''}"`,
      producto.sku,
      producto.price,
      producto.cost,
      producto.stock,
      producto.minStock,
      `"${producto.category?.name || 'Sin categoría'}"`,
      producto.category?.color || '',
      new Date(producto.createdAt).toLocaleDateString('es-ES'),
      new Date(producto.updatedAt).toLocaleDateString('es-ES')
    ]);

    // Crear contenido CSV
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Crear respuesta con headers para descarga
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="productos_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error al exportar productos:', error);
    return NextResponse.json(
      { error: 'Error al exportar productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { format } = await request.json();

    // Obtener todos los productos con sus categorías
    const productos = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (format === 'json') {
      // Exportar como JSON
      const jsonData = productos.map(producto => ({
        id: producto.id,
        nombre: producto.name,
        descripcion: producto.description,
        sku: producto.sku,
        precio: producto.price,
        costo: producto.cost,
        stock: producto.stock,
        stockMinimo: producto.minStock,
        categoria: producto.category?.name || 'Sin categoría',
        colorCategoria: producto.category?.color || '',
        fechaCreacion: producto.createdAt,
        fechaActualizacion: producto.updatedAt,
        margen: ((producto.price - producto.cost) / producto.price * 100).toFixed(2) + '%',
        valorTotal: (producto.stock * producto.price).toFixed(2),
        estado: producto.stock === 0 ? 'Sin Stock' : 
                producto.stock <= producto.minStock ? 'Stock Bajo' : 'En Stock'
      }));

      const response = new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="productos_${new Date().toISOString().split('T')[0]}.json"`,
        },
      });

      return response;
    }

    // Por defecto, exportar como CSV
    return GET();
  } catch (error) {
    console.error('Error al exportar productos:', error);
    return NextResponse.json(
      { error: 'Error al exportar productos' },
      { status: 500 }
    );
  }
}
