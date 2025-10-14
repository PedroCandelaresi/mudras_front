// app/api/graphql/route.ts
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

async function proxy(req: NextRequest, method: 'POST' | 'GET') {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) return new NextResponse('BACKEND_URL no configurada', { status: 500 });

  const token =
    req.cookies.get('mudras_token')?.value ||
    req.cookies.get('mudras_jwt')?.value ||
    req.cookies.get('access_token')?.value ||
    req.cookies.get('auth_token')?.value;

  const headers: Record<string, string> = {};
  if (method === 'POST') {
    headers['Content-Type'] = req.headers.get('content-type') || 'application/json';
  }
  if (token) {
    headers['Authorization'] = /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
  }
  const secret =
    process.env.X_SECRET_KEY ||
    process.env.NEXT_PUBLIC_X_SECRET_KEY;
  if (secret) headers['X-Secret-Key'] = secret;

  const url = method === 'GET' ? `${join(base, '/graphql')}${new URL(req.url).search}` : join(base, '/graphql');
  const agent = pickAgent(base);

  try {
    const upstream = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? await req.text() : undefined,
      cache: 'no-store',
      // @ts-ignore
      agent,
    });

    // No dejamos que el backend setee cookies directo al cliente
    const respHeaders = new Headers(upstream.headers);
    respHeaders.delete('set-cookie');

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error('❌ [/api/graphql] Error backend:', err?.message || err);
    return new NextResponse('Error conectando al backend', { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  return proxy(req, 'POST');
}

export async function GET(req: NextRequest) {
  return proxy(req, 'GET');
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
