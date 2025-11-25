// /src/components/rubros/ModalDetallesRubro.tsx
'use client';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Chip, TextField, InputAdornment, Divider
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback, type ComponentProps } from 'react';
import { Icon } from '@iconify/react';
import { azul, verde } from '@/ui/colores';
import { marron } from '@/components/rubros/colores-marron';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_PROVEEDORES_POR_RUBRO } from '@/components/rubros/graphql/queries';
import type { ProveedoresPorRubroResponse } from '@/interfaces/rubros';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { TablaArticulos } from '@/components/articulos';
import { ModalEliminarArticuloRubro } from '@/components/rubros/ModalEliminarArticuloRubro';
import { ELIMINAR_ARTICULO_DE_RUBRO } from '@/components/rubros/graphql/mutations';

interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
}

interface ModalDetallesRubroProps {
  open: boolean;
  onClose: () => void;
  rubro: Rubro | null;
  /** Color que viene de la tabla de rubros (hex/rgb/hsl). */
  accentColor?: string;
}

const PAGINAS_OPCIONES = [20, 50, 100];
type ColumnasTablaArticulos = ComponentProps<typeof TablaArticulos>['columns'];
type FiltrosTablaControlados = NonNullable<ComponentProps<typeof TablaArticulos>['controlledFilters']>;
type TablaArticulosOnDataLoaded = NonNullable<ComponentProps<typeof TablaArticulos>['onDataLoaded']>;
type TablaArticulosDataPayload = Parameters<TablaArticulosOnDataLoaded>[0];
type TablaArticulosOnDelete = NonNullable<ComponentProps<typeof TablaArticulos>['onDelete']>;
type TablaArticulosRow = Parameters<TablaArticulosOnDelete>[0];

type EstadoTabla = {
  total: number;
  loading: boolean;
  error?: Error;
};

const NBSP = '\u00A0';
const formatCount = (n: number, singular: string, plural?: string) =>
  `${n.toLocaleString('es-AR')}${NBSP}${n === 1 ? singular : (plural ?? `${singular}s`)}`;

// === Layout (header + footer + divisores) ===
const VH_MAX = 85;
const HEADER_H = 60;
const FOOTER_H = 60;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

// Derivar paleta desde el color de rubro
const makeColors = (base?: string) => {
  const primary = base || marron.primary || '#5D4037';
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.5),
    chipBorder: 'rgba(255,255,255,0.35)',
  };
};

const ARTICULOS_COLORS = verde;

