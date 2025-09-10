import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { apiKeyService } from '@/lib/api-keys';

// PUT - Activar/Desactivar API Key
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Solo ADMIN y CEO pueden modificar API Keys
  const authResult = await requirePermission(request, 'settings.edit');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Solo ADMIN y CEO pueden gestionar API Keys
  if (!['ADMIN', 'CEO'].includes(user.role)) {
    return NextResponse.json(
      { error: 'No tienes permisos para modificar API Keys' },
      { status: 403 }
    );
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    if (action === 'deactivate') {
      await apiKeyService.deactivateApiKey(id);
      return NextResponse.json({
        message: 'API Key desactivada exitosamente'
      });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error modificando API Key:', error);
    return NextResponse.json(
      { error: 'Error modificando API Key' },
      { status: 500 }
    );
  }
}
