import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('mudras_token')?.value;
  if (!token) {
    return new NextResponse('No autenticado', { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/auth/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return new NextResponse('Token inválido', { status: 401 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
