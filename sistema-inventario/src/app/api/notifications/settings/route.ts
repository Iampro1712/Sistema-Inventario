import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { notificationService } from '@/lib/notification-service';

// GET - Obtener configuración de notificaciones del usuario
export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const settings = await notificationService.getUserNotificationSettings(user.id);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error obteniendo configuración de notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración de notificaciones' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuración de notificaciones del usuario
export async function PUT(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    
    const settings = await notificationService.updateNotificationSettings(user.id, body);
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error actualizando configuración de notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración de notificaciones' },
      { status: 500 }
    );
  }
}
