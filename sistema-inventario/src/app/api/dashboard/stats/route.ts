import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Obtener productos con stock bajo o sin stock
    const lowStockProductsList = await prisma.product.findMany({
      where: {
        stock: {
          lte: 10 // Consideramos stock bajo si es <= 10
        }
      },
      include: {
        category: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        stock: 'asc'
      },
      take: 10
    });

    // Obtener movimientos recientes
    const recentMovementsList = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true
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
      totalInventoryValue: totalInventoryValue._sum.price || 0,
      lowStockProductsList,
      recentMovementsList: recentMovementsList.map(movement => ({
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason || 'Sin especificar',
        createdAt: movement.createdAt.toISOString(),
        product: {
          name: movement.product.name,
          sku: movement.product.sku
        },
        user: {
          name: 'Sistema'
        }
      })),
      categoryDistribution: categoryDistribution.map(category => ({
        name: category.name,
        count: category._count.products,
        color: category.color || '#6366f1'
      }))
    };

    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
