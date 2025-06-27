"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Shield } from 'lucide-react';
import { AuthLoading } from './auth-loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir al login
    if (!loading && !isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [loading, isAuthenticated, router, pathname]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return fallback || <AuthLoading />;
  }

  // Si no está autenticado, mostrar mensaje de acceso denegado
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Acceso Restringido</h2>
            <p className="text-sm text-muted-foreground">
              Necesitas iniciar sesión para acceder a esta página.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                // Limpiar localStorage
                localStorage.removeItem('currentUserId');
                localStorage.removeItem('auth-token');

                // Limpiar cookies
                document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

                // Recargar la página para limpiar el estado
                window.location.reload();
              }}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              🗑️ Limpiar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
}

// Hook para verificar autenticación en componentes
export function useRequireAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [loading, isAuthenticated, router, pathname]);

  return { user, loading, isAuthenticated };
}
