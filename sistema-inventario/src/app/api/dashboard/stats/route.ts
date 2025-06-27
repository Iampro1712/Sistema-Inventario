import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener estadísticas básicas de forma simple
    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();
    const totalUsers = await prisma.user.count();
    const outOfStockProducts = await prisma.product.count({
      where: { stock: 0 }
    });

    const recentMovements = await prisma.stockMovement.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const totalInventoryValue = await prisma.product.aggregate({
      _sum: { price: true }
    });

    // Obtener productos con stock bajo
    const lowStockProductsList = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5 // Stock bajo si es menor o igual a 5
        }
      },
      include: {
        category: true
      },
      take: 5
    });

    // Obtener movimientos recientes
    const recentMovementsList = await prisma.stockMovement.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

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

    const stats = {
      totalProducts,
      totalCategories,
      totalUsers,
      lowStockProducts: lowStockProductsList.length,
      outOfStockProducts,
      recentMovements,
      totalInventoryValue: totalInventoryValue._sum.price || 0,
      lowStockProductsList,
      recentMovementsList: recentMovementsList.map((m: any) => ({
        ...m,
        user: { name: 'Sistema' } // Por ahora usuario fijo
      })),
      categoryDistribution
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
