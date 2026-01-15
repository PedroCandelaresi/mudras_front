'use client';

import React, { useMemo, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  Box,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Avatar, Skeleton, TextField, InputAdornment, Button,
  IconButton, Tooltip, Menu, Stack
} from '@mui/material';
import { useQuery } from '@apollo/client/react';

import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { Proveedor, ProveedoresResponse } from '@/interfaces/proveedores';

import {
  IconSearch, IconUsers, IconRefresh, IconPhone, IconMail,
  IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical
} from '@tabler/icons-react';

import {
  ModalDetallesProveedor,
  ModalEditarProveedor,
  ModalEliminarProveedor
} from '@/components/proveedores';

/* ======================== Tipos ======================== */
type ColKey = 'nombre' | 'codigo' | 'cuit';
type ColFilters = Partial<Record<ColKey, string>>;

export interface TablaProveedoresHandle {
  abrirCrearProveedor: () => void;
}

interface Props {
  onNuevoProveedor?: () => void;
  puedeCrear?: boolean;

  showViewModal?: boolean;
  showEditModal?: boolean;
  showDeleteModal?: boolean;

  onView?: (p: Proveedor) => void;
  onEdit?: (p: Proveedor) => void;
  onDelete?: (p: Proveedor) => void;

  hideViewAction?: boolean;
  hideEditAction?: boolean;
  hideDeleteAction?: boolean;
}

