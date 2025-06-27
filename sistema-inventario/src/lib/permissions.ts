// Sistema de permisos por rol
export type UserRole = 'VENDEDOR' | 'MANAGER' | 'ADMIN' | 'CEO';

export type Permission = 
  // Dashboard
  | 'dashboard.view'
  | 'dashboard.stats'
  
  // Productos
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'products.export'
  
  // Categorías
  | 'categories.view'
  | 'categories.create'
  | 'categories.edit'
  | 'categories.delete'
  | 'categories.export'
  
  // Movimientos
  | 'movements.view'
  | 'movements.create'
  | 'movements.create_in'
  | 'movements.create_out'
  | 'movements.export'
  
  // Alertas
  | 'alerts.view'
  | 'alerts.manage'
  | 'alerts.resolve'

  // Notificaciones
  | 'notifications.view'
  | 'notifications.create'
  | 'notifications.manage'
  | 'notifications.settings'
  
  // Reportes
  | 'reports.view'
  | 'reports.export'
  | 'reports.advanced'
  
  // Usuarios
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_permissions'
  | 'users.export'
  
  // Configuración
  | 'settings.view'
  | 'settings.edit'
  | 'settings.system';

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // VENDEDOR - Permisos básicos de venta
  VENDEDOR: [
    'dashboard.view',
    'dashboard.stats',
    'products.view',
    'categories.view',
    'movements.view', // Puede ver movimientos
    'movements.create_out', // Solo puede crear salidas (ventas)
    'alerts.view',
    'notifications.view'
  ],
  
  // GERENTE - Permisos de gestión operativa
  MANAGER: [
    'dashboard.view',
    'dashboard.stats',
    'products.view',
    'products.create',
    'products.edit',
    'products.export',
    'categories.view',
    'movements.view',
    'movements.create',
    'movements.create_in',
    'movements.create_out',
    'movements.export',
    'alerts.view',
    'alerts.manage',
    'alerts.resolve',
    'reports.view',
    'reports.export',
    'reports.advanced',
    'notifications.view',
    'notifications.settings'
  ],
  
  // ADMINISTRADOR - Permisos administrativos (sin CEO)
  ADMIN: [
    'dashboard.view',
    'dashboard.stats',
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'products.export',
    'categories.view',
    'categories.create',
    'categories.edit',
    'categories.delete',
    'categories.export',
    'movements.view',
    'movements.create',
    'movements.create_in',
    'movements.create_out',
    'movements.export',
    'alerts.view',
    'alerts.manage',
    'alerts.resolve',
    'reports.view',
    'reports.export',
    'reports.advanced',
    'users.view',
    'users.create',
    'users.edit',
    'users.export',
    'settings.view',
    'settings.edit',
    'notifications.view',
    'notifications.create',
    'notifications.manage',
    'notifications.settings'
  ],
  
  // CEO - Todos los permisos
  CEO: [
    'dashboard.view',
    'dashboard.stats',
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'products.export',
    'categories.view',
    'categories.create',
    'categories.edit',
    'categories.delete',
    'categories.export',
    'movements.view',
    'movements.create',
    'movements.create_in',
    'movements.create_out',
    'movements.export',
    'alerts.view',
    'alerts.manage',
    'alerts.resolve',
    'reports.view',
    'reports.export',
    'reports.advanced',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage_permissions',
    'users.export',
    'settings.view',
    'settings.edit',
    'notifications.view',
    'notifications.create',
    'notifications.manage',
    'notifications.settings',
    'settings.system'
  ]
};

// Función para verificar si un usuario tiene un permiso específico
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

// Función para verificar múltiples permisos (requiere todos)
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Función para verificar si tiene al menos uno de los permisos
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Función para obtener todos los permisos de un rol
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

// Función para verificar si puede acceder a una sección
export function canAccessSection(userRole: UserRole, section: string): boolean {
  const sectionPermissions: Record<string, Permission[]> = {
    dashboard: ['dashboard.view'],
    productos: ['products.view'],
    categorias: ['categories.view'],
    movimientos: ['movements.view', 'movements.create_out'],
    alertas: ['alerts.view'],
    reportes: ['reports.view'],
    usuarios: ['users.view'],
    configuracion: ['settings.view']
  };
  
  const requiredPermissions = sectionPermissions[section];
  if (!requiredPermissions) return false;
  
  return hasAnyPermission(userRole, requiredPermissions);
}

// Mapeo de roles a nombres en español
export const ROLE_NAMES: Record<UserRole, string> = {
  VENDEDOR: 'Vendedor',
  MANAGER: 'Gerente',
  ADMIN: 'Administrador',
  CEO: 'Director Ejecutivo'
};

// Función para obtener el nombre del rol en español
export function getRoleName(role: UserRole): string {
  return ROLE_NAMES[role] || role;
}
