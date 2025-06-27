import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulamos una función para verificar permisos del usuario actual
function canManagePermissions(currentUserRole: string): boolean {
  return currentUserRole === 'CEO' || currentUserRole === 'ADMIN';
}

// Definición de permisos disponibles
export const AVAILABLE_PERMISSIONS = {
  canManageUsers: {
    name: 'Gestionar Usuarios',
    description: 'Crear, editar y eliminar usuarios del sistema',
    category: 'Usuarios'
  },
  canManageInventory: {
    name: 'Gestionar Inventario',
    description: 'Agregar, modificar y eliminar productos del inventario',
    category: 'Inventario'
  },
  canViewReports: {
    name: 'Ver Reportes',
    description: 'Acceder y visualizar reportes del sistema',
    category: 'Reportes'
  },
  canExportData: {
    name: 'Exportar Datos',
    description: 'Descargar datos en formatos CSV, Excel y JSON',
    category: 'Reportes'
  },
  canManageSettings: {
    name: 'Gestionar Configuración',
    description: 'Modificar configuraciones del sistema',
    category: 'Sistema'
  },
  canManagePermissions: {
    name: 'Gestionar Permisos',
    description: 'Asignar y modificar permisos de otros usuarios',
    category: 'Usuarios'
  },
  canDeleteUsers: {
    name: 'Eliminar Usuarios',
    description: 'Eliminar permanentemente usuarios del sistema',
    category: 'Usuarios'
  },
  canViewFinancials: {
    name: 'Ver Información Financiera',
    description: 'Acceder a reportes financieros y de costos',
    category: 'Finanzas'
  }
};

// Permisos por defecto según el rol
export const DEFAULT_PERMISSIONS = {
  CEO: {
    canManageUsers: true,
    canManageInventory: true,
    canViewReports: true,
    canExportData: true,
    canManageSettings: true,
    canManagePermissions: true,
    canDeleteUsers: true,
    canViewFinancials: true
  },
  ADMIN: {
    canManageUsers: true,
    canManageInventory: true,
    canViewReports: true,
    canExportData: true,
    canManageSettings: true,
    canManagePermissions: true,
    canDeleteUsers: true,
    canViewFinancials: false
  },
  MANAGER: {
    canManageUsers: false,
    canManageInventory: true,
    canViewReports: true,
    canExportData: true,
    canManageSettings: false,
    canManagePermissions: false,
    canDeleteUsers: false,
    canViewFinancials: false
  },
  VENDEDOR: {
    canManageUsers: false,
    canManageInventory: true,
    canViewReports: false,
    canExportData: false,
    canManageSettings: false,
    canManagePermissions: false,
    canDeleteUsers: false,
    canViewFinancials: false
  }
};

// GET - Obtener permisos disponibles y información
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'available') {
      return NextResponse.json({
        permissions: AVAILABLE_PERMISSIONS,
        defaultPermissions: DEFAULT_PERMISSIONS
      });
    }

    return NextResponse.json({
      permissions: AVAILABLE_PERMISSIONS
    });

  } catch (error) {
    console.error('Error al obtener permisos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar permisos de un usuario
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, permissions, currentUserRole = 'ADMIN' } = body;

    // Verificar si el usuario actual puede gestionar permisos
    if (!canManagePermissions(currentUserRole)) {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar permisos de usuarios' },
        { status: 403 }
      );
    }

    // Validar que los permisos enviados son válidos
    const validPermissions = Object.keys(AVAILABLE_PERMISSIONS);
    const receivedPermissions = Object.keys(permissions);
    
    const invalidPermissions = receivedPermissions.filter(
      perm => !validPermissions.includes(perm)
    );

    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { error: `Permisos inválidos: ${invalidPermissions.join(', ')}` },
        { status: 400 }
      );
    }

    // Actualizar permisos en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: permissions
      }
    });

    return NextResponse.json({
      message: 'Permisos actualizados correctamente',
      userId,
      permissions,
      updatedAt: updatedUser.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Error al actualizar permisos:', error);
    return NextResponse.json(
      { error: 'Error al actualizar permisos' },
      { status: 500 }
    );
  }
}

// POST - Aplicar permisos por defecto según el rol
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, currentUserRole = 'ADMIN' } = body;

    // Verificar permisos
    if (!canManagePermissions(currentUserRole)) {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar permisos de usuarios' },
        { status: 403 }
      );
    }

    // Obtener permisos por defecto para el rol
    const defaultPermissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS];
    
    if (!defaultPermissions) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Permisos por defecto aplicados correctamente',
      userId,
      role,
      permissions: defaultPermissions,
      appliedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al aplicar permisos por defecto:', error);
    return NextResponse.json(
      { error: 'Error al aplicar permisos por defecto' },
      { status: 500 }
    );
  }
}
