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
    console.log('🔐 [AUTH] Obteniendo perfil de usuario...');
    const res = await apiFetch<{ perfil: PerfilResponse['perfil'] }>(`/auth/perfil`);
    console.log('🔐 [AUTH] Perfil obtenido:', res.perfil);
    return res.perfil;
  } catch (error) {
    console.error('🔐 [AUTH] Error obteniendo perfil:', error);
    return null;
  }
}

export async function obtenerPermisosEfectivos(): Promise<string[]> {
  try {
    console.log('🔑 [PERMISOS] Obteniendo permisos efectivos...');
    const res = await apiFetch<{ permisos: string[] }>(`/auth/permisos`);
    console.log('🔑 [PERMISOS] Permisos obtenidos:', res.permisos);
    return res.permisos || [];
  } catch (error) {
    console.error('🔑 [PERMISOS] Error obteniendo permisos:', error);
    return [];
  }
}
