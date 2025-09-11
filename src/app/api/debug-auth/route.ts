import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  const mudrasToken = req.cookies.get('mudras_token')?.value;
  
  return NextResponse.json({
    cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    mudrasToken: mudrasToken ? 'PRESENTE' : 'AUSENTE',
    cookieHeader: req.headers.get('cookie') || 'NO HAY HEADER COOKIE',
  });
}
