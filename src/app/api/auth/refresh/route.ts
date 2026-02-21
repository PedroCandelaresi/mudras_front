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
const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function POST(req: NextRequest) {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) {
    return new NextResponse('BACKEND_URL no configurada', { status: 500 });
  }

  // Intentar obtener el refreshToken de la cookie o del body
  let refreshToken = req.cookies.get('mudras_refresh')?.value || '';

  try {
    const bodyText = await req.text();
    if (bodyText) {
      try {
        const parsed = JSON.parse(bodyText);
        if (parsed?.refreshToken && typeof parsed.refreshToken === 'string') {
          refreshToken = parsed.refreshToken;
        }
      } catch {
        // ignorar body inválido
      }
    }
  } catch {
    // ignorar errores leyendo el body
  }

  if (!refreshToken) {
    return new NextResponse('refreshToken is required', { status: 400 });
  }

  try {
    const res = await fetch(join(base, '/auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.X_SECRET_KEY ? { 'X-Secret-Key': process.env.X_SECRET_KEY as string } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      // @ts-ignore
      agent: pickAgent(base),
    });

    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text || 'Refresh inválido', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || '';
    if (!/application\/json/i.test(contentType)) {
      const text = await res.text();
      return new NextResponse(text || 'Respuesta no JSON del backend', { status: 502 });
    }

    const data = await res.json();
    const accessToken: string | undefined = data.accessToken;
    const nuevoRefresh: string | undefined = data.refreshToken;

    const respuesta = NextResponse.json({ ok: true });

    if (accessToken) {
      respuesta.cookies.set('mudras_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
      });
    }

    if (nuevoRefresh) {
      respuesta.cookies.set('mudras_refresh', nuevoRefresh, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return respuesta;
  } catch (err: any) {
    console.error('❌ [/api/auth/refresh] Error backend:', err?.message || err);
    return new NextResponse('Error conectando al backend', { status: 502 });
  }
}
