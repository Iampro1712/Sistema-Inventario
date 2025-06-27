import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || '6m';
    const categoria = searchParams.get('categoria');
    const tipo = searchParams.get('tipo');

    // Calcular fechas según el período
    const now = new Date();
    let startDate = new Date();
    
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

    // Procesar datos por mes
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const sales = await prisma.stockMovement.aggregate({
        where: {
          type: 'OUT',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          quantity: true
        }
      });

      const purchases = await prisma.stockMovement.aggregate({
        where: {
          type: 'IN',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          quantity: true
        }
      });

      monthlyData.push({
        month: monthName,
        sales: sales._sum.quantity || 0,
        purchases: purchases._sum.quantity || 0
      });
    }

    // Obtener distribución por categorías
    const categoryDistribution = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    const totalProducts = await prisma.product.count();
    const distributionData = categoryDistribution.map(cat => ({
      name: cat.name,
      value: cat._count.products,
      percentage: Math.round((cat._count.products / totalProducts) * 100),
      color: cat.color
    }));

    // Obtener productos más vendidos
    const topProducts = await prisma.stockMovement.groupBy({
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
      },
      take: 5
    });

    const topProductsData = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        
        return {
          name: product?.name || 'Producto desconocido',
          sales: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * (product?.price || 0),
          trend: Math.floor(Math.random() * 20 + 5) // Tendencia simulada por ahora
        };
      })
    );

    return NextResponse.json({
      salesData: monthlyData,
      categoryDistribution: distributionData,
      topProducts: topProductsData,
      periodo,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al obtener datos de reportes:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de reportes' },
      { status: 500 }
    );
  }
}
