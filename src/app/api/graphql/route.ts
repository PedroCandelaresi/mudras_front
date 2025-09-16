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

function getTarget(): string | null {
  const igql = process.env.INTERNAL_GRAPHQL_URL;
  if (igql) return igql;
  const ibase = process.env.INTERNAL_BACKEND_URL;
  if (ibase) return join(ibase, '/graphql');
  // último recurso: podría crear loop si apunta al dominio público
  const pub = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  return pub ?? null;
}

function pickAgent(url: string) {
  return url.startsWith('https://') ? httpsAgent : httpAgent;
}

async function proxy(req: NextRequest, method: 'POST' | 'GET') {
  const target = getTarget();
  if (!target) {
    return new NextResponse('INTERNAL_GRAPHQL_URL no configurada', { status: 500 });
  }

  // ✅ Tomar token desde cookies del request (no usamos cookies() para evitar el warning)
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
  const secret = process.env.X_SECRET_KEY;
  if (secret) headers['X-Secret-Key'] = secret;

  const url = method === 'GET' ? `${target}${new URL(req.url).search}` : target;
  const agent = pickAgent(target);

  const upstream = await fetch(url, {
    method,
    headers,
    body: method === 'POST' ? await req.text() : undefined,
    // @ts-ignore: Node runtime acepta 'agent'
    agent,
  });

  // No dejamos que el backend setee cookies directo al cliente
  const respHeaders = new Headers(upstream.headers);
  respHeaders.delete('set-cookie');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function POST(req: NextRequest) {
  return proxy(req, 'POST');
}

export async function GET(req: NextRequest) {
  return proxy(req, 'GET');
}

// Opcional: preflights
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
