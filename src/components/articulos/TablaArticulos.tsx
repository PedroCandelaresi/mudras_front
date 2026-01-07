'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { alpha, darken } from '@mui/material/styles';
import { useQuery } from '@apollo/client/react';
import {
  IconSearch, IconClipboardList, IconRefresh, IconPhone, IconMail,
  IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical
} from '@tabler/icons-react';
import { Icon } from '@iconify/react';
import { BUSCAR_ARTICULOS, GET_ESTADISTICAS_ARTICULOS } from '@/components/articulos/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { abrevUnidad, type UnidadMedida } from '@/app/utils/unidades';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';
import { azul, verde } from '@/ui/colores';
import ModalDetallesArticulo from '@/components/articulos/ModalDetallesArticulo';
import ModalEliminarArticulo from '@/components/articulos/ModalEliminarArticulo';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';
import SearchToolbar from '@/components/ui/SearchToolbar';

/* ======================== Tipos de columnas ======================== */
type ArticuloColumnKey =
  | 'descripcion'
  | 'imagen'
  | 'codigo'
  | 'marca'
  | 'rubro'
  | 'stock'
  | 'precio'
  | 'iva'
  | 'proveedor'
  | 'estado'
  | 'acciones';
type ColKey = Extract<ArticuloColumnKey, 'descripcion' | 'codigo' | 'rubro' | 'proveedor' | 'estado'>;
type ColFilters = Partial<Record<ColKey, string>>;
export type ColumnDef = {
  key: ArticuloColumnKey;
  header?: string;
  width?: string | number;
  render?: (art: Articulo) => React.ReactNode;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
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
  /**
   * Si es true (por defecto), la tabla mostrará acciones internas (ver/eliminar)
   * usando sus propios modales cuando no se proveen handlers externos.
   * Útil para pantallas generales como Panel > Artículos. En contextos embebidos
   * (e.g. detalles de rubro/proveedor) los handlers externos siguen teniendo prioridad.
   */
  useInternalModals?: boolean;
};

/* ======================== Estética ======================== */
const militaryGreen = '#2b4735';
const accentExterior = militaryGreen;
const accentInterior = darken(militaryGreen, 0.3);
const panelBg = 'rgba(222, 236, 227, 0.72)';
const tableBodyBg = 'rgba(235, 247, 238, 0.58)';
const tableBodyAlt = 'rgba(191, 214, 194, 0.32)';
const woodTintExterior = '#c7d8cb';
const woodTintInterior = '#b2c4b6';
const headerBg = darken(militaryGreen, 0.12);
const headerTextColor = alpha('#ffffff', 0.95);
const colorAccionEliminar = '#b71c1c';

const biselExteriorConfig = crearConfiguracionBisel(accentExterior, 1.45);
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
        backgroundColor: alpha('#f2f7f4', 0.78),
        zIndex: 0,
      }}
    />
    <Box sx={{ position: 'relative', zIndex: 2, p: 2.75 }}>{children}</Box>
  </Box>
);

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

const formatCurrency = (valor: number) => `$${Number(valor || 0).toLocaleString('es-AR')}`;

const obtenerPrecioCalculado = (articulo: Articulo) => {
  const precio = calcularPrecioDesdeArticulo(articulo);
  if (!precio) {
    return Number(articulo.PrecioVenta ?? 0);
  }
  return precio;
};

const obtenerStockTotal = (articulo: Articulo) => {
  if (typeof articulo.totalStock === 'number' && Number.isFinite(articulo.totalStock)) {
    return articulo.totalStock;
  }
  return 0;
};

const normalizarIva = (valor?: number | null): number | null => {
  if (valor == null) return null;
  const num = Number(valor);
  if (Number.isNaN(num)) return null;
  if (num === 0 || num === 10.5 || num === 21) return num;
  return null;
};

const numberFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

