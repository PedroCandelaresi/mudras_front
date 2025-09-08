import { apiFetch } from './api';

export interface PerfilResponse {
  perfil: {
    sub: string;
    username: string | null;
    roles: string[]; // slugs, p.ej. 'administrador'
    typ: 'EMPRESA' | 'CLIENTE';
    iat?: number;
    exp?: number;
  }
}

export async function obtenerPerfil(): Promise<PerfilResponse['perfil'] | null> {
  try {
    const res = await apiFetch<{ perfil: PerfilResponse['perfil'] }>(`/auth/perfil`);
    return res.perfil;
  } catch {
    return null;
  }
}

export async function obtenerPermisosEfectivos(): Promise<string[]> {
  try {
    const res = await apiFetch<{ permisos: string[] }>(`/auth/permisos`);
    return res.permisos || [];
  } catch {
    return [];
  }
}
