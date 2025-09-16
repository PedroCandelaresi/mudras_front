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

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

async function proxy(req: NextRequest, path: string[]) {
  const base = INTERNAL_BASE || PUBLIC_BASE;
  if (!base) return new NextResponse('BACKEND_URL no configurada', { status: 500 });

  const targetPath = '/' + (path?.join('/') || '');
  const qs = req.nextUrl.search || '';
  const targetUrl = join(base, targetPath) + qs;

  const headers: Record<string, string> = {};
  // Content-Type si existe
  const ct = req.headers.get('content-type');
  if (ct) headers['Content-Type'] = ct;

  // Reenviar Authorization si existe cookie con token
  const token = req.cookies.get('mudras_token')?.value
    || req.cookies.get('mudras_jwt')?.value
    || req.cookies.get('access_token')?.value
    || req.cookies.get('auth_token')?.value;
  if (token) headers['Authorization'] = /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;

  // Reenviar X-Secret-Key si está configurado
  const secretKey = process.env.X_SECRET_KEY;
  if (secretKey) headers['X-Secret-Key'] = secretKey;

  // Reenviar todas las cookies hacia el backend (para guards que lean cookie directamente)
  const incomingCookie = req.headers.get('cookie');
  if (incomingCookie) headers['Cookie'] = incomingCookie;

  // Construir init
  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
    // @ts-ignore
    agent: pickAgent(base),
  };

  // Body si corresponde
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const bodyText = await req.text();
    init.body = bodyText;
  }

  console.info('[API /api/rest] ->', req.method, targetUrl);
  const upstream = await fetch(targetUrl, init);
  const text = await upstream.text();
  if (!upstream.ok) {
    console.warn('[API /api/rest] <-', upstream.status, upstream.statusText, '| body:', text?.slice(0, 300));
  } else {
    console.info('[API /api/rest] <-', upstream.status, upstream.headers.get('content-type'));
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
  });
}
