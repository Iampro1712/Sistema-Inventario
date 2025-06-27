import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireUserManagement, requirePermission } from '@/lib/auth-middleware';
import { notifyNewUser } from '@/lib/notification-helpers';

const prisma = new PrismaClient();

// Función para convertir usuario de Prisma al formato esperado por el frontend
function formatUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    phone: user.phone || '',
    department: user.department || '',
    permissions: user.permissions || {}
  };
}

// Función para generar permisos basados en el rol
function generatePermissionsByRole(role: string) {
  switch (role) {
    case 'CEO':
      return {
        canManageUsers: true,
        canManageInventory: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: true,
        canManagePermissions: true,
        canDeleteUsers: true,
        canViewFinancials: true
      };
    case 'ADMIN':
      return {
        canManageUsers: true,
        canManageInventory: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: true,
        canManagePermissions: false,
        canDeleteUsers: false,
        canViewFinancials: true
      };
    case 'MANAGER':
      return {
        canManageUsers: false,
        canManageInventory: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: false,
        canManagePermissions: false,
        canDeleteUsers: false,
        canViewFinancials: false
      };
    case 'VENDEDOR':
      return {
        canManageUsers: false,
        canManageInventory: true,
        canViewReports: false,
        canExportData: false,
        canManageSettings: false,
        canManagePermissions: false,
        canDeleteUsers: false,
        canViewFinancials: false
      };
    default:
      return {
        canManageUsers: false,
        canManageInventory: false,
        canViewReports: false,
        canExportData: false,
        canManageSettings: false,
        canManagePermissions: false,
        canDeleteUsers: false,
        canViewFinancials: false
      };
  }
}

// Datos de ejemplo expandidos (como fallback)
const fallbackUsers = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@empresa.com",
    role: "CEO",
    isActive: true,
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    phone: "+34 612 345 678",
    department: "Dirección General",
    permissions: {
      canManageUsers: true,
      canManageInventory: true,
      canViewReports: true,
      canExportData: true,
      canManageSettings: true,
      canManagePermissions: true,
      canDeleteUsers: true,
      canViewFinancials: true
    }
  },
  {
    id: 2,
    name: "María García",
    email: "maria.garcia@empresa.com",
    role: "ADMIN",
    isActive: true,
    lastLogin: "2024-01-15T09:15:00Z",
    createdAt: "2024-01-02T00:00:00Z",
    phone: "+34 623 456 789",
    department: "Administración",
    permissions: {
      canManageUsers: true,
      canManageInventory: true,
      canViewReports: true,
      canExportData: true,
      canManageSettings: true,
      canManagePermissions: true,
      canDeleteUsers: true,
      canViewFinancials: false
    }
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos.lopez@empresa.com",
    role: "MANAGER",
    isActive: true,
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2024-01-03T00:00:00Z",
    phone: "+34 634 567 890",
    department: "Ventas",
    permissions: {
      canManageUsers: false,
      canManageInventory: true,
      canViewReports: true,
      canExportData: true,
      canManageSettings: false,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: false
    }
  },
  {
    id: 4,
    name: "Ana Martínez",
    email: "ana.martinez@empresa.com",
    role: "USER",
    isActive: false,
    lastLogin: "2024-01-10T14:20:00Z",
    createdAt: "2024-01-04T00:00:00Z",
    phone: "+34 645 678 901",
    department: "Contabilidad",
    permissions: {
      canManageUsers: false,
      canManageInventory: false,
      canViewReports: true,
      canExportData: false,
      canManageSettings: false,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: true
    }
  },
  {
    id: 5,
    name: "Luis Rodríguez",
    email: "luis.rodriguez@empresa.com",
    role: "MANAGER",
    isActive: true,
    lastLogin: "2024-01-15T11:30:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    phone: "+34 656 789 012",
    department: "Compras",
    permissions: {
      canManageUsers: false,
      canManageInventory: true,
      canViewReports: true,
      canExportData: true,
      canManageSettings: false,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: false
    }
  },
  {
    id: 6,
    name: "Carmen Ruiz",
    email: "carmen.ruiz@empresa.com",
    role: "USER",
    isActive: true,
    lastLogin: "2024-01-15T08:45:00Z",
    createdAt: "2024-01-06T00:00:00Z",
    phone: "+34 667 890 123",
    department: "Almacén",
    permissions: {
      canManageUsers: false,
      canManageInventory: true,
      canViewReports: false,
      canExportData: false,
      canManageSettings: false,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: false
    }
  },
  {
    id: 7,
    name: "Pedro Sánchez",
    email: "pedro.sanchez@empresa.com",
    role: "USER",
    isActive: true,
    lastLogin: "2024-01-14T17:30:00Z",
    createdAt: "2024-01-07T00:00:00Z",
    phone: "+34 678 901 234",
    department: "Ventas",
    permissions: {
      canManageUsers: false,
      canManageInventory: false,
      canViewReports: true,
      canExportData: false,
      canManageSettings: false,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: false
    }
  },
  {
    id: 8,
    name: "Isabel Torres",
    email: "isabel.torres@empresa.com",
    role: "MANAGER",
    isActive: false,
    lastLogin: "2024-01-12T12:15:00Z",
    createdAt: "2024-01-08T00:00:00Z",
    phone: "+34 689 012 345",
    department: "Recursos Humanos",
    permissions: {
      canManageUsers: true,
      canManageInventory: false,
      canViewReports: true,
      canExportData: true,
      canManageSettings: false,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: false
    }
  },
  {
    id: 9,
    name: "Miguel Fernández",
    email: "miguel.fernandez@empresa.com",
    role: "USER",
    isActive: true,
    lastLogin: "2024-01-15T13:20:00Z",
    createdAt: "2024-01-09T00:00:00Z",
    phone: "+34 690 123 456",
    department: "Almacén",
    permissions: {
      canManageUsers: false,
      canManageInventory: true,
      canViewReports: false,
      canExportData: false,
      canManageSettings: false,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: false
    }
  },
  {
    id: 10,
    name: "Laura Jiménez",
    email: "laura.jimenez@empresa.com",
    role: "USER",
    isActive: true,
    lastLogin: "2024-01-15T15:10:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    phone: "+34 601 234 567",
    department: "Contabilidad",
    permissions: {
      canManageUsers: false,
      canManageInventory: false,
      canViewReports: true,
      canExportData: false,
      canManageSettings: false,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: true
    }
  }
];

