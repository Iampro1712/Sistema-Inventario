import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hasPermission, Permission, UserRole } from './permissions';
import { apiKeyService } from './api-keys';

// Mapeo de permisos de API Key a permisos del sistema
const API_KEY_PERMISSION_MAP: Record<string, Permission[]> = {
  'products.read': ['products.view'],
  'products.write': ['products.create', 'products.edit'],
  'products.delete': ['products.delete'],
  'users.read': ['users.view'],
  'users.write': ['users.create', 'users.edit'],
  'users.delete': ['users.delete'],
  'movements.read': ['movements.view'],
  'movements.write': ['movements.create_in', 'movements.create_out'],
  'reports.read': ['reports.view', 'reports.export'],
  'settings.read': ['settings.view'],
  'settings.write': ['settings.edit'],
  'notifications.read': ['notifications.view'],
  'notifications.write': ['notifications.create'],
  '*': [] // Acceso completo se maneja por separado
};

const prisma = new PrismaClient();

// Función para verificar si una API Key tiene un permiso específico
function hasApiKeyPermission(apiKeyPermissions: string[], requiredPermission: Permission): boolean {
  // Si tiene acceso completo
  if (apiKeyPermissions.includes('*')) {
    return true;
  }

  // Verificar permisos específicos
  for (const apiKeyPerm of apiKeyPermissions) {
    const mappedPermissions = API_KEY_PERMISSION_MAP[apiKeyPerm];
    if (mappedPermissions && mappedPermissions.includes(requiredPermission)) {
      return true;
    }
  }

  return false;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isApiKey?: boolean; // Para distinguir si la autenticación es por API Key
  apiKeyPermissions?: string[]; // Permisos específicos de la API Key
}

// Función para obtener el usuario desde la cookie de autenticación
export async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Obtener el token de autenticación desde la cookie
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      return null;
    }

    // Extraer el userId del token (formato: auth_{userId}_{timestamp})
    const tokenParts = authToken.split('_');

    if (tokenParts.length < 3 || tokenParts[0] !== 'auth') {
      return null;
    }

    const userId = tokenParts[1];

    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      isActive: user.isActive
    };
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
}

// Función para obtener el usuario desde una API Key
export async function getUserFromApiKey(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Buscar API Key en headers
    let apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');

    // Si no está en X-API-Key, buscar en Authorization Bearer
    if (!apiKey) {
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.substring(7);
      }
    }

    if (!apiKey) {
      return null;
    }

    // Validar la API Key
    const validation = await apiKeyService.validateApiKey(apiKey);

    if (!validation.valid || !validation.keyData) {
      // Guardar el error específico para devolverlo más tarde si es necesario
      console.log('🔑 API Key inválida:', validation.error);
      return null;
    }

    // Obtener el usuario que creó la API Key
    const user = await prisma.user.findUnique({
      where: { id: validation.keyData.createdBy, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      isActive: user.isActive,
      isApiKey: true,
      apiKeyPermissions: validation.keyData.permissions
    };
  } catch (error) {
    console.error('Error obteniendo usuario desde API Key:', error);
    return null;
  }
}

// Middleware para verificar autenticación
export async function requireAuth(request: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  // Intentar autenticación por cookie primero
  let user = await getUserFromRequest(request);

  // Si no hay usuario por cookie, intentar por API Key
  if (!user) {
    // Verificar si hay una API Key en los headers
    const apiKey = request.headers.get('x-api-key') ||
                   request.headers.get('X-API-Key') ||
                   (() => {
                     const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
                     return authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
                   })();

    if (apiKey) {
      // Validar la API Key para obtener un mensaje de error específico
      const validation = await apiKeyService.validateApiKey(apiKey);
      if (!validation.valid) {
        let errorMessage = 'No autorizado. API Key inválida.';
        if (validation.error === 'API Key expirada') {
          errorMessage = 'No autorizado. La API Key ha expirado.';
        } else if (validation.error === 'API Key desactivada') {
          errorMessage = 'No autorizado. La API Key está desactivada.';
        } else if (validation.error === 'API Key no encontrada') {
          errorMessage = 'No autorizado. API Key no encontrada.';
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 401 }
        );
      }
    }

    user = await getUserFromApiKey(request);
  }

  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado. Debe iniciar sesión.' },
      { status: 401 }
    );
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Cuenta desactivada. Contacte al administrador.' },
      { status: 403 }
    );
  }

  return { user };
}

