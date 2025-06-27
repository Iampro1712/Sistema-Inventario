import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/',
  '/productos',
  '/usuarios',
  '/reportes',
  '/configuracion',
  '/perfil'
];

// Rutas públicas (no requieren autenticación)
const publicRoutes = [
  '/login'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual está protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Si es una ruta protegida, verificar autenticación
  if (isProtectedRoute) {
    // En el middleware no podemos acceder a localStorage directamente
    // Usaremos una cookie para verificar la autenticación
    const authToken = request.cookies.get('auth-token');
    
    if (!authToken) {
      // Si no hay token de autenticación, redirigir al login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Si el usuario está autenticado y trata de acceder al login, redirigir al dashboard
  if (isPublicRoute && pathname === '/login') {
    const authToken = request.cookies.get('auth-token');
    if (authToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
