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

    // Obtener todos los movimientos de una vez para optimizar
    const allMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        type: true,
        quantity: true,
        createdAt: true,
        productId: true
      }
    });

    // Procesar datos por mes usando los datos ya obtenidos
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthMovements = allMovements.filter(m => 
        m.createdAt >= monthStart && m.createdAt <= monthEnd
      );
      
      const sales = monthMovements
        .filter(m => m.type === 'OUT')
        .reduce((sum, m) => sum + (m.quantity || 0), 0);
        
      const purchases = monthMovements
        .filter(m => m.type === 'IN')
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      monthlyData.push({
        month: monthName,
        sales,
        purchases
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

    // Obtener productos más vendidos usando los datos ya obtenidos
    const salesMovements = allMovements.filter(m => m.type === 'OUT');
    const productSales = salesMovements.reduce((acc, movement) => {
       if (movement.productId) {
         acc[movement.productId] = (acc[movement.productId] || 0) + (movement.quantity || 0);
       }
       return acc;
     }, {} as Record<string, number>);

    const topProductIds = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    const topProductsData = topProductIds.length > 0 ? await Promise.all(
      topProductIds.map(async (productId) => {
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });
        
        return {
          name: product?.name || 'Producto desconocido',
          sales: productSales[productId] || 0,
          revenue: (productSales[productId] || 0) * (product?.price || 0),
          trend: Math.floor(Math.random() * 20 + 5) // Tendencia simulada por ahora
        };
      })
    ) : [];

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
