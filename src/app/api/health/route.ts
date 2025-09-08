import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: NextRequest) {
  const base = BACKEND_URL.replace(/\/$/, '');

  type HealthResult = {
    backendUrl: string;
    timestamp: string;
    checks: Record<string, unknown>;
  };

  const result: HealthResult = {
    backendUrl: base,
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Copiar cookies entrantes (para probar /auth/perfil si ya hay login)
  const incomingCookie = req.headers.get('cookie') || undefined;

  // 1) Check REST /auth/perfil directamente al backend
  try {
    const res = await fetch(`${base}/auth/perfil`, {
      method: 'GET',
      headers: {
        ...(incomingCookie ? { Cookie: incomingCookie } : {}),
        ...(process.env.NEXT_PUBLIC_X_SECRET_KEY ? { 'X-Secret-Key': process.env.NEXT_PUBLIC_X_SECRET_KEY } : {}),
      },
    });
    const text = await res.text();
    result.checks = {
      ...result.checks,
      restPerfilDirecto: {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        sample: text.slice(0, 200),
      },
    };
  } catch (e: unknown) {
    result.checks = { ...result.checks, restPerfilDirecto: { ok: false, error: String(e) } };
  }

  // 2) Check GraphQL directamente al backend (introspection mínima)
  try {
    const gql = await fetch(`${base}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(incomingCookie ? { Cookie: incomingCookie } : {}),
        ...(process.env.NEXT_PUBLIC_X_SECRET_KEY ? { 'X-Secret-Key': process.env.NEXT_PUBLIC_X_SECRET_KEY } : {}),
      },
      body: JSON.stringify({ query: `query __Health { __schema { queryType { name } } }` }),
    });
    const text = await gql.text();
    result.checks = {
      ...result.checks,
      graphqlDirecto: {
        ok: gql.ok,
        status: gql.status,
        statusText: gql.statusText,
        sample: text.slice(0, 200),
      },
    };
  } catch (e: unknown) {
    result.checks = { ...result.checks, graphqlDirecto: { ok: false, error: String(e) } };
  }

  // 3) Check a través del proxy REST /api/rest
  try {
    const restProxy = await fetch(`${req.nextUrl.origin}/api/rest/auth/perfil`, {
      method: 'GET',
      headers: {
        ...(incomingCookie ? { Cookie: incomingCookie } : {}),
      },
    });
    const text = await restProxy.text();
    result.checks = {
      ...result.checks,
      restPerfilProxy: {
        ok: restProxy.ok,
        status: restProxy.status,
        statusText: restProxy.statusText,
        sample: text.slice(0, 200),
      },
    };
  } catch (e: unknown) {
    result.checks = { ...result.checks, restPerfilProxy: { ok: false, error: String(e) } };
  }

  return NextResponse.json(result);
}