/* ======================== Componente ======================== */
const TablaArticulos: React.FC<ArticulosTableProps> = ({
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
  useInternalModals = true,
}) => {
  const [page, setPage] = useState(initialServerFilters?.pagina ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(initialServerFilters?.limite ?? defaultPageSize);
  const [globalInput, setGlobalInput] = useState(initialServerFilters?.busqueda ?? '');
  const [globalSearchDraft, setGlobalSearchDraft] = useState(controlledFilters?.busqueda ?? initialServerFilters?.busqueda ?? '');
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
  const [filtrosColumna, setFiltrosColumna] = useState<ColFilters>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  const controlledEstado = controlledFilters?.estado;
  const estadoSeleccionado = useMemo(
    () => ((controlledEstado ?? localFilters.estado) || '').toLowerCase(),
    [controlledEstado, localFilters.estado]
  );

  const globalSearch = useMemo(() => {
    const g = (controlledFilters?.busqueda ?? globalInput)?.trim();
    return g || undefined;
  }, [controlledFilters?.busqueda, globalInput]);

  useEffect(() => {
    setGlobalSearchDraft(controlledFilters?.busqueda ?? globalInput);
  }, [controlledFilters?.busqueda, globalInput]);

  const filtrosServidor = useMemo<FiltrosServidor>(() => ({
    busqueda: undefined,
    codigo: (controlledFilters?.codigo ?? localFilters.codigo) || undefined,
    descripcion: (controlledFilters?.descripcion ?? localFilters.descripcion) || undefined,
    rubro: (controlledFilters?.rubro ?? localFilters.rubro) || undefined,
    pagina: controlledFilters?.pagina ?? page,
    limite: controlledFilters?.limite ?? rowsPerPage,
    ordenarPor: controlledFilters?.ordenarPor ?? 'Codigo',
    direccionOrden: controlledFilters?.direccionOrden ?? 'ASC',
    // Allow flexible matching because labels may vary (e.g. 'Sin stock', 'Bajo stock', 'STOCK BAJO')
    soloConStock: (estadoSeleccionado.includes('con') || estadoSeleccionado.includes('disponible')) ? true : undefined,
    soloStockBajo: (estadoSeleccionado.includes('bajo') || estadoSeleccionado.includes('stock bajo')) ? true : undefined,
    soloSinStock: estadoSeleccionado.includes('sin') ? true : undefined,
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

  const { data: statsData } = useQuery<{ estadisticasArticulos?: { totalUnidades?: number } }>(GET_ESTADISTICAS_ARTICULOS, { fetchPolicy: 'cache-first' });

  const articulosRaw: Articulo[] = (data?.buscarArticulos?.articulos ?? []).filter((a): a is Articulo => !!a);
  const searchTerm = (variablesQuery.filtros.busqueda || '').toString().trim().toLowerCase();
  const articulos: Articulo[] = useMemo(() => {
    if (!searchTerm) return [...articulosRaw].sort((a, b) => (a.Codigo || '').localeCompare(b.Codigo || ''));

    const score = (cod?: string) => {
      const c = (cod || '').toString().toLowerCase();
      if (!c) return 3;
      if (c === searchTerm) return 0;
      if (c.startsWith(searchTerm)) return 1;
      if (c.includes(searchTerm)) return 2;
      return 3;
    };

    return [...articulosRaw]
      .map((a) => ({ a, s: score(a.Codigo) }))
      .sort((x, y) => x.s - y.s || (x.a.Codigo || '').localeCompare(y.a.Codigo || ''))
      .map((x) => x.a);
  }, [articulosRaw, searchTerm]);
  const total: number = data?.buscarArticulos?.total ?? 0;
  const estadoActual = controlledFilters?.estado ?? localFilters.estado;

  // ===== Modales internos (detalles + eliminar) =====
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Pick<Articulo, 'id' | 'Descripcion' | 'Codigo'> | null>(null);
  const [textoConfirmEliminar, setTextoConfirmEliminar] = useState('');

  const openDetalles = useCallback((a: Articulo) => {
    setArticuloSeleccionado({ id: a.id, Descripcion: a.Descripcion, Codigo: a.Codigo });
    setModalDetallesOpen(true);
  }, []);

  const openEliminar = useCallback((a: Articulo) => {
    setArticuloSeleccionado({ id: a.id, Descripcion: a.Descripcion, Codigo: a.Codigo });
    setTextoConfirmEliminar('');
    setModalEliminarOpen(true);
  }, []);

  const closeModals = () => {
    setModalDetallesOpen(false);
    setModalEliminarOpen(false);
    setArticuloSeleccionado(null);
    setTextoConfirmEliminar('');
  };

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

  const handleChangePage = (_: unknown, newPage: number) => {
    if (!controlledFilters) setPage(newPage);
    onFiltersChange?.({
      ...filtrosServidor,
      busqueda: globalSearch,
      estado: estadoActual,
      pagina: newPage,
    });
  };

  useEffect(() => {
    const handleStockUpdate = () => {
      refetch();
    };

    window.addEventListener('stockGlobalActualizado', handleStockUpdate);
    return () => {
      window.removeEventListener('stockGlobalActualizado', handleStockUpdate);
    };
  }, [refetch]);

  const ejecutarBusqueda = useCallback(() => {
    const next = (globalSearchDraft ?? '').trim();
    if (controlledFilters) {
      onFiltersChange?.({
        ...filtrosServidor,
        busqueda: next || undefined,
        estado: estadoSeleccionado,
        pagina: 0,
      });
      if (!next && globalSearch === undefined) {
        refetch();
      }
    } else {
      if (next === globalInput) {
        refetch();
      } else {
        setGlobalInput(next);
        setPage(0);
      }
    }
  }, [controlledFilters, filtrosServidor, globalSearchDraft, globalInput, estadoSeleccionado, onFiltersChange, refetch, globalSearch]);

  const limpiarFiltros = () => {
    if (!controlledFilters) {
      setGlobalInput('');
      setGlobalSearchDraft('');
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
    } else {
      setGlobalSearchDraft('');
      onFiltersChange?.({
        ...filtrosServidor,
        busqueda: undefined,
        estado: undefined,
        pagina: 0,
      });
    }
    refetch();
  };

  const abrirMenu = (colKey: ColumnDef['key']) => (event: React.MouseEvent<HTMLElement>) => {
    setActiveCol(colKey);
    if (colKey === 'descripcion') setColInput(controlledFilters?.descripcion ?? localFilters.descripcion);
    if (colKey === 'codigo') setColInput(controlledFilters?.codigo ?? localFilters.codigo);
    if (colKey === 'rubro') setColInput(controlledFilters?.rubro ?? localFilters.rubro);
    if (colKey === 'proveedor') setColInput(controlledFilters?.proveedor ?? localFilters.proveedor);
    if (colKey === 'estado') setColInput(controlledFilters?.estado ?? localFilters.estado);
    setMenuAnchor(event.currentTarget);
  };

  const cerrarMenu = () => {
    setMenuAnchor(null);
    setActiveCol(null);
    setColInput('');
  };

  const totalPaginas = Math.ceil(total / (controlledFilters?.limite ?? rowsPerPage));
  const paginaActual = (controlledFilters?.pagina ?? page) + 1;

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

  const handleView = onView ?? (useInternalModals ? openDetalles : undefined);
  const handleDelete = onDelete ?? (useInternalModals ? openEliminar : undefined);

  const defaultRenderers: Record<ArticuloColumnKey, (a: Articulo) => React.ReactNode> = {
    descripcion: (a) => (
      <Box display="flex" flexDirection="column">
        <Typography variant="body2" fontWeight={700} sx={{ color: darken(militaryGreen, 0.2) }}>
          {a.Descripcion || '-'}
        </Typography>
      </Box>
    ),
    imagen: (a) => (
      <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd', bgcolor: '#fff' }}>
        {a.ImagenUrl ? (
          <img src={a.ImagenUrl.startsWith('http') ? a.ImagenUrl : `http://localhost:4000${a.ImagenUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Icon icon="mdi:image-off-outline" color="#ccc" width={20} style={{ margin: 10 }} />
        )}
      </Box>
    ),
    codigo: (a) => (
      <Chip
        label={a.Codigo ?? 'Sin código'}
        size="small"
        sx={{
          bgcolor: alpha(accentExterior, 0.14),
          color: darken(militaryGreen, 0.35),
          fontWeight: 600,
        }}
      />
    ),
    marca: (a) => (
      <Typography variant="body2" color="text.secondary">
        {a.Marca ?? '-'}
      </Typography>
    ),
    rubro: (a) => (
      <Chip
        label={a.Rubro || 'Sin rubro'}
        size="small"
        sx={{
          bgcolor: alpha(accentExterior, 0.22),
          color: headerBg,
          fontWeight: 600,
          height: 22,
          '& .MuiChip-label': { px: 0.8 },
        }}
      />
    ),
    stock: (a) => {
      const total = Number(obtenerStockTotal(a).toFixed(2));
      return (
        <Typography variant="body2" fontWeight={700} color={total <= 0 ? 'error.main' : headerBg}>
          {total} {abrevUnidad(a.Unidad as UnidadMedida)}
        </Typography>
      );
    },
    precio: (a) => {
      const precio = obtenerPrecioCalculado(a);
      return (
        <Typography variant="body2" fontWeight={700} color={headerBg}>
          {formatCurrency(precio)}
        </Typography>
      );
    },
    iva: (a) => {
      const ivaVal = normalizarIva(a.AlicuotaIva);
      return (
        <Chip
          label={ivaVal !== null ? `${ivaVal.toString().replace('.', ',')}%` : '—'}
          size="small"
          sx={{
            bgcolor: alpha(accentExterior, 0.18),
            color: darken(militaryGreen, 0.35),
            fontWeight: 600,
          }}
        />
      );
    },
    proveedor: (a) => (
      <Typography variant="body2" color="text.secondary">
        {a.proveedor?.Nombre || 'Sin proveedor'}
      </Typography>
    ),
    estado: (a) => {
      const dep = obtenerStockTotal(a);
      const min = a.StockMinimo || 0;
      return (
        <Chip
          label={getStockLabel(dep, min)}
          color={getStockColor(dep, min)}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      );
    },
    acciones: (a) => (
      <Box display="flex" justifyContent="center" gap={0.75}>
        {handleView && (
          <Tooltip title="Ver detalles">
            <CrystalIconButton baseColor={azul.primary} onClick={() => handleView(a)}>
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
        {handleDelete && (
          <Tooltip title="Eliminar">
            <CrystalIconButton baseColor={colorAccionEliminar} onClick={() => handleDelete(a)}>
              <IconTrash size={16} />
            </CrystalIconButton>
          </Tooltip>
        )}
      </Box>
    ),
  };

  const renderCell = (col: ColumnDef, articulo: Articulo) => {
    if (col.render) return col.render(articulo);
    const renderer = defaultRenderers[col.key];
    return renderer ? renderer(articulo) : null;
  };

  const toolbar = (
    <SearchToolbar
      title="Artículos"
      icon={<IconClipboardList size={30} />}
      baseColor={verde.primary}
      placeholder="Buscar descripción, código o proveedor…"
      searchValue={globalSearchDraft}
      onSearchValueChange={setGlobalSearchDraft}
      onSubmitSearch={ejecutarBusqueda}
      onClear={limpiarFiltros}
      canCreate={allowCreate}
      createLabel="Nuevo artículo"
      onCreateClick={onCreateClick}
      searchDisabled={loading}
    />
  );


  const tabla = (
    <TableContainer
      sx={{
        position: 'relative',
        borderRadius: 0,
        border: '1px solid',
        borderColor: alpha(accentInterior, 0.38),
        bgcolor: 'rgba(255, 250, 242, 0.94)',
        backdropFilter: 'saturate(110%) blur(0.85px)',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      }}
    >
      <WoodBackdrop accent={woodTintInterior} radius={0} inset={0} strength={0.12} texture="tabla" />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: alpha('#fffaf3', 0.82),
          zIndex: 0,
        }}
      />
      <Table
        stickyHeader
        size="small"
        sx={{
          borderRadius: 0,
          position: 'relative',
          zIndex: 2,
          bgcolor: tableBodyBg,
          '& .MuiTableRow-root': { minHeight: 62 },
          '& .MuiTableCell-root': {
            fontSize: '0.75rem',
            px: 1,
            py: 1.1,
            borderBottomColor: alpha(accentInterior, 0.35),
            bgcolor: 'transparent',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
            bgcolor: tableBodyBg,
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
            bgcolor: tableBodyAlt,
          },
          '& .MuiTableBody-root .MuiTableRow-root.MuiTableRow-hover:hover .MuiTableCell-root': {
            bgcolor: alpha('#d9b18a', 0.58),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: verde.headerBg,
            color: alpha('#FFFFFF', 0.94),
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.12)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          },
          // ✅ divisores sutiles entre columnas del header
          '& .MuiTableHead-root .MuiTableCell-head:not(:last-of-type)': {
            borderRight: `3px solid ${alpha(verde.headerBorder, 0.5)}`,
          },
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => {
              const displayedHeader = (column.header === 'STOCK TOTAL' || column.key === 'stock') ? 'Global' : (column.header ?? column.key.toUpperCase());
              return (
                <TableCell
                  key={column.key}
                  align={column.align ?? (column.key === 'acciones' ? 'center' : 'left')}
                  sx={{ width: column.width }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    {displayedHeader}

                    {column.key === 'estado' && (
                      <Tooltip title="Filtrar por estado de stock">
                        <IconButton
                          size="small"
                          color="inherit"
                          aria-label={`Filtrar estado de stock`}
                          aria-haspopup="menu"
                          onClick={abrirMenu('estado')}
                        >
                          <IconDotsVertical size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>


        <TableBody>
          {articulos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  No encontramos artículos que coincidan con tu búsqueda.
                </Typography>
                <Button variant="text" sx={{ mt: 1 }} onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            articulos.map((articulo) => (
              <TableRow key={articulo.id} hover>
                {columns.map((column) => (
                  <TableCell
                    key={`${articulo.id}-${column.key}`}
                    align={column.align ?? (column.key === 'acciones' ? 'center' : 'left')}
                  >
                    {renderCell(column, articulo)}
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mt: 3,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Mostrando {Math.min(rowsPerPage, articulos.length)} de {total} artículos
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          select
          size="small"
          value={String(rowsPerPage)}
          onChange={handleChangeRowsPerPage}
          sx={{ minWidth: 80 }}
        >
          {[50, 100, 150].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="body2" color="text.secondary">
          Página {paginaActual} de {Math.max(1, totalPaginas)}
        </Typography>

        {generarNumerosPaginas().map((num, idx) =>
          num === '...' ? (
            <CrystalSoftButton
              key={`ellipsis-${idx}`}
              baseColor={verde.primary}
              disabled
              sx={{
                minWidth: 32,
                minHeight: 30,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                color: verde.textStrong,
              }}
            >
              ...
            </CrystalSoftButton>
          ) : (
            <CrystalButton
              key={`page-${num}`}
              baseColor={verde.primary}
              sx={{
                minWidth: 32,
                minHeight: 30,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                fontWeight: Number(num) === paginaActual ? 800 : 600,
                boxShadow: 'none',
              }}
              onClick={() => handleChangePage(null, Number(num) - 1)}
              disabled={num === paginaActual}
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
        {showToolbar ? (
          <Skeleton variant="rounded" height={64} sx={{ mb: 3, borderRadius: 3 }} />
        ) : null}
        <Skeleton variant="rounded" height={dense ? 320 : 380} sx={{ borderRadius: 3 }} />
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

        {/* Resumen debajo del subtítulo (similar a TablaStockPuntoVenta) */}
        <Box px={1} pb={1}>
          <Typography variant="body1" color="text.secondary">
            {`${total} artículos • ${numberFormatter.format(
              statsData?.estadisticasArticulos?.totalUnidades ?? articulos.reduce((acc, it) => acc + Number(obtenerStockTotal(it) || 0), 0)
            )} unidades`}
          </Typography>
        </Box>

        {tabla}
        {paginador}
      </WoodSection>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { p: 1.5, minWidth: 260, borderRadius: 2 } },
        }}
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
                {['Sin stock', 'STOCK BAJO', 'Con stock'].map((op) => {
                  const key = op;
                  const isActive = (controlledFilters?.estado ?? localFilters.estado) === op;
                  const color = op.toLowerCase().includes('sin') ? 'error' : op.toLowerCase().includes('bajo') ? 'warning' : 'success';
                  return (
                    <Button
                      key={key}
                      size="small"
                      variant={isActive ? 'contained' : 'outlined'}
                      color={color as any}
                      onClick={() => {
                        if (!controlledFilters) {
                          setLocalFilters((prev) => ({ ...prev, estado: op as any }));
                          setPage(0);
                        }
                        // Do not call refetch immediately; allow new variables to propagate to useQuery
                        cerrarMenu();
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      {op}
                    </Button>
                  );
                })}
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Button
                  size="small"
                  onClick={() => {
                    if (!controlledFilters) {
                      setLocalFilters((prev) => ({ ...prev, estado: '' as any }));
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

      {/* Modales internos como en Rubros (opcional) */}
      {useInternalModals && (
        <>
          <ModalDetallesArticulo
            open={modalDetallesOpen}
            onClose={closeModals}
            articulo={articuloSeleccionado as any}
            accentColor={verde.primary}
            stockContext={{ label: 'Stock total' }}
          />
          <ModalEliminarArticulo
            open={modalEliminarOpen}
            onClose={closeModals}
            articulo={articuloSeleccionado as any}
            textoConfirmacion={textoConfirmEliminar}
            setTextoConfirmacion={setTextoConfirmEliminar}
            onSuccess={() => refetch()}
          />
        </>
      )}
    </>
  );
};

export default TablaArticulos;
