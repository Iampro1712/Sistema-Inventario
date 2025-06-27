// Sistema unificado de datos de usuarios
// Este archivo mantiene la sincronización entre autenticación y API

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  avatar?: string;
  password?: string; // Hash de la contraseña
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  permissions: {
    canManageUsers: boolean;
    canManageInventory: boolean;
    canViewReports: boolean;
    canExportData: boolean;
    canManageSettings: boolean;
    canManagePermissions: boolean;
    canDeleteUsers: boolean;
    canViewFinancials: boolean;
  };
}

// Base de datos en memoria (solo para fallback cuando no hay DB)
const FALLBACK_USERS: UserData[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    role: 'CEO',
    department: 'Dirección General',
    phone: '+34 612 345 678',
    password: '$2b$12$gaaBtaXmUyr2iAhtovv8yuoN40OWJiuNjMmJq2l2YpCKnPaWt8bAm', // admin123
    isActive: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    createdAt: new Date('2024-01-01'),
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
    id: '2',
    name: 'María García',
    email: 'maria.garcia@empresa.com',
    role: 'ADMIN',
    department: 'Administración',
    phone: '+34 612 345 679',
    password: '$2b$12$aDjeBNtHiU5PdHKfj.paDew/7j3wHzhuqT1ON/V.doJkqO2A.QFIm', // admin456
    isActive: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    createdAt: new Date('2024-01-01'),
    permissions: {
      canManageUsers: true,
      canManageInventory: true,
      canViewReports: true,
      canExportData: true,
      canManageSettings: true,
      canManagePermissions: false,
      canDeleteUsers: false,
      canViewFinancials: true
    }
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos.lopez@empresa.com',
    role: 'MANAGER',
    department: 'Ventas',
    phone: '+34 612 345 680',
    password: '$2b$12$jhzJuIq4Cbd4a5b6AhGcrunDtPwIi97K7s/Tyt8z0S3xPgXxkZJvO', // manager789
    isActive: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    createdAt: new Date('2024-01-01'),
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
    id: '4',
    name: 'Ana Martínez',
    email: 'ana.martinez@empresa.com',
    role: 'VENDEDOR',
    department: 'Ventas',
    phone: '+34 612 345 681',
    password: '$2b$12$eDpQJuDHPDegkzMIRBxnnuc4fzFvZtP/22UJPjBQ6Ep59.jmODE3m', // vendedor123
    isActive: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    createdAt: new Date('2024-01-01'),
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
  }
];

// Funciones de fallback (solo se usan cuando no hay base de datos)
export function getFallbackUsers(): UserData[] {
  return FALLBACK_USERS;
}

export function getFallbackUserByEmail(email: string): UserData | undefined {
  return FALLBACK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
}
