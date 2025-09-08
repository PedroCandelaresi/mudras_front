"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TextField } from '@mui/material';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

export interface PermisoListado { id: string; resource: string; action: string; description?: string | null }

interface Props {
  onCrear?: () => void;
  onEditar?: (p: PermisoListado) => void;
  onEliminar?: (p: PermisoListado) => void;
  refetchToken?: number | string;
}

export function PermisosTable({ onCrear, onEditar, onEliminar, refetchToken }: Props) {
  const [cargando, setCargando] = useState<boolean>(true);
  const [permisos, setPermisos] = useState<PermisoListado[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<{ campo: 'resource' | 'action'; dir: 'asc' | 'desc' }>({ campo: 'resource', dir: 'asc' });

  async function cargar() {
    try {
      setCargando(true);
      const data = await apiFetch<PermisoListado[]>(`/permissions`);
      setPermisos(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar permisos');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [refetchToken]);

  const permisosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let arr = !q ? permisos : permisos.filter((p) => `${p.resource}:${p.action}`.toLowerCase().includes(q));
    arr = [...arr].sort((a, b) => {
      const ca = a[orden.campo].toLowerCase();
      const cb = b[orden.campo].toLowerCase();
      if (ca < cb) return orden.dir === 'asc' ? -1 : 1;
      if (ca > cb) return orden.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [permisos, busqueda, orden]);

  function toggleOrden(campo: 'resource' | 'action') {
    setOrden((o) => o.campo === campo ? { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { campo, dir: 'asc' });
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <div className="flex items-center gap-2">
          <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={onCrear}>Nuevo Permiso</Button>
          <TextField size="small" placeholder="Buscar (recurso:acción)" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} sx={{ maxWidth: 360 }} />
        </div>
        {cargando && <CircularProgress size={20} />}
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => toggleOrden('resource')} style={{ cursor: 'pointer' }}>
                Recurso {orden.campo === 'resource' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell onClick={() => toggleOrden('action')} style={{ cursor: 'pointer' }}>
                Acción {orden.campo === 'action' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permisosFiltrados.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell><Chip size="small" label={p.resource} /></TableCell>
                <TableCell><Chip size="small" label={p.action} /></TableCell>
                <TableCell>{p.description || '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => onEditar?.(p)}>
                      <IconEdit size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" onClick={() => onEliminar?.(p)}>
                      <IconTrash size={18} />
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
