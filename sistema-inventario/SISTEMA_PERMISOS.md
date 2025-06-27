# Sistema de Permisos - Sistema de Inventario

## Resumen
Se ha implementado un sistema completo de permisos basado en roles (RBAC) que controla el acceso a funcionalidades según el rol del usuario.

## Roles Implementados

### 1. USER (Vendedor)
**Permisos básicos de operación:**
- ✅ Dashboard: Ver estadísticas básicas
- ✅ Productos: Ver, crear, editar (limitado)
- ✅ Categorías: Ver, crear
- ✅ Movimientos: Ver, crear entradas y salidas
- ✅ Alertas: Ver alertas básicas
- ❌ Reportes: Sin acceso
- ❌ Usuarios: Sin acceso
- ❌ Configuración: Sin acceso

### 2. MANAGER (Gerente)
**Permisos de gestión operativa:**
- ✅ Dashboard: Ver estadísticas completas
- ✅ Productos: Acceso completo (CRUD + exportar)
- ✅ Categorías: Acceso completo (CRUD + exportar)
- ✅ Movimientos: Acceso completo (CRUD + exportar)
- ✅ Alertas: Gestionar y resolver alertas
- ✅ Reportes: Ver reportes básicos y exportar
- ❌ Usuarios: Sin acceso
- ❌ Configuración: Sin acceso

### 3. ADMIN (Administrador)
**Permisos administrativos:**
- ✅ Dashboard: Acceso completo
- ✅ Productos: Acceso completo
- ✅ Categorías: Acceso completo
- ✅ Movimientos: Acceso completo
- ✅ Alertas: Acceso completo
- ✅ Reportes: Acceso completo + reportes avanzados
- ✅ Usuarios: Ver, crear, editar, eliminar (excepto CEO)
- ✅ Configuración: Ver y editar configuraciones

### 4. CEO (Director Ejecutivo)
**Permisos completos:**
- ✅ Acceso total a todas las funcionalidades
- ✅ Gestión completa de usuarios (incluyendo otros CEO)
- ✅ Gestión de permisos de usuarios
- ✅ Configuración del sistema
- ✅ Reportes financieros y avanzados

## Archivos Implementados

### 1. Sistema de Permisos Base
- **`src/lib/permissions.ts`**: Define permisos, roles y funciones de verificación
- **`src/lib/auth-middleware.ts`**: Middleware para validar permisos en APIs
- **`src/lib/api-client.ts`**: Cliente API con headers de autenticación

### 2. Hooks y Contextos
- **`src/hooks/use-permissions.ts`**: Hook para verificar permisos en componentes
- **`src/contexts/auth-context.tsx`**: Actualizado para integrar sistema de permisos

### 3. Componentes de Protección
- **`src/components/auth/permission-guard.tsx`**: Componentes para proteger UI
- **`src/components/auth/route-guard.tsx`**: Protección de rutas completas

### 4. APIs Protegidas
- **`src/app/api/usuarios/route.ts`**: API de usuarios con validaciones
- **`src/app/api/usuarios/[id]/route.ts`**: API individual con permisos
- **`src/app/api/productos/route.ts`**: API de productos protegida

### 5. UI Actualizada
- **`src/components/layout/sidebar.tsx`**: Navegación filtrada por permisos
- **`src/components/users/users-header.tsx`**: Botones protegidos
- **`src/components/users/users-table.tsx`**: Acciones protegidas
- **`src/app/usuarios/page.tsx`**: Página con protección de ruta

## Funcionalidades Implementadas

### Protección de APIs
- ✅ Middleware de autenticación en endpoints
- ✅ Validación de permisos específicos por acción
- ✅ Restricciones especiales para gestión de usuarios
- ✅ Respuestas de error estandarizadas (401, 403)

### Protección de UI
- ✅ Componentes que se ocultan sin permisos
- ✅ Botones protegidos por permisos específicos
- ✅ Navegación filtrada según rol
- ✅ Protección de rutas completas

### Sistema de Roles
- ✅ Jerarquía de roles bien definida
- ✅ Permisos granulares por funcionalidad
- ✅ Restricciones especiales (ej: solo CEO puede gestionar CEO)
- ✅ Compatibilidad con sistema anterior

## Cómo Usar el Sistema

### En Componentes React
```tsx
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';

function MiComponente() {
  const { can, checkPermission } = usePermissions();
  
  return (
    <div>
      {/* Verificación programática */}
      {can.createUsers() && <button>Crear Usuario</button>}
      
      {/* Componente de protección */}
      <PermissionGuard permission="users.delete">
        <button>Eliminar Usuario</button>
      </PermissionGuard>
    </div>
  );
}
```

### En APIs
```tsx
import { requirePermission } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Verificar permisos
  const authResult = await requirePermission(request, 'users.create');
  if (authResult instanceof NextResponse) {
    return authResult; // Error de permisos
  }
  
  // Continuar con la lógica...
}
```

### Protección de Rutas
```tsx
import { UserManagementRouteGuard } from '@/components/auth/route-guard';

export default function UsuariosPage() {
  return (
    <UserManagementRouteGuard>
      {/* Contenido de la página */}
    </UserManagementRouteGuard>
  );
}
```

## Estado del Sistema
✅ **Completamente implementado y funcional**
- Sistema de permisos granular
- Protección de APIs y UI
- Navegación adaptativa
- Compatibilidad con roles existentes
- Documentación completa

## Próximos Pasos Recomendados
1. Implementar JWT real para autenticación
2. Agregar logs de auditoría para acciones sensibles
3. Implementar caché de permisos para mejor rendimiento
4. Agregar tests unitarios para el sistema de permisos
