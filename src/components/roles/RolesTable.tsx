"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Box, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TextField, Button, Popover, Divider, Stack } from '@mui/material';
import { IconAdjustments, IconPlus } from '@tabler/icons-react';

import SearchToolbar from '@/components/ui/SearchToolbar';

export interface PermisoItem { id: string; resource: string; action: string; description?: string | null; }
export interface RolePermission { permission: PermisoItem }
export interface RolItem { id: string; name: string; slug: string; rolePermissions?: RolePermission[] }

interface Props {
  onAsignarPermisos: (rol: RolItem) => void;
  onCrear?: () => void;
  refetchToken?: number | string;
}

export function RolesTable({ onAsignarPermisos, onCrear, refetchToken }: Props) {
  const [cargando, setCargando] = useState<boolean>(true);
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaInput, setBusquedaInput] = useState('');
  const [orden, setOrden] = useState<{ campo: 'name' | 'slug'; dir: 'asc' | 'desc' }>({ campo: 'name', dir: 'asc' });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'name' | 'slug'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{ name?: string; slug?: string; }>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  async function cargar() {
    try {
      setCargando(true);
      const datos = await apiFetch<RolItem[]>(`/roles`);
      setRoles(datos);
    } catch (e: any) {
      console.error('Error al cargar roles', e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [refetchToken]);

  const rolesFiltrados = useMemo(() => {
    let arr = roles.slice();
    const q = busqueda.toLowerCase();
    if (q) arr = arr.filter((r) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q));
    if (filtrosColumna.name) arr = arr.filter((r) => r.name.toLowerCase().includes(filtrosColumna.name!.toLowerCase()));
    if (filtrosColumna.slug) arr = arr.filter((r) => r.slug.toLowerCase().includes(filtrosColumna.slug!.toLowerCase()));
    arr = arr.sort((a, b) => {
      const va = String(a[orden.campo]).toLowerCase();
      const vb = String(b[orden.campo]).toLowerCase();
      if (va < vb) return orden.dir === 'asc' ? -1 : 1;
      if (va > vb) return orden.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [roles, busqueda, orden, filtrosColumna]);

  function toggleOrden(campo: 'name' | 'slug') {
    setOrden((o) => o.campo === campo ? { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { campo, dir: 'asc' });
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box
        sx={{
          px: 1,
          py: 1,
          bgcolor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          borderRadius: 0,
          mb: 2,
        }}
      >
        {/* <SearchToolbar
          title="Roles"
          baseColor=""
          placeholder="Buscar rol (nombre o slug)"
          searchValue={busquedaInput}
          onSearchValueChange={setBusquedaInput}
          onSubmitSearch={() => setBusqueda(busquedaInput)}
          onClear={() => { setBusqueda(''); setBusquedaInput(''); }}
          canCreate={Boolean(onCrear)}
          createLabel="Nuevo Rol"
          onCreateClick={onCrear}
          searchDisabled={cargando}
        /> */}
        {cargando && (
          <Box display="flex" justifyContent="flex-end" mt={0.5}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Box>

      <TableContainer sx={{ borderRadius: 0, border: '1px solid #e0e0e0', bgcolor: '#fff', boxShadow: 'none' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: '#f5f5f5', color: '#000', fontWeight: 700 } }}>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => toggleOrden('name')} sx={{ cursor: 'pointer', borderBottom: '1px solid #e0e0e0' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <span>Nombre {orden.campo === 'name' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}</span>
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('name'); setFiltroColInput(filtrosColumna.name || ''); setMenuAnchor(e.currentTarget); }} sx={{ opacity: 0.5 }}>
                      <IconAdjustments size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell onClick={() => toggleOrden('slug')} sx={{ cursor: 'pointer', borderBottom: '1px solid #e0e0e0' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <span>Slug {orden.campo === 'slug' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}</span>
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('slug'); setFiltroColInput(filtrosColumna.slug || ''); setMenuAnchor(e.currentTarget); }} sx={{ opacity: 0.5 }}>
                      <IconAdjustments size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>Permisos</TableCell>
              <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rolesFiltrados.map((r, idx) => (
              <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{r.name}</TableCell>
                <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  <Chip size="small" label={r.slug} sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#eee' }} />
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  {(r.rolePermissions || []).map((rp) => (
                    <Chip key={rp.permission.id} size="small" label={`${rp.permission.resource}:${rp.permission.action}`} sx={{ mr: 0.5, mb: 0.5, borderRadius: 0 }} variant="outlined" />
                  ))}
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  <Tooltip title="Asignar permisos">
                    <IconButton onClick={() => onAsignarPermisos(r)} sx={{ color: '#1976d2' }}>
                      <IconAdjustments size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menú filtros por columna - Usamos Popover para contenido custom que no es lista */}
      <Popover
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 1.5, minWidth: 260 }}>
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
                InputProps={{ sx: { borderRadius: 0 } }}
              />
              <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
                <Button size="small" onClick={() => { setFiltroColInput(''); setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: '' })); }} sx={{ borderRadius: 0 }}>Limpiar</Button>
                <Button size="small" variant="contained" sx={{ borderRadius: 0, bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }} onClick={() => {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }}>Aplicar</Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Popover>
    </Paper>
  );
}
