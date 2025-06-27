'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/lib/permissions';

interface RouteGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  section?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function RouteGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  section,
  redirectTo = '/',
  fallback
}: RouteGuardProps) {
  const router = useRouter();
  const { 
    checkPermission, 
    checkAllPermissions, 
    checkAnyPermission, 
    checkSectionAccess,
    isAuthenticated 
  } = usePermissions();

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    let hasAccess = false;

    // Verificar acceso por sección
    if (section) {
      hasAccess = checkSectionAccess(section);
    }
    // Verificar permiso único
    else if (permission) {
      hasAccess = checkPermission(permission);
    }
    // Verificar múltiples permisos
    else if (permissions && permissions.length > 0) {
      if (requireAll) {
        hasAccess = checkAllPermissions(permissions);
      } else {
        hasAccess = checkAnyPermission(permissions);
      }
    }
    // Si no se especifica criterio, permitir acceso
    else {
      hasAccess = true;
    }

    // Si no tiene acceso, redirigir
    if (!hasAccess) {
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    permission,
    permissions,
    requireAll,
    section,
    redirectTo,
    router,
    checkPermission,
    checkAllPermissions,
    checkAnyPermission,
    checkSectionAccess
  ]);

  // Verificar acceso actual
  if (!isAuthenticated) {
    return fallback || <div>Redirigiendo al login...</div>;
  }

  let hasAccess = false;

  if (section) {
    hasAccess = checkSectionAccess(section);
  } else if (permission) {
    hasAccess = checkPermission(permission);
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = checkAllPermissions(permissions);
    } else {
      hasAccess = checkAnyPermission(permissions);
    }
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback || <div>Acceso denegado. Redirigiendo...</div>;
  }

  return <>{children}</>;
}

// Componente específico para proteger páginas de administración
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      permissions={['users.view', 'settings.view']} 
      requireAll={false}
      redirectTo="/"
      fallback={<div>Acceso denegado. Solo administradores.</div>}
    >
      {children}
    </RouteGuard>
  );
}

// Componente específico para proteger páginas de CEO
export function CEORouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      permission="users.manage_permissions"
      redirectTo="/"
      fallback={<div>Acceso denegado. Solo CEO.</div>}
    >
      {children}
    </RouteGuard>
  );
}

// Componente específico para proteger páginas de gestión de usuarios
export function UserManagementRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      permission="users.view"
      redirectTo="/"
      fallback={<div>Acceso denegado. No puede gestionar usuarios.</div>}
    >
      {children}
    </RouteGuard>
  );
}

// Componente específico para proteger páginas de reportes
export function ReportsRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      permission="reports.view"
      redirectTo="/"
      fallback={<div>Acceso denegado. No puede ver reportes.</div>}
    >
      {children}
    </RouteGuard>
  );
}

// Componente específico para proteger páginas de configuración
export function SettingsRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      permission="settings.view"
      redirectTo="/"
      fallback={<div>Acceso denegado. No puede acceder a configuración.</div>}
    >
      {children}
    </RouteGuard>
  );
}
