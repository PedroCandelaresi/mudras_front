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
  Autocomplete,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { alpha, darken } from '@mui/material/styles';
import { useQuery, useApolloClient } from '@apollo/client/react';
import {
  IconSearch, IconClipboardList, IconRefresh, IconPhone, IconMail,
  IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical,
  IconFileTypePdf, IconFileSpreadsheet
} from '@tabler/icons-react';
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';
import MudrasLoader from '@/components/ui/MudrasLoader';
import { Icon } from '@iconify/react';
import { BUSCAR_ARTICULOS, GET_ESTADISTICAS_ARTICULOS } from '@/components/articulos/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { abrevUnidad, type UnidadMedida } from '@/app/utils/unidades';
import { Paper } from '@mui/material';
import { azul, verde, verdeMilitar } from '@/ui/colores';
import ModalDetallesArticulo from '@/components/articulos/ModalDetallesArticulo';
import ModalEliminarArticulo from '@/components/articulos/ModalEliminarArticulo';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';

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
  rubroIds?: number[];
  proveedorIds?: number[];
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
const headerBg = verdeMilitar.primary; // Flat Green Header
const tableBodyBg = '#ffffff';
const tableBodyAlt = '#f8f9fa';
const colorAccionEliminar = '#b71c1c';

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
  rowsPerPageOptions = [50, 100, 150, 300, 500],
  defaultPageSize = 150,
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
    rubroIds: initialServerFilters?.rubroIds ?? [],
    proveedorIds: initialServerFilters?.proveedorIds ?? [],
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCol, setActiveCol] = useState<ColumnDef['key'] | null>(null);
  const [colInput, setColInput] = useState('');
  // const [filtrosColumna, setFiltrosColumna] = useState<ColFilters>({}); // Unused
  // const [filtroColInput, setFiltroColInput] = useState(''); // Unused

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

  const client = useApolloClient();
  const [exporting, setExporting] = useState(false);

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
    rubroIds: controlledFilters?.rubroIds ?? localFilters.rubroIds ?? undefined,
    proveedorIds: controlledFilters?.proveedorIds ?? localFilters.proveedorIds ?? undefined,
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

  // --- Fix Contexto Precios ---
  // Traemos rubros y proveedores para tener los recargos correctos si no vienen en el artículo
  const { data: rubrosData } = useQuery(GET_RUBROS, { fetchPolicy: 'cache-first' });
  const { data: proveedoresData } = useQuery(GET_PROVEEDORES, { fetchPolicy: 'cache-first' });

  const rubroMap = useMemo(() => {
    const rubros = (rubrosData as any)?.obtenerRubros || [];
    return new Map<string, { porcentajeRecargo?: number; porcentajeDescuento?: number }>(
      rubros.map((r: any) => [
        (r.nombre || '').toLowerCase(),
        {
          porcentajeRecargo: r.porcentajeRecargo,
          porcentajeDescuento: r.porcentajeDescuento,
        }
      ])
    );
  }, [rubrosData]);

  const proveedorMap = useMemo(() => {
    const provs = (proveedoresData as any)?.proveedores || [];
    return new Map<number, { porcentajeRecargo?: number; porcentajeDescuento?: number }>(
      provs.map((p: any) => [
        Number(p.IdProveedor),
        {
          porcentajeRecargo: p.PorcentajeRecargoProveedor,
          porcentajeDescuento: p.PorcentajeDescuentoProveedor,
        }
      ])
    );
  }, [proveedoresData]);

  const obtenerPrecioHydrated = useCallback((articulo: Articulo) => {
    // Intentar hidratar rubro si le falta info
    let rubroHydrated = articulo.rubro;
    if (!rubroHydrated?.PorcentajeRecargo && articulo.Rubro) {
      const match = rubroMap.get(articulo.Rubro.toLowerCase());
      if (match) {
        rubroHydrated = {
          ...rubroHydrated,
          Id: rubroHydrated?.Id || 0,
          Rubro: articulo.Rubro,
          PorcentajeRecargo: match.porcentajeRecargo,
          PorcentajeDescuento: match.porcentajeDescuento,
        };
      }
    }

    // Intentar hidratar proveedor
    let proveedorHydrated = articulo.proveedor;
    if (!proveedorHydrated?.PorcentajeRecargoProveedor && articulo.idProveedor) {
      const match = proveedorMap.get(articulo.idProveedor);
      if (match) {
        proveedorHydrated = {
          ...proveedorHydrated,
          IdProveedor: articulo.idProveedor,
          PorcentajeRecargoProveedor: match.porcentajeRecargo,
          PorcentajeDescuentoProveedor: match.porcentajeDescuento,
        };
      }
    }

    const ctx = {
      ...articulo,
      rubro: rubroHydrated,
      proveedor: proveedorHydrated,
    };
    return obtenerPrecioCalculado(ctx as Articulo);
  }, [rubroMap, proveedorMap]);
  // ----------------------------


  // ==================== Filtros Bidireccionales ====================
  // Construimos mapas para filtrar opciones disponibles
  const { rubrosDisponibles, proveedoresDisponibles } = useMemo(() => {
    const allProvs: any[] = (proveedoresData as any)?.proveedores || [];
    const allRubros: any[] = (rubrosData as any)?.obtenerRubros || [];

    // Mapas de relaciones
    const provToRubros = new Map<number, Set<number>>();
    const rubroToProvs = new Map<number, Set<number>>();

    allProvs.forEach((p) => {
      const pId = Number(p.IdProveedor);
      const pRubros = (p.proveedorRubros || []).map((pr: any) => Number(pr.rubro?.Id));

      if (p.rubroId) pRubros.push(Number(p.rubroId));

      const rubroSet = new Set<number>(pRubros);
      provToRubros.set(pId, rubroSet);

      rubroSet.forEach(rId => {
        if (!rubroToProvs.has(rId)) rubroToProvs.set(rId, new Set());
        rubroToProvs.get(rId)?.add(pId);
      });
    });

    // Filtros activos
    const activeProvIds = controlledFilters?.proveedorIds ?? localFilters.proveedorIds ?? [];
    const activeRubroIds = controlledFilters?.rubroIds ?? localFilters.rubroIds ?? [];

    // Calcular proveedores disponibles
    let filteredProvs = allProvs;
    if (activeRubroIds.length > 0) {
      // Union logic: providers that have AT LEAST ONE of the selected rubros
      const allowedProvs = new Set<number>();
      let hasAnyRubroWithProvs = false;

      activeRubroIds.forEach((rId: number) => {
        const provsForRubro = rubroToProvs.get(rId);
        if (provsForRubro) {
          hasAnyRubroWithProvs = true;
          provsForRubro.forEach(pId => allowedProvs.add(pId));
        }
      });

      // If none of the selected rubros have providers, the result should logically be empty.
      // Or if rubros exist but no providers are mapped? Empty.
      filteredProvs = allProvs.filter(p => allowedProvs.has(Number(p.IdProveedor)));
    }

    // Calcular rubros disponibles
    let filteredRubros = allRubros;
    if (activeProvIds.length > 0) {
      // Union logic: rubros offered by AT LEAST ONE of the selected providers
      const allowedRubros = new Set<number>();

      activeProvIds.forEach((pId: number) => {
        const rubrosForProv = provToRubros.get(pId);
        if (rubrosForProv) {
          rubrosForProv.forEach(rId => allowedRubros.add(rId));
        }
      });

      filteredRubros = allRubros.filter(r => allowedRubros.has(Number(r.id)));
    }

    return {
      rubrosDisponibles: filteredRubros,
      proveedoresDisponibles: filteredProvs
    };
  }, [proveedoresData, rubrosData, controlledFilters?.proveedorIds, localFilters.proveedorIds, controlledFilters?.rubroIds, localFilters.rubroIds]);

  // Alias para mantener compatibilidad si se usaba otro nombre, o para claridad
  const rubrosFiltrados = rubrosDisponibles;
  const proveedoresFiltradosLista = proveedoresDisponibles;

  // const { data: statsData } = useQuery<{ estadisticasArticulos?: { totalUnidades?: number } }>(GET_ESTADISTICAS_ARTICULOS, { fetchPolicy: 'cache-first' });

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
        rubroIds: [],
        proveedorIds: [],
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
        <Typography variant="body2" fontWeight={700} sx={{ color: '#2b4735' }}>
          {a.Descripcion || '-'}
        </Typography>
      </Box>
    ),
    imagen: (a) => (
      <Box sx={{ width: 40, height: 40, borderRadius: 0, overflow: 'hidden', border: '1px solid #ddd', bgcolor: '#fff' }}>
        {a.ImagenUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.ImagenUrl.startsWith('http') ? a.ImagenUrl : `http://localhost:4000${a.ImagenUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </>
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
          bgcolor: '#eeeeee',
          color: '#424242',
          fontWeight: 600,
          borderRadius: 0,
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
          bgcolor: alpha(verdeMilitar.primary, 0.1),
          color: verdeMilitar.primary,
          fontWeight: 600,
          height: 24,
          borderRadius: 0,
          '& .MuiChip-label': { px: 1 },
        }}
      />
    ),
    stock: (a) => {
      const total = Number(obtenerStockTotal(a).toFixed(2));
      return (
        <Typography variant="body2" fontWeight={700} color={total <= 0 ? 'error.main' : 'text.primary'}>
          {total} {abrevUnidad(a.Unidad as UnidadMedida)}
        </Typography>
      );
    },
    precio: (a) => {
      const precio = obtenerPrecioHydrated(a); // Usamos la versión hidratada
      return (
        <Typography variant="body2" fontWeight={700} color="text.primary">
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
            bgcolor: '#eeeeee',
            color: '#616161',
            fontWeight: 600,
            borderRadius: 0,
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
          sx={{ fontWeight: 600, borderRadius: 0 }}
        />
      );
    },
    acciones: (a) => (
      <Box display="flex" justifyContent="center" gap={0.5}>
        {handleView && (
          <Tooltip title="Ver detalles">
            <IconButton size="small" onClick={() => handleView(a)} sx={{ color: azul.primary, '&:hover': { bgcolor: alpha(azul.primary, 0.1) } }}>
              <IconEye size={20} />
            </IconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(a)} sx={{ color: verdeMilitar.primary, '&:hover': { bgcolor: alpha(verdeMilitar.primary, 0.1) } }}>
              <IconEdit size={20} />
            </IconButton>
          </Tooltip>
        )}
        {handleDelete && (
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={() => handleDelete(a)} sx={{ color: colorAccionEliminar, '&:hover': { bgcolor: alpha(colorAccionEliminar, 0.1) } }}>
              <IconTrash size={20} />
            </IconButton>
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

  const handleExportar = async (type: 'pdf' | 'excel') => {
    try {
      setExporting(true);
      const { data: exportData } = await client.query({
        query: BUSCAR_ARTICULOS,
        variables: {
          filtros: {
            ...variablesQuery.filtros,
            limite: 100000,
            pagina: 0,
          }
        },
        fetchPolicy: 'network-only',
      });

      const articulosExport = (exportData as any)?.buscarArticulos?.articulos || [];
      const articulosHydrated = articulosExport.map((a: any) => {
        // Logica simplificada de hidratacion para export
        // Reutilizamos la misma logica del hook obtenerPrecioHydrated pero aqui manual
        // para asegurarnos de que el export tenga el precio calculado

        let rubroHydrated = a.rubro;
        if (!rubroHydrated?.PorcentajeRecargo && a.Rubro) {
          const match = rubroMap.get(a.Rubro.toLowerCase());
          if (match) {
            rubroHydrated = {
              ...rubroHydrated,
              Id: rubroHydrated?.Id || 0,
              Rubro: a.Rubro,
              PorcentajeRecargo: match.porcentajeRecargo,
              PorcentajeDescuento: match.porcentajeDescuento,
            };
          }
        }

        let proveedorHydrated = a.proveedor;
        if (!proveedorHydrated?.PorcentajeRecargoProveedor && a.idProveedor) {
          const match = proveedorMap.get(a.idProveedor);
          if (match) {
            proveedorHydrated = {
              ...proveedorHydrated,
              IdProveedor: a.idProveedor,
              PorcentajeRecargoProveedor: match.porcentajeRecargo,
              PorcentajeDescuentoProveedor: match.porcentajeDescuento,
            };
          }
        }

        const ctx: Articulo = {
          ...a,
          rubro: rubroHydrated,
          proveedor: proveedorHydrated,
        };
        const precioFinal = obtenerPrecioCalculado(ctx);

        return {
          ...ctx,
          PrecioVentaCalculado: precioFinal
        };
      });

      const columns: ExportColumn<any>[] = [
        { header: 'Descripción', key: 'Descripcion', width: 40 },
        { header: 'Código', key: 'Codigo', width: 15 },
        { header: 'Marca', key: 'Marca', width: 20 },
        { header: 'Rubro', key: (item) => item.Rubro || item.rubro?.Rubro || '', width: 15 },
        { header: 'Proveedor', key: (item) => item.proveedor?.Nombre || '', width: 25 },
        { header: 'Precio Venta', key: (item) => `$${Number(item.PrecioVentaCalculado).toLocaleString('es-AR')}`, width: 15 },
        { header: 'Stock Global', key: (item) => item.totalStock || item.Stock || 0, width: 10 },
      ];

      const timestamp = new Date().toISOString().split('T')[0];

      // Build filter summary
      const filterParts: string[] = [];
      const f = variablesQuery.filtros;
      if (f.busqueda) filterParts.push(`Búsqueda: "${f.busqueda}"`);
      if (f.rubro) filterParts.push(`Rubro: ${f.rubro}`);
      if (f.rubroId) {
        // Try to find rubro name if only ID is present, though usually 'rubro' string is also set or we can infer it
        const rName = (rubrosData as any)?.obtenerRubros?.find((r: any) => Number(r.id) === f.rubroId)?.nombre;
        if (rName) filterParts.push(`Rubro: ${rName}`);
      }
      if (f.proveedorId) {
        const pName = (proveedoresData as any)?.proveedores?.find((p: any) => Number(p.IdProveedor) === f.proveedorId)?.Nombre;
        filterParts.push(`Proveedor: ${pName || f.proveedorId}`);
      }
      if (f.rubroIds && f.rubroIds.length > 0) {
        const rNames = (rubrosData as any)?.obtenerRubros?.filter((r: any) => f.rubroIds?.includes(Number(r.id))).map((r: any) => r.nombre).join(', ');
        if (rNames) filterParts.push(`Rubros: ${rNames}`);
      }
      if (f.proveedorIds && f.proveedorIds.length > 0) {
        const pNames = (proveedoresData as any)?.proveedores?.filter((p: any) => f.proveedorIds?.includes(Number(p.IdProveedor))).map((p: any) => p.Nombre).join(', ');
        if (pNames) filterParts.push(`Proveedores: ${pNames}`);
      }
      if (f.soloConStock) filterParts.push('Estado: Con Stock');
      if (f.soloStockBajo) filterParts.push('Estado: Poco Stock');
      if (f.soloSinStock) filterParts.push('Estado: Sin Stock');

      const filterSummary = filterParts.join(' | ');

      if (type === 'excel') {
        exportToExcel(articulosHydrated, columns, `Articulos_Mudras_${timestamp}`, filterSummary);
      } else {
        exportToPdf(articulosHydrated, columns, `Articulos_Mudras_${timestamp}`, 'Listado de Artículos', filterSummary);
      }

    } catch (error) {
      console.error('Error exportando:', error);
    } finally {
      setExporting(false);
    }
  };



  /* ---------- Toolbar ---------- */
  const toolbar = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mb: 3,
        p: 2,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {/* --- Fila 1: Nuevo Artículo + Búsqueda + Limpiar --- */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        {/* Left: Nuevo Artículo */}
        <Box>
          {allowCreate && (
            <Button
              variant="contained"
              startIcon={<IconPlus size={18} />}
              onClick={onCreateClick}
              disableElevation
              sx={{
                borderRadius: 1, // Slightly rounded for "site aesthetic" if needed, or 0 if strict
                textTransform: 'none',
                bgcolor: verdeMilitar.primary,
                fontWeight: 600,
                px: 3,
                py: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': { bgcolor: verdeMilitar.primaryHover }
              }}
            >
              {`Nuevo artículo`}
            </Button>
          )}
        </Box>

        {/* Right: Search + Limpiar */}
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Buscar descripción, código o proveedor…"
            size="small"
            value={globalSearchDraft}
            onChange={(e) => setGlobalSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') ejecutarBusqueda();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} color="#757575" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 350,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: '#f9f9f9',
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': { borderColor: '#bdbdbd' },
                '&.Mui-focused fieldset': { borderColor: verdeMilitar.primary },
              }
            }}
          />

          <Button
            variant="outlined"
            startIcon={<IconRefresh size={18} />}
            onClick={limpiarFiltros}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              color: '#757575',
              borderColor: '#e0e0e0',
              height: 40,
              px: 2,
              '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
            }}
          >
            Limpiar
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* --- Fila 2: Exportación + Combos --- */}
      {/* --- Fila 2: Exportación + Combos --- */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="nowrap" gap={2}>
        {/* Left: Export Buttons */}
        <Box display="flex" gap={2} mt={0.5}>
          <Button
            variant="outlined"
            startIcon={<IconFileSpreadsheet size={18} />}
            onClick={() => handleExportar('excel')}
            sx={{ borderRadius: 0, textTransform: 'none', color: '#1D6F42', borderColor: '#1D6F42' }}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<IconFileTypePdf size={18} />}
            onClick={() => handleExportar('pdf')}
            sx={{ borderRadius: 0, textTransform: 'none', color: '#B71C1C', borderColor: '#B71C1C' }}
          >
            PDF
          </Button>
        </Box>

        {/* Right: Combos (Proveedor -> Rubro) */}
        <Box display="flex" alignItems="flex-start" gap={2} flexWrap="nowrap" sx={{ flexGrow: 1 }}>
          {/* --- Proveedores --- */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            id="checkboxes-proveedores"
            options={proveedoresFiltradosLista}
            getOptionLabel={(option: any) => option.Nombre || ''}
            value={proveedoresFiltradosLista.filter((p: any) => {
              const currentIds = controlledFilters?.proveedorIds ?? localFilters.proveedorIds ?? [];
              return currentIds.includes(Number(p.IdProveedor));
            })}
            onChange={(_, newValue) => {
              const newIds = newValue.map((v: any) => Number(v.IdProveedor));
              if (controlledFilters) {
                onFiltersChange?.({ ...filtrosServidor, proveedorIds: newIds, pagina: 0 });
              } else {
                setLocalFilters(prev => ({ ...prev, proveedorIds: newIds }));
                setPage(0);
              }
            }}
            renderOption={(props, option: any, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.Nombre}
              </li>
            )}
            fullWidth
            sx={{ flexBasis: '50%', flexGrow: 1 }}
            renderInput={(params) => <TextField {...params} label="Proveedores" size="small" placeholder="Seleccionar..." sx={{ bgcolor: 'white' }} />}
          />

          {/* --- Rubros --- */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            id="checkboxes-rubros"
            options={rubrosFiltrados}
            getOptionLabel={(option: any) => option.nombre || option.Rubro || ''}
            value={rubrosFiltrados.filter((r: any) => {
              const currentIds = controlledFilters?.rubroIds ?? localFilters.rubroIds ?? [];
              return currentIds.includes(Number(r.id));
            })}
            onChange={(_, newValue) => {
              const newIds = newValue.map((v: any) => Number(v.id));
              if (controlledFilters) {
                onFiltersChange?.({ ...filtrosServidor, rubroIds: newIds, pagina: 0 });
              } else {
                setLocalFilters(prev => ({ ...prev, rubroIds: newIds }));
                setPage(0);
              }
            }}
            renderOption={(props, option: any, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.nombre || option.Rubro}
              </li>
            )}
            fullWidth
            sx={{ flexBasis: '50%', flexGrow: 1 }}
            renderInput={(params) => <TextField {...params} label="Rubros" size="small" placeholder="Seleccionar..." sx={{ bgcolor: 'white' }} />}
          />
        </Box>
      </Box>
    </Box>
  );

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
        size={dense ? 'small' : 'medium'}
        sx={{
          minWidth: 700,
          '& .MuiTableRow-root': {
            minHeight: 56,
            transition: 'background-color 0.2s',
          },
          '& .MuiTableCell-root': {
            fontSize: '0.85rem',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #f0f0f0',
            color: '#37474f',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
            bgcolor: verdeMilitar.tableStriped,
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover': {
            bgcolor: alpha(verdeMilitar.primary, 0.12),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: verdeMilitar.tableHeader,
            color: '#ffffff',
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: verdeMilitar.tableHeader, color: '#ffffff', fontWeight: 600, letterSpacing: 0.5, borderRadius: 0 } }}>
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
                          sx={{ color: 'inherit' }}
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
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 10 }}>
                <MudrasLoader size={80} text="Cargando artículos..." />
              </TableCell>
            </TableRow>
          ) : articulos.length === 0 ? (
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
          {rowsPerPageOptions.map((option) => (
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
            <Box key={`ellipsis-${idx}`} sx={{ px: 1, color: 'text.secondary' }}>...</Box>
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
                bgcolor: Number(num) === paginaActual ? verde.primary : 'transparent',
                color: Number(num) === paginaActual ? '#fff' : 'text.primary',
                '&:hover': {
                  borderColor: verde.primary,
                  bgcolor: Number(num) === paginaActual ? verde.primaryHover : alpha(verde.primary, 0.05)
                }
              }}
              onClick={() => handleChangePage(null as unknown as Event, Number(num) - 1)}
              disabled={num === paginaActual}
            >
              {num}
            </Button>
          )
        )}
      </Stack>
    </Box>
  );





  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 0, border: '1px solid #e0e0e0' }}>
        {showToolbar && toolbar}
        <Typography color="error" variant="h6" mb={1} fontWeight={700}>
          Error al cargar artículos
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {error.message}
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconRefresh />}
          onClick={() => refetch()}
          sx={{ borderRadius: 0, bgcolor: azul.primary, textTransform: 'none' }}
        >
          Reintentar
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {showToolbar && toolbar}



        {tabla}
        {paginador}
      </Box>

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
      {
        useInternalModals && (
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
        )
      }
    </>
  );
};

export default TablaArticulos;
