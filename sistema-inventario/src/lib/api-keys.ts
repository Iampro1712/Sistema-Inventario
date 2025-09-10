import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[] | any; // JSON que contiene array de strings
  isActive: boolean;
  lastUsed: Date | null;
  expiresAt: Date | null;
  createdBy: string;
  createdAt: Date;
}

export interface CreateApiKeyData {
  name: string;
  permissions: string[];
  expiresAt: Date | null;
  createdBy: string;
}

class ApiKeyService {
  
  // Generar una nueva API Key
  generateApiKey(): string {
    const prefix = 'sk_'; // Secret Key prefix
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  // Crear una nueva API Key
  async createApiKey(data: CreateApiKeyData): Promise<ApiKey> {
    try {
      const apiKey = this.generateApiKey();
      
      const newApiKey = await prisma.apiKey.create({
        data: {
          name: data.name,
          key: apiKey,
          permissions: data.permissions,
          isActive: true,
          expiresAt: data.expiresAt,
          createdBy: data.createdBy,
        },
      });

      return newApiKey;
    } catch (error) {
      console.error('Error creando API Key:', error);
      throw error;
    }
  }

  // Validar una API Key
  async validateApiKey(apiKey: string): Promise<{ valid: boolean; keyData?: ApiKey; error?: string }> {
    try {
      if (!apiKey || !apiKey.startsWith('sk_')) {
        return { valid: false, error: 'Formato de API Key inválido' };
      }

      const keyData = await prisma.apiKey.findUnique({
        where: { key: apiKey },
      });

      if (!keyData) {
        return { valid: false, error: 'API Key no encontrada' };
      }

      if (!keyData.isActive) {
        return { valid: false, error: 'API Key desactivada' };
      }

      if (keyData.expiresAt && keyData.expiresAt < new Date()) {
        return { valid: false, error: 'API Key expirada' };
      }

      // Actualizar último uso
      await prisma.apiKey.update({
        where: { id: keyData.id },
        data: { lastUsed: new Date() },
      });

      return { valid: true, keyData };
    } catch (error) {
      console.error('Error validando API Key:', error);
      return { valid: false, error: 'Error interno del servidor' };
    }
  }

  // Verificar permisos de una API Key
  hasPermission(keyData: ApiKey, requiredPermission: string): boolean {
    // Asegurar que permissions es un array
    const permissions = Array.isArray(keyData.permissions) ? keyData.permissions : [];

    // Permiso de administrador total
    if (permissions.includes('*')) {
      return true;
    }

    // Verificar permiso específico
    return permissions.includes(requiredPermission);
  }

  // Obtener todas las API Keys (con keys truncadas para seguridad)
  async getAllApiKeys() {
    try {
      const apiKeys = await prisma.apiKey.findMany({
        select: {
          id: true,
          name: true,
          key: true, // Necesitamos la key para mostrar una versión truncada
          permissions: true,
          isActive: true,
          lastUsed: true,
          expiresAt: true,
          createdBy: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return apiKeys.map(apiKey => ({
        ...apiKey,
        key: `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 4)}`, // Mostrar solo parte de la key
      }));
    } catch (error) {
      console.error('Error obteniendo API Keys:', error);
      throw error;
    }
  }

  // Desactivar una API Key
  async deactivateApiKey(keyId: string): Promise<void> {
    try {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { isActive: false },
      });
    } catch (error) {
      console.error('Error desactivando API Key:', error);
      throw error;
    }
  }

  // Obtener una API Key específica con la key completa (solo para mostrar al crear)
  async getApiKeyById(id: string): Promise<ApiKey | null> {
    try {
      const apiKey = await prisma.apiKey.findUnique({
        where: { id },
      });

      return apiKey;
    } catch (error) {
      console.error('Error obteniendo API Key:', error);
      throw error;
    }
  }

  // Eliminar una API Key
  async deleteApiKey(keyId: string): Promise<void> {
    try {
      await prisma.apiKey.delete({
        where: { id: keyId },
      });
    } catch (error) {
      console.error('Error eliminando API Key:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const apiKeyService = new ApiKeyService();

// Permisos disponibles
export const API_PERMISSIONS = {
  // Productos
  'products.read': 'Leer productos',
  'products.write': 'Crear/editar productos',
  'products.delete': 'Eliminar productos',
  
  // Usuarios
  'users.read': 'Leer usuarios',
  'users.write': 'Crear/editar usuarios',
  'users.delete': 'Eliminar usuarios',
  
  // Movimientos
  'movements.read': 'Leer movimientos',
  'movements.write': 'Crear movimientos',
  
  // Reportes
  'reports.read': 'Acceso a reportes',
  
  // Configuración
  'settings.read': 'Leer configuración',
  'settings.write': 'Modificar configuración',
  
  // Notificaciones
  'notifications.read': 'Leer notificaciones',
  'notifications.write': 'Crear notificaciones',
  
  // Administración total
  '*': 'Acceso completo (Administrador)',
} as const;

export type ApiPermission = keyof typeof API_PERMISSIONS;
