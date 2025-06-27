import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { testNotificationSystem, getNotificationSystemInfo } from '@/lib/init-notifications';

// GET - Obtener información del sistema de notificaciones
export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const systemInfo = await getNotificationSystemInfo();
    return NextResponse.json(systemInfo);
  } catch (error) {
    console.error('Error obteniendo información del sistema:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del sistema' },
      { status: 500 }
    );
  }
}

// POST - Enviar email de prueba
export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.create');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { email } = body;

    // Usar el email del usuario actual si no se proporciona uno
    const testEmail = email || user.email;

    const result = await testNotificationSystem(testEmail);

    if (result.success) {
      return NextResponse.json({
        message: 'Email de prueba enviado exitosamente',
        email: testEmail,
        previewUrl: result.previewUrl,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Error enviando email de prueba' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error enviando email de prueba:', error);
    return NextResponse.json(
      { error: 'Error enviando email de prueba' },
      { status: 500 }
    );
  }
}