/* ======================== Componente ======================== */
const TablaProveedores = forwardRef<TablaProveedoresHandle, Props>(({
  onNuevoProveedor,
  puedeCrear = true,

  showViewModal = true,
  showEditModal = true,
  showDeleteModal = true,

  onView,
  onEdit,
  onDelete,

  hideViewAction = false,
  hideEditAction = false,
  hideDeleteAction = false,
}, ref) => {
  const { data, loading, error, refetch } = useQuery<ProveedoresResponse>(GET_PROVEEDORES);

  // estado tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtro, setFiltro] = useState('');

  // filtros por columna
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | ColKey>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<ColFilters>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  // modales internos
  const [modalDetalles, setModalDetalles] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);

  // datos
  const proveedoresDataList = data?.proveedores;
  const proveedores: Proveedor[] = useMemo(
    () => (Array.isArray(proveedoresDataList) ? proveedoresDataList : []),
    [proveedoresDataList]
  );

  // filtrado
  const proveedoresFiltrados = useMemo(() => {
    const lower = filtro.trim().toLowerCase();
    return proveedores.filter((p) => {
      const cumpleGeneral =
        !lower ||
        p.Nombre?.toLowerCase().includes(lower) ||
        p.Codigo?.toString().toLowerCase().includes(lower) ||
        p.CUIT?.toLowerCase().includes(lower);

      const cumpleCols = (Object.entries(filtrosColumna) as [ColKey, string][])
        .every(([campo, valor]) => {
          if (!valor) return true;
          const v = (p as any)[campo === 'nombre' ? 'Nombre' : campo === 'codigo' ? 'Codigo' : 'CUIT'];
          return v?.toString().toLowerCase().includes(valor.toLowerCase());
        });

      return cumpleGeneral && cumpleCols;
    });
  }, [proveedores, filtro, filtrosColumna]);

  const totalPaginas = Math.ceil(proveedoresFiltrados.length / rowsPerPage);
  const paginaActual = page + 1;
  const proveedoresPaginados = useMemo(
    () => proveedoresFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [proveedoresFiltrados, page, rowsPerPage]
  );

  const generarNumerosPaginas = () => {
    const paginas: (number | '...')[] = [];
    const totalPaginasCalc = Math.max(1, totalPaginas);
    const maxVisible = 7;

    if (totalPaginasCalc <= maxVisible) {
      for (let i = 1; i <= totalPaginasCalc; i++) paginas.push(i);
    } else if (paginaActual <= 4) {
      for (let i = 1; i <= 5; i++) paginas.push(i);
      paginas.push('...', totalPaginasCalc);
    } else if (paginaActual >= totalPaginasCalc - 3) {
      paginas.push(1, '...');
      for (let i = totalPaginasCalc - 4; i <= totalPaginasCalc; i++) paginas.push(i);
    } else {
      paginas.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginasCalc);
    }
    return paginas;
  };

  // acciones
  const handleView = (p: Proveedor) => {
    if (onView) onView(p);
    else if (showViewModal) { setProveedorSeleccionado(p); setModalDetalles(true); }
  };
  const handleEdit = (p: Proveedor) => {
    if (onEdit) onEdit(p);
    else if (showEditModal) { setProveedorSeleccionado(p); setModalEditar(true); }
  };
  const handleDelete = (p: Proveedor) => {
    if (onDelete) onDelete(p);
    else if (showDeleteModal) { setProveedorSeleccionado(p); setModalEliminar(true); }
  };

  const abrirCrear = useCallback(() => {
    if (onNuevoProveedor) onNuevoProveedor();
    else if (puedeCrear && showEditModal) {
      setProveedorSeleccionado(null);
      setModalEditar(true);
    }
  }, [onNuevoProveedor, puedeCrear, showEditModal]);

  useImperativeHandle(ref, () => ({ abrirCrearProveedor: abrirCrear }));

  return (
    <>
      <Paper elevation={0} sx={{ p: 0, bgcolor: 'background.paper', borderRadius: 0, border: 'none' }}>

        {/* Toolbar */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          sx={{ px: 2, py: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar variant="rounded" sx={{ bgcolor: '#8d6e63', color: '#fff' }}>
              <IconUsers size={24} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                Proveedores
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gestión y administración
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              placeholder="Buscar..."
              variant="outlined"
              size="small"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} color="#9e9e9e" />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: '#fff',
                  borderRadius: 0,
                  '& fieldset': { borderColor: '#e0e0e0' }
                }
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
            />
            <Button
              variant="contained"
              startIcon={<IconPlus />}
              onClick={abrirCrear}
              disabled={!puedeCrear || loading}
              disableElevation
              sx={{
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#2e7d32',
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              Nuevo
            </Button>
            <Tooltip title="Recargar">
              <IconButton onClick={() => refetch()} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, bgcolor: '#fff' }}>
                <IconRefresh size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Loading / Error / Table */}
        {loading ? (
          <Box p={3} display="flex" flexDirection="column" gap={2}>
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={40} animation="wave" />)}
          </Box>
        ) : error ? (
          <Box p={4} textAlign="center">
            <Typography color="error">Error al cargar proveedores</Typography>
            <Button onClick={() => refetch()} sx={{ mt: 1 }}>Reintentar</Button>
          </Box>
        ) : (
          <TableContainer sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell onClick={(e) => { setColumnaActiva('codigo'); setMenuAnchor(e.currentTarget); setFiltroColInput(filtrosColumna.codigo || ''); }} sx={{ fontWeight: 700, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', cursor: 'pointer', '&:hover': { bgcolor: '#eceff1' } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      Código <IconDotsVertical size={14} style={{ opacity: 0.5 }} />
                    </Box>
                  </TableCell>
                  <TableCell onClick={(e) => { setColumnaActiva('nombre'); setMenuAnchor(e.currentTarget); setFiltroColInput(filtrosColumna.nombre || ''); }} sx={{ fontWeight: 700, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', cursor: 'pointer', '&:hover': { bgcolor: '#eceff1' } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      Nombre <IconDotsVertical size={14} style={{ opacity: 0.5 }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Contacto</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proveedoresPaginados.map((p, idx) => (
                  <TableRow key={p.IdProveedor} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        #{p.Codigo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CUIT: {p.CUIT || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" fontWeight={600}>{p.Nombre}</Typography>
                      {!!p.Rubro && (
                        <Typography variant="caption" sx={{ bgcolor: '#fff3e0', color: '#e65100', px: 0.5, borderRadius: 0, border: '1px solid #ffcc80' }}>
                          {p.Rubro}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Stack spacing={0.5}>
                        {p.Telefono && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <IconPhone size={14} color="#757575" />
                            <Typography variant="caption">{p.Telefono}</Typography>
                          </Box>
                        )}
                        {p.Mail && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <IconMail size={14} color="#757575" />
                            <Typography variant="caption">{p.Mail}</Typography>
                          </Box>
                        )}
                        {!p.Telefono && !p.Mail && <Typography variant="caption" color="text.disabled">-</Typography>}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box display="flex" justifyContent="flex-end">
                        {!hideViewAction && (
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" onClick={() => handleView(p)} sx={{ color: '#0288d1' }}><IconEye size={18} /></IconButton>
                          </Tooltip>
                        )}
                        {!hideEditAction && (
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEdit(p)} sx={{ color: '#fb8c00' }}><IconEdit size={18} /></IconButton>
                          </Tooltip>
                        )}
                        {!hideDeleteAction && (
                          <Tooltip title="Eliminar">
                            <IconButton size="small" onClick={() => handleDelete(p)} sx={{ color: '#d32f2f' }}><IconTrash size={18} /></IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {proveedoresPaginados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="text.secondary">No se encontraron proveedores.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ borderTop: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
          <Typography variant="caption" color="text.secondary">
            Mostrando {proveedoresPaginados.length} de {proveedoresFiltrados.length}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              sx={{ minWidth: 32, px: 1, borderRadius: 0, textTransform: 'none', color: '#666' }}
            >
              Ant
            </Button>
            {generarNumerosPaginas().map((pg, idx) => (
              <Button
                key={idx}
                size="small"
                onClick={() => typeof pg === 'number' && setPage(pg - 1)}
                disabled={typeof pg !== 'number'}
                sx={{
                  minWidth: 32,
                  px: 1,
                  borderRadius: 0,
                  bgcolor: paginaActual === pg ? '#8d6e63' : 'transparent',
                  color: paginaActual === pg ? '#fff' : '#666',
                  '&:hover': { bgcolor: paginaActual === pg ? '#6d4c41' : '#e0e0e0' }
                }}
              >
                {pg}
              </Button>
            ))}
            <Button
              size="small"
              disabled={page >= totalPaginas - 1}
              onClick={() => setPage(p => p + 1)}
              sx={{ minWidth: 32, px: 1, borderRadius: 0, textTransform: 'none', color: '#666' }}
            >
              Sig
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Menú filtros */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); }}
        PaperProps={{ sx: { borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } }}
      >
        <Box p={2} width={250}>
          <Typography variant="subtitle2" gutterBottom>
            Filtrar por {columnaActiva === 'nombre' ? 'Nombre' : columnaActiva === 'codigo' ? 'Código' : 'CUIT'}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Escribe..."
            value={filtroColInput}
            onChange={(e) => setFiltroColInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setFiltrosColumna(prev => ({ ...prev, [columnaActiva!]: filtroColInput }));
                setMenuAnchor(null);
              }
            }}
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <Box mt={1} display="flex" justifyContent="flex-end" gap={1}>
            <Button size="small" onClick={() => { setFiltroColInput(''); setFiltrosColumna(prev => ({ ...prev, [columnaActiva!]: '' })); setMenuAnchor(null); }} sx={{ textTransform: 'none', borderRadius: 0 }}>
              Limpiar
            </Button>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={() => { setFiltrosColumna(prev => ({ ...prev, [columnaActiva!]: filtroColInput })); setMenuAnchor(null); }}
              sx={{ textTransform: 'none', borderRadius: 0, bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }}
            >
              Aplicar
            </Button>
          </Box>
        </Box>
      </Menu>

      {/* Modales */}
      {modalDetalles && (
        <ModalDetallesProveedor
          open={modalDetalles}
          proveedor={proveedorSeleccionado}
          onClose={() => setModalDetalles(false)}
        />
      )}
      {modalEditar && (
        <ModalEditarProveedor
          open={modalEditar}
          proveedor={proveedorSeleccionado ?? undefined}
          onClose={() => setModalEditar(false)}
          onProveedorGuardado={() => {
            refetch();
            onNuevoProveedor?.();
          }}
        />
      )}
      {modalEliminar && (
        <ModalEliminarProveedor
          open={modalEliminar}
          proveedor={proveedorSeleccionado}
          onClose={() => setModalEliminar(false)}
          onProveedorEliminado={() => {
            setModalEliminar(false);
            refetch();
          }}
        />
      )}
    </>
  );
});

export default TablaProveedores;
