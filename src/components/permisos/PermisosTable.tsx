"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TextField, Typography, InputAdornment, Menu, Divider, Stack } from '@mui/material';
import { IconEdit, IconTrash, IconPlus, IconSearch } from '@tabler/icons-react';
import { marron } from '@/ui/colores';

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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'resource' | 'action'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{ resource?: string; action?: string; }>({});
  const [filtroColInput, setFiltroColInput] = useState('');
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
    let arr = [...permisos];
    const q = busqueda.trim().toLowerCase();
    if (q) {
      arr = arr.filter((p) => `${p.resource}:${p.action}`.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (filtrosColumna.resource) arr = arr.filter((p) => p.resource.toLowerCase().includes(filtrosColumna.resource!.toLowerCase()));
    if (filtrosColumna.action) arr = arr.filter((p) => p.action.toLowerCase().includes(filtrosColumna.action!.toLowerCase()));
    arr.sort((a, b) => {
      const ca = orden.campo === 'resource' ? a.resource : a.action;
      const cb = orden.campo === 'resource' ? b.resource : b.action;
      if (ca < cb) return orden.dir === 'asc' ? -1 : 1;
      if (ca > cb) return orden.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [permisos, busqueda, orden, filtrosColumna]);

  function toggleOrden(campo: 'resource' | 'action') {
    setOrden((o) => o.campo === campo ? { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { campo, dir: 'asc' });
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: marron.toolbarBg, border: '1px solid', borderColor: marron.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={marron.textStrong}>Permisos</Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {onCrear && (
            <Button variant="contained" onClick={onCrear} sx={{ textTransform: 'none', bgcolor: marron.primary, '&:hover': { bgcolor: marron.primaryHover } }} startIcon={<IconPlus size={16} />}>
              Nuevo Permiso
            </Button>
          )}
          <TextField size="small" placeholder="Buscar (recurso:acción)" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} sx={{ minWidth: 260 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={18} /></InputAdornment> }}
          />
          <Button variant="outlined" color="inherit" onClick={() => setBusqueda('')} sx={{ textTransform: 'none', borderColor: marron.headerBorder, color: marron.textStrong, '&:hover': { borderColor: marron.primaryHover, bgcolor: marron.toolbarBg } }}>
            Limpiar
          </Button>
          {cargando && <CircularProgress size={20} />}
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: marron.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: marron.headerBg, color: marron.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: marron.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 } }}>
              <TableCell onClick={() => toggleOrden('resource')} sx={{ cursor: 'pointer', fontWeight: 700, borderBottom: '3px solid', borderColor: marron.headerBorder, color: marron.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Recurso {orden.campo === 'resource' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('resource'); setFiltroColInput(filtrosColumna.resource || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconSearch size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell onClick={() => toggleOrden('action')} sx={{ cursor: 'pointer', fontWeight: 700, borderBottom: '3px solid', borderColor: marron.headerBorder, color: marron.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Acción {orden.campo === 'action' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('action'); setFiltroColInput(filtrosColumna.action || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconSearch size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, borderBottom: '3px solid', borderColor: marron.headerBorder, color: marron.headerText }}>Descripción</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, borderBottom: '3px solid', borderColor: marron.headerBorder, color: marron.headerText }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permisosFiltrados.map((p, idx) => (
              <TableRow key={p.id} hover sx={{ bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit', '&:hover': { bgcolor: marron.rowHover } }}>
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

      {/* Menú filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'resource' && 'Filtrar por Recurso'}
          {columnaActiva === 'action' && 'Filtrar por Acción'}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {columnaActiva && (
          <Box px={1} pb={1}>
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Escribe para filtrar..."
              value={filtroColInput}
              onChange={(e) => setFiltroColInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => { setFiltroColInput(''); setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: '' })); }}>Limpiar</Button>
              <Button size="small" variant="contained" sx={{ bgcolor: marron.primary, '&:hover': { bgcolor: marron.primaryHover } }} onClick={() => {
                setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                setMenuAnchor(null);
                setColumnaActiva(null);
              }}>Aplicar</Button>
            </Stack>
          </Box>
        )}
      </Menu>
    </Paper>
  );
}