const ModalDetallesRubro = ({ open, onClose, rubro, accentColor }: ModalDetallesRubroProps) => {
  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);

  const [filtroInput, setFiltroInput] = useState('');
  const [busquedaPersonalizada, setBusquedaPersonalizada] = useState('');
  const [proveedorSeleccionadoId, setProveedorSeleccionadoId] = useState<number | null>(null);
  const [paginacion, setPaginacion] = useState({ pagina: 0, limite: PAGINAS_OPCIONES[0] });
  const { pagina, limite } = paginacion;

  const rubroId = rubro?.id ?? null;
  const rubroNombre = rubro?.nombre ?? 'Detalle del Rubro';
  const rubroCodigo = rubro?.codigo ?? '';
  const porcentajeRecargo = Number(rubro?.porcentajeRecargo ?? 0);
  const porcentajeDescuento = Number(rubro?.porcentajeDescuento ?? 0);

  const formatPorcentaje = (valor: number) => {
    const formatter = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: valor % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    return `${formatter.format(valor)}%`;
  };

  const shouldQuery = Boolean(open && rubroId != null);

  const { data: proveedoresData, loading: loadingProveedores } =
    useQuery<ProveedoresPorRubroResponse>(GET_PROVEEDORES_POR_RUBRO, {
      variables: { rubroId: Number(rubroId) },
      skip: !shouldQuery,
      fetchPolicy: 'cache-and-network',
    });

  const proveedores = proveedoresData?.proveedoresPorRubro ?? [];
  const [estadoTabla, setEstadoTabla] = useState<EstadoTabla>({ total: 0, loading: false, error: undefined });
  const totalArticulos = estadoTabla.total;
  const totalArticulosRubro = useMemo(() => {
    if (typeof rubro?.cantidadArticulos === 'number' && rubro.cantidadArticulos >= 0) {
      return rubro.cantidadArticulos;
    }
    return totalArticulos;
  }, [rubro?.cantidadArticulos, totalArticulos]);
  const loadingArticulos = estadoTabla.loading;
  const errorArticulos = estadoTabla.error;
  const [reloadKey, setReloadKey] = useState(0);
  const [articuloAEliminar, setArticuloAEliminar] = useState<any | null>(null);
  const [confirmEliminarOpen, setConfirmEliminarOpen] = useState(false);
  const [textoConfirmEliminar, setTextoConfirmEliminar] = useState('');
  const [eliminarArticuloDeRubro] = useMutation(ELIMINAR_ARTICULO_DE_RUBRO);

  const cerrarModalEliminar = useCallback(() => {
    setConfirmEliminarOpen(false);
    setTextoConfirmEliminar('');
    setArticuloAEliminar(null);
  }, []);

  const abrirModalEliminar = useCallback((articulo: TablaArticulosRow) => {
    setArticuloAEliminar(articulo);
    setTextoConfirmEliminar('');
    setConfirmEliminarOpen(true);
  }, []);

  const confirmarEliminarArticulo = useCallback(async () => {
    if (!articuloAEliminar) return;
    const articuloId = Number(articuloAEliminar?.id ?? articuloAEliminar?.Id);
    if (!Number.isFinite(articuloId)) {
      cerrarModalEliminar();
      return;
    }

    try {
      await eliminarArticuloDeRubro({ variables: { articuloId } });
      setEstadoTabla((prev) => ({
        ...prev,
        total: prev.total > 0 ? prev.total - 1 : 0,
      }));
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error al eliminar artículo del rubro:', error);
    } finally {
      cerrarModalEliminar();
    }
  }, [articuloAEliminar, eliminarArticuloDeRubro, cerrarModalEliminar]);

  useEffect(() => {
    if (!open) return;
    setPaginacion({ pagina: 0, limite: PAGINAS_OPCIONES[0] });
    setBusquedaPersonalizada('');
    setFiltroInput('');
    setProveedorSeleccionadoId(null);
    setEstadoTabla({ total: 0, loading: false, error: undefined });
  }, [open, rubroId]);

  useEffect(() => {
    if (!open || rubroId == null) return;
    setPaginacion((prev) => ({ pagina: 0, limite: prev.limite }));
    setReloadKey((prev) => prev + 1);
  }, [proveedorSeleccionadoId, open, rubroId]);

  const columnasTabla = useMemo<ColumnasTablaArticulos>(() => ([
    { key: 'codigo', header: 'Código', width: '18%' },
    { key: 'descripcion', header: 'Descripción', width: '36%' },
    { key: 'stock', header: 'Stock', width: '14%' },
    { key: 'precio', header: 'Precio', width: '14%' },
    { key: 'proveedor', header: 'Proveedor', width: '18%' },
  ] as ColumnasTablaArticulos), []);

  const filtrosControlados = useMemo<FiltrosTablaControlados>(() => {
    const base: FiltrosTablaControlados = {
      pagina,
      limite,
    };
    if (typeof rubroId === 'number') base.rubroId = rubroId;
    if (busquedaPersonalizada) base.busqueda = busquedaPersonalizada;
    if (proveedorSeleccionadoId !== null) base.proveedorId = proveedorSeleccionadoId;
    return base;
  }, [pagina, limite, rubroId, busquedaPersonalizada, proveedorSeleccionadoId]);

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
      if (prev.total === next.total && prev.loading === next.loading && sameError) {
        return prev;
      }
      return next;
    });
  }, []);

  const onCerrar = () => {
    setFiltroInput('');
    setBusquedaPersonalizada('');
    setPaginacion({ pagina: 0, limite: PAGINAS_OPCIONES[0] });
    cerrarModalEliminar();
    onClose();
  };

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
          <DialogTitle
            sx={{
              p: 0,
              m: 0,
              height: HEADER_H,
              minHeight: HEADER_H,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1,        // <── BAJAR EL PADDING AQUÍ
                gap: 2,
              }}
            >

              <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
                color: '#fff'
              }}>
                <Icon icon="mdi:tag-outline" width={22} height={22} />
              </Box>

              <Typography variant="h6" fontWeight={700} color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {rubroNombre}
              </Typography>

              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, pr: 1.5 }}>
                {!!rubroCodigo && (
                  <Chip
                    label={`Código${NBSP}${rubroCodigo}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', border: `1px solid ${COLORS.chipBorder}`, fontWeight: 600, px: 1.5, py: 0.5, height: 28 }}
                  />
                )}
                <Chip
                  label={formatCount(totalArticulosRubro, 'artículo', 'artículos')}
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', border: `1px solid ${COLORS.chipBorder}`, fontWeight: 600, px: 1.5, py: 0.5, height: 28 }}
                />
                <Chip
                  label={formatCount(proveedores.length, 'proveedor', 'proveedores')}
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', border: `1px solid ${COLORS.chipBorder}`, fontWeight: 600, px: 1.5, py: 0.5, height: 28 }}
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

          {/* Divisor header (claro arriba / oscuro abajo) */}
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
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: { xs: 3, md: 4 },
                  borderRadius: 0,
                  backdropFilter: 'none',
                  background: '#ffffff',
                }}
              >
                <Box
                  display="flex"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  gap={2}
                  mb={3}
                >
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      p: 2.25,
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.22)}`,
                      background: alpha(COLORS.primary, 0.08),
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} color={COLORS.textStrong} gutterBottom>
                      Recargo por rubro
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color={COLORS.primary}>
                      {formatPorcentaje(porcentajeRecargo)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Se suma al precio base de los artículos pertenecientes al rubro.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      p: 2.25,
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                      background: alpha(COLORS.primary, 0.05),
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} color={COLORS.textStrong} gutterBottom>
                      Descuento por rubro
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color={COLORS.primary}>
                      {formatPorcentaje(porcentajeDescuento)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Utilizado para promociones o acuerdos comerciales específicos.
                    </Typography>
                  </Box>
                </Box>

                {/* Proveedores */}
                <Box mb={2}>
                  <Typography variant="h6" fontWeight={700} mb={1} color={COLORS.textStrong}>
                    Proveedores Asociados
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {loadingProveedores ? (
                      <Typography variant="body2" color="text.secondary">Cargando proveedores…</Typography>
                    ) : proveedores.length ? (
                      <>
                        <Chip
                          key="todos"
                          label="Todos"
                          clickable
                          variant={proveedorSeleccionadoId === null ? 'filled' : 'outlined'}
                          sx={{
                            fontWeight: 600,
                            bgcolor: proveedorSeleccionadoId === null ? azul.primary : 'transparent',
                            color: proveedorSeleccionadoId === null ? '#fff' : azul.primary,
                            borderColor: azul.primary,
                            '&:hover': {
                              bgcolor: proveedorSeleccionadoId === null ? azul.primaryHover : alpha(azul.primary, 0.08),
                            },
                          }}
                          onClick={() => {
                            setProveedorSeleccionadoId(null);
                            setPaginacion((prev) =>
                              prev.pagina === 0 ? prev : { ...prev, pagina: 0 }
                            );
                          }}
                        />
                        {proveedores.map((p) => {
                          const nextId = Number(p.id);
                          const seleccionado = proveedorSeleccionadoId === nextId;
                          return (
                            <Chip
                              key={nextId}
                              label={p.nombre}
                              clickable
                              variant={seleccionado ? 'filled' : 'outlined'}
                              sx={{
                                fontWeight: 600,
                                bgcolor: seleccionado ? azul.primary : 'transparent',
                                color: seleccionado ? '#fff' : azul.primary,
                                borderColor: azul.primary,
                                '&:hover': {
                                  bgcolor: seleccionado ? azul.primaryHover : alpha(azul.primary, 0.08),
                                },
                              }}
                              onClick={() => {
                                setProveedorSeleccionadoId((prev) => (prev === nextId ? null : nextId));
                                setPaginacion((prev) =>
                                  prev.pagina === 0 ? prev : { ...prev, pagina: 0 }
                                );
                              }}
                            />
                          );
                        })}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay proveedores asociados
                      </Typography>
                    )}
                  </Box>
                </Box>

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
                      Artículos del rubro
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

                <Box mt={2}>
                  <TablaArticulos
                    key={`${rubroId ?? 'rubro'}-${proveedorSeleccionadoId ?? 'todos'}-${reloadKey}`}
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

          {/* Divisor footer (oscuro arriba / claro abajo) */}
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
          <DialogActions   sx={{
    p: 0,
    m: 0,
    height: FOOTER_H,
    minHeight: FOOTER_H,
  }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 2, py: 1, gap: 1.5 }}>
              <CrystalSoftButton baseColor={COLORS.primary} onClick={onCerrar}>
                Cerrar
              </CrystalSoftButton>
            </Box>
          </DialogActions>
        </Box>
      </TexturedPanel>
      <ModalEliminarArticuloRubro
        open={confirmEliminarOpen}
        onClose={cerrarModalEliminar}
        onConfirm={confirmarEliminarArticulo}
        articuloSeleccionado={articuloAEliminar ? {
          id: Number(articuloAEliminar?.id ?? articuloAEliminar?.Id ?? 0),
          codigo: articuloAEliminar?.Codigo ?? articuloAEliminar?.codigo ?? '',
          descripcion: articuloAEliminar?.Descripcion ?? articuloAEliminar?.descripcion ?? '',
        } : null}
        cantidadSeleccionados={articuloAEliminar ? 1 : 0}
        textoConfirmacion={textoConfirmEliminar}
        setTextoConfirmacion={setTextoConfirmEliminar}
      />
    </Dialog>
  );
};

export default ModalDetallesRubro;
