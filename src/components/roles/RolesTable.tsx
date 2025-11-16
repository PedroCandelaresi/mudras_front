"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Box, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TextField, Button, Typography, Menu, Divider, Stack } from '@mui/material';
import { IconAdjustments, IconPlus } from '@tabler/icons-react';
import { marron } from '@/ui/colores';
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
          bgcolor: marron.toolbarBg,
          border: '1px solid',
          borderColor: marron.toolbarBorder,
          borderRadius: 1,
          mb: 2,
        }}
      >
        <SearchToolbar
          title="Roles"
          baseColor={marron.primary}
          placeholder="Buscar rol (nombre o slug)"
          searchValue={busquedaInput}
          onSearchValueChange={setBusquedaInput}
          onSubmitSearch={() => setBusqueda(busquedaInput)}
          onClear={() => { setBusqueda(''); setBusquedaInput(''); }}
          canCreate={Boolean(onCrear)}
          createLabel="Nuevo Rol"
          onCreateClick={onCrear}
          searchDisabled={cargando}
        />
        {cargando && (
          <Box display="flex" justifyContent="flex-end" mt={0.5}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: marron.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: marron.headerBg, color: marron.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: marron.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 } }}>
              <TableCell onClick={() => toggleOrden('name')} sx={{ cursor: 'pointer', fontWeight: 700, borderBottom: '3px solid', borderColor: marron.headerBorder, color: marron.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <span>Nombre {orden.campo === 'name' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}</span>
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('name'); setFiltroColInput(filtrosColumna.name || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconAdjustments size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell onClick={() => toggleOrden('slug')} sx={{ cursor: 'pointer', fontWeight: 700, borderBottom: '3px solid', borderColor: marron.headerBorder, color: marron.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <span>Slug {orden.campo === 'slug' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}</span>
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('slug'); setFiltroColInput(filtrosColumna.slug || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconAdjustments size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, borderBottom: '3px solid', borderColor: marron.headerBorder, color: marron.headerText }}>Permisos</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, borderBottom: '3px solid', borderColor: marron.headerBorder, color: marron.headerText }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rolesFiltrados.map((r, idx) => (
              <TableRow key={r.id} hover sx={{ bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit', '&:hover': { bgcolor: marron.rowHover } }}>
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
          {columnaActiva === 'name' && 'Filtrar por Nombre'}
          {columnaActiva === 'slug' && 'Filtrar por Slug'}
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
