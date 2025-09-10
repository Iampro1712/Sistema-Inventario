import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { apiKeyService, API_PERMISSIONS } from '@/lib/api-keys';

// GET - Obtener todas las API Keys
export async function GET(request: NextRequest) {
  // Solo ADMIN y CEO pueden ver API Keys
  const authResult = await requirePermission(request, 'settings.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Solo ADMIN y CEO pueden gestionar API Keys
  if (!['ADMIN', 'CEO'].includes(user.role)) {
    return NextResponse.json(
      { error: 'No tienes permisos para gestionar API Keys' },
      { status: 403 }
    );
  }

  try {
    const apiKeys = await apiKeyService.getAllApiKeys();
    
    return NextResponse.json({
      apiKeys,
      permissions: API_PERMISSIONS
    });
  } catch (error) {
    console.error('Error obteniendo API Keys:', error);
    return NextResponse.json(
      { error: 'Error obteniendo API Keys' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva API Key
export async function POST(request: NextRequest) {
  // Solo ADMIN y CEO pueden crear API Keys
  const authResult = await requirePermission(request, 'settings.edit');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Solo ADMIN y CEO pueden gestionar API Keys
  if (!['ADMIN', 'CEO'].includes(user.role)) {
    return NextResponse.json(
      { error: 'No tienes permisos para crear API Keys' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, permissions, expiresAt } = body;

    // Validaciones
    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Nombre y permisos son requeridos' },
        { status: 400 }
      );
    }

    // Validar que los permisos sean válidos
    const validPermissions = Object.keys(API_PERMISSIONS);
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { error: `Permisos inválidos: ${invalidPermissions.join(', ')}` },
        { status: 400 }
      );
    }

    // Crear la API Key
    const newApiKey = await apiKeyService.createApiKey({
      name,
      permissions,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: user.id,
    });

    return NextResponse.json({
      message: 'API Key creada exitosamente',
      apiKey: {
        id: newApiKey.id,
        name: newApiKey.name,
        key: newApiKey.key, // Solo mostrar la key completa al crearla
        permissions: newApiKey.permissions,
        expiresAt: newApiKey.expiresAt,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando API Key:', error);
    return NextResponse.json(
      { error: 'Error creando API Key' },
      { status: 500 }
    );
  }
}

// PUT - Obtener API Key completa para copiar
export async function PUT(request: NextRequest) {
  // Solo ADMIN y CEO pueden ver API Keys completas
  const authResult = await requirePermission(request, 'settings.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Solo ADMIN y CEO pueden gestionar API Keys
  if (!['ADMIN', 'CEO'].includes(user.role)) {
    return NextResponse.json(
      { error: 'No tienes permisos para gestionar API Keys' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json(
        { error: 'ID de API Key requerido' },
        { status: 400 }
      );
    }

    // Obtener la API Key completa
    const apiKey = await apiKeyService.getApiKeyById(keyId);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      key: apiKey.key
    });

  } catch (error) {
    console.error('Error obteniendo API Key completa:', error);
    return NextResponse.json(
      { error: 'Error obteniendo API Key completa' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar API Key
export async function DELETE(request: NextRequest) {
  // Solo ADMIN y CEO pueden eliminar API Keys
  const authResult = await requirePermission(request, 'settings.edit');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Solo ADMIN y CEO pueden gestionar API Keys
  if (!['ADMIN', 'CEO'].includes(user.role)) {
    return NextResponse.json(
      { error: 'No tienes permisos para eliminar API Keys' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'ID de API Key requerido' },
        { status: 400 }
      );
    }

    await apiKeyService.deleteApiKey(keyId);

    return NextResponse.json({
      message: 'API Key eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando API Key:', error);
    return NextResponse.json(
      { error: 'Error eliminando API Key' },
      { status: 500 }
    );
  }
}
