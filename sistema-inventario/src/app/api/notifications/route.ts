import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { notificationService } from '@/lib/notification-service';

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'UNREAD' | 'READ' | 'ARCHIVED' | null;
    const type = searchParams.get('type') as any;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const notifications = await notificationService.getUserNotifications(user.id, {
      status: status || undefined,
      type: type || undefined,
      limit,
      offset,
    });

    const unreadCount = await notificationService.getUnreadCount(user.id);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        total: notifications.length,
      },
    });
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva notificación (solo para admins)
export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.create');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { title, message, type, priority, userId, data, sendEmail } = body;

    // Validar campos requeridos
    if (!title || !message || !type || !userId) {
      return NextResponse.json(
        { error: 'Campos requeridos: title, message, type, userId' },
        { status: 400 }
      );
    }

    const notification = await notificationService.createNotification({
      title,
      message,
      type,
      priority: priority || 'NORMAL',
      userId,
      senderId: user.id,
      data,
      sendEmail,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creando notificación:', error);
    return NextResponse.json(
      { error: 'Error al crear notificación' },
      { status: 500 }
    );
  }
}
