'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Button, Tooltip, IconButton, Chip, Menu, Divider, Stack
} from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { BUSCAR_ARTICULOS } from '@/components/articulos/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { IconSearch } from '@tabler/icons-react';
import { IconDotsVertical, IconEye, IconEdit, IconTrash, IconPlus, IconRefresh } from '@tabler/icons-react';
import { verde } from '@/ui/colores';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { abrevUnidad, type UnidadMedida } from '@/app/utils/unidades';

/* ======================== Tipos de columnas ======================== */
type ArticuloColumnKey =
  | 'descripcion'
  | 'codigo'
  | 'marca'
  | 'rubro'
  | 'stock'
  | 'precio'
  | 'proveedor'
  | 'estado'
  | 'acciones';

type ColumnDef = {
  key: ArticuloColumnKey;
  header?: string;
  width?: string | number;
  render?: (art: Articulo) => React.ReactNode;
  filterable?: boolean;
};

/* ======================== Filtros servidor ======================== */
type FiltrosServidor = {
  busqueda?: string;
  codigo?: string;
  descripcion?: string;
  pagina?: number;
  limite?: number;
  ordenarPor?: 'Descripcion' | 'Codigo' | 'PrecioVenta' | 'Rubro';
  direccionOrden?: 'ASC' | 'DESC';
  soloConStock?: boolean;
  soloStockBajo?: boolean;
  soloSinStock?: boolean;
  soloEnPromocion?: boolean;

  // 👇 nuevos campos explícitos
  rubro?: string;          // filtro por texto de rubro
  proveedor?: string;      // filtro por texto de proveedor
  rubroId?: number;        // filtro por id de rubro
  proveedorId?: number;    // filtro por id de proveedor
};

/* ======================== Props reutilizable ======================== */
type ArticulosTableProps = {
  columns: ColumnDef[];
  title?: string;
  rowsPerPageOptions?: number[];
  defaultPageSize?: number;

  initialServerFilters?: Partial<FiltrosServidor> & {
    estado?: 'Sin stock' | 'Bajo stock' | 'Con stock';
  };

  controlledFilters?: Partial<FiltrosServidor> & {
    estado?: 'Sin stock' | 'Bajo stock' | 'Con stock';
  };
  onFiltersChange?: (filtros: FiltrosServidor & { estado?: string }) => void;

  showToolbar?: boolean;
  showGlobalSearch?: boolean;
  allowCreate?: boolean;
  onCreateClick?: () => void;

  onView?: (articulo: Articulo) => void;
  onEdit?: (articulo: Articulo) => void;
  onDelete?: (articulo: Articulo) => void;

  dense?: boolean;

  onDataLoaded?: (payload: {
    total: number;
    articulos: Articulo[];
    filtros: (FiltrosServidor & { estado?: string; busqueda?: string | undefined });
    loading: boolean;
    error?: Error;
  }) => void;
};

/* ======================== Utils ======================== */
const getStockColor = (stock: number, stockMinimo: number) => {
  if (stock <= 0) return 'error';
  if (stock <= stockMinimo) return 'warning';
  return 'success';
};
const getStockLabel = (stock: number, stockMinimo: number) => {
  if (stock <= 0) return 'Sin stock';
  if (stock <= stockMinimo) return 'Stock Bajo';
  return 'Disponible';
};

