import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener todas las categorías con conteo de productos
    const categorias = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
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
      'Color',
      'Productos Asociados',
      'Fecha Creación',
      'Fecha Actualización'
    ];

    const csvRows = categorias.map(categoria => [
      categoria.id,
      `"${categoria.name}"`,
      `"${categoria.description || ''}"`,
      categoria.color,
      categoria._count.products,
      new Date(categoria.createdAt).toLocaleDateString('es-ES'),
      new Date(categoria.updatedAt).toLocaleDateString('es-ES')
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
        'Content-Disposition': `attachment; filename="categorias_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error al exportar categorías:', error);
    return NextResponse.json(
      { error: 'Error al exportar categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { format } = await request.json();

    // Obtener todas las categorías con conteo de productos
    const categorias = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (format === 'json') {
      // Exportar como JSON
      const jsonData = categorias.map(categoria => ({
        id: categoria.id,
        nombre: categoria.name,
        descripcion: categoria.description,
        color: categoria.color,
        productosAsociados: categoria._count.products,
        fechaCreacion: categoria.createdAt,
        fechaActualizacion: categoria.updatedAt,
        estado: categoria._count.products > 0 ? 'Activa' : 'Sin productos',
        actividad: categoria._count.products === 0 ? 'Sin actividad' :
                   categoria._count.products <= 2 ? 'Baja actividad' :
                   categoria._count.products <= 5 ? 'Actividad media' : 'Alta actividad'
      }));

      const response = new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="categorias_${new Date().toISOString().split('T')[0]}.json"`,
        },
      });

      return response;
    }

    // Por defecto, exportar como CSV
    return GET();
  } catch (error) {
    console.error('Error al exportar categorías:', error);
    return NextResponse.json(
      { error: 'Error al exportar categorías' },
      { status: 500 }
    );
  }
}
