import { NextRequest, NextResponse } from 'next/server';
import http from 'node:http';
import https from 'node:https';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

function join(base: string, path: string) {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function pickAgent(url: string) {
  return url.startsWith('https://') ? httpsAgent : httpAgent;
}

const INTERNAL_BASE = process.env.INTERNAL_BACKEND_URL;
const PUBLIC_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(req: NextRequest) {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) return new NextResponse('BACKEND_URL no configurada', { status: 500 });

  const token =
    req.cookies.get('mudras_token')?.value ||
    req.cookies.get('mudras_jwt')?.value ||
    req.cookies.get('access_token')?.value ||
    req.cookies.get('auth_token')?.value;

  if (!token) return new NextResponse('No autenticado', { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const url = join(base, `/users${queryString ? `?${queryString}` : ''}`);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`,
        ...(process.env.X_SECRET_KEY ? { 'X-Secret-Key': process.env.X_SECRET_KEY } : {}),
      },
      cache: 'no-store',
      // @ts-ignore
      agent: pickAgent(base),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return new NextResponse(errorText || `Error ${res.status}`, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en /api/users GET:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) return new NextResponse('BACKEND_URL no configurada', { status: 500 });

  const token =
    req.cookies.get('mudras_token')?.value ||
    req.cookies.get('mudras_jwt')?.value ||
    req.cookies.get('access_token')?.value ||
    req.cookies.get('auth_token')?.value;

  if (!token) return new NextResponse('No autenticado', { status: 401 });

  try {
    const body = await req.json();

    const res = await fetch(join(base, '/users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`,
        ...(process.env.X_SECRET_KEY ? { 'X-Secret-Key': process.env.X_SECRET_KEY } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      // @ts-ignore
      agent: pickAgent(base),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return new NextResponse(errorText || `Error ${res.status}`, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en /api/users POST:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) return new NextResponse('BACKEND_URL no configurada', { status: 500 });

  const token =
    req.cookies.get('mudras_token')?.value ||
    req.cookies.get('mudras_jwt')?.value ||
    req.cookies.get('access_token')?.value ||
    req.cookies.get('auth_token')?.value;

  if (!token) return new NextResponse('No autenticado', { status: 401 });

  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const url = join(base, `/users${queryString ? `?${queryString}` : ''}`);

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`,
        ...(process.env.X_SECRET_KEY ? { 'X-Secret-Key': process.env.X_SECRET_KEY } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      // @ts-ignore
      agent: pickAgent(base),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return new NextResponse(errorText || `Error ${res.status}`, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en /api/users PUT:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) return new NextResponse('BACKEND_URL no configurada', { status: 500 });

  const token =
    req.cookies.get('mudras_token')?.value ||
    req.cookies.get('mudras_jwt')?.value ||
    req.cookies.get('access_token')?.value ||
    req.cookies.get('auth_token')?.value;

  if (!token) return new NextResponse('No autenticado', { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const url = join(base, `/users${queryString ? `?${queryString}` : ''}`);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`,
        ...(process.env.X_SECRET_KEY ? { 'X-Secret-Key': process.env.X_SECRET_KEY } : {}),
      },
      cache: 'no-store',
      // @ts-ignore
      agent: pickAgent(base),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return new NextResponse(errorText || `Error ${res.status}`, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en /api/users DELETE:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
