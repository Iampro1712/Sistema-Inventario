import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { checkAndNotifyStockAlerts } from '@/lib/notification-helpers';

// POST - Ejecutar verificación manual de alertas de stock
export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, 'inventory.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    console.log('🔍 Ejecutando verificación manual de alertas de stock...');
    
    // Ejecutar verificación de alertas
    await checkAndNotifyStockAlerts();
    
    return NextResponse.json({ 
      message: 'Verificación de alertas de stock completada exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en verificación de alertas:', error);
    return NextResponse.json(
      { error: 'Error al verificar alertas de stock' },
      { status: 500 }
    );
  }
}

// GET - Obtener estado de las alertas automáticas
export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, 'inventory.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Obtener productos con stock bajo o agotado
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock
        }
      },
      include: {
        category: true
      },
      orderBy: {
        stock: 'asc'
      }
    });

    const outOfStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: 0
      },
      include: {
        category: true
      }
    });

    // Obtener configuración de alertas automáticas
    const settings = await prisma.settings.findUnique({
      where: { key: 'inventory.autoAlerts' }
    });

    const autoAlertsEnabled = settings?.value ?? true;

    return NextResponse.json({
      autoAlertsEnabled,
      stats: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalAlertsCount: lowStockProducts.length + outOfStockProducts.length
      },
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: p.stock,
        minStock: p.minStock,
        category: p.category?.name || 'Sin categoría'
      })),
      outOfStockProducts: outOfStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || 'Sin categoría'
      }))
    });

  } catch (error) {
    console.error('Error obteniendo estado de alertas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de alertas' },
      { status: 500 }
    );
  }
}
