'use client';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Paper, Avatar, Skeleton, TextField, InputAdornment, Button,
  IconButton, Tooltip, Menu, Divider, Stack
} from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { Proveedor, ProveedoresResponse } from '@/interfaces/proveedores';
import {
  IconSearch, IconUsers, IconRefresh, IconPhone, IconMail,
  IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { azul } from '@/ui/colores';
import {
  ModalDetallesProveedor,
  ModalEditarProveedor,
  ModalEliminarProveedor
} from '@/components/proveedores';

type ColKey = 'nombre' | 'codigo' | 'cuit';
type ColFilters = Partial<Record<ColKey, string>>;

interface Props {
  // toolbar / crear
  onNuevoProveedor?: () => void;
  puedeCrear?: boolean;

  // flags para usar MODALES internos (on by default)
  showViewModal?: boolean;
  showEditModal?: boolean;
  showDeleteModal?: boolean;

  // callbacks externos (si los pasás, NO se abre el modal interno)
  onView?: (p: Proveedor) => void;
  onEdit?: (p: Proveedor) => void;
  onDelete?: (p: Proveedor) => void;

  // opcional: ocultar botones de acción específicos (independiente de modales/callbacks)
  hideViewAction?: boolean;
  hideEditAction?: boolean;
  hideDeleteAction?: boolean;
}

const TablaProveedores: React.FC<Props> = ({
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
}) => {
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

  // helpers
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

  const handleNuevoProveedor = () => {
    if (onNuevoProveedor) return onNuevoProveedor();
    if (showEditModal) {
      setProveedorSeleccionado(null);
      setModalEditar(true);
    }
  };

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

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // loading / error
  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" mb={3}>Proveedores</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Proveedor', 'Código', 'Teléfono', 'Email', 'CUIT'].map((h) => (
                  <TableCell key={h}><Skeleton variant="text" width="100%" /></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, r) => (
                <TableRow key={r}>
                  {Array.from({ length: 5 }).map((_, c) => (
                    <TableCell key={c}><Skeleton variant="text" width="100%" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography color="error" variant="h6" mb={2}>Error al cargar proveedores</Typography>
        <Typography color="text.secondary" mb={2}>{error.message}</Typography>
        <Button variant="contained" color="warning" startIcon={<IconRefresh />} onClick={() => refetch()}>
          Reintentar
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
      {/* Toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center"
        sx={{ px: 1, py: 1, bgcolor: azul.toolbarBg, border: '1px solid', borderColor: azul.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={azul.textStrong}>
          <IconUsers style={{ marginRight: 8, verticalAlign: 'middle' }} /> Proveedores
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {puedeCrear && (
            <Button variant="contained"
              onClick={handleNuevoProveedor}
              sx={{ textTransform: 'none', bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }}
              startIcon={<IconPlus size={18} />}>
              Nuevo Proveedor
            </Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar proveedores..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setPage(0); }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
            sx={{ minWidth: 250 }}
          />
          <Button variant="contained"
            sx={{ textTransform: 'none', bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }}
            onClick={() => setPage(0)}>
            Buscar
          </Button>
          <Button variant="outlined" color="inherit"
            onClick={() => { setFiltro(''); setFiltrosColumna({}); setPage(0); }}
            sx={{ textTransform: 'none', borderColor: azul.headerBorder, color: azul.textStrong, '&:hover': { borderColor: azul.textStrong, bgcolor: azul.toolbarBg } }}>
            Limpiar filtros
          </Button>
        </Box>
      </Box>

      {/* Tabla */}
      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: azul.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: azul.headerBg, color: azul.headerText } }}>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: '3px solid', borderColor: azul.headerBorder } }}>
              {/* Proveedor */}
              <TableCell sx={{ fontWeight: 700, color: azul.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Proveedor
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit"
                      onClick={(e) => { setColumnaActiva('nombre'); setFiltroColInput(filtrosColumna.nombre || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>

              {/* Código */}
              <TableCell sx={{ fontWeight: 700, color: azul.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Código
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit"
                      onClick={(e) => { setColumnaActiva('codigo'); setFiltroColInput(filtrosColumna.codigo || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>

              <TableCell sx={{ fontWeight: 700, color: azul.headerText }}>Teléfono</TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText }}>Email</TableCell>

              {/* CUIT */}
              <TableCell sx={{ fontWeight: 700, color: azul.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  CUIT
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit"
                      onClick={(e) => { setColumnaActiva('cuit'); setFiltroColInput(filtrosColumna.cuit || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>

              <TableCell sx={{ fontWeight: 700, color: azul.headerText, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {proveedoresPaginados.map((proveedor, idx) => (
              <TableRow key={proveedor.IdProveedor}
                sx={{ bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit', '&:hover': { bgcolor: azul.rowHover } }}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: azul.primary, width: 40, height: 40, mr: 2, fontSize: '1rem' }}>
                      {proveedor.Nombre?.charAt(0) || 'P'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{proveedor.Nombre || 'Sin nombre'}</Typography>
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

                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    {!hideViewAction && (onView || showViewModal) && (
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleViewProveedor(proveedor)}
                          sx={{ bgcolor: '#1976d2', color: 'white', borderRadius: 1.5, width: 32, height: 32, '&:hover': { bgcolor: '#1565c0' } }}>
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {!hideEditAction && (onEdit || showEditModal) && (
                      <Tooltip title="Editar proveedor">
                        <IconButton size="small" onClick={() => handleEditProveedor(proveedor)}
                          sx={{ bgcolor: '#2e7d32', color: 'white', borderRadius: 1.5, width: 32, height: 32, '&:hover': { bgcolor: '#1b5e20' } }}>
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {!hideDeleteAction && (onDelete || showDeleteModal) && (
                      <Tooltip title="Eliminar proveedor">
                        <IconButton size="small" onClick={() => handleDeleteProveedor(proveedor)}
                          sx={{ bgcolor: '#d32f2f', color: 'white', borderRadius: 1.5, width: 32, height: 32, '&:hover': { bgcolor: '#c62828' } }}>
                          <IconTrash size={18} />
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

      {/* Paginación */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">Filas por página:</Typography>
          <TextField select size="small" value={rowsPerPage} onChange={handleChangeRowsPerPage} sx={{ minWidth: 80 }}>
            {[50, 100, 150].map((o) => (<option key={o} value={o}>{o}</option>))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, proveedoresFiltrados.length)} de ${proveedoresFiltrados.length}`}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {generarNumerosPaginas().map((n, i) => (
              <Box key={i}>
                {n === '...' ? (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>…</Typography>
                ) : (
                  <Button
                    size="small"
                    variant={paginaActual === n ? 'contained' : 'text'}
                    onClick={() => handleChangePage(null, (n as number) - 1)}
                    sx={{
                      minWidth: 32, height: 32, textTransform: 'none', fontSize: '0.875rem',
                      ...(paginaActual === n
                        ? { bgcolor: azul.primary, color: 'white', '&:hover': { bgcolor: azul.primaryHover } }
                        : { color: 'text.secondary', '&:hover': { bgcolor: azul.rowHover } }),
                    }}
                  >
                    {n}
                  </Button>
                )}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" onClick={() => handleChangePage(null, 0)} disabled={page === 0} sx={{ color: 'text.secondary' }} title="Primera">⏮</IconButton>
            <IconButton size="small" onClick={() => handleChangePage(null, page - 1)} disabled={page === 0} sx={{ color: 'text.secondary' }} title="Anterior">◀</IconButton>
            <IconButton size="small" onClick={() => handleChangePage(null, page + 1)} disabled={page >= totalPaginas - 1} sx={{ color: 'text.secondary' }} title="Siguiente">▶</IconButton>
            <IconButton size="small" onClick={() => handleChangePage(null, totalPaginas - 1)} disabled={page >= totalPaginas - 1} sx={{ color: 'text.secondary' }} title="Última">⏭</IconButton>
          </Box>
        </Box>
      </Box>

      {/* MENU de filtros por columna (visible siempre que lo necesites) */}
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
              <Button size="small" onClick={() => { setFiltroColInput(''); setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: '' })); }}>
                Limpiar
              </Button>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }}
                onClick={() => {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                  setPage(0);
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }}
              >
                Aplicar
              </Button>
            </Stack>
          </Box>
        )}
      </Menu>

      {/* MODALES internos, montados según flags */}
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
    </Paper>
  );
};

export default TablaProveedores;
