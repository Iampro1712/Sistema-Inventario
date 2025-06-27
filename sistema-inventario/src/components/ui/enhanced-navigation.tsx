'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '@/contexts/navigation-context';
import { cn } from '@/lib/utils';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/productos': 'Productos',
  '/categorias': 'Categorías',
  '/movimientos': 'Movimientos',
  '/alertas': 'Alertas',
  '/reportes': 'Reportes',
  '/usuarios': 'Usuarios',
  '/configuracion': 'Configuración',
  '/perfil': 'Perfil'
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const { navigate, isLoading } = useNavigation();

  // Generar breadcrumbs basado en la ruta actual
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Dashboard', href: '/', current: pathname === '/' }
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    const name = routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      name,
      href: currentPath,
      current: isLast
    });
  });

  // Si estamos en el dashboard, no mostrar breadcrumbs
  if (pathname === '/') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <button
        onClick={() => navigate('/')}
        className={cn(
          "flex items-center hover:text-foreground transition-colors",
          isLoading && "pointer-events-none opacity-50"
        )}
        disabled={isLoading}
      >
        <Home className="h-4 w-4" />
      </button>
      
      {breadcrumbs.slice(1).map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {breadcrumb.current ? (
            <span className="font-medium text-foreground">
              {breadcrumb.name}
            </span>
          ) : (
            <button
              onClick={() => navigate(breadcrumb.href)}
              className={cn(
                "hover:text-foreground transition-colors",
                isLoading && "pointer-events-none opacity-50"
              )}
              disabled={isLoading}
            >
              {breadcrumb.name}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}

// Componente para mostrar el estado de carga en la página
export function PageLoadingState() {
  const { isLoading } = useNavigation();

  if (!isLoading) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Cargando página...</span>
        </div>
      </div>
    </div>
  );
}
