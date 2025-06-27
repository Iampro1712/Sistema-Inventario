'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // Si es true, requiere todos los permisos. Si es false, requiere al menos uno
  section?: string;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  section,
  fallback = null,
  showFallback = false
}: PermissionGuardProps) {
  const { checkPermission, checkAllPermissions, checkAnyPermission, checkSectionAccess } = usePermissions();

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
  // Si no se especifica ningún criterio, denegar acceso
  else {
    hasAccess = false;
  }

  // Si no tiene acceso
  if (!hasAccess) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}

// Componente específico para proteger botones
interface ProtectedButtonProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function ProtectedButton({
  children,
  permission,
  permissions,
  requireAll = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}: ProtectedButtonProps) {
  const { checkPermission, checkAllPermissions, checkAnyPermission } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = checkPermission(permission);
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = checkAllPermissions(permissions);
    } else {
      hasAccess = checkAnyPermission(permissions);
    }
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Componente para mostrar contenido basado en rol
interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  showFallback = false
}: RoleGuardProps) {
  const { user } = usePermissions();

  const hasAccess = user && allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}

// Componente para mostrar contenido solo para administradores
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'CEO']} fallback={fallback} showFallback={!!fallback}>
      {children}
    </RoleGuard>
  );
}

// Componente para mostrar contenido solo para CEO
export function CEOOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['CEO']} fallback={fallback} showFallback={!!fallback}>
      {children}
    </RoleGuard>
  );
}

// Componente para mostrar contenido para gerentes y superiores
export function ManagerOrAbove({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['MANAGER', 'ADMIN', 'CEO']} fallback={fallback} showFallback={!!fallback}>
      {children}
    </RoleGuard>
  );
}

// Hook para verificar permisos de forma condicional
export function useConditionalPermission(condition: boolean, permission: Permission): boolean {
  const { checkPermission } = usePermissions();
  
  if (!condition) return true; // Si no se cumple la condición, permitir acceso
  return checkPermission(permission);
}

// Componente para mostrar diferentes contenidos según el rol
interface RoleSwitchProps {
  vendedor?: ReactNode;
  gerente?: ReactNode;
  admin?: ReactNode;
  ceo?: ReactNode;
  fallback?: ReactNode;
}

export function RoleSwitch({ vendedor, gerente, admin, ceo, fallback }: RoleSwitchProps) {
  const { user } = usePermissions();

  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }

  switch (user.role) {
    case 'VENDEDOR':
      return vendedor ? <>{vendedor}</> : (fallback ? <>{fallback}</> : null);
    case 'MANAGER':
      return gerente ? <>{gerente}</> : (fallback ? <>{fallback}</> : null);
    case 'ADMIN':
      return admin ? <>{admin}</> : (fallback ? <>{fallback}</> : null);
    case 'CEO':
      return ceo ? <>{ceo}</> : (fallback ? <>{fallback}</> : null);
    default:
      return fallback ? <>{fallback}</> : null;
  }
}
