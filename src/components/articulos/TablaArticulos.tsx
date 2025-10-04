'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  IconButton,
  Chip,
  Menu,
  Divider,
  Stack,
  Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@apollo/client/react';
import { IconSearch, IconShoppingCart } from '@tabler/icons-react';
import { IconDotsVertical, IconEye, IconEdit, IconTrash, IconPlus, IconRefresh } from '@tabler/icons-react';

import { BUSCAR_ARTICULOS } from '@/components/articulos/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { verde, azul, marron } from '@/ui/colores';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { abrevUnidad, type UnidadMedida } from '@/app/utils/unidades';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';

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

/* ======================== Estética ======================== */
const accentExterior = verde.primary;
const accentInterior = verde.borderInner ?? '#2f3e2e';
const panelBg = 'rgba(236, 249, 236, 0.82)';
const tableBodyBg = 'rgba(243, 255, 242, 0.68)';
const tableBodyAlt = 'rgba(178, 228, 178, 0.28)';
const woodTintExterior = '#cde7c9';
const colorAccionEliminar = '#c62828';

const biselExteriorConfig = crearConfiguracionBisel(accentExterior, 1.4);
const estilosBiselExterior = crearEstilosBisel(biselExteriorConfig, { zContenido: 2 });

const WoodSection: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
      background: 'transparent',
      ...estilosBiselExterior,
    }}
  >
    <WoodBackdrop accent={woodTintExterior} radius={3} inset={0} strength={0.16} texture="tabla" />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundColor: alpha('#f5fff0', 0.85),
        zIndex: 0,
      }}
    />
    <Box sx={{ position: 'relative', zIndex: 2, p: 3 }}>{children}</Box>
  </Box>
);

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
  rubro?: string;
  proveedor?: string;
  rubroId?: number;
  proveedorId?: number;
};

