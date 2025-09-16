// src/app/api/auth/perfil/route.ts
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

const INTERNAL_BASE = process.env.INTERNAL_BACKEND_URL;          // p.ej. http://host.docker.internal:4000/api
const PUBLIC_BASE   = process.env.NEXT_PUBLIC_BACKEND_URL;       // p.ej. https://mudras.nqn.net.ar/api

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
    const res = await fetch(join(base, '/auth/perfil'), {
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
      const text = await res.text();
      return new NextResponse(text || 'Token inválido', { status: res.status });
    }

    const ct = res.headers.get('content-type') || '';
    if (!/application\/json/i.test(ct)) {
      const text = await res.text();
      return new NextResponse(text || 'Respuesta no JSON del backend', { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('❌ [/api/auth/perfil] Error backend:', err?.message || err);
    return new NextResponse('Error conectando al backend', { status: 502 });
  }
}
