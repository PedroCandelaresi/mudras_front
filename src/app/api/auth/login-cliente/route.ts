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
const PUBLIC_BASE   = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(req: NextRequest) {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) return new NextResponse('BACKEND_URL no configurada', { status: 500 });

  try {
    const body = await req.json();
    const res = await fetch(join(base, '/auth/login-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.X_SECRET_KEY ? { 'X-Secret-Key': process.env.X_SECRET_KEY as any } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      // @ts-ignore
      agent: pickAgent(base),
    });

    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text || 'Credenciales inválidas', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || '';
    if (!/application\/json/i.test(contentType)) {
      const text = await res.text();
      return new NextResponse(text || 'Respuesta no JSON del backend', { status: 502 });
    }

    const data = await res.json();
    const token: string | undefined = data.accessToken;
    const respuesta = NextResponse.json({ usuario: data.usuario });
    if (token) {
      respuesta.cookies.set('mudras_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60,
      });
    }
    return respuesta;
  } catch (err: any) {
    return new NextResponse('Error conectando al backend', { status: 502 });
  }
}