/* ======================== Componente ======================== */
const ArticulosTable: React.FC<ArticulosTableProps> = ({
  columns,
  title = 'Artículos',
  rowsPerPageOptions = [50, 100, 150],
  defaultPageSize = 50,
  initialServerFilters,
  controlledFilters,
  onFiltersChange,
  showToolbar = true,
  showGlobalSearch = true,
  allowCreate = true,
  onCreateClick,
  onView,
  onEdit,
  onDelete,
  dense = true,
  onDataLoaded,
}) => {
  // estado interno (si no vienen controlados)
  const [page, setPage] = useState(initialServerFilters?.pagina ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(initialServerFilters?.limite ?? defaultPageSize);
  const [globalInput, setGlobalInput] = useState(initialServerFilters?.busqueda ?? '');

  const [localFilters, setLocalFilters] = useState({
    codigo: initialServerFilters?.codigo ?? '',
    descripcion: initialServerFilters?.descripcion ?? '',
    rubro: initialServerFilters?.rubro ?? '',
    proveedor: initialServerFilters?.proveedor ?? '',
    estado: initialServerFilters?.estado ?? '',
    rubroId: initialServerFilters?.rubroId ?? undefined as number | undefined,
    proveedorId: initialServerFilters?.proveedorId ?? undefined as number | undefined,
  });

  // menú de filtros por columna
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCol, setActiveCol] = useState<ColumnDef['key'] | null>(null);
  const [colInput, setColInput] = useState('');

  // Proveedores (opcional para autocompletar)
  const { data: dataProveedores } = useQuery<{ proveedores: { IdProveedor: number; Nombre: string }[] }>(
    GET_PROVEEDORES,
    { fetchPolicy: 'cache-first' }
  );
  const proveedores = dataProveedores?.proveedores ?? [];

  // seleccion de estado
  const controlledEstado = controlledFilters?.estado;
  const estadoSeleccionado = useMemo(
    () => ((controlledEstado ?? localFilters.estado) || '').toLowerCase(),
    [controlledEstado, localFilters.estado]
  );

  // 🔎 búsqueda global (solo el input global/prop busqueda)
  const globalSearch = useMemo(() => {
    const g = (controlledFilters?.busqueda ?? globalInput)?.trim();
    return g || undefined;
  }, [controlledFilters?.busqueda, globalInput]);

  // 🎯 filtros que viajarán al servidor (explícitos)
  const filtrosServidor = useMemo<FiltrosServidor>(() => ({
    busqueda: undefined, // se setea en variablesQuery
    codigo: (controlledFilters?.codigo ?? localFilters.codigo) || undefined,
    descripcion: (controlledFilters?.descripcion ?? localFilters.descripcion) || undefined,
    rubro: (controlledFilters?.rubro ?? localFilters.rubro) || undefined,
    pagina: controlledFilters?.pagina ?? page,
    limite: controlledFilters?.limite ?? rowsPerPage,
    ordenarPor: controlledFilters?.ordenarPor ?? 'Descripcion',
    direccionOrden: controlledFilters?.direccionOrden ?? 'ASC',
    soloConStock: estadoSeleccionado === 'con stock' ? true : undefined,
    soloStockBajo: estadoSeleccionado === 'bajo stock' ? true : undefined,
    soloSinStock: estadoSeleccionado === 'sin stock' ? true : undefined,
    soloEnPromocion: controlledFilters?.soloEnPromocion,
    rubroId: controlledFilters?.rubroId ?? localFilters.rubroId ?? undefined,
    proveedorId: controlledFilters?.proveedorId ?? localFilters.proveedorId ?? undefined,
  }), [
    controlledFilters,
    localFilters,
    page,
    rowsPerPage,
    estadoSeleccionado,
  ]);

  const variablesQuery = useMemo(() => ({
    filtros: {
      ...filtrosServidor,
      busqueda: globalSearch,
    },
  }), [filtrosServidor, globalSearch]);

  const { data, loading, error, refetch } = useQuery<{
    buscarArticulos: { total: number; articulos: (Articulo | null)[] }
  }>(BUSCAR_ARTICULOS, {
    variables: variablesQuery,
    fetchPolicy: 'cache-and-network'
  });

  const articulos: Articulo[] = (data?.buscarArticulos?.articulos ?? []).filter((a): a is Articulo => !!a);
  const total: number = data?.buscarArticulos?.total ?? 0;

  const estadoActual = controlledFilters?.estado ?? localFilters.estado;

  useEffect(() => {
    if (!onDataLoaded) return;
    onDataLoaded({
      total,
      articulos,
      filtros: {
        ...filtrosServidor,
        busqueda: globalSearch,
        estado: estadoActual,
      },
      loading,
      error: error ?? undefined,
    });
  }, [onDataLoaded, total, articulos, filtrosServidor, globalSearch, estadoActual, loading, error]);

  // Propagar filtros efectivos al padre
  useEffect(() => {
    onFiltersChange?.({
      ...filtrosServidor,
      busqueda: globalSearch,
      estado: estadoActual,
    });
  }, [onFiltersChange, filtrosServidor, globalSearch, estadoActual]);

  // handlers básicos
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!controlledFilters) {
      setRowsPerPage(value);
      setPage(0);
    }
    onFiltersChange?.({
      ...filtrosServidor,
      busqueda: globalSearch,
      estado: estadoActual,
      limite: value,
      pagina: 0,
    });
  };
  const handleChangePage = (_: any, newPage: number) => {
    if (!controlledFilters) setPage(newPage);
    onFiltersChange?.({
      ...filtrosServidor,
      busqueda: globalSearch,
      estado: estadoActual,
      pagina: newPage,
    });
  };

  const limpiarFiltros = () => {
    if (!controlledFilters) {
      setGlobalInput('');
      setLocalFilters({
        codigo: '',
        descripcion: '',
        rubro: '',
        proveedor: '',
        estado: '',
        rubroId: undefined,
        proveedorId: undefined
      });
      setPage(0);
    }
    refetch();
  };

  // render por defecto
  const defaultRenderers: Record<ArticuloColumnKey, (a: Articulo) => React.ReactNode> = {
    descripcion: (a) => (
      <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal' }}>
        {a.Descripcion || '-'}
      </Typography>
    ),
    codigo: (a) => <Typography variant="body2">{a.Codigo ?? '-'}</Typography>,
    marca: (a) => <Typography variant="body2" color="text.secondary">{a.Marca ?? '-'}</Typography>,
    rubro: (a) => (
      <Chip
        label={a.Rubro || 'Sin rubro'}
        size="small"
        sx={{
          bgcolor: 'success.light',
          color: 'success.dark',
          fontWeight: 500,
          height: 18,
          borderRadius: 1,
          '& .MuiChip-label': { px: 0.6, py: 0, fontSize: '0.675rem', lineHeight: 1.1 },
        }}
      />
    ),
    stock: (a) => {
      const dep = parseFloat(String(a.Deposito ?? 0)) || 0;
      const min = a.StockMinimo || 0;
      return (
        <Typography variant="body2" fontWeight={600} color={dep <= 0 ? 'error.main' : 'text.primary'}>
          {dep} {abrevUnidad(a.Unidad as UnidadMedida)}
        </Typography>
      );
    },
    precio: (a) => (
      <Typography variant="body2" fontWeight={600} color="success.dark">
        ${(a.PrecioVenta || 0).toLocaleString('es-AR')}
      </Typography>
    ),
    proveedor: (a) => (
      <Typography variant="body2" color="text.secondary">
        {a.proveedor?.Nombre || 'Sin proveedor'}
      </Typography>
    ),
    estado: (a) => {
      const dep = parseFloat(String(a.Deposito ?? 0)) || 0;
      const min = a.StockMinimo || 0;
      return (
        <>
          <Chip
            label={getStockLabel(dep, min)}
            color={getStockColor(dep, min)}
            size="small"
            variant="filled"
            sx={{
              height: 18,
              borderRadius: 1,
              '& .MuiChip-label': { px: 0.6, py: 0, fontSize: '0.675rem', lineHeight: 1.1 },
            }}
          />
          {a.EnPromocion && (
            <Chip
              label="Promoción"
              color="warning"
              size="small"
              variant="outlined"
              sx={{
                ml: 0.75,
                height: 18,
                borderRadius: 1,
                '& .MuiChip-label': { px: 0.6, py: 0, fontSize: '0.675rem', lineHeight: 1.1 },
              }}
            />
          )}
        </>
      );
    },
    acciones: (a) => (
      <Box display="flex" justifyContent="center" gap={0.75}>
        {onView && (
          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              onClick={() => onView(a)}
              sx={{ bgcolor: '#1976d2', color: 'white', borderRadius: 1, width: 28, height: 28, '&:hover': { bgcolor: '#1565c0' } }}
            >
              <IconEye size={16} />
            </IconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => onEdit(a)}
              sx={{ bgcolor: '#2e7d32', color: 'white', borderRadius: 1, width: 28, height: 28, '&:hover': { bgcolor: '#1b5e20' } }}
            >
              <IconEdit size={16} />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => onDelete(a)}
              sx={{ bgcolor: '#d32f2f', color: 'white', borderRadius: 1, width: 28, height: 28, '&:hover': { bgcolor: '#c62828' } }}
            >
              <IconTrash size={16} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
  };

  // menú de filtros por columna (simple)
  const abrirMenu = (colKey: ColumnDef['key']) => (e: React.MouseEvent<HTMLElement>) => {
    setActiveCol(colKey);
    if (colKey === 'descripcion') setColInput(controlledFilters?.descripcion ?? localFilters.descripcion);
    if (colKey === 'codigo') setColInput(controlledFilters?.codigo ?? localFilters.codigo);
    if (colKey === 'rubro') setColInput(controlledFilters?.rubro ?? localFilters.rubro);
    if (colKey === 'proveedor') setColInput(controlledFilters?.proveedor ?? localFilters.proveedor);
    setMenuAnchor(e.currentTarget);
  };
  const cerrarMenu = () => { setMenuAnchor(null); setActiveCol(null); setColInput(''); };

  const totalPaginas = Math.ceil(total / (controlledFilters?.limite ?? rowsPerPage));
  const paginaActual = (controlledFilters?.pagina ?? page) + 1;
  const genPaginas = () => {
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

  return (
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
      {showToolbar && (
        <Box display="flex" justifyContent="space-between" alignItems="center"
          sx={{ px: 1, py: 1, bgcolor: verde.toolbarBg, border: '1px solid', borderColor: verde.toolbarBorder, borderRadius: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color={verde.textStrong}>{title}</Typography>
          <Box display="flex" alignItems="center" gap={1.5}>
            {allowCreate && (
              <Button
                variant="contained"
                sx={{ textTransform: 'none', bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }}
                startIcon={<IconPlus size={18} />}
                onClick={onCreateClick}
              >
                Nuevo
              </Button>
            )}
            {showGlobalSearch && (
              <>
                <TextField
                  size="small"
                  placeholder="Buscar..."
                  value={controlledFilters?.busqueda ?? globalInput}
                  onChange={(e) => setGlobalInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') refetch(); }}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
                  sx={{ minWidth: 250 }}
                />
                <Tooltip title="Buscar (Enter)">
                  <span>
                    <Button
                      variant="contained"
                      sx={{ textTransform: 'none', bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }}
                      startIcon={<IconSearch size={18} />}
                      onClick={() => refetch()}
                      disabled={loading}
                    >
                      Buscar
                    </Button>
                  </span>
                </Tooltip>
              </>
            )}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<IconRefresh />}
              onClick={limpiarFiltros}
              sx={{ textTransform: 'none', borderColor: verde.headerBorder, color: verde.textStrong, '&:hover': { borderColor: verde.textStrong, bgcolor: verde.toolbarBg } }}
            >
              Limpiar
            </Button>
          </Box>
        </Box>
      )}

      {/* tabla */}
      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: verde.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small"
          sx={{
            '& .MuiTableCell-root': { fontSize: '0.75rem', px: 1, py: 0.5 },
            '& .MuiTableCell-head': { fontSize: '0.75rem', fontWeight: 600, bgcolor: verde.headerBg, color: verde.headerText },
          }}
        >
          <TableHead>
            <TableRow sx={{ '& th:first-of-type': { borderTopLeftRadius: 8 }, '& th:last-of-type': { borderTopRightRadius: 8 } }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    fontWeight: 700,
                    color: verde.headerText,
                    borderBottom: '3px solid',
                    borderColor: verde.headerBorder,
                    width: col.key === 'acciones' ? 140 : col.width,
                    textAlign: col.key === 'acciones' ? 'center' : undefined,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    {col.header ?? col.key.toUpperCase()}
                    {col.filterable && (
                      <Tooltip title="Filtrar">
                        <IconButton size="small" color="inherit" onClick={abrirMenu(col.key)}>
                          <IconDotsVertical size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody sx={{ '& .MuiTableCell-root': { py: dense ? 1 : 1.5 } }}>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length}><Typography> Cargando… </Typography></TableCell></TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box textAlign="center" py={3}>
                    <Typography color="error" variant="h6" mb={1}>Error al cargar</Typography>
                    <Typography color="text.secondary" mb={2}>{error.message}</Typography>
                    <Button variant="contained" color="warning" startIcon={<IconRefresh />} onClick={() => refetch()}>
                      Reintentar
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : articulos.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length}><Typography>No hay resultados</Typography></TableCell></TableRow>
            ) : (
              articulos.map((a, idx) => (
                <TableRow key={a.id} sx={{ bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit', '&:hover': { bgcolor: verde.toolbarBg } }}>
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ textAlign: col.key === 'acciones' ? 'center' : undefined }}>
                      {col.render ? col.render(a) : defaultRenderers[col.key](a)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* footer paginación */}
      <Box mt={1} mb={1} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">Mostrando {articulos.length} filas en esta página.</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">Filas por página:</Typography>
          <TextField select size="small" value={controlledFilters?.limite ?? rowsPerPage} onChange={handleChangeRowsPerPage} sx={{ minWidth: 80 }}>
            {rowsPerPageOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
          </TextField>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {`${(controlledFilters?.pagina ?? page) * (controlledFilters?.limite ?? rowsPerPage) + 1}-${Math.min(((controlledFilters?.pagina ?? page) + 1) * (controlledFilters?.limite ?? rowsPerPage), total)} de ${total}`}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {genPaginas().map((n, i) => (
              <Box key={i}>
                {n === '...' ? (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>…</Typography>
                ) : (
                  <Button
                    size="small"
                    variant={((controlledFilters ? (controlledFilters.pagina ?? 0) + 1 : paginaActual) === n) ? 'contained' : 'text'}
                    onClick={() => handleChangePage(null, (n as number) - 1)}
                    sx={{
                      minWidth: 32, height: 32, textTransform: 'none', fontSize: '0.875rem',
                      ...(((controlledFilters ? (controlledFilters.pagina ?? 0) + 1 : paginaActual) === n)
                        ? { bgcolor: verde.primary, color: 'white', '&:hover': { bgcolor: verde.primaryHover } }
                        : { color: 'text.secondary', '&:hover': { bgcolor: verde.rowHover } })
                    }}
                  >
                    {n}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" onClick={() => handleChangePage(null, 0)} disabled={(controlledFilters?.pagina ?? page) === 0} sx={{ color: 'text.secondary' }} title="Primera">⏮</IconButton>
            <IconButton size="small" onClick={() => handleChangePage(null, (controlledFilters?.pagina ?? page) - 1)} disabled={(controlledFilters?.pagina ?? page) === 0} sx={{ color: 'text.secondary' }} title="Anterior">◀</IconButton>
            <IconButton size="small" onClick={() => handleChangePage(null, (controlledFilters?.pagina ?? page) + 1)} disabled={(controlledFilters?.pagina ?? page) >= totalPaginas - 1} sx={{ color: 'text.secondary' }} title="Siguiente">▶</IconButton>
            <IconButton size="small" onClick={() => handleChangePage(null, totalPaginas - 1)} disabled={(controlledFilters?.pagina ?? page) >= totalPaginas - 1} sx={{ color: 'text.secondary' }} title="Última">⏭</IconButton>
          </Box>
        </Box>
      </Box>

      {/* Menú filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {activeCol === 'codigo' && 'Filtrar por Código'}
          {activeCol === 'descripcion' && 'Filtrar por Descripción'}
          {activeCol === 'rubro' && 'Filtrar por Rubro'}
          {activeCol === 'proveedor' && 'Filtrar por Proveedor (texto)'}
          {activeCol === 'estado' && 'Filtrar por Estado'}
        </Typography>
        <Divider sx={{ mb: 1 }} />

        {activeCol === 'estado' ? (
          <Box px={1} pb={1}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['Sin stock', 'Bajo stock', 'Con stock'].map((op) => (
                  <Button
                    key={op}
                    size="small"
                    variant={(controlledFilters?.estado ?? localFilters.estado) === op ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => {
                      if (!controlledFilters) { setLocalFilters((p) => ({ ...p, estado: op as any })); setPage(0); }
                      cerrarMenu(); refetch();
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    {op}
                  </Button>
                ))}
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Button size="small" onClick={() => { if (!controlledFilters) setLocalFilters((p) => ({ ...p, estado: '' as any })); cerrarMenu(); refetch(); }}>Limpiar</Button>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Box px={1} pb={1}>
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Escribe para filtrar…"
              value={colInput}
              onChange={(e) => setColInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && activeCol) {
                  if (!controlledFilters) {
                    setLocalFilters((prev) => {
                      const next = { ...prev };
                      if (activeCol === 'codigo') next.codigo = colInput;
                      if (activeCol === 'descripcion') next.descripcion = colInput;
                      if (activeCol === 'rubro') next.rubro = colInput;
                      if (activeCol === 'proveedor') next.proveedor = colInput;
                      return next;
                    });
                    setPage(0);
                  }
                  cerrarMenu(); refetch();
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => setColInput('')}>Limpiar</Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => {
                  if (!controlledFilters && activeCol) {
                    setLocalFilters((prev) => {
                      const next = { ...prev };
                      if (activeCol === 'codigo') next.codigo = colInput;
                      if (activeCol === 'descripcion') next.descripcion = colInput;
                      if (activeCol === 'rubro') next.rubro = colInput;
                      if (activeCol === 'proveedor') next.proveedor = colInput;
                      return next;
                    });
                    setPage(0);
                  }
                  cerrarMenu(); refetch();
                }}
              >
                Aplicar
              </Button>
            </Stack>
          </Box>
        )}
      </Menu>
    </Paper>
  );
};

export default ArticulosTable;
