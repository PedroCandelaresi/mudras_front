// /src/components/proveedores/TablaProveedores.tsx
'use client';

import React, { useMemo, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  Box,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Avatar, Skeleton, TextField, InputAdornment, Button,
  IconButton, Tooltip, Menu, Divider, Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@apollo/client/react';

import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { Proveedor, ProveedoresResponse } from '@/interfaces/proveedores';

import {
  IconSearch, IconUsers, IconRefresh, IconPhone, IconMail,
  IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical
} from '@tabler/icons-react';

import { azul, verde } from '@/ui/colores';

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
    const maxVisible = 7;
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else if (paginaActual <= 4) {
      for (let i = 1; i <= 5; i++) paginas.push(i);
      paginas.push('...', totalPaginas);
    } else if (paginaActual >= totalPaginas - 3) {
      paginas.push(1, '...');
      for (let i = totalPaginas - 4; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
    }
    return paginas;
  };

  // acciones
  const handleViewProveedor = (p: Proveedor) => {
    if (onView) return onView(p);
    if (showViewModal) {
      setProveedorSeleccionado(p);
      setModalDetalles(true);
    }
  };

  const handleEditProveedor = (p: Proveedor) => {
    if (onEdit) return onEdit(p);
    if (showEditModal) {
      setProveedorSeleccionado(p);
      setModalEditar(true);
    }
  };

  const handleDeleteProveedor = (p: Proveedor) => {
    if (onDelete) return onDelete(p);
    if (showDeleteModal) {
      setProveedorSeleccionado(p);
      setModalEliminar(true);
    }
  };

  const abrirModalCrear = useCallback(() => {
    setProveedorSeleccionado(null);
    setModalEditar(true);
  }, []);

  const handleNuevoProveedor = useCallback(() => {
    onNuevoProveedor?.();
    if (showEditModal) {
      abrirModalCrear();
    }
  }, [onNuevoProveedor, showEditModal, abrirModalCrear]);

  const handleProveedorGuardado = () => {
    refetch();
    setModalEditar(false);
    setProveedorSeleccionado(null);
  };

  const handleProveedorEliminado = () => {
    refetch();
    setModalEliminar(false);
    setProveedorSeleccionado(null);
  };

  const cerrarModales = () => {
    setModalDetalles(false);
    setModalEditar(false);
    setModalEliminar(false);
    setProveedorSeleccionado(null);
  };

  useImperativeHandle(ref, () => ({
    abrirCrearProveedor: () => {
      abrirModalCrear();
    },
  }), [abrirModalCrear]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  /* ======================== Toolbar ======================== */
  const toolbar = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        p: 2,
        bgcolor: '#ffffff',
      }}
    >
      {/* IZQUIERDA: Botón Nuevo */}
      <Box>
        {puedeCrear && (
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={handleNuevoProveedor}
            disableElevation
            sx={{
              borderRadius: 0,
              textTransform: 'none',
              bgcolor: azul.primary,
              fontWeight: 600,
              '&:hover': { bgcolor: azul.primaryHover }
            }}
          >
            Nuevo Proveedor
          </Button>
        )}
      </Box>

      {/* DERECHA: Buscador y Limpiar */}
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          placeholder="Buscar proveedores..."
          size="small"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} color="#757575" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              bgcolor: '#f5f5f5',
              '& fieldset': { borderColor: '#e0e0e0' },
              '&:hover fieldset': { borderColor: '#bdbdbd' },
              '&.Mui-focused fieldset': { borderColor: azul.primary },
            }
          }}
        />

        <Button
          variant="outlined"
          startIcon={<IconRefresh size={18} />}
          onClick={() => { setFiltro(''); setFiltrosColumna({}); setPage(0); }}
          sx={{ borderRadius: 0, textTransform: 'none', color: '#757575', borderColor: '#e0e0e0', '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' } }}
        >
          Limpiar
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 0, borderRadius: 0, bgcolor: 'transparent' }}>
        <Box sx={{ px: 1, py: 1, mb: 2 }}>
          <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 0 }} />
        </Box>
        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 0 }} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Typography color="error" variant="h6" mb={2} fontWeight={700}>
          Error al cargar proveedores
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {error.message}
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconRefresh />}
          onClick={() => refetch()}
          sx={{ borderRadius: 0, textTransform: 'none', bgcolor: azul.primary }}
        >
          Reintentar
        </Button>
      </Paper>
    );
  }

  /* ======================== Components (Tabla) ======================== */

  /* ======================== Tabla ======================== */
  const tabla = (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 0,
        border: '1px solid #e0e0e0',
        bgcolor: '#ffffff',
        overflow: 'auto',
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          minWidth: 700,
          '& .MuiTableRow-root': {
            minHeight: 56, // Slightly reduced for compact modern look
            transition: 'background-color 0.2s',
          },
          '& .MuiTableCell-root': {
            fontSize: '0.85rem', // Larger for readability (60+ yo target)
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #FFFFFF',
            color: '#37474f', // High contrast dark gray
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
            bgcolor: azul.tableStriped, // Zebra striping celeste pastel
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover': {
            bgcolor: alpha(azul.primary, 0.12),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: azul.tableHeader, // Header celeste fuerte
            color: '#ffffff', // Texto blanco para contraste con celeste fuerte
            textTransform: 'uppercase', // Opcional: estilo más "header"
            letterSpacing: '0.5px',
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ '& th': { borderBottom: 'none' } }}>
            {/* Proveedor */}
            <TableCell align="center">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                Proveedor
                <Tooltip title="Filtrar columna">
                  <IconButton
                    size="small" color="inherit"
                    aria-label="Filtrar columna proveedor"
                    aria-haspopup="menu"
                    onClick={(e) => { setColumnaActiva('nombre'); setFiltroColInput(filtrosColumna.nombre || ''); setMenuAnchor(e.currentTarget); }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            {/* Código */}
            <TableCell align="center">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                Código
                <Tooltip title="Filtrar columna">
                  <IconButton
                    size="small" color="inherit"
                    aria-label="Filtrar columna código"
                    aria-haspopup="menu"
                    onClick={(e) => { setColumnaActiva('codigo'); setFiltroColInput(filtrosColumna.codigo || ''); setMenuAnchor(e.currentTarget); }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            <TableCell align="center">Teléfono</TableCell>
            <TableCell align="center">Email</TableCell>

            {/* CUIT */}
            <TableCell align="center">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                CUIT
                <Tooltip title="Filtrar columna">
                  <IconButton
                    size="small" color="inherit"
                    aria-label="Filtrar columna CUIT"
                    aria-haspopup="menu"
                    onClick={(e) => { setColumnaActiva('cuit'); setFiltroColInput(filtrosColumna.cuit || ''); setMenuAnchor(e.currentTarget); }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {proveedoresPaginados.map((proveedor, idx) => (
            <TableRow key={proveedor.IdProveedor} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{ bgcolor: azul.primary, width: 40, height: 40, fontSize: '1rem' }}
                  >
                    {proveedor.Nombre?.charAt(0) || 'P'}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    {proveedor.Nombre || 'Sin nombre'}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                  {proveedor.Codigo || 'N/A'}
                </Typography>
              </TableCell>

              <TableCell>
                {!!proveedor.Telefono && (
                  <Box display="flex" alignItems="center">
                    <IconPhone size={16} style={{ marginRight: 4, color: '#666' }} />
                    <Typography variant="body2">{proveedor.Telefono}</Typography>
                  </Box>
                )}
              </TableCell>

              <TableCell>
                {!!proveedor.Mail && (
                  <Box display="flex" alignItems="center">
                    <IconMail size={16} style={{ marginRight: 4, color: '#666' }} />
                    <Typography variant="body2">{proveedor.Mail}</Typography>
                  </Box>
                )}
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {proveedor.CUIT || 'Sin CUIT'}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={0.5}>
                  {!hideViewAction && (onView || showViewModal) && (
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => handleViewProveedor(proveedor)}
                        sx={{ color: azul.primary, '&:hover': { bgcolor: alpha(azul.primary, 0.1) } }}
                      >
                        <IconEye size={20} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {!hideEditAction && (onEdit || showEditModal) && (
                    <Tooltip title="Editar proveedor">
                      <IconButton
                        size="small"
                        onClick={() => handleEditProveedor(proveedor)}
                        sx={{ color: verde.primary, '&:hover': { bgcolor: alpha(verde.primary, 0.1) } }}
                      >
                        <IconEdit size={20} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {!hideDeleteAction && (onDelete || showDeleteModal) && (
                    <Tooltip title="Eliminar proveedor">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProveedor(proveedor)}
                        sx={{ color: '#d32f2f', '&:hover': { bgcolor: alpha('#d32f2f', 0.1) } }}
                      >
                        <IconTrash size={20} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  /* ======================== Paginador ======================== */
  const paginador = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
      <Typography variant="caption" color="text.secondary">
        Mostrando {Math.min(rowsPerPage, proveedoresPaginados.length)} de {proveedoresFiltrados.length} proveedores
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField select size="small" value={String(rowsPerPage)} onChange={handleChangeRowsPerPage} sx={{ minWidth: 80 }}>
          {[50, 100, 150].map((option) => (<option key={option} value={option}>{option}</option>))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          Página {paginaActual} de {Math.max(1, totalPaginas)}
        </Typography>
        {generarNumerosPaginas().map((num, idx) =>
          num === '...' ? (
            <Box key={idx} sx={{ px: 1, color: 'text.secondary' }}>...</Box>
          ) : (
            <Button
              key={num}
              variant={Number(num) === paginaActual ? 'contained' : 'outlined'}
              size="small"
              sx={{
                minWidth: 32,
                px: 1,
                borderRadius: 0,
                borderColor: Number(num) === paginaActual ? 'transparent' : '#e0e0e0',
                bgcolor: Number(num) === paginaActual ? azul.primary : 'transparent',
                color: Number(num) === paginaActual ? '#fff' : 'text.primary',
                '&:hover': {
                  borderColor: azul.primary,
                  bgcolor: Number(num) === paginaActual ? azul.primaryHover : alpha(azul.primary, 0.05)
                }
              }}
              onClick={() => setPage(Number(num) - 1)}
              disabled={num === paginaActual}
            >
              {num}
            </Button>
          )
        )}
      </Stack>
    </Box>
  );

  /* ======================== Render ======================== */
  return (
    <>
      <Box sx={{ width: '100%' }}>
        {toolbar}
        {tabla}
        {paginador}
      </Box>

      {/* Menú de filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'nombre' && 'Filtrar por Proveedor'}
          {columnaActiva === 'codigo' && 'Filtrar por Código'}
          {columnaActiva === 'cuit' && 'Filtrar por CUIT'}
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
                  setPage(0);
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button
                size="small"
                onClick={() => {
                  setFiltroColInput('');
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: '' }));
                }}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                  setPage(0);
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }}
                sx={{ borderRadius: 0, bgcolor: azul.primary }}
              >
                Aplicar
              </Button>
            </Stack>
          </Box>
        )}
      </Menu>

      {/* MODALES internos */}
      {showViewModal && (
        <ModalDetallesProveedor
          open={modalDetalles}
          onClose={cerrarModales}
          proveedor={proveedorSeleccionado}
        />
      )}

      {showEditModal && (
        <ModalEditarProveedor
          open={modalEditar}
          onClose={cerrarModales}
          proveedor={proveedorSeleccionado ?? undefined}
          onProveedorGuardado={handleProveedorGuardado}
        />
      )}

      {showDeleteModal && (
        <ModalEliminarProveedor
          open={modalEliminar}
          onClose={cerrarModales}
          proveedor={proveedorSeleccionado}
          onProveedorEliminado={handleProveedorEliminado}
        />
      )}
    </>
  );
});

TablaProveedores.displayName = 'TablaProveedores';

export default TablaProveedores;
