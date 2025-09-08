"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Box, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TextField } from '@mui/material';
import { IconAdjustments } from '@tabler/icons-react';

export interface PermisoItem { id: string; resource: string; action: string; description?: string | null; }
export interface RolePermission { permission: PermisoItem }
export interface RolItem { id: string; name: string; slug: string; rolePermissions?: RolePermission[] }

interface Props {
  onAsignarPermisos: (rol: RolItem) => void;
  refetchToken?: number | string;
}

export function RolesTable({ onAsignarPermisos, refetchToken }: Props) {
  const [cargando, setCargando] = useState<boolean>(true);
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<{ campo: 'name' | 'slug'; dir: 'asc' | 'desc' }>({ campo: 'name', dir: 'asc' });

  async function cargar() {
    try {
      setCargando(true);
      const data = await apiFetch<RolItem[]>(`/roles`);
      setRoles(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar roles');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [refetchToken]);

  const rolesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let arr = !q ? roles : roles.filter((r) =>
      r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q)
    );
    arr = [...arr].sort((a, b) => {
      const ca = a[orden.campo].toLowerCase();
      const cb = b[orden.campo].toLowerCase();
      if (ca < cb) return orden.dir === 'asc' ? -1 : 1;
      if (ca > cb) return orden.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [roles, busqueda, orden]);

  function toggleOrden(campo: 'name' | 'slug') {
    setOrden((o) => o.campo === campo ? { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { campo, dir: 'asc' });
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField size="small" placeholder="Buscar rol (nombre o slug)" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} sx={{ maxWidth: 360 }} />
        {cargando && <CircularProgress size={20} />}
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => toggleOrden('name')} style={{ cursor: 'pointer' }}>
                Nombre {orden.campo === 'name' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell onClick={() => toggleOrden('slug')} style={{ cursor: 'pointer' }}>
                Slug {orden.campo === 'slug' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell>Permisos</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rolesFiltrados.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell><Chip size="small" label={r.slug} /></TableCell>
                <TableCell>
                  {(r.rolePermissions || []).map((rp) => (
                    <Chip key={rp.permission.id} size="small" label={`${rp.permission.resource}:${rp.permission.action}`} sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Asignar permisos">
                    <IconButton onClick={() => onAsignarPermisos(r)}>
                      <IconAdjustments size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