export async function GET(request: NextRequest) {
  // Verificar permisos para ver usuarios
  const authResult = await requirePermission(request, 'users.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const department = searchParams.get('department') || '';

    // Construir filtros para Prisma
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.isActive = status === 'active';
    }

    if (department) {
      where.department = department;
    }

    // Obtener usuarios de la base de datos
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // Formatear usuarios para el frontend
    const formattedUsers = users.map(formatUser);

    // Obtener estadísticas generales
    const [totalCount, activeCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } })
    ]);

    // Estadísticas
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: totalCount - activeCount
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios de Prisma, usando fallback:', error);

    // Fallback: usar el sistema unificado
    try {
      const users = getAllUsers();

      // Aplicar filtros manualmente
      let filteredUsers = users;

      if (search) {
        filteredUsers = filteredUsers.filter(user =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.department.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }

      if (status) {
        filteredUsers = filteredUsers.filter(user =>
          status === 'active' ? user.isActive : !user.isActive
        );
      }

      if (department) {
        filteredUsers = filteredUsers.filter(user => user.department === department);
      }

      // Paginación manual
      const totalUsers = filteredUsers.length;
      const totalPages = Math.ceil(totalUsers / limit);
      const startIndex = (page - 1) * limit;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

      // Remover contraseñas antes de enviar
      const safeUsers = paginatedUsers.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

      // Estadísticas
      const activeCount = users.filter(u => u.isActive).length;
      const totalCount = users.length;

      return NextResponse.json({
        users: safeUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        stats: {
          total: totalCount,
          active: activeCount,
          inactive: totalCount - activeCount
        }
      });

    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  // Verificar permisos para crear usuarios
  const authResult = await requirePermission(request, 'users.create');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult; // Obtener el usuario que está creando

  try {
    const body = await request.json();

    // Generar permisos basados en el rol
    const permissions = generatePermissionsByRole(body.role);

    // Crear usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        phone: body.phone,
        department: body.department,
        password: body.password, // Ya viene hasheada del frontend
        isActive: body.isActive ?? true,
        permissions: permissions || {}
      }
    });

    console.log('✅ Usuario creado en base de datos:', newUser.email);

    // Enviar notificación de nuevo usuario
    await notifyNewUser(newUser.id, user.id);

    return NextResponse.json(formatUser(newUser), { status: 201 });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);

    // Manejar error de email duplicado
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    // Actualizar usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: updateData.name,
        email: updateData.email,
        role: updateData.role,
        phone: updateData.phone,
        department: updateData.department,
        isActive: updateData.isActive,
        permissions: updateData.permissions,
        lastLogin: updateData.lastLogin ? new Date(updateData.lastLogin) : undefined
      }
    });

    return NextResponse.json(formatUser(updatedUser));
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';

    // Eliminar usuario de la base de datos
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
