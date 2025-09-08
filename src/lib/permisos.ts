"use client";
import { useEffect, useMemo, useState } from 'react';
import { obtenerPerfil, obtenerPermisosEfectivos, type PerfilResponse } from './auth';

/**
 * Hook de permisos del usuario actual basado en el perfil.
 * - Admin (rol 'administrador') => todos los permisos permitidos.
 * - Para el resto, por ahora devolvemos false (pendiente: integrar endpoint de permisos explícitos si existe).
 */
export function usePermisos() {
  const [perfil, setPerfil] = useState<PerfilResponse['perfil'] | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [permisos, setPermisos] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await obtenerPerfil();
        if (mounted) setPerfil(p);
        if (p) {
          const perms = await obtenerPermisosEfectivos();
          if (mounted) setPermisos(perms || []);
        }
      } finally {
        if (mounted) setCargando(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const esAdmin = useMemo(() => Boolean(perfil?.roles?.includes('administrador')), [perfil]);

  function tienePermiso(permiso: string): boolean {
    if (esAdmin) return true;
    if (!permiso) return false;
    if (permisos.includes('*')) return true;
    return permisos.includes(permiso);
  }

  return { perfil, cargando, esAdmin, tienePermiso, permisos };
}
