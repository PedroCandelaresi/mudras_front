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
const PUBLIC_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;       // p.ej. https://mudras.nqn.net.ar/api

export async function POST(req: NextRequest) {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) return new NextResponse('BACKEND_URL no configurada', { status: 500 });

  console.log('🚀 [LOGIN] BASE URL usada por SSR:', base);

  try {
    const body = await req.json();

    console.log('🚀 [LOGIN] Sending request to:', join(base, '/auth/login'));
    const res = await fetch(join(base, '/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.X_SECRET_KEY ? { 'X-Secret-Key': process.env.X_SECRET_KEY } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      // @ts-ignore
      agent: pickAgent(base),
    });

    console.log('🚀 [LOGIN] Backend response status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ [LOGIN] Backend error:', text);
      return new NextResponse(text || 'Credenciales inválidas', {
        status: res.status,
      });
    }

    const contentType = res.headers.get('content-type') || '';
    console.log('🚀 [LOGIN] Response content-type:', contentType);
    if (!/application\/json/i.test(contentType)) {
      const text = await res.text();
      console.error('❌ [LOGIN] Non-JSON response:', text);
      return new NextResponse(text || 'Respuesta no JSON del backend', {
        status: 502,
      });
    }

    const data = await res.json();
    console.log('🚀 [LOGIN] Backend data received. Tokens present?', !!data.accessToken);
    const accessToken: string | undefined = data.accessToken;
    const refreshToken: string | undefined = data.refreshToken;

    const respuesta = NextResponse.json({ usuario: data.usuario });

    if (accessToken) {
      respuesta.cookies.set('mudras_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        // Mantener la sesión activa al menos 24hs
        maxAge: 60 * 60 * 24,
      });
    }

    if (refreshToken) {
      respuesta.cookies.set('mudras_refresh', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        // El refresh por defecto dura 7 días en el backend
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return respuesta;
  } catch (err: any) {
    console.error('❌ [LOGIN] Error fetch backend:', err?.message || err);
    return new NextResponse('Error conectando al backend', { status: 502 });
  }
}
