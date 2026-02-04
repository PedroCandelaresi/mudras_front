// /src/components/proveedores/ModalDetallesProveedor.tsx
'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
  Paper,
  Button,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback, type ComponentProps } from 'react';
import { Icon } from '@iconify/react';
import { IconFileTypePdf, IconFileSpreadsheet } from '@tabler/icons-react';
import { azul, verde, marron as marronPalette } from '@/ui/colores';
import { TablaArticulos } from '@/components/articulos';
import { useQuery, useApolloClient } from '@apollo/client/react';
import { GET_PROVEEDOR, RUBROS_POR_PROVEEDOR } from '@/components/proveedores/graphql/queries';
import { BUSCAR_ARTICULOS } from '@/components/articulos/graphql/queries';
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';
import type { Articulo } from '@/app/interfaces/mudras.types';
import type {
  ProveedorResponse,
  Proveedor,
  RubrosPorProveedorListResponse,
} from '@/interfaces/proveedores';

interface ModalDetallesProveedorProps {
  open: boolean;
  onClose: () => void;
  proveedor: Proveedor | null;
  /** Podés pasar un color para acentuar (hex/rgb/hsl). */
  accentColor?: string;
}

/* ======================== Utils ======================== */
const PAGINAS_OPCIONES = [50, 100, 150, 300, 500];
type ColumnasTablaArticulos = ComponentProps<typeof TablaArticulos>['columns'];
type FiltrosTablaControlados = NonNullable<ComponentProps<typeof TablaArticulos>['controlledFilters']>;
type TablaArticulosOnDataLoaded = NonNullable<ComponentProps<typeof TablaArticulos>['onDataLoaded']>;
type TablaArticulosDataPayload = Parameters<TablaArticulosOnDataLoaded>[0];

type EstadoTabla = {
  total: number;
  loading: boolean;
  error?: Error;
};

const NBSP = '\u00A0';
const formatCount = (n: number, singular: string, plural?: string) =>
  `${n.toLocaleString('es-AR')}${NBSP}${n === 1 ? singular : (plural ?? `${singular}s`)}`;

