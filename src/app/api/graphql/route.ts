import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function POST(req: NextRequest) {
  const body = await req.text(); // mantener el body tal cual
  const token = req.cookies.get('mudras_token')?.value
    || req.cookies.get('mudras_jwt')?.value
    || req.cookies.get('access_token')?.value
    || req.cookies.get('auth_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };
  if (token) {
    headers['Authorization'] = /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
  }
  const secretKey = process.env.NEXT_PUBLIC_X_SECRET_KEY;
  if (secretKey) headers['X-Secret-Key'] = secretKey;
  // Reenviar cookies originales por si el backend lee JWT desde Cookie
  const incomingCookie = req.headers.get('cookie');
  if (incomingCookie) headers['Cookie'] = incomingCookie;

  const target = `${BACKEND_URL.replace(/\/$/, '')}/graphql`;
  console.info('[API /api/graphql] reenviando a:', target, '| token presente:', Boolean(token));
  const upstream = await fetch(target, {
    method: 'POST',
    headers,
    body,
    // No usamos credentials aquí; reenviamos manualmente headers necesarios
  });

  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
  });
  return res;
}
