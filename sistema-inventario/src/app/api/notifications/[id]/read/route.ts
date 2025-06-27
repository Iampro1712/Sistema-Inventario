import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { notificationService } from '@/lib/notification-service';

// PUT - Marcar notificación como leída
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requirePermission(request, 'notifications.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const notificationId = params.id;

    const notification = await notificationService.markAsRead(notificationId, user.id);

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    return NextResponse.json(
      { error: 'Error al marcar notificación como leída' },
      { status: 500 }
    );
  }
}
