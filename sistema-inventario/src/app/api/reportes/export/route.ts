import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'general';
    const formato = searchParams.get('formato') || 'json';
    const periodo = searchParams.get('periodo') || '6m';

    let data: any = {};

    switch (tipo) {
      case 'inventario':
        data = await exportInventario();
        break;
      case 'movimientos':
        data = await exportMovimientos(periodo);
        break;
      case 'valoracion':
        data = await exportValoracion();
        break;
      case 'criticos':
        data = await exportProductosCriticos();
        break;
      case 'ventas':
        data = await exportAnalisisVentas(periodo);
        break;
      case 'usuarios':
        data = await exportActividadUsuarios(periodo);
        break;
      case 'mensual':
        data = await exportReporteMensual();
        break;
      case 'rotacion':
        data = await exportRotacionInventario();
        break;
      default:
        data = await exportGeneral();
    }

    if (formato === 'csv') {
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      ...data,
      exportedAt: new Date().toISOString(),
      tipo,
      formato,
      tipoDisplay: getTipoDisplay(tipo)
    });

  } catch (error) {
    console.error('Error al exportar reporte:', error);
    return NextResponse.json(
      { error: 'Error al exportar reporte' },
      { status: 500 }
    );
  }
}

async function exportInventario() {
  const productos = await prisma.product.findMany({
    include: {
      category: true
    }
  });

  return {
    titulo: 'Inventario General',
    productos: productos.map(p => ({
      id: p.id,
      nombre: p.name,
      sku: p.sku,
      categoria: p.category?.name || 'Sin categoría',
      stock: p.stock,
      stockMinimo: p.minStock,
      precio: p.price,
      valorTotal: p.stock * p.price,
      estado: p.stock <= p.minStock ? 'Crítico' : p.stock <= p.minStock * 2 ? 'Bajo' : 'Normal'
    })),
    resumen: {
      totalProductos: productos.length,
      valorTotalInventario: productos.reduce((sum, p) => sum + (p.stock * p.price), 0),
      productosCriticos: productos.filter(p => p.stock <= p.minStock).length
    }
  };
}

async function exportMovimientos(periodo: string) {
  const startDate = getStartDate(periodo);
  
  const movimientos = await prisma.stockMovement.findMany({
    where: {
      createdAt: {
        gte: startDate
      }
    },
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

  return {
    titulo: 'Movimientos del Período',
    periodo,
    movimientos: movimientos.map(m => ({
      id: m.id,
      fecha: m.createdAt.toISOString(),
      tipo: m.type === 'IN' ? 'Entrada' : 'Salida',
      producto: m.product.name,
      sku: m.product.sku,
      categoria: m.product.category?.name || 'Sin categoría',
      cantidad: m.quantity,
      motivo: m.reason,
      usuario: 'Sistema'
    }))
  };
}

async function exportValoracion() {
  const productos = await prisma.product.findMany({
    include: {
      category: true
    }
  });

  const valorTotal = productos.reduce((sum, p) => sum + (p.stock * p.price), 0);
  
  return {
    titulo: 'Valoración de Stock',
    valorTotal,
    productos: productos.map(p => ({
      nombre: p.name,
      stock: p.stock,
      precio: p.price,
      valorIndividual: p.stock * p.price,
      categoria: p.category?.name || 'Sin categoría'
    })).sort((a, b) => b.valorIndividual - a.valorIndividual)
  };
}

async function exportProductosCriticos() {
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { stock: 0 },
        { stock: { lte: prisma.product.fields.minStock } }
      ]
    },
    include: {
      category: true
    }
  });

  return {
    titulo: 'Productos Críticos',
    productos: productos.map(p => ({
      nombre: p.name,
      sku: p.sku,
      categoria: p.category?.name || 'Sin categoría',
      stockActual: p.stock,
      stockMinimo: p.minStock,
      estado: p.stock === 0 ? 'Sin existencias' : 'Stock bajo',
      accionRequerida: p.stock === 0 ? 'Reposición urgente' : 'Revisar stock'
    }))
  };
}

async function exportAnalisisVentas(periodo: string) {
  const startDate = getStartDate(periodo);
  
  const ventas = await prisma.stockMovement.groupBy({
    by: ['productId'],
    where: {
      type: 'OUT',
      createdAt: {
        gte: startDate
      }
    },
    _sum: {
      quantity: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    }
  });

  const ventasDetalle = await Promise.all(
    ventas.map(async (v) => {
      const producto = await prisma.product.findUnique({
        where: { id: v.productId },
        include: { category: true }
      });
      
      return {
        producto: producto?.name || 'Desconocido',
        categoria: producto?.category?.name || 'Sin categoría',
        cantidadVendida: v._sum.quantity || 0,
        ingresos: (v._sum.quantity || 0) * (producto?.price || 0)
      };
    })
  );

  return {
    titulo: 'Análisis de Ventas',
    periodo,
    productos: ventasDetalle
  };
}

async function exportActividadUsuarios(periodo: string) {
  const startDate = getStartDate(periodo);
  
  const movimientos = await prisma.stockMovement.count({
    where: {
      createdAt: {
        gte: startDate
      }
    }
  });

  return {
    titulo: 'Actividad de Usuarios',
    periodo,
    totalMovimientos: movimientos,
    usuarios: [
      { nombre: 'Sistema', movimientos: movimientos }
    ]
  };
}

async function exportReporteMensual() {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const productos = await prisma.product.count();
  const movimientos = await prisma.stockMovement.count({
    where: {
      createdAt: {
        gte: inicioMes
      }
    }
  });

  return {
    titulo: 'Reporte Mensual',
    mes: inicioMes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
    resumen: {
      totalProductos: productos,
      movimientosDelMes: movimientos
    }
  };
}

async function exportRotacionInventario() {
  const categorias = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    }
  });

  return {
    titulo: 'Rotación de Inventario',
    categorias: categorias.map(c => ({
      categoria: c.name,
      totalProductos: c._count.products,
      rotacion: 'Media' // Simulado por ahora
    }))
  };
}

async function exportGeneral() {
  const inventario = await exportInventario();
  const valoracion = await exportValoracion();
  
  return {
    titulo: 'Reporte General',
    inventario: inventario.resumen,
    valoracion: {
      valorTotal: valoracion.valorTotal
    }
  };
}

function getStartDate(periodo: string): Date {
  const now = new Date();
  const startDate = new Date();
  
  switch (periodo) {
    case '1m':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3m':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 6);
  }
  
  return startDate;
}

function convertToCSV(data: any): string {
  // Implementación básica de conversión a CSV
  if (data.productos) {
    const headers = Object.keys(data.productos[0] || {});
    const csvHeaders = headers.join(',');
    const csvRows = data.productos.map((item: any) =>
      headers.map(header => `"${item[header] || ''}"`).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  }

  return JSON.stringify(data, null, 2);
}

function getTipoDisplay(tipo: string): string {
  const tipoMap: { [key: string]: string } = {
    'inventario': 'Inventario General',
    'movimientos': 'Movimientos del Período',
    'valoracion': 'Valoración de Stock',
    'criticos': 'Productos Críticos',
    'ventas': 'Análisis de Ventas',
    'usuarios': 'Actividad de Usuarios',
    'mensual': 'Reporte Mensual',
    'rotacion': 'Rotación de Inventario',
    'general': 'Reporte General'
  };

  return tipoMap[tipo] || 'Reporte';
}
