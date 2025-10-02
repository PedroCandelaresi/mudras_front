// /src/components/proveedores/ModalDetallesProveedor.tsx
'use client';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Chip, TextField, InputAdornment, Divider, Card, CardContent
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback, type ComponentProps } from 'react';
import { Icon } from '@iconify/react';
import { azul, verde } from '@/ui/colores';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { TablaArticulos } from '@/components/articulos';
import { useQuery } from '@apollo/client/react';
import { GET_PROVEEDOR } from '@/components/proveedores/graphql/queries';
import type { ProveedorResponse, Proveedor } from '@/interfaces/proveedores';

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

  const proveedorId = proveedor?.IdProveedor ?? null;

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
    return base;
  }, [pagina, limite, proveedorId, busquedaPersonalizada]);

  // Hooks para sincronizar resets al abrir/cambiar proveedor
  useEffect(() => {
    if (!open) return;
    setPaginacion({ pagina: 0, limite: PAGINAS_OPCIONES[0] });
    setBusquedaPersonalizada('');
    setFiltroInput('');
    setEstadoTabla({ total: 0, loading: false, error: undefined });
  }, [open, proveedorId]);

  // Si cambia el proveedor, recargar tabla
  useEffect(() => {
    if (!open || proveedorId == null) return;
    setPaginacion((prev) => ({ pagina: 0, limite: prev.limite }));
    setReloadKey((prev) => prev + 1);
  }, [open, proveedorId]);

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
                  label={formatCount(totalArticulos, 'artículo', 'artículos')}
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
                <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                  <Card sx={{
                    flex: '1 1 260px',
                    minWidth: 260,
                    borderRadius: 2,
                    border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                    background: alpha(COLORS.primary, 0.06),
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.24)',
                  }}>
                    <CardContent sx={{ p: 2.25 }}>
                      <Box display="flex" alignItems="center" gap={1.25} mb={1}>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '50%',
                          display: 'grid', placeItems: 'center',
                          bgcolor: alpha(COLORS.primary, 0.18)
                        }}>
                          <Icon icon="mdi:account" width={16} height={16} color={COLORS.primary} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                          Contacto
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {proveedorCompleto?.Contacto || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {proveedorCompleto?.Mail || 'Sin email'}{NBSP}•{NBSP}{proveedorCompleto?.Telefono || proveedorCompleto?.Celular || 'Sin teléfono'}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{
                    flex: '1 1 260px',
                    minWidth: 260,
                    borderRadius: 2,
                    border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                    background: alpha(COLORS.primary, 0.06),
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.24)',
                  }}>
                    <CardContent sx={{ p: 2.25 }}>
                      <Box display="flex" alignItems="center" gap={1.25} mb={1}>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '50%',
                          display: 'grid', placeItems: 'center',
                          bgcolor: alpha(COLORS.primary, 0.18)
                        }}>
                          <Icon icon="mdi:map-marker" width={16} height={16} color={COLORS.primary} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                          Ubicación
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {proveedorCompleto?.Direccion || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[proveedorCompleto?.Localidad, proveedorCompleto?.Provincia].filter(Boolean).join(', ') || '—'}{NBSP}{proveedorCompleto?.CP ? `(CP ${proveedorCompleto.CP})` : ''}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{
                    flex: '1 1 260px',
                    minWidth: 260,
                    borderRadius: 2,
                    border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                    background: alpha(COLORS.primary, 0.06),
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.24)',
                  }}>
                    <CardContent sx={{ p: 2.25 }}>
                      <Box display="flex" alignItems="center" gap={1.25} mb={1}>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '50%',
                          display: 'grid', placeItems: 'center',
                          bgcolor: alpha(COLORS.primary, 0.18)
                        }}>
                          <Icon icon="mdi:cash" width={16} height={16} color={COLORS.primary} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                          Saldo
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={800} color={COLORS.primary}>
                        {currency(proveedorCompleto?.Saldo)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Condición: {proveedorCompleto?.TipoIva || '—'}{proveedorCompleto?.Rubro ? ` • Rubro: ${proveedorCompleto.Rubro}` : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Observaciones */}
                {Boolean(proveedorCompleto?.Observaciones) && (
                  <Box
                    sx={{
                      p: 2.25,
                      mb: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                      background: alpha(COLORS.primary, 0.05),
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong} gutterBottom>
                      Observaciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {proveedorCompleto?.Observaciones}
                    </Typography>
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
                    key={`${proveedorId ?? 'prov'}-${reloadKey}`}
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