const formatPercentage = (value?: number) => {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
  const formatter = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${formatter.format(numeric)}%`;
};

/* ======================== Layout ======================== */
const VH_MAX = 78;
const HEADER_H = 88;
const FOOTER_H = 96;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

/* ======================== Paleta ======================== */
const makeColors = (base?: string) => {
  const primary = base || azul.primary; // Default to Blue
  const secondary = azul.headerBorder || '#546e7a';
  return {
    primary,
    secondary,
    primaryHover: darken(primary, 0.1),
    textStrong: darken(primary, 0.35),
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
    background: '#f8f9fa',
    paper: '#ffffff',
    chipBorder: '#bdc3c7'
  };
};

const TIPO_IVA_OPTIONS = [
  { value: '1', label: 'Responsable Inscripto' },
  { value: '2', label: 'Monotributo' },
  { value: '3', label: 'Exento' },
  { value: '4', label: 'Consumidor Final' },
  { value: '5', label: 'Responsable No Inscripto' },
] as const;

// Helper component for ReadOnly Fields
const ReadOnlyField = ({ label, value }: { label: string, value: string | number | undefined | null }) => (
  <TextField
    label={label}
    value={value ?? ''}
    fullWidth
    variant="outlined"
    InputProps={{ readOnly: true }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 0, // Sharp corners
        backgroundColor: '#fff',
        '& fieldset': { borderColor: '#e0e0e0' },
      },
      '& .MuiInputLabel-root': { color: '#546e7a' }
    }}
  />
);

const ModalDetallesProveedor = ({ open, onClose, proveedor, accentColor }: ModalDetallesProveedorProps) => {
  const COLORS = useMemo(() => makeColors(accentColor || azul.primary), [accentColor]);

  // Estado de filtros/paginación (igual al patrón de ModalDetallesRubro)
  const [filtroInput, setFiltroInput] = useState('');
  const [busquedaPersonalizada, setBusquedaPersonalizada] = useState('');
  const [paginacion, setPaginacion] = useState({ pagina: 0, limite: 150 });
  const { pagina, limite } = paginacion;
  const [estadoTabla, setEstadoTabla] = useState<EstadoTabla>({ total: 0, loading: false, error: undefined });
  const [reloadKey, setReloadKey] = useState(0);

  const proveedorId = useMemo(() => {
    if (proveedor?.IdProveedor == null) return null;
    const parsed = Number(proveedor.IdProveedor);
    return Number.isFinite(parsed) ? parsed : null;
  }, [proveedor?.IdProveedor]);

  // Datos del proveedor (detalle completo)
  const { data: proveedorData } = useQuery<ProveedorResponse>(GET_PROVEEDOR, {
    variables: { id: proveedorId ?? undefined },
    skip: !open || !proveedorId,
    fetchPolicy: 'cache-and-network',
  });

  const proveedorCompleto: Proveedor | null = useMemo(
    () => (proveedorData?.proveedor as any) || proveedor || null,
    [proveedorData?.proveedor, proveedor]
  );

  const [rubroFiltro, setRubroFiltro] = useState<{ id: number | null; nombre: string | null } | null>(null);
  const [filtroStock, setFiltroStock] = useState<string>('todos'); // 'todos', 'con_stock', 'bajo_stock', 'sin_stock'
  const [exporting, setExporting] = useState(false);
  const client = useApolloClient();

  const { data: rubrosData, loading: loadingRubros, error: errorRubros } =
    useQuery<RubrosPorProveedorListResponse>(RUBROS_POR_PROVEEDOR, {
      variables: { proveedorId: proveedorId != null ? String(proveedorId) : '0' },
      skip: !open || proveedorId == null,
      fetchPolicy: 'cache-and-network',
    });

  const rubrosRelacionados = useMemo(() => {
    // Use rubros directly from the provider object instead of a separate query
    const rubros = proveedorCompleto?.rubros || [];
    return rubros.map((r: any) => ({
      nombre: r.Rubro || r.nombre || 'Sin nombre',
      cantidad: null, // We don't have article count in this view, simpler display
      rubroId: r.Id || r.id
    }));
  }, [proveedorCompleto?.rubros]);

  const cantidadRubros = rubrosRelacionados.length;
  const rubrosTooltipTitle = loadingRubros
    ? 'Cargando rubros asociados…'
    : errorRubros
      ? 'No pudimos obtener los rubros asociados.'
      : cantidadRubros > 0
        ? rubrosRelacionados
          .map(({ nombre, cantidad }) =>
            cantidad != null ? `• ${nombre} (${cantidad} artículos)` : `• ${nombre}`,
          )
          .join('\n')
        : 'Este proveedor aún no está asociado a rubros.';

  const rubroFiltroId = rubroFiltro?.id ?? null;
  const rubroFiltroNombre = rubroFiltro?.nombre ?? null;

  const totalArticulosProveedor = useMemo(() => {
    const relaciones = rubrosData?.rubrosPorProveedor ?? [];
    const sum = relaciones.reduce((acc, item) => {
      const cantidad = item.cantidadArticulos != null ? Number(item.cantidadArticulos) : 0;
      return acc + (Number.isFinite(cantidad) ? cantidad : 0);
    }, 0);
    if (sum > 0) return sum;
    if (Array.isArray(proveedorCompleto?.articulos)) {
      return proveedorCompleto.articulos.length;
    }
    return estadoTabla.total;
  }, [rubrosData?.rubrosPorProveedor, proveedorCompleto?.articulos, estadoTabla.total]);

  const porcentajeRecargoProveedor = Number(proveedorCompleto?.PorcentajeRecargoProveedor ?? 0);
  const porcentajeDescuentoProveedor = Number(proveedorCompleto?.PorcentajeDescuentoProveedor ?? 0);
  const tieneRecargo = Math.abs(porcentajeRecargoProveedor) > 0.0001;
  const tieneDescuento = Math.abs(porcentajeDescuentoProveedor) > 0.0001;
  const recargoTooltipTitle = tieneRecargo
    ? `Aplicado sobre el precio base de artículos: ${formatPercentage(porcentajeRecargoProveedor)}`
    : 'Configurá un recargo personalizado para este proveedor.';
  const descuentoTooltipTitle = tieneDescuento
    ? `Se descuenta tras aplicar el recargo: ${formatPercentage(porcentajeDescuentoProveedor)}`
    : 'Podés definir un descuento en el precio final de los articulos de este proveedor.';

  const contactoTooltipTitle = (() => {
    const detalles: string[] = [];
    if (proveedorCompleto?.Mail) detalles.push(`Email: ${proveedorCompleto.Mail}`);
    if (proveedorCompleto?.Telefono || proveedorCompleto?.Celular) {
      const tel = [proveedorCompleto.Telefono, proveedorCompleto.Celular].filter(Boolean).join(' / ');
      detalles.push(`Teléfono: ${tel}`);
    }
    const localidad = [proveedorCompleto?.Localidad, proveedorCompleto?.Provincia].filter(Boolean).join(', ');
    const direccion = [proveedorCompleto?.Direccion, localidad].filter(Boolean).join(' · ');
    if (direccion) detalles.push(`Dirección: ${direccion}${proveedorCompleto?.CP ? ` (CP ${proveedorCompleto.CP})` : ''}`);
    return detalles.length ? detalles.join('\n') : 'Sin datos de contacto adicionales.';
  })();

  const renderTooltip = useCallback(
    (text: string) => (
      <Box sx={{ whiteSpace: 'pre-line', lineHeight: 1.4, maxWidth: 280 }}>
        {text}
      </Box>
    ),
    [],
  );

  const totalArticulos = estadoTabla.total;
  const loadingArticulos = estadoTabla.loading;
  const errorArticulos = estadoTabla.error;

  // columnas para la TablaArticulos (mismas claves que en rubro)
  const columnasTabla = useMemo<ColumnasTablaArticulos>(() => ([
    { key: 'codigo', header: 'Código', width: '18%' },
    { key: 'descripcion', header: 'Descripción', width: '36%' },
    { key: 'stock', header: 'Stock', width: '14%' },
    { key: 'precio', header: 'Precio', width: '14%' },
    { key: 'rubro', header: 'Rubro', width: '18%' },
  ] as ColumnasTablaArticulos), []);

  // Filtros controlados para la TablaArticulos
  const filtrosControlados = useMemo<FiltrosTablaControlados>(() => {
    const base: FiltrosTablaControlados = { pagina, limite };
    if (typeof proveedorId === 'number') base.proveedorId = proveedorId;
    if (busquedaPersonalizada) base.busqueda = busquedaPersonalizada;
    if (rubroFiltro?.id != null) {
      base.rubroId = rubroFiltro.id;
    } else if (rubroFiltro?.nombre) {
      base.rubro = rubroFiltro.nombre;
    }

    if (filtroStock === 'con_stock') base.estado = 'Con stock';
    if (filtroStock === 'bajo_stock') base.estado = 'Bajo stock';
    if (filtroStock === 'sin_stock') base.estado = 'Sin stock';

    return base;
  }, [pagina, limite, proveedorId, busquedaPersonalizada, rubroFiltro, filtroStock]);

  // Hooks para sincronizar resets al abrir/cambiar proveedor
  useEffect(() => {
    if (!open) return;
    setPaginacion({ pagina: 0, limite: PAGINAS_OPCIONES[0] });
    setBusquedaPersonalizada('');
    setFiltroInput('');
    setEstadoTabla({ total: 0, loading: false, error: undefined });
    setRubroFiltro(null);
  }, [open, proveedorId]);

  // Si cambia el proveedor, recargar tabla
  useEffect(() => {
    if (!open || proveedorId == null) return;
    setPaginacion((prev) => ({ pagina: 0, limite: prev.limite }));
    setReloadKey((prev) => prev + 1);
  }, [open, proveedorId, rubroFiltro]);

  const handleTablaFiltersChange = useCallback((filtros: FiltrosTablaControlados) => {
    setPaginacion((prev) => {
      const next = {
        pagina: filtros.pagina ?? prev.pagina,
        limite: filtros.limite ?? prev.limite,
      };
      return (next.pagina === prev.pagina && next.limite === prev.limite) ? prev : next;
    });
    if ('busqueda' in filtros) {
      const nextSearch = (filtros.busqueda ?? '').trim();
      setBusquedaPersonalizada((prev) => (prev === nextSearch ? prev : nextSearch));
      setFiltroInput((prev) => (prev === nextSearch ? prev : nextSearch));
    }
  }, []);

  const handleTablaDataLoaded = useCallback((payload: TablaArticulosDataPayload) => {
    setEstadoTabla((prev) => {
      const next: EstadoTabla = {
        total: payload?.total ?? 0,
        loading: payload?.loading ?? false,
        error: payload?.error,
      };
      const sameError = (prev.error?.message ?? '') === (next.error?.message ?? '');
      if (prev.total === next.total && prev.loading === next.loading && sameError) return prev;
      return next;
    });
  }, []);

  const handleSeleccionarRubro = useCallback(
    (entrada?: { rubroId: number | null; nombre: string | null }) => {
      setRubroFiltro((prev) => {
        if (!entrada) return null;
        const next = { id: entrada.rubroId ?? null, nombre: entrada.nombre ?? null };
        const same = prev?.id === next.id && prev?.nombre === next.nombre;
        return same ? null : next;
      });
      setPaginacion((prev) => ({ pagina: 0, limite: prev.limite }));
      setReloadKey((prev) => prev + 1);
    },
    [],
  );

  const handleExportar = async (type: 'pdf' | 'excel') => {
    if (!proveedorCompleto) return;
    try {
      setExporting(true);

      const variables = {
        filtros: {
          ...filtrosControlados,
          estado: undefined, // Remove string state from query vars
          soloConStock: filtroStock === 'con_stock' ? true : undefined,
          soloStockBajo: filtroStock === 'bajo_stock' ? true : undefined,
          soloSinStock: filtroStock === 'sin_stock' ? true : undefined,
          limite: 100000,
          pagina: 0,
        }
      };

      const { data: exportData } = await client.query({
        query: BUSCAR_ARTICULOS,
        variables,
        fetchPolicy: 'network-only',
      });

      const articulosExport = (exportData as any)?.buscarArticulos?.articulos || [];

      // lógica simplificada para hidratar precios en exportación (asumiendo que los datos del proveedor ya están cargados)
      const articulosHydrated = articulosExport.map((a: any) => {
        const ctx: Articulo = {
          ...a,
          proveedor: a.proveedor ? a.proveedor : {
            IdProveedor: proveedorCompleto.IdProveedor,
            PorcentajeRecargoProveedor: proveedorCompleto.PorcentajeRecargoProveedor,
            PorcentajeDescuentoProveedor: proveedorCompleto.PorcentajeDescuentoProveedor,
            Nombre: proveedorCompleto.Nombre
          },
          rubro: a.rubro ? a.rubro : (a.Rubro ? { Rubro: a.Rubro } : undefined)
        };
        // Nota: si el rubro no viene completo y no tenemos forma facil de buscarlo aqui sin el mapa global,
        // el precio podria variar si depende del recargo del rubro. 
        // Sin embargo, en contexto proveedor, el recargo proveedor suele ser el dominante, o el usuario acepta la aprox.
        const precioFinal = calcularPrecioDesdeArticulo(ctx) || Number(a.PrecioVenta ?? 0);

        return {
          ...ctx,
          PrecioVentaCalculado: precioFinal,
          StockTotal: (a.totalStock !== undefined) ? a.totalStock : (a.Stock || 0)
        };
      });


      const columns: ExportColumn<any>[] = [
        { header: 'Código', key: 'Codigo', width: 15 },
        { header: 'Descripción', key: 'Descripcion', width: 40 },
        { header: 'Rubro', key: (item) => item.Rubro || item.rubro?.Rubro || '', width: 20 },
        { header: 'Stock', key: 'StockTotal', width: 10 },
        { header: 'Precio', key: (item) => `$${Number(item.PrecioVentaCalculado).toLocaleString('es-AR')}`, width: 15 },
      ];

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${proveedorCompleto.Nombre?.replace(/\s+/g, '_')}_Articulos_${timestamp}`;

      if (type === 'excel') {
        exportToExcel(articulosHydrated, columns, filename);
      } else {
        exportToPdf(articulosHydrated, columns, filename, `Artículos de ${proveedorCompleto.Nombre}`);
      }

    } catch (error) {
      console.error('Error exportando:', error);
    } finally {
      setExporting(false);
    }
  };

  const onCerrar = () => {
    setFiltroInput('');
    setBusquedaPersonalizada('');
    setPaginacion({ pagina: 0, limite: PAGINAS_OPCIONES[0] });
    onClose();
  };

  if (!proveedorCompleto) return null;

  const headerTitle = `${proveedorCompleto?.Codigo ? `${proveedorCompleto.Codigo} - ` : ''}${proveedorCompleto?.Nombre ?? 'Detalle del Proveedor'}`;

  return (
    <Dialog
      open={open}
      onClose={onCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 4,
        sx: {
          borderRadius: 0, // Strict square aesthetic
          bgcolor: '#ffffff',
          maxHeight: `${VH_MAX}vh`,
        },
        square: true,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: `${VH_MAX}vh` }}>
        {/* Header */}
        <Box sx={{
          bgcolor: COLORS.primary,
          color: '#ffffff',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `4px solid ${COLORS.secondary}`,
          borderRadius: 0,
          flexShrink: 0,
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon icon="mdi:card-account-details-outline" width={24} height={24} />
            <Box>
              <Typography variant="h6" fontWeight={600} letterSpacing={0.5}>
                {headerTitle.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onCerrar} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <Icon icon="mdi:close" width={24} />
          </IconButton>
        </Box>

        <DialogContent
          dividers
          sx={{
            p: 4,
            bgcolor: '#f8f9fa',
            borderTop: 0,
            borderBottom: 0,
          }}
        >
          <Box display="flex" flexDirection="column" gap={3}>

            {/* General Info */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Datos Generales
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: 'white' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: '25%' }}>
                    <ReadOnlyField label="Código" value={proveedorCompleto?.Codigo} />
                  </Box>
                  <Box width={{ xs: '100%', md: '70%', flexGrow: 1 }}>
                    <ReadOnlyField label="Razón Social / Nombre" value={proveedorCompleto?.Nombre} />
                  </Box>
                  <Box width={{ xs: '100%', md: '100%' }}>
                    <ReadOnlyField label="Persona de Contacto" value={proveedorCompleto?.Contacto} />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Contact Info */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Información de Contacto
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: 'white' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="Teléfono" value={proveedorCompleto?.Telefono} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="Celular" value={proveedorCompleto?.Celular} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="Email" value={proveedorCompleto?.Mail} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="Sitio Web" value={proveedorCompleto?.Web} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="Fax" value={proveedorCompleto?.Fax} />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Location */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Ubicación
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: 'white' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width="100%">
                    <ReadOnlyField label="Dirección" value={proveedorCompleto?.Direccion} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33% - 11px)' }}>
                    <ReadOnlyField label="Localidad" value={proveedorCompleto?.Localidad} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33% - 11px)' }}>
                    <ReadOnlyField label="Provincia" value={proveedorCompleto?.Provincia} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33% - 11px)' }}>
                    <ReadOnlyField label="Código Postal" value={proveedorCompleto?.CP} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="País" value={proveedorCompleto?.Pais} />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Fiscal Data */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Datos Fiscales
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: 'white' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="CUIT" value={proveedorCompleto?.CUIT} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField
                      label="Tipo IVA"
                      value={TIPO_IVA_OPTIONS.find(o => o.value === proveedorCompleto?.TipoIva?.toString())?.label || proveedorCompleto?.TipoIva}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Commercial & Rubros */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Comercial y Rubros
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: 'white' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="Recargo Proveedor (%)" value={proveedorCompleto?.PorcentajeRecargoProveedor} />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <ReadOnlyField label="Descuento Proveedor (%)" value={proveedorCompleto?.PorcentajeDescuentoProveedor} />
                  </Box>
                  <Box width="100%">
                    <ReadOnlyField label="Observaciones" value={proveedorCompleto?.Observaciones} />
                  </Box>

                  <Box width="100%" mt={1}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#546e7a', fontWeight: 600 }}>
                      Rubros Asociados
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {rubrosRelacionados.length > 0 ? (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {rubrosRelacionados.map(({ nombre, cantidad }) => (
                          <Chip
                            key={nombre}
                            label={`${nombre} (${cantidad || 0})`}
                            variant="outlined"
                            sx={{ borderRadius: 0, borderColor: COLORS.inputBorder, color: COLORS.textStrong, fontWeight: 500 }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No hay rubros asociados.</Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Articles Table */}
            <Box>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 0, // Sharp corners
                  background: '#fff',
                  px: 3,
                  py: 2.25,
                  mb: 2.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Typography variant="h6" fontWeight={700} color={COLORS.textStrong}>
                  Artículos del proveedor
                </Typography>
                <TextField
                  placeholder="Buscar artículos…"
                  value={filtroInput}
                  onChange={(e) => setFiltroInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const termino = filtroInput.trim();
                      setBusquedaPersonalizada(termino);
                      setPaginacion((prev) => (prev.pagina === 0 ? prev : { ...prev, pagina: 0 }));
                    }
                  }}
                  size="small"
                  sx={{ minWidth: { xs: '100%', sm: 240, md: 280 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="mdi:magnify" color={COLORS.primary} />
                      </InputAdornment>
                    ),
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0, // Sharp corners
                        backgroundColor: '#fff',
                        '& fieldset': { borderColor: '#e0e0e0' },
                        '&:hover fieldset': { borderColor: '#bdc3c7' },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                      },
                    },
                  }}
                />
              </Box>

              {/* Toolbar Actions: Stock Filters & Exports */}
              <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
                <Box display="flex" gap={1}>
                  {[
                    { label: 'Todos', value: 'todos', color: COLORS.secondary },
                    { label: 'Con Stock', value: 'con_stock', color: '#2e7d32' }, // Green
                    { label: 'Poco Stock', value: 'bajo_stock', color: '#ed6c02' }, // Orange
                    { label: 'Sin Stock', value: 'sin_stock', color: '#d32f2f' }, // Red
                  ].map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      onClick={() => {
                        setFiltroStock(opt.value);
                        setPaginacion(prev => ({ ...prev, pagina: 0 }));
                      }}
                      variant={filtroStock === opt.value ? 'filled' : 'outlined'}
                      sx={{
                        borderRadius: 0,
                        fontWeight: 600,
                        cursor: 'pointer',
                        bgcolor: filtroStock === opt.value ? opt.color : 'transparent',
                        color: filtroStock === opt.value ? '#fff' : opt.color,
                        borderColor: opt.color,
                        '&:hover': {
                          bgcolor: filtroStock === opt.value ? darken(opt.color, 0.1) : alpha(opt.color, 0.1)
                        }
                      }}
                    />
                  ))}
                </Box>

                <Box flexGrow={1} />

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconFileSpreadsheet size={18} />}
                    onClick={() => handleExportar('excel')}
                    disabled={exporting}
                    sx={{ borderRadius: 0, textTransform: 'none', color: '#1D6F42', borderColor: '#1D6F42', '&:hover': { bgcolor: alpha('#1D6F42', 0.1), borderColor: '#1D6F42' } }}
                  >
                    Excel
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconFileTypePdf size={18} />}
                    onClick={() => handleExportar('pdf')}
                    disabled={exporting}
                    sx={{ borderRadius: 0, textTransform: 'none', color: '#D32F2F', borderColor: '#D32F2F', '&:hover': { bgcolor: alpha('#D32F2F', 0.1), borderColor: '#D32F2F' } }}
                  >
                    PDF
                  </Button>
                </Box>
              </Box>

              <Box mt={2}>
                <TablaArticulos
                  key={`${proveedorId ?? 'prov'}-${rubroFiltro?.id ?? rubroFiltro?.nombre ?? 'all'}-${reloadKey}`}
                  columns={columnasTabla}
                  showToolbar={false}
                  allowCreate={false}
                  rowsPerPageOptions={PAGINAS_OPCIONES}
                  defaultPageSize={limite}
                  controlledFilters={filtrosControlados}
                  onFiltersChange={handleTablaFiltersChange}
                  onDataLoaded={handleTablaDataLoaded}
                  dense
                />
                {errorArticulos && (
                  <Typography variant="body2" color="error" mt={1}>
                    Error al cargar artículos: {errorArticulos.message}
                  </Typography>
                )}
                {loadingArticulos && (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Cargando artículos…
                  </Typography>
                )}
              </Box>
            </Box>

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#f1f2f6', borderTop: '1px solid #e0e0e0', gap: 2, borderRadius: 0 }}>
          <Button
            onClick={onCerrar}
            variant="contained"
            disableElevation
            sx={{
              flex: 1,
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: COLORS.primaryHover },
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 0 // Sharp corners
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ModalDetallesProveedor;
