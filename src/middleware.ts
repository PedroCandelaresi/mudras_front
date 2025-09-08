import { NextRequest, NextResponse } from 'next/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = new Set<string>([
  '/',
  '/login',
  '/registro',
]);

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Permitir siempre APIs y assets
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const isPublic = Array.from(PUBLIC_PATHS).some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPanel = pathname === '/panel' || pathname.startsWith('/panel/');

  // Leer posibles cookies de token
  const token = req.cookies.get('mudras_token')?.value
    || req.cookies.get('mudras_jwt')?.value
    || req.cookies.get('access_token')?.value
    || req.cookies.get('auth_token')?.value;

  if (isPanel && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    // redirigir con query 'siguiente' para volver post-login
    url.search = `?siguiente=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
