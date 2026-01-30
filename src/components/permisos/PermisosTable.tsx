"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { OBTENER_PERMISOS_QUERY } from '@/components/usuarios/graphql/queries';
import { Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TextField, Typography, Menu, Divider, Stack, Alert } from '@mui/material';
import { IconEdit, IconTrash, IconSearch, IconAlertTriangle } from '@tabler/icons-react';
import { grisNeutro } from '@/ui/colores';
import SearchToolbar from '@/components/ui/SearchToolbar';

export interface PermisoListado { id: string; resource: string; action: string; description?: string | null }

interface Props {
  onCrear?: () => void;
  onEditar?: (p: PermisoListado) => void;
  onEliminar?: (p: PermisoListado) => void;
  refetchToken?: number | string;
}

export function PermisosTable({ onCrear, onEditar, onEliminar, refetchToken }: Props) {
  const { data, loading: cargando, error: errorQuery, refetch } = useQuery<{ permisos: PermisoListado[] }>(OBTENER_PERMISOS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only'
  });

  const permisos = data?.permisos || [];
  const error = errorQuery?.message || null;

  useEffect(() => {
    if (refetchToken) refetch();
  }, [refetchToken, refetch]);

  const [busqueda, setBusqueda] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'resource' | 'action'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{ resource?: string; action?: string; }>({});
  const [filtroColInput, setFiltroColInput] = useState('');
  const [orden, setOrden] = useState<{ campo: 'resource' | 'action'; dir: 'asc' | 'desc' }>({ campo: 'resource', dir: 'asc' });



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
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 0, bgcolor: 'background.paper' }}>
      <Box
        sx={{
          px: 2,
          py: 2,
          bgcolor: '#ffffff',
          borderRadius: 0,
          mb: 3,
        }}
      >
        <SearchToolbar
          title="Permisos"
          baseColor={grisNeutro.primary}
          placeholder="Buscar (recurso:acción, descripción)"
          searchValue={busqueda}
          onSearchValueChange={setBusqueda}
          onSubmitSearch={() => { void refetch(); }}
          onClear={() => setBusqueda('')}
          canCreate={Boolean(onCrear)}
          createLabel="Nuevo Permiso"
          onCreateClick={onCrear}
          searchDisabled={cargando}
        />
        {cargando && (
          <Box display="flex" justifyContent="flex-end" mt={0.5}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" icon={<IconAlertTriangle />} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {permisos.length === 0 && !cargando && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No hay permisos registrados.
        </Alert>
      )}

      <TableContainer sx={{ borderRadius: 0, border: '1px solid #e0e0e0', bgcolor: '#fff', boxShadow: 'none' }}>
        <Table stickyHeader size="small" sx={{
          '& .MuiTableCell-head': {
            bgcolor: grisNeutro.tableHeader,
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
            bgcolor: grisNeutro.tableStriped,
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover': {
            bgcolor: grisNeutro.rowHover,
          }
        }}>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => toggleOrden('resource')} sx={{ cursor: 'pointer', borderBottom: '1px solid #e0e0e0' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Recurso {orden.campo === 'resource' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('resource'); setFiltroColInput(filtrosColumna.resource || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconSearch size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell onClick={() => toggleOrden('action')} sx={{ cursor: 'pointer', borderBottom: '1px solid #e0e0e0' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Acción {orden.campo === 'action' ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('action'); setFiltroColInput(filtrosColumna.action || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconSearch size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>Descripción</TableCell>
              <TableCell align="center" sx={{ borderBottom: '1px solid #e0e0e0' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permisosFiltrados.map((p, idx) => (
              <TableRow key={p.id} hover>
                <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}><Chip size="small" label={p.resource} sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#eee' }} /></TableCell>
                <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}><Chip size="small" label={p.action} sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#eee' }} /></TableCell>
                <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{p.description || '-'}</TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  <Box display="flex" justifyContent="center" gap={0.5}>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => onEditar?.(p)} sx={{ color: grisNeutro.primary }}>
                        <IconEdit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => onEliminar?.(p)} sx={{ color: '#d32f2f' }}>
                        <IconTrash size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
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
              <Button size="small" onClick={() => { setFiltroColInput(''); setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: '' })); }} sx={{ borderRadius: 0 }}>Limpiar</Button>
              <Button size="small" variant="contained" sx={{ borderRadius: 0, bgcolor: grisNeutro.primary, '&:hover': { bgcolor: grisNeutro.primaryHover } }} onClick={() => {
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
