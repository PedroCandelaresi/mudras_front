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
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback, type ComponentProps } from 'react';
import { Icon } from '@iconify/react';
import { azul, verde, marron as marronPalette } from '@/ui/colores';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { TablaArticulos } from '@/components/articulos';
import { useQuery } from '@apollo/client/react';
import { GET_PROVEEDOR, RUBROS_POR_PROVEEDOR } from '@/components/proveedores/graphql/queries';
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
const PAGINAS_OPCIONES = [20, 50, 100];
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

const currency = (v?: number) =>
  (v ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const formatPercentage = (value?: number) => {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
  const formatter = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${formatter.format(numeric)}%`;
};

/* ======================== Layout ======================== */
const VH_MAX = 85;
const HEADER_H = 88;
const FOOTER_H = 88;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

/* ======================== Paleta ======================== */
const makeColors = (base?: string) => {
  const primary = base || azul.primary;
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.5),
    chipBorder: 'rgba(255,255,255,0.35)',
  };
};

const ModalDetallesProveedor = ({ open, onClose, proveedor, accentColor }: ModalDetallesProveedorProps) => {
  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);

  // Estado de filtros/paginación (igual al patrón de ModalDetallesRubro)
  const [filtroInput, setFiltroInput] = useState('');
  const [busquedaPersonalizada, setBusquedaPersonalizada] = useState('');
  const [paginacion, setPaginacion] = useState({ pagina: 0, limite: PAGINAS_OPCIONES[0] });
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

  const { data: rubrosData, loading: loadingRubros, error: errorRubros } =
    useQuery<RubrosPorProveedorListResponse>(RUBROS_POR_PROVEEDOR, {
      variables: { proveedorId: proveedorId != null ? String(proveedorId) : '0' },
      skip: !open || proveedorId == null,
      fetchPolicy: 'cache-and-network',
    });

  const rubrosRelacionados = useMemo(() => {
    const mapa = new Map<string, { cantidad: number | null; rubroId: number | null }>();
    (rubrosData?.rubrosPorProveedor ?? []).forEach((item) => {
      const nombre = (item.rubroNombre ?? '').trim() || 'Sin rubro';
      const cantidad = item.cantidadArticulos != null ? Number(item.cantidadArticulos) : null;
      const rubroId = item.rubroId != null ? Number(item.rubroId) : null;
      if (!mapa.has(nombre)) {
        mapa.set(nombre, { cantidad, rubroId });
      }
    });
    return Array.from(mapa.entries()).map(([nombre, meta]) => ({
      nombre,
      cantidad: meta.cantidad,
      rubroId: meta.rubroId,
    }));
  }, [rubrosData]);

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
    return base;
  }, [pagina, limite, proveedorId, busquedaPersonalizada, rubroFiltro]);

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
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          bgcolor: 'transparent',
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
        }
      }}
    >
      <TexturedPanel
        accent={COLORS.primary}
        radius={12}
        contentPadding={0}
        bgTintPercent={12}
        bgAlpha={1}
        textureBaseOpacity={0.22}
        textureBoostOpacity={0.19}
        textureBrightness={1.12}
        textureContrast={1.03}
        tintOpacity={0.38}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
          {/* ===== HEADER ===== */}
          <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', px: 3, py: 2.25, gap: 2 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
                color: '#fff'
              }}>
                <Icon icon="mdi:account-outline" width={22} height={22} />
              </Box>

              <Typography variant="h6" fontWeight={700} color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {headerTitle}
              </Typography>

              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, pr: 1.5 }}>
                {Boolean(proveedorCompleto?.CUIT) && (
                  <Chip
                    label={`CUIT${NBSP}${proveedorCompleto?.CUIT}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', border: `1px solid ${COLORS.chipBorder}`, fontWeight: 600, px: 1.5, py: 0.5, height: 28 }}
                  />
                )}
                <Chip
                  label={formatCount(totalArticulosProveedor, 'artículo', 'artículos')}
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', border: `1px solid ${COLORS.chipBorder}`, fontWeight: 600, px: 1.5, py: 0.5, height: 28 }}
                />
                <Chip
                  label={`Saldo${NBSP}${currency(proveedorCompleto?.Saldo)}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', border: `1px solid ${COLORS.chipBorder}`, fontWeight: 700, px: 1.5, py: 0.5, height: 28 }}
                />
              </Box>

              <CrystalSoftButton
                baseColor={COLORS.primary}
                onClick={onCerrar}
                title="Cerrar"
                sx={{
                  width: 40, height: 40, minWidth: 40,
                  p: 0, borderRadius: '50%',
                  display: 'grid', placeItems: 'center',
                  transform: 'none !important', transition: 'none',
                  '&:hover': { transform: 'none !important' },
                }}
              >
                <Icon icon="mdi:close" color="#fff" width={22} height={22} />
              </CrystalSoftButton>
            </Box>
          </DialogTitle>

          {/* Divisor header */}
          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
                linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
                linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
              `,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto'
            }}
          />

          {/* ===== CONTENIDO ===== */}
          <DialogContent
            sx={{
              p: 0,
              borderRadius: 0,
              overflow: 'auto',
              maxHeight: CONTENT_MAX,
              flex: '0 1 auto'
            }}
          >
            <Box sx={{ position: 'relative', borderRadius: 0, overflow: 'hidden' }}>
              <WoodBackdrop accent={COLORS.primary} radius={0} inset={0} strength={0.75} texture="wide" />
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: 5,
                  borderRadius: 0,
                  backdropFilter: 'saturate(118%) blur(0.4px)',
                  background: 'rgba(255,255,255,0.84)',
                }}
              >
                {/* Tarjetas de info rápida */}
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.75,
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      md: 'repeat(4, minmax(0, 1fr))',
                    },
                    mb: 3,
                  }}
                >
                  <Tooltip placement="top" arrow title={renderTooltip(contactoTooltipTitle)}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                        background: alpha(COLORS.primary, 0.06),
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.24)',
                      }}
                    >
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.18),
                            }}
                          >
                            <Icon icon="mdi:account" width={15} height={15} color={COLORS.primary} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            Contacto
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={700} color={COLORS.primary}>
                          {proveedorCompleto?.Contacto || proveedorCompleto?.Nombre || '—'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Tooltip>

                  <Tooltip placement="top" arrow title={renderTooltip(rubrosTooltipTitle)}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                        background: alpha(COLORS.primary, 0.05),
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                      }}
                    >
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.16),
                            }}
                          >
                            <Icon icon="mdi:layers" width={15} height={15} color={COLORS.primary} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            Rubros asociados
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.primary}>
                          {loadingRubros ? '…' : errorRubros ? '—' : formatCount(cantidadRubros, 'rubro')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Tooltip>

                  <Tooltip placement="top" arrow title={renderTooltip(recargoTooltipTitle)}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                        background: alpha(COLORS.primary, 0.05),
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                      }}
                    >
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.16),
                            }}
                          >
                            <Icon icon="mdi:trending-up" width={15} height={15} color={COLORS.primary} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            Recargo por proveedor
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.primary}>
                          {formatPercentage(porcentajeRecargoProveedor)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Tooltip>

                  <Tooltip placement="top" arrow title={renderTooltip(descuentoTooltipTitle)}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                        background: alpha(COLORS.primary, 0.05),
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                      }}
                    >
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.16),
                            }}
                          >
                            <Icon icon="mdi:trending-down" width={15} height={15} color={COLORS.primary} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            Descuento por proveedor
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.primary}>
                          {formatPercentage(porcentajeDescuentoProveedor)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Tooltip>
                </Box>

                {cantidadRubros > 0 && (
                  <Box mt={2.5} display="flex" flexDirection="column" gap={1.25}>
                    <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                      Rubros del proveedor
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip
                        key="rubro-todos"
                        label="Todos"
                        clickable
                        variant={!rubroFiltro ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 600,
                          bgcolor: !rubroFiltro ? marronPalette.primary : 'transparent',
                          color: !rubroFiltro ? '#fff' : marronPalette.primary,
                          borderColor: marronPalette.primary,
                          '&:hover': {
                            bgcolor: !rubroFiltro
                              ? marronPalette.primaryHover
                              : alpha(marronPalette.primary, 0.08),
                          },
                        }}
                        onClick={() => handleSeleccionarRubro()}
                      />
                      {rubrosRelacionados.map(({ nombre, cantidad, rubroId }) => {
                        const isActive =
                          rubroFiltroId != null
                            ? rubroId != null && rubroFiltroId === rubroId
                            : rubroFiltroNombre != null && rubroFiltroNombre === nombre;
                        const label = cantidad != null ? `${nombre} (${cantidad})` : nombre;
                        return (
                          <Chip
                            key={`${rubroId ?? nombre}`}
                            label={label}
                            clickable
                            variant={isActive ? 'filled' : 'outlined'}
                            sx={{
                              fontWeight: 600,
                              bgcolor: isActive ? marronPalette.primary : 'transparent',
                              color: isActive ? '#fff' : marronPalette.primary,
                              borderColor: marronPalette.primary,
                              '&:hover': {
                                bgcolor: isActive
                                  ? marronPalette.primaryHover
                                  : alpha(marronPalette.primary, 0.08),
                              },
                            }}
                            onClick={() =>
                              handleSeleccionarRubro({ rubroId: rubroId ?? null, nombre })
                            }
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Toolbar tabla */}
                <Box
                  sx={{
                    border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                    borderRadius: 2,
                    background: alpha(COLORS.primary, 0.05),
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    px: 3,
                    py: 2.25,
                    mb: 2.5,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ gap: 2, flexWrap: 'wrap' }}
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
                            color: COLORS.textStrong,
                            borderRadius: 2,
                            background: '#fff',
                            '& fieldset': { borderColor: alpha(COLORS.primary, 0.28) },
                            '&:hover fieldset': { borderColor: alpha(COLORS.primary, 0.42) },
                            '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Tabla de artículos — usando el mismo componente genérico */}
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

          {/* Divisor footer */}
          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: `
                linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
                linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
                linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
              `,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto'
            }}
          />

          {/* ===== FOOTER ===== */}
          <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 3, py: 2.25, gap: 1.5 }}>
              <CrystalSoftButton baseColor={COLORS.primary} onClick={onCerrar}>
                Cerrar
              </CrystalSoftButton>
            </Box>
          </DialogActions>
        </Box>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalDetallesProveedor;
