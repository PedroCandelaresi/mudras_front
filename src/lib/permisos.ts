"use client";
import { useEffect, useMemo, useState, useRef } from 'react';
import { obtenerPerfil, obtenerPermisosEfectivos, type PerfilResponse } from './auth';

// Cache global para evitar múltiples llamadas
let perfilCache: PerfilResponse['perfil'] | null = null;
let permisosCache: string[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Hook de permisos del usuario actual basado en el perfil.
 * - Admin (rol 'administrador') => todos los permisos permitidos.
 * - Para el resto, por ahora devolvemos false (pendiente: integrar endpoint de permisos explícitos si existe).
 */
export function usePermisos() {
  const [perfil, setPerfil] = useState<PerfilResponse['perfil'] | null>(perfilCache);
  const [cargando, setCargando] = useState<boolean>(!perfilCache);
  const [permisos, setPermisos] = useState<string[]>(permisosCache);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Si ya tenemos cache válido, no hacer fetch
    const now = Date.now();
    if (perfilCache && (now - cacheTimestamp) < CACHE_DURATION) {
      setPerfil(perfilCache);
      setPermisos(permisosCache);
      setCargando(false);
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let mounted = true;
    (async () => {
      try {
        const p = await obtenerPerfil();
        if (mounted) {
          setPerfil(p);
          perfilCache = p;
          cacheTimestamp = Date.now();
        }
        if (p) {
          const perms = await obtenerPermisosEfectivos();
          if (mounted) {
            setPermisos(perms || []);
            permisosCache = perms || [];
          }
        }
      } finally {
        if (mounted) setCargando(false);
        fetchedRef.current = false;
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