// Middleware para verificar permisos específicos
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult; // Error de autenticación
  }

  const { user } = authResult;

  // Si es autenticación por API Key, verificar permisos específicos de la API Key
  if (user.isApiKey && user.apiKeyPermissions) {
    if (!hasApiKeyPermission(user.apiKeyPermissions, permission)) {
      return NextResponse.json(
        {
          error: 'Acceso denegado. La API Key no tiene permisos para realizar esta acción.',
          required_permission: permission,
          api_key_permissions: user.apiKeyPermissions
        },
        { status: 403 }
      );
    }
  } else {
    // Autenticación por cookie, verificar permisos del rol del usuario
    if (!hasPermission(user.role, permission)) {
      return NextResponse.json(
        {
          error: 'Acceso denegado. No tiene permisos para realizar esta acción.',
          required_permission: permission,
          user_role: user.role
        },
        { status: 403 }
      );
    }
  }

  return { user };
}

// Middleware para verificar múltiples permisos (requiere todos)
export async function requireAllPermissions(
  request: NextRequest, 
  permissions: Permission[]
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  const missingPermissions = permissions.filter(permission => 
    !hasPermission(user.role, permission)
  );

  if (missingPermissions.length > 0) {
    return NextResponse.json(
      { 
        error: 'Acceso denegado. No tiene todos los permisos requeridos.',
        missing_permissions: missingPermissions,
        user_role: user.role
      },
      { status: 403 }
    );
  }

  return { user };
}

// Middleware para verificar al menos uno de los permisos
export async function requireAnyPermission(
  request: NextRequest, 
  permissions: Permission[]
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  const hasAnyPermission = permissions.some(permission => 
    hasPermission(user.role, permission)
  );

  if (!hasAnyPermission) {
    return NextResponse.json(
      { 
        error: 'Acceso denegado. No tiene ninguno de los permisos requeridos.',
        required_permissions: permissions,
        user_role: user.role
      },
      { status: 403 }
    );
  }

  return { user };
}

// Middleware específico para operaciones de usuarios
export async function requireUserManagement(
  request: NextRequest,
  targetUserId?: string
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Solo CEO y ADMIN pueden gestionar usuarios
  if (!hasPermission(user.role, 'users.view')) {
    return NextResponse.json(
      { error: 'No tiene permisos para gestionar usuarios.' },
      { status: 403 }
    );
  }

  // Si se especifica un usuario objetivo, verificar restricciones adicionales
  if (targetUserId) {
    try {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { role: true }
      });

      if (targetUser) {
        // Los ADMIN no pueden gestionar otros ADMIN o CEO
        if (user.role === 'ADMIN' && (targetUser.role === 'ADMIN' || targetUser.role === 'CEO')) {
          return NextResponse.json(
            { error: 'No puede gestionar usuarios con rol de Administrador o CEO.' },
            { status: 403 }
          );
        }

        // Nadie puede gestionar al CEO excepto otro CEO
        if (targetUser.role === 'CEO' && user.role !== 'CEO') {
          return NextResponse.json(
            { error: 'Solo el CEO puede gestionar otros usuarios CEO.' },
            { status: 403 }
          );
        }
      }
    } catch (error) {
      console.error('Error verificando usuario objetivo:', error);
    }
  }

  return { user };
}

// Helper para crear respuestas de error estandarizadas
export function createUnauthorizedResponse(message?: string) {
  return NextResponse.json(
    { error: message || 'No autorizado' },
    { status: 401 }
  );
}

export function createForbiddenResponse(message?: string) {
  return NextResponse.json(
    { error: message || 'Acceso denegado' },
    { status: 403 }
  );
}
