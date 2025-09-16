import { NextRequest, NextResponse } from 'next/server';
import http from 'node:http';
import https from 'node:https';

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

function join(base: string, path: string) {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function POST(req: NextRequest) {
  const BASE =
    process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  console.log('🚀 [LOGIN] BASE URL usada por SSR:', BASE);

  if (!BASE) {
    return new NextResponse('BACKEND_URL no configurada', { status: 500 });
  }

  try {
    const body = await req.json();

    const isHttps = BASE.startsWith('https://');
    const agent = isHttps ? httpsAgent : httpAgent;

    const res = await fetch(join(BASE, '/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.X_SECRET_KEY
          ? { 'X-Secret-Key': process.env.X_SECRET_KEY }
          : {}),
      },
      body: JSON.stringify(body),
      // timeouts razonables para evitar bucles colgados
      // @ts-ignore (Node fetch soporta estos campos en runtime)
      agent,
    });

    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text || 'Credenciales inválidas', {
        status: res.status,
      });
    }

    const contentType = res.headers.get('content-type') || '';
    if (!/application\/json/i.test(contentType)) {
      const text = await res.text();
      return new NextResponse(text || 'Respuesta no JSON del backend', {
        status: 502,
      });
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
    console.error('❌ [LOGIN] Error fetch backend:', err?.message || err);
    return new NextResponse('Error conectando al backend', { status: 502 });
  }
}
