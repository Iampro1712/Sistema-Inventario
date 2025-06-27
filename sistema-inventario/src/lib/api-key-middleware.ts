import { NextRequest, NextResponse } from 'next/server';
import { apiKeyService, ApiPermission } from './api-keys';

export interface ApiKeyAuthResult {
  success: boolean;
  keyData?: any;
  error?: string;
}

// Middleware para validar API Keys
export async function requireApiKey(
  request: NextRequest,
  requiredPermission?: ApiPermission
): Promise<NextResponse | ApiKeyAuthResult> {
  try {
    // Obtener API Key del header
    const apiKey = request.headers.get('x-api-key') || 
                   request.headers.get('authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'API Key requerida',
          message: 'Incluye tu API Key en el header "X-API-Key" o "Authorization: Bearer <key>"'
        },
        { status: 401 }
      );
    }

    // Validar la API Key
    const validation = await apiKeyService.validateApiKey(apiKey);
    
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'API Key inválida',
          message: validation.error
        },
        { status: 401 }
      );
    }

    // Verificar permisos si se especifica
    if (requiredPermission && !apiKeyService.hasPermission(validation.keyData!, requiredPermission)) {
      return NextResponse.json(
        { 
          error: 'Permisos insuficientes',
          message: `Esta API Key no tiene el permiso: ${requiredPermission}`
        },
        { status: 403 }
      );
    }

    // Retornar datos de la key válida
    return {
      success: true,
      keyData: validation.keyData
    };

  } catch (error) {
    console.error('Error en middleware de API Key:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'Error validando API Key'
      },
      { status: 500 }
    );
  }
}

// Middleware combinado: API Key O autenticación de usuario
export async function requireApiKeyOrAuth(
  request: NextRequest,
  requiredPermission?: ApiPermission
): Promise<NextResponse | { success: boolean; keyData?: any; user?: any; authType: 'apikey' | 'user' }> {
  try {
    // Intentar primero con API Key
    const apiKey = request.headers.get('x-api-key') || 
                   request.headers.get('authorization')?.replace('Bearer ', '');

    if (apiKey && apiKey.startsWith('sk_')) {
      const apiKeyResult = await requireApiKey(request, requiredPermission);
      
      if (apiKeyResult instanceof NextResponse) {
        // Si falla API Key, intentar con autenticación de usuario
        const { requirePermission } = await import('./auth-middleware');
        const userAuthResult = await requirePermission(request, requiredPermission as any);
        
        if (userAuthResult instanceof NextResponse) {
          return userAuthResult;
        }
        
        return {
          success: true,
          user: userAuthResult.user,
          authType: 'user'
        };
      }
      
      return {
        success: true,
        keyData: (apiKeyResult as ApiKeyAuthResult).keyData,
        authType: 'apikey'
      };
    }

    // Si no hay API Key, usar autenticación de usuario
    const { requirePermission } = await import('./auth-middleware');
    const userAuthResult = await requirePermission(request, requiredPermission as any);
    
    if (userAuthResult instanceof NextResponse) {
      return userAuthResult;
    }
    
    return {
      success: true,
      user: userAuthResult.user,
      authType: 'user'
    };

  } catch (error) {
    console.error('Error en middleware combinado:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'Error en autenticación'
      },
      { status: 500 }
    );
  }
}

// Función helper para extraer información de autenticación
export function getAuthInfo(authResult: any): { isApiKey: boolean; isUser: boolean; data: any } {
  return {
    isApiKey: authResult.authType === 'apikey',
    isUser: authResult.authType === 'user',
    data: authResult.keyData || authResult.user
  };
}
