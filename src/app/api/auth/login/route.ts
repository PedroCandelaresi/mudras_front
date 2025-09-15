import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
console.log('🚀 [LOGIN] BACKEND_URL:', BACKEND_URL);
export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return new NextResponse('BACKEND_URL no configurada', { status: 500 });
  }

  const body = await req.json();
  const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.NEXT_PUBLIC_X_SECRET_KEY ? { 'X-Secret-Key': process.env.NEXT_PUBLIC_X_SECRET_KEY } : {}),
    },
    body: JSON.stringify(body),
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
      maxAge: 60 * 60, // 1 hora
    });
  }

  return respuesta;
}
