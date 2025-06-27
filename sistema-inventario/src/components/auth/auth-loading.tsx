"use client";

import { Loader2, Building } from 'lucide-react';

export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
            <Building className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Sistema de Inventario</h1>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>

        {/* Spinner de carga */}
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>

        {/* Mensaje adicional */}
        <p className="text-sm text-muted-foreground">
          Por favor espera mientras verificamos tu sesión
        </p>

        {/* Barra de progreso animada */}
        <div className="w-full bg-muted rounded-full h-1">
          <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Building className="h-8 w-8 text-destructive" />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Error de Autenticación</h1>
          <p className="text-muted-foreground">
            Hubo un problema al verificar tu sesión
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Reintentar
            </button>
          )}
          
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Ir al Login
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
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              🗑️ Limpiar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
