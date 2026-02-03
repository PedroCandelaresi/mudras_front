import { NextRequest, NextResponse } from 'next/server';

const PROTEGIDAS = [/^\/panel(\/.*)?$/];
const PROTEGIDAS_CLIENTE = [/^\/cliente\/panel(\/.*)?$/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Permitir recursos públicos y rutas de auth/api
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname === '/login' ||
    pathname === '/' ||
    pathname === '/cliente'
  ) {
    return NextResponse.next();
  }

  const requiereAuth = PROTEGIDAS.some((re) => re.test(pathname));
  const requiereAuthCliente = PROTEGIDAS_CLIENTE.some((re) => re.test(pathname));
  if (!requiereAuth && !requiereAuthCliente) return NextResponse.next();

  const token = req.cookies.get('mudras_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = requiereAuthCliente ? '/cliente' : '/login';
    url.searchParams.set('siguiente', pathname);
    return NextResponse.redirect(url);
  }

  // Redirecciones por tipo de usuario
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000';
  try {
    const resp = await fetch(`${backendUrl}/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
      // middleware en edge: limitar tiempo
      cache: 'no-store',
    });
    if (resp.ok) {
      const data = (await resp.json()) as { perfil?: { typ?: 'EMPRESA' | 'CLIENTE' } };
      const typ = data?.perfil?.typ;
      if (typ === 'CLIENTE' && PROTEGIDAS.some((re) => re.test(pathname))) {
        const url = req.nextUrl.clone();
        url.pathname = '/cliente/panel';
        return NextResponse.redirect(url);
      }
      if (typ === 'EMPRESA' && pathname.startsWith('/cliente') && !PROTEGIDAS_CLIENTE.some((re) => re.test(pathname))) {
        const url = req.nextUrl.clone();
        url.pathname = '/panel';
        return NextResponse.redirect(url);
      }
    }
  } catch {
    // Ignorar errores de red; permitir paso si ya tiene token
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|logo.svg).*)'],
};