/* ======================== Props reutilizable ======================== */
type ArticulosTableProps = {
  columns: ColumnDef[];
  title?: string;
  rowsPerPageOptions?: number[];
  defaultPageSize?: number;
  initialServerFilters?: Partial<FiltrosServidor> & { estado?: 'Sin stock' | 'Bajo stock' | 'Con stock' };
  controlledFilters?: Partial<FiltrosServidor> & { estado?: 'Sin stock' | 'Bajo stock' | 'Con stock' };
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

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCol, setActiveCol] = useState<ColumnDef['key'] | null>(null);
  const [colInput, setColInput] = useState('');

  const { data: dataProveedores } = useQuery<{ proveedores: { IdProveedor: number; Nombre: string }[] }>(
    GET_PROVEEDORES,
    { fetchPolicy: 'cache-first' }
  );
  const proveedores = dataProveedores?.proveedores ?? [];

  const controlledEstado = controlledFilters?.estado;
  const estadoSeleccionado = useMemo(
    () => ((controlledEstado ?? localFilters.estado) || '').toLowerCase(),
    [controlledEstado, localFilters.estado]
  );

  const globalSearch = useMemo(() => {
    const g = (controlledFilters?.busqueda ?? globalInput)?.trim();
    return g || undefined;
  }, [controlledFilters?.busqueda, globalInput]);

  const filtrosServidor = useMemo<FiltrosServidor>(() => ({
    busqueda: undefined,
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
    fetchPolicy: 'cache-and-network',
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

  useEffect(() => {
    onFiltersChange?.({
      ...filtrosServidor,
      busqueda: globalSearch,
      estado: estadoActual,
    });
  }, [onFiltersChange, filtrosServidor, globalSearch, estadoActual]);

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
        proveedorId: undefined,
      });
      setPage(0);
    }
    refetch();
  };

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
          bgcolor: alpha(accentExterior, 0.18),
          color: verde.textStrong,
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
      <Typography variant="body2" fontWeight={700} color={verde.textStrong}>
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
        <Box display="flex" alignItems="center" gap={0.75}>
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
                height: 18,
                borderRadius: 1,
                '& .MuiChip-label': { px: 0.6, py: 0, fontSize: '0.675rem', lineHeight: 1.1 },
              }}
            />
          )}
        </Box>
      );
    },
    acciones: (a) => (
      <Box display="flex" justifyContent="center" gap={0.75}>
        {onView && (
          <Tooltip title="Ver detalles">
            <CrystalIconButton baseColor={azul.primary} onClick={() => onView(a)}>
              <IconEye size={16} />
            </CrystalIconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title="Editar">
            <CrystalIconButton baseColor={verde.primary} onClick={() => onEdit(a)}>
              <IconEdit size={16} />
            </CrystalIconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Eliminar">
            <CrystalIconButton baseColor={colorAccionEliminar} onClick={() => onDelete(a)}>
              <IconTrash size={16} />
            </CrystalIconButton>
          </Tooltip>
        )}
      </Box>
    ),
  };

  const abrirMenu = (colKey: ColumnDef['key']) => (e: React.MouseEvent<HTMLElement>) => {
    setActiveCol(colKey);
    if (colKey === 'descripcion') setColInput(controlledFilters?.descripcion ?? localFilters.descripcion);
    if (colKey === 'codigo') setColInput(controlledFilters?.codigo ?? localFilters.codigo);
    if (colKey === 'rubro') setColInput(controlledFilters?.rubro ?? localFilters.rubro);
    if (colKey === 'proveedor') setColInput(controlledFilters?.proveedor ?? localFilters.proveedor);
    setMenuAnchor(e.currentTarget);
  };
  const cerrarMenu = () => {
    setMenuAnchor(null);
    setActiveCol(null);
    setColInput('');
  };

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

  const toolbar = (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        px: 2,
        py: 1.5,
        mb: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: accentInterior,
        bgcolor: panelBg,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Chip
          icon={<IconShoppingCart size={16} />}
          label={title}
          sx={{
            bgcolor: accentExterior,
            color: '#fff',
            fontWeight: 700,
            height: 36,
            '& .MuiChip-label': { px: 1.2 },
          }}
        />
        <Typography variant="body2" color={verde.textStrong}>
          Gestión centralizada de inventario y stock disponible
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1.25} alignItems="center">
        {showGlobalSearch && (
          <TextField
            size="small"
            placeholder="Buscar descripción, código o proveedor…"
            value={controlledFilters?.busqueda ?? globalInput}
            onChange={(e) => setGlobalInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') refetch(); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 260,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#fff',
                '& fieldset': { borderColor: alpha(accentExterior, 0.35) },
                '&:hover fieldset': { borderColor: alpha(accentExterior, 0.5) },
                '&.Mui-focused fieldset': { borderColor: accentExterior },
              },
            }}
          />
        )}
        <CrystalSoftButton
          baseColor={accentExterior}
          startIcon={<IconRefresh size={18} />}
          onClick={limpiarFiltros}
          sx={{ minHeight: 36, px: 2 }}
        >
          Limpiar
        </CrystalSoftButton>
        <CrystalButton
          baseColor={accentExterior}
          startIcon={<IconSearch size={18} />}
          onClick={() => refetch()}
          disabled={loading}
          sx={{ minHeight: 36, px: 2.4 }}
        >
          Buscar
        </CrystalButton>
        {allowCreate && (
          <CrystalButton
            baseColor={verde.primary}
            startIcon={<IconPlus size={18} />}
            onClick={onCreateClick}
            sx={{ minHeight: 36, px: 2.4 }}
          >
            Nuevo artículo
          </CrystalButton>
        )}
      </Stack>
    </Box>
  );

  const tablaContenido = (
    <TableContainer
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(accentExterior, 0.6),
        bgcolor: tableBodyBg,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          '& .MuiTableCell-root': { fontSize: '0.78rem', px: 1.25, py: dense ? 0.75 : 1.1 },
          '& .MuiTableCell-head': {
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor: accentExterior,
            color: '#fff',
            borderBottom: 'none',
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ '& th:first-of-type': { borderTopLeftRadius: 8 }, '& th:last-of-type': { borderTopRightRadius: 8 } }}>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                sx={{
                  fontWeight: 700,
                  color: '#fff',
                  width: col.key === 'acciones' ? 160 : col.width,
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
        <TableBody>
          {articulos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box textAlign="center" py={4}>
                  <Typography variant="subtitle1" color={verde.textStrong} fontWeight={600}>
                    No se encontraron artículos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajustá los filtros o cargá un nuevo artículo.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            articulos.map((a, idx) => (
              <TableRow
                key={a.id}
                sx={{
                  bgcolor: idx % 2 === 0 ? 'transparent' : tableBodyAlt,
                  '&:hover': { bgcolor: alpha(accentExterior, 0.1) },
                }}
              >
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
  );

  const paginador = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
      <Typography variant="caption" color="text.secondary">
        Mostrando {Math.min(articulos.length, rowsPerPage)} de {total} artículos
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          select
          size="small"
          value={String(controlledFilters?.limite ?? rowsPerPage)}
          onChange={handleChangeRowsPerPage}
          sx={{ minWidth: 90 }}
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          Página {paginaActual} de {Math.max(1, totalPaginas)}
        </Typography>
        {genPaginas().map((num, idx) =>
          num === '...' ? (
            <CrystalSoftButton
              key={`ellipsis-${idx}`}
              baseColor={accentExterior}
              disabled
              sx={{ minWidth: 32, minHeight: 30, px: 1, py: 0.25, borderRadius: 2, color: verde.textStrong }}
            >
              …
            </CrystalSoftButton>
          ) : (
            <CrystalButton
              key={`page-${num}`}
              baseColor={accentExterior}
              onClick={() => handleChangePage(null, (num as number) - 1)}
              disabled={num === paginaActual}
              sx={{
                minWidth: 32,
                minHeight: 30,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                fontWeight: num === paginaActual ? 800 : 600,
                boxShadow: 'none',
              }}
            >
              {num}
            </CrystalButton>
          )
        )}
      </Stack>
    </Box>
  );

  if (loading) {
    return (
      <WoodSection>
        <Skeleton variant="rounded" height={48} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
      </WoodSection>
    );
  }

  if (error) {
    return (
      <WoodSection>
        <Typography color="error" variant="h6" mb={1}>
          Error al cargar artículos
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {error.message}
        </Typography>
        <CrystalButton baseColor={accentExterior} startIcon={<IconRefresh />} onClick={() => refetch()}>
          Reintentar
        </CrystalButton>
      </WoodSection>
    );
  }

  return (
    <>
      <WoodSection>
        {showToolbar && toolbar}
        {tablaContenido}
        {paginador}
      </WoodSection>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260, borderRadius: 2 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {activeCol === 'codigo' && 'Filtrar por Código'}
          {activeCol === 'descripcion' && 'Filtrar por Descripción'}
          {activeCol === 'rubro' && 'Filtrar por Rubro'}
          {activeCol === 'proveedor' && 'Filtrar por Proveedor'}
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
                      if (!controlledFilters) {
                        setLocalFilters((p) => ({ ...p, estado: op as any }));
                        setPage(0);
                      }
                      cerrarMenu();
                      refetch();
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    {op}
                  </Button>
                ))}
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Button
                  size="small"
                  onClick={() => {
                    if (!controlledFilters) {
                      setLocalFilters((p) => ({ ...p, estado: '' as any }));
                      setPage(0);
                    }
                    cerrarMenu();
                    refetch();
                  }}
                >
                  Limpiar
                </Button>
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
                  cerrarMenu();
                  refetch();
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => setColInput('')}>
                Limpiar
              </Button>
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
                  cerrarMenu();
                  refetch();
                }}
              >
                Aplicar
              </Button>
            </Stack>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default ArticulosTable;
