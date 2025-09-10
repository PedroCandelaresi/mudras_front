import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const result = {
    timestamp: new Date().toISOString(),
    tests: {} as Record<string, any>,
  };

  // Test 1: GraphQL directo al backend
  try {
    const response = await fetch('http://127.0.0.1:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret-Key': process.env.NEXT_PUBLIC_X_SECRET_KEY || '',
      },
      body: JSON.stringify({
        query: `query { __schema { queryType { name } } }`
      }),
    });
    const data = await response.json();
    result.tests.backendDirecto = {
      ok: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error) {
    result.tests.backendDirecto = {
      error: String(error),
    };
  }

  // Test 2: GraphQL a través del proxy nginx
  try {
    const response = await fetch(`${req.nextUrl.origin}/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query { __schema { queryType { name } } }`
      }),
    });
    const data = await response.json();
    result.tests.nginxProxy = {
      ok: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error) {
    result.tests.nginxProxy = {
      error: String(error),
    };
  }

  // Test 3: Query de artículos directo al backend
  try {
    const response = await fetch('http://127.0.0.1:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret-Key': process.env.NEXT_PUBLIC_X_SECRET_KEY || '',
      },
      body: JSON.stringify({
        query: `query GetArticulos { 
          articulos { 
            id 
            nombre 
            precio 
            deposito 
          } 
        }`
      }),
    });
    const data = await response.json();
    result.tests.articulosDirecto = {
      ok: response.ok,
      status: response.status,
      data: data,
      hasArticulos: data?.data?.articulos?.length > 0,
    };
  } catch (error) {
    result.tests.articulosDirecto = {
      error: String(error),
    };
  }

  // Test 4: Variables de entorno
  result.tests.environment = {
    NEXT_PUBLIC_X_SECRET_KEY: process.env.NEXT_PUBLIC_X_SECRET_KEY ? 'PRESENTE' : 'FALTANTE',
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(result, { status: 200 });
}
