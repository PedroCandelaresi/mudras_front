// /src/components/rubros/ModalDetallesRubro.tsx
'use client';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Chip, TextField, InputAdornment, Divider
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback, type ComponentProps } from 'react';
import { Icon } from '@iconify/react';
import { azul } from '@/ui/colores';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_PROVEEDORES_POR_RUBRO } from '@/components/rubros/graphql/queries';
import type { ProveedoresPorRubroResponse } from '@/interfaces/rubros';
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
  const primary = azul.primary; // Blue
  const secondary = azul.headerBorder;
  return {
    primary,
    secondary,
    primaryHover: darken(primary, 0.12),
    textStrong: azul.textStrong,
    chipBorder: azul.borderInner,
    background: '#f8f9fa',
  };
};

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
        elevation: 4,
        sx: {
          borderRadius: 0, // Zero border radius for strict square aesthetic (like ModalEditarProveedor)
          bgcolor: '#ffffff',
          maxHeight: `${VH_MAX}vh`,
          overflow: 'hidden', // Prevent Paper from scrolling
        },
        square: true, // Force square borders
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: `${VH_MAX}vh` }}>

        {/* ===== HEADER ===== */}
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
          flexShrink: 0, // Prevent Header from shrinking
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon icon="mdi:tag-multiple" width={24} height={24} />
            <Box>
              <Typography variant="h6" fontWeight={600} letterSpacing={0.5}>
                {rubroNombre.toUpperCase()}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                {!!rubroCodigo && (
                  <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
                    CÓD: {rubroCodigo}
                  </Typography>
                )}
                {!!rubroCodigo && <Typography variant="caption" sx={{ opacity: 0.6 }}>|</Typography>}
                <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
                  {formatCount(totalArticulosRubro, 'ARTÍCULO', 'ARTÍCULOS')}
                </Typography>
              </Box>
            </Box>
          </Box>
          <CrystalSoftButton
            baseColor="rgba(255,255,255,0.2)"
            onClick={onCerrar}
            title="Cerrar"
            sx={{
              width: 32, height: 32, minWidth: 32,
              p: 0, borderRadius: 0,
              display: 'grid', placeItems: 'center',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <Icon icon="mdi:close" color="#fff" width={20} height={20} />
          </CrystalSoftButton>
        </Box>

        <DialogContent
          sx={{
            p: 3,
            bgcolor: '#ffffff',
            overflowY: 'auto',
            flex: 1, // Take remaining space
            minHeight: 0, // Allow shrinking below content size
          }}
        >
          {/* Tarjetas de Recargo/Descuento */}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
            <Box
              sx={{
                flex: 1,
                p: 2,
                border: `1px solid ${COLORS.chipBorder}`,
                bgcolor: alpha(COLORS.primary, 0.05),
                borderRadius: 0, // Square
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Recargo
              </Typography>
              <Typography variant="h4" fontWeight={700} color={COLORS.primary} mt={1}>
                {formatPorcentaje(porcentajeRecargo)}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 2,
                border: `1px solid ${COLORS.chipBorder}`,
                bgcolor: alpha(COLORS.primary, 0.05),
                borderRadius: 0, // Square
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Descuento
              </Typography>
              <Typography variant="h4" fontWeight={700} color={COLORS.primary} mt={1}>
                {formatPorcentaje(porcentajeDescuento)}
              </Typography>
            </Box>
          </Box>

          {/* Proveedores */}
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              Proveedores Asociados
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {loadingProveedores ? (
                <Typography variant="body2" color="text.secondary">Cargando...</Typography>
              ) : proveedores.length ? (
                <>
                  <Chip
                    key="todos"
                    label="TODOS"
                    clickable
                    variant={proveedorSeleccionadoId === null ? 'filled' : 'outlined'}
                    onClick={() => {
                      setProveedorSeleccionadoId(null);
                      setPaginacion((prev) => (prev.pagina === 0 ? prev : { ...prev, pagina: 0 }));
                    }}
                    sx={{
                      borderRadius: 0, fontWeight: 600,
                      bgcolor: proveedorSeleccionadoId === null ? COLORS.primary : 'transparent',
                      color: proveedorSeleccionadoId === null ? '#fff' : COLORS.primary,
                      borderColor: COLORS.primary,
                      '&:hover': { bgcolor: proveedorSeleccionadoId === null ? COLORS.primaryHover : alpha(COLORS.primary, 0.1) }
                    }}
                  />
                  {proveedores.map((p) => {
                    const nextId = Number(p.id);
                    const seleccionado = proveedorSeleccionadoId === nextId;
                    return (
                      <Chip
                        key={nextId}
                        label={p.nombre.toUpperCase()}
                        clickable
                        variant={seleccionado ? 'filled' : 'outlined'}
                        onClick={() => {
                          setProveedorSeleccionadoId((prev) => (prev === nextId ? null : nextId));
                          setPaginacion((prev) => (prev.pagina === 0 ? prev : { ...prev, pagina: 0 }));
                        }}
                        sx={{
                          borderRadius: 0, fontWeight: 600,
                          bgcolor: seleccionado ? COLORS.primary : 'transparent',
                          color: seleccionado ? '#fff' : COLORS.primary,
                          borderColor: COLORS.primary,
                          '&:hover': { bgcolor: seleccionado ? COLORS.primaryHover : alpha(COLORS.primary, 0.1) }
                        }}
                      />
                    );
                  })}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  Sin proveedores asociados.
                </Typography>
              )}
            </Box>
          </Box>

          {/* Toolbar y Tabla */}
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Artículos ({totalArticulos})
            </Typography>
            <TextField
              placeholder="Buscar artículos..."
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: '#fff',
                  '& fieldset': { borderColor: COLORS.chipBorder },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 2 },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:magnify" color={COLORS.secondary} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
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
                Error: {errorArticulos.message}
              </Typography>
            )}
            {loadingArticulos && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Cargando...
              </Typography>
            )}
          </Box>

        </DialogContent>

        {/* ===== FOOTER ===== */}
        <DialogActions sx={{ p: 2, bgcolor: '#f1f2f6', borderTop: '1px solid #e0e0e0', gap: 2, borderRadius: 0, flexShrink: 0 }}>
          <Box flex={1} />
          <CrystalSoftButton
            baseColor={COLORS.secondary}
            onClick={onCerrar}
            sx={{
              borderRadius: 0,
              color: '#fff',
              px: 3,
              fontWeight: 600,
              '&:hover': { bgcolor: darken(COLORS.secondary, 0.2) }
            }}
          >
            Cerrar
          </CrystalSoftButton>
        </DialogActions>

      </Box>

      {/* Modal Eliminar (se mantiene igual, solo lógica) */}
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
