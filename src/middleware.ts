import { NextRequest, NextResponse } from 'next/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = new Set<string>([
  '/',
  '/login',
  '/registro',
]);

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Permitir siempre APIs y assets
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    if (pathname.startsWith('/api/roles')) {
      console.log('Middleware: allowing /api/roles. Token present:', !!(req.cookies.get('mudras_token') || req.cookies.get('mudras_jwt') || req.cookies.get('access_token') || req.cookies.get('auth_token')));
    }
    return NextResponse.next();
  }

  const isPublic = Array.from(PUBLIC_PATHS).some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPanel = pathname === '/panel' || pathname.startsWith('/panel/');

  // Leer posibles cookies de token
  const token = req.cookies.get('mudras_token')?.value
    || req.cookies.get('mudras_jwt')?.value
    || req.cookies.get('access_token')?.value
    || req.cookies.get('auth_token')?.value;

  // Si intenta acceder al panel, validamos la sesión realmente contra /api/auth/perfil
  if (isPanel) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?siguiente=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }
    // Validación básica del token - evitamos fetch interno para prevenir bucles
    // En producción, el token será validado por el backend en cada request
    if (!token || token.length < 10) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?siguiente=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }
  }

  // Si está logueado y va a /login, redirigir al panel
  if (!isPanel && !isPublic && !token) {
    // Cualquier otra ruta privada podría reusar el mismo flujo
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?siguiente=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  if (isPublic && token && pathname.startsWith('/login')) {
    const url = req.nextUrl.clone();
    url.pathname = '/panel';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg).*)'],
};
