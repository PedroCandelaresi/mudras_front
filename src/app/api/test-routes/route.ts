import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const result = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      NEXT_PUBLIC_X_SECRET_KEY: process.env.NEXT_PUBLIC_X_SECRET_KEY ? '***PRESENTE***' : 'FALTANTE',
    },
    urlTests: {} as Record<string, any>,
  };

  // Test 1: Variable BASE_URL
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';
  const testUrl1 = `${BASE_URL}/api/auth/perfil`;
  result.urlTests.baseUrlTest = {
    BASE_URL,
    constructedUrl: testUrl1,
    isEmpty: BASE_URL === '',
  };

  // Test 2: Fetch directo con BASE_URL
  try {
    const response = await fetch(testUrl1, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEXT_PUBLIC_X_SECRET_KEY ? { 'X-Secret-Key': process.env.NEXT_PUBLIC_X_SECRET_KEY } : {}),
      },
    });
    result.urlTests.fetchTest = {
      url: testUrl1,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    };
  } catch (error) {
    result.urlTests.fetchTest = {
      url: testUrl1,
      error: String(error),
    };
  }

  // Test 3: Fetch con origin del request
  const testUrl2 = `${req.nextUrl.origin}/api/auth/perfil`;
  try {
    const response = await fetch(testUrl2, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    result.urlTests.originTest = {
      origin: req.nextUrl.origin,
      url: testUrl2,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    };
  } catch (error) {
    result.urlTests.originTest = {
      origin: req.nextUrl.origin,
      url: testUrl2,
      error: String(error),
    };
  }

  // Test 4: Verificar si existe el endpoint /api/auth/perfil
  try {
    const response = await fetch(`${req.nextUrl.origin}/api/auth/perfil`, {
      method: 'HEAD', // Solo headers, no body
    });
    result.urlTests.endpointExists = {
      url: `${req.nextUrl.origin}/api/auth/perfil`,
      exists: response.status !== 404,
      status: response.status,
    };
  } catch (error) {
    result.urlTests.endpointExists = {
      url: `${req.nextUrl.origin}/api/auth/perfil`,
      error: String(error),
    };
  }

  return NextResponse.json(result, { status: 200 });
}
