import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const result = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: req.nextUrl.toString(),
    tests: {} as Record<string, any>,
  };

  // Test 1: Verificar variables de entorno
  result.tests.environment = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_X_SECRET_KEY: process.env.NEXT_PUBLIC_X_SECRET_KEY ? 'PRESENTE' : 'FALTANTE',
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'NO DEFINIDO',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  };

  // Test 2: Probar GraphQL directo al backend
  try {
    const backendUrl = 'http://127.0.0.1:4000/graphql';
    const response = await fetch(backendUrl, {
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
      url: backendUrl,
      ok: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
    };
  } catch (error) {
    result.tests.backendDirecto = {
      error: String(error),
    };
  }

  // Test 3: Probar GraphQL a través del proxy
  try {
    const proxyUrl = `${req.nextUrl.origin}/api/graphql`;
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query { __schema { queryType { name } } }`
      }),
    });
    
    const data = await response.json();
    result.tests.proxyGraphQL = {
      url: proxyUrl,
      ok: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
    };
  } catch (error) {
    result.tests.proxyGraphQL = {
      error: String(error),
    };
  }

  // Test 4: Probar query de artículos
  try {
    const response = await fetch('http://127.0.0.1:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret-Key': process.env.NEXT_PUBLIC_X_SECRET_KEY || '',
      },
      body: JSON.stringify({
        query: `query BuscarArticulos($filtros: FiltrosArticuloDto!) {
          buscarArticulos(filtros: $filtros) {
            articulos {
              id
              Descripcion
              PrecioVenta
              Deposito
            }
            total
          }
        }`,
        variables: {
          filtros: {
            pagina: 0,
            limite: 5,
            ordenarPor: 'Descripcion',
            direccionOrden: 'ASC'
          }
        }
      }),
    });
    
    const data = await response.json();
    result.tests.queryArticulos = {
      ok: response.ok,
      status: response.status,
      data: data,
      hasArticulos: data?.data?.buscarArticulos?.articulos?.length > 0,
      totalArticulos: data?.data?.buscarArticulos?.total || 0,
    };
  } catch (error) {
    result.tests.queryArticulos = {
      error: String(error),
    };
  }

  return NextResponse.json(result, { status: 200 });
}
