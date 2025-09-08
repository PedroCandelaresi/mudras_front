import { CredencialesLogin, RespuestaLogin, UsuarioSesion } from '@/interfaces/auth';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export async function login(c: CredencialesLogin): Promise<RespuestaLogin> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || 'Error de autenticación');
  }
  return (await res.json()) as RespuestaLogin;
}

export async function obtenerPerfil(): Promise<{ perfil: UsuarioSesion & { roles: string[] } } | null> {
  const res = await fetch(`${BASE_URL}/api/auth/perfil`, { cache: 'no-store' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('No se pudo obtener el perfil');
  return (await res.json()) as { perfil: UsuarioSesion & { roles: string[] } };
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
}
