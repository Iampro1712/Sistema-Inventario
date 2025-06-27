import { NextRequest, NextResponse } from 'next/server';

// Datos de ejemplo (mismos que en la API principal)
const users = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@empresa.com",
    role: "ADMIN",
    isActive: true,
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    phone: "+34 612 345 678",
    department: "Administración",
  },
  {
    id: 2,
    name: "María García",
    email: "maria.garcia@empresa.com",
    role: "MANAGER",
    isActive: true,
    lastLogin: "2024-01-15T09:15:00Z",
    createdAt: "2024-01-02T00:00:00Z",
    phone: "+34 623 456 789",
    department: "Ventas",
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos.lopez@empresa.com",
    role: "USER",
    isActive: true,
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2024-01-03T00:00:00Z",
    phone: "+34 634 567 890",
    department: "Almacén",
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
  }
];

function generateCSV(data: any[]) {
  const headers = ['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Departamento', 'Teléfono', 'Último Acceso', 'Fecha Creación'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(user => [
      user.id,
      `"${user.name}"`,
      user.email,
      user.role,
      user.isActive ? 'Activo' : 'Inactivo',
      `"${user.department}"`,
      user.phone,
      user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca',
      new Date(user.createdAt).toLocaleDateString('es-ES')
    ].join(','))
  ].join('\n');

  return csvContent;
}

function generateJSON(data: any[]) {
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    totalUsers: data.length,
    users: data.map(user => ({
      ...user,
      roleText: user.role === 'ADMIN' ? 'Administrador' : 
                user.role === 'MANAGER' ? 'Gerente' : 'Usuario',
      statusText: user.isActive ? 'Activo' : 'Inactivo',
      lastLoginFormatted: user.lastLogin ? 
        new Date(user.lastLogin).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Nunca',
      createdAtFormatted: new Date(user.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }))
  }, null, 2);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const department = searchParams.get('department') || '';

    // Aplicar filtros
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
      const isActive = status === 'active';
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }

    if (department) {
      filteredUsers = filteredUsers.filter(user => user.department === department);
    }

    // Generar archivo según formato
    if (format === 'csv') {
      const csvContent = generateCSV(filteredUsers);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="usuarios_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else if (format === 'json') {
      const jsonContent = generateJSON(filteredUsers);
      
      return new NextResponse(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="usuarios_${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Formato no soportado. Use csv o json' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error al exportar usuarios:', error);
    return NextResponse.json(
      { error: 'Error al exportar usuarios' },
      { status: 500 }
    );
  }
}
