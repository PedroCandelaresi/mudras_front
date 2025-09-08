import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text || 'Credenciales inválidas', { status: res.status });
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
