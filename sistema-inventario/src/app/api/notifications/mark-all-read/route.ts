import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { notificationService } from '@/lib/notification-service';

// PUT - Marcar todas las notificaciones como leídas
export async function PUT(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const result = await notificationService.markAllAsRead(user.id);

    return NextResponse.json({
      message: 'Todas las notificaciones marcadas como leídas',
      count: result.count,
    });
  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    return NextResponse.json(
      { error: 'Error al marcar todas las notificaciones como leídas' },
      { status: 500 }
    );
  }
}
