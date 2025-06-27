import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Aplicar los mismos filtros que en la consulta principal
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const productId = searchParams.get('productId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        {
          reason: {
            contains: search
          }
        },
        {
          product: {
            name: {
              contains: search
            }
          }
        },
        {
          product: {
            sku: {
              contains: search
            }
          }
        }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (productId) {
      where.productId = productId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Obtener todos los movimientos que coincidan con los filtros
    const movimientos = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convertir a formato CSV
    const csvHeaders = [
      'ID',
      'Fecha',
      'Tipo',
      'Producto',
      'SKU',
      'Categoría',
      'Cantidad',
      'Razón',
      'Referencia',
      'Notas',
      'Creado Por'
    ];

    const csvRows = movimientos.map(movimiento => [
      movimiento.id,
      new Date(movimiento.createdAt).toLocaleString('es-ES'),
      movimiento.type === 'IN' ? 'Entrada' : 
      movimiento.type === 'OUT' ? 'Salida' : 'Ajuste',
      `"${movimiento.product.name}"`,
      movimiento.product.sku,
      `"${movimiento.product.category?.name || 'Sin categoría'}"`,
      movimiento.quantity,
      `"${movimiento.reason}"`,
      `"${movimiento.reference || ''}"`,
      `"${movimiento.notes || ''}"`,
      `"${movimiento.createdBy || 'Sistema'}"`
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
        'Content-Disposition': `attachment; filename="movimientos_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error al exportar movimientos:', error);
    return NextResponse.json(
      { error: 'Error al exportar movimientos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { format, filters } = await request.json();

    // Construir filtros desde el cuerpo de la petición
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        {
          reason: {
            contains: filters.search
          }
        },
        {
          product: {
            name: {
              contains: filters.search
            }
          }
        },
        {
          product: {
            sku: {
              contains: filters.search
            }
          }
        }
      ];
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Obtener movimientos
    const movimientos = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'json') {
      // Exportar como JSON
      const jsonData = movimientos.map(movimiento => ({
        id: movimiento.id,
        fecha: movimiento.createdAt,
        tipo: movimiento.type === 'IN' ? 'Entrada' : 
              movimiento.type === 'OUT' ? 'Salida' : 'Ajuste',
        tipoOriginal: movimiento.type,
        producto: {
          id: movimiento.product.id,
          nombre: movimiento.product.name,
          sku: movimiento.product.sku,
          categoria: movimiento.product.category?.name || 'Sin categoría'
        },
        cantidad: movimiento.quantity,
        razon: movimiento.reason,
        referencia: movimiento.reference,
        notas: movimiento.notes,
        creadoPor: movimiento.createdBy || 'Sistema',
        impactoStock: movimiento.type === 'IN' ? `+${movimiento.quantity}` :
                     movimiento.type === 'OUT' ? `-${movimiento.quantity}` :
                     `=${movimiento.quantity}`
      }));

      const response = new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="movimientos_${new Date().toISOString().split('T')[0]}.json"`,
        },
      });

      return response;
    }

    // Por defecto, exportar como CSV (reutilizar lógica del GET)
    return GET(request as NextRequest);
  } catch (error) {
    console.error('Error al exportar movimientos:', error);
    return NextResponse.json(
      { error: 'Error al exportar movimientos' },
      { status: 500 }
    );
  }
}
