'use client';

import { useAuth } from '@/contexts/auth-context';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  canAccessSection,
  getRolePermissions,
  Permission, 
  UserRole 
} from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuth();
  
  const userRole = user?.role as UserRole || 'VENDEDOR';

  // Verificar si tiene un permiso específico
  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(userRole, permission);
  };

  // Verificar si tiene todos los permisos especificados
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(userRole, permissions);
  };

  // Verificar si tiene al menos uno de los permisos
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(userRole, permissions);
  };

  // Verificar si puede acceder a una sección
  const checkSectionAccess = (section: string): boolean => {
    if (!user) return false;
    return canAccessSection(userRole, section);
  };

  // Obtener todos los permisos del usuario
  const getUserPermissions = (): Permission[] => {
    if (!user) return [];
    return getRolePermissions(userRole);
  };

  // Verificaciones específicas por funcionalidad
  const can = {
    // Dashboard
    viewDashboard: () => checkPermission('dashboard.view'),
    viewStats: () => checkPermission('dashboard.stats'),

    // Productos
    viewProducts: () => checkPermission('products.view'),
    createProducts: () => checkPermission('products.create'),
    editProducts: () => checkPermission('products.edit'),
    deleteProducts: () => checkPermission('products.delete'),
    exportProducts: () => checkPermission('products.export'),

    // Categorías
    viewCategories: () => checkPermission('categories.view'),
    createCategories: () => checkPermission('categories.create'),
    editCategories: () => checkPermission('categories.edit'),
    deleteCategories: () => checkPermission('categories.delete'),
    exportCategories: () => checkPermission('categories.export'),

    // Movimientos
    viewMovements: () => checkPermission('movements.view'),
    createMovements: () => checkPermission('movements.create'),
    createInMovements: () => checkPermission('movements.create_in'),
    createOutMovements: () => checkPermission('movements.create_out'),
    exportMovements: () => checkPermission('movements.export'),

    // Alertas
    viewAlerts: () => checkPermission('alerts.view'),
    manageAlerts: () => checkPermission('alerts.manage'),
    resolveAlerts: () => checkPermission('alerts.resolve'),

    // Reportes
    viewReports: () => checkPermission('reports.view'),
    exportReports: () => checkPermission('reports.export'),
    viewAdvancedReports: () => checkPermission('reports.advanced'),

    // Usuarios
    viewUsers: () => checkPermission('users.view'),
    createUsers: () => checkPermission('users.create'),
    editUsers: () => checkPermission('users.edit'),
    deleteUsers: () => checkPermission('users.delete'),
    managePermissions: () => checkPermission('users.manage_permissions'),
    exportUsers: () => checkPermission('users.export'),

    // Configuración
    viewSettings: () => checkPermission('settings.view'),
    editSettings: () => checkPermission('settings.edit'),
    systemSettings: () => checkPermission('settings.system'),

    // Acceso a secciones
    accessDashboard: () => checkSectionAccess('dashboard'),
    accessProducts: () => checkSectionAccess('productos'),
    accessCategories: () => checkSectionAccess('categorias'),
    accessMovements: () => checkSectionAccess('movimientos'),
    accessAlerts: () => checkSectionAccess('alertas'),
    accessReports: () => checkSectionAccess('reportes'),
    accessUsers: () => checkSectionAccess('usuarios'),
    accessSettings: () => checkSectionAccess('configuracion')
  };

  // Información del usuario y rol
  const roleInfo = {
    role: userRole,
    isVendedor: userRole === 'VENDEDOR',
    isGerente: userRole === 'MANAGER',
    isAdmin: userRole === 'ADMIN',
    isCEO: userRole === 'CEO',
    isAdminOrAbove: userRole === 'ADMIN' || userRole === 'CEO',
    isManagerOrAbove: userRole === 'MANAGER' || userRole === 'ADMIN' || userRole === 'CEO'
  };

  // Funciones de compatibilidad con el sistema anterior
  const canManageUsers = () => checkPermission('users.view');
  const canChangeUserPasswords = () => checkPermission('users.edit');
  const canDeleteUsers = () => checkPermission('users.delete');
  const canManagePermissions = () => checkPermission('users.manage_permissions');
  const canViewFinancials = () => checkPermission('reports.advanced');
  const canManageSettings = () => checkPermission('settings.edit');
  const canManageInventory = () => checkPermission('products.view');
  const canViewReports = () => checkPermission('reports.view');
  const canExportData = () => checkAnyPermission(['products.export', 'users.export', 'reports.export']);

  // Obtener roles que puede asignar según su nivel
  const getAssignableRoles = (): string[] => {
    if (!user) return [];

    switch (userRole) {
      case 'CEO':
        return ['CEO', 'ADMIN', 'MANAGER', 'VENDEDOR'];
      case 'ADMIN':
        return ['ADMIN', 'MANAGER', 'VENDEDOR'];
      case 'MANAGER':
        return ['VENDEDOR'];
      default:
        return [];
    }
  };

  // Verificar si puede cambiar el rol de un usuario
  const canChangeUserRole = (): boolean => {
    return checkPermission('users.manage_permissions');
  };

  return {
    // Funciones de verificación
    checkPermission,
    checkAllPermissions,
    checkAnyPermission,
    checkSectionAccess,
    getUserPermissions,
    
    // Verificaciones específicas
    can,
    
    // Información del rol
    ...roleInfo,
    
    // Usuario actual
    user,
    isAuthenticated: !!user,
    
    // Funciones de compatibilidad
    canManageUsers,
    canChangeUserPasswords,
    canDeleteUsers,
    canManagePermissions,
    canViewFinancials,
    canManageSettings,
    canManageInventory,
    canViewReports,
    canExportData,

    // Funciones adicionales para usuarios
    getAssignableRoles,
    canChangeUserRole
  };
}
