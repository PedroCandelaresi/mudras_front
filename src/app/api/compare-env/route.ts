import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const result = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apolloConfig: {
      graphqlUri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql',
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      secretKey: process.env.NEXT_PUBLIC_X_SECRET_KEY ? 'PRESENTE' : 'FALTANTE',
    },
    urlAnalysis: {
      // En local: graphqlUri sería "/api/graphql" 
      // En producción: graphqlUri sería "https://mudras.nqn.net.ar/api/graphql"
      isAbsoluteUrl: (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql').startsWith('http'),
      finalUri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql',
    },
    tests: {} as Record<string, any>,
  };

  // Test 1: GraphQL con URI actual
  const currentUri = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql';
  try {
    const response = await fetch(currentUri.startsWith('http') ? currentUri : `${req.nextUrl.origin}${currentUri}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEXT_PUBLIC_X_SECRET_KEY ? { 'X-Secret-Key': process.env.NEXT_PUBLIC_X_SECRET_KEY } : {}),
      },
      body: JSON.stringify({
        query: `query { __schema { queryType { name } } }`
      }),
    });
    const data = await response.json();
    result.tests.graphqlWithCurrentConfig = {
      url: currentUri.startsWith('http') ? currentUri : `${req.nextUrl.origin}${currentUri}`,
      ok: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error) {
    result.tests.graphqlWithCurrentConfig = {
      error: String(error),
    };
  }

  // Test 2: GraphQL con URI relativa (como en local)
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
    result.tests.graphqlWithRelativeUri = {
      url: `${req.nextUrl.origin}/api/graphql`,
      ok: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error) {
    result.tests.graphqlWithRelativeUri = {
      error: String(error),
    };
  }

  return NextResponse.json(result, { status: 200 });
}
