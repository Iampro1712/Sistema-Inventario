import { NextRequest, NextResponse } from 'next/server';
import { checkAndNotifyStockAlerts, cleanupNotifications } from '@/lib/notification-helpers';

// POST - Ejecutar tareas programadas de notificaciones
export async function POST(request: NextRequest) {
  try {
    // Verificar que la petición viene de un cron job autorizado
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret-change-me';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('🕐 Ejecutando tareas programadas de notificaciones...');
    
    const results = {
      stockAlerts: false,
      cleanup: false,
      timestamp: new Date().toISOString(),
      errors: [] as string[]
    };

    // 1. Verificar alertas de stock
    try {
      await checkAndNotifyStockAlerts();
      results.stockAlerts = true;
      console.log('✅ Verificación de alertas de stock completada');
    } catch (error) {
      console.error('❌ Error en verificación de alertas de stock:', error);
      results.errors.push('Error en verificación de alertas de stock');
    }

    // 2. Limpiar notificaciones antiguas
    try {
      await cleanupNotifications();
      results.cleanup = true;
      console.log('✅ Limpieza de notificaciones completada');
    } catch (error) {
      console.error('❌ Error en limpieza de notificaciones:', error);
      results.errors.push('Error en limpieza de notificaciones');
    }

    console.log('🏁 Tareas programadas completadas');
    
    return NextResponse.json({
      message: 'Tareas programadas ejecutadas',
      results,
      success: results.errors.length === 0
    });

  } catch (error) {
    console.error('❌ Error en tareas programadas:', error);
    return NextResponse.json(
      { error: 'Error ejecutando tareas programadas' },
      { status: 500 }
    );
  }
}

// GET - Obtener estado del cron job
export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Obtener estadísticas de notificaciones
    const notificationStats = await prisma.notification.groupBy({
      by: ['type', 'status'],
      _count: {
        id: true
      }
    });

    // Obtener productos con alertas
    const lowStockCount = await prisma.product.count({
      where: {
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock
        }
      }
    });

    const outOfStockCount = await prisma.product.count({
      where: {
        isActive: true,
        stock: 0
      }
    });

    // Obtener configuración de alertas automáticas
    const autoAlertsConfig = await prisma.settings.findUnique({
      where: { key: 'inventory.autoAlerts' }
    });

    return NextResponse.json({
      status: 'active',
      lastRun: new Date().toISOString(),
      autoAlertsEnabled: autoAlertsConfig?.value ?? true,
      stats: {
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        totalNotifications: notificationStats.reduce((sum, stat) => sum + stat._count.id, 0),
        unreadNotifications: notificationStats
          .filter(stat => stat.status === 'UNREAD')
          .reduce((sum, stat) => sum + stat._count.id, 0)
      },
      notificationBreakdown: notificationStats
    });

  } catch (error) {
    console.error('Error obteniendo estado del cron:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estado' },
      { status: 500 }
    );
  }
}
