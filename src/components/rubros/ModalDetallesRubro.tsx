'use client';

import {
  Dialog, DialogContent, DialogActions,
  Typography, Box, Chip, TextField, InputAdornment, Button, IconButton
} from '@mui/material';
import { useState, useEffect, useMemo, useCallback, type ComponentProps } from 'react';
import { Icon } from '@iconify/react';
import { useMutation, useQuery } from '@apollo/client/react';

import { GET_PROVEEDORES_POR_RUBRO } from '@/components/rubros/graphql/queries';
import { ProveedoresPorRubroResponse } from '@/interfaces/rubros';
import { TablaArticulos } from '@/components/articulos';
import { ModalEliminarArticuloRubro } from '@/components/rubros/ModalEliminarArticuloRubro';
import { ELIMINAR_ARTICULO_DE_RUBRO } from '@/components/rubros/graphql/mutations';
import { azul } from '@/ui/colores';

interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  unidadMedida?: string;
}

interface ModalDetallesRubroProps {
  open: boolean;
  onClose: () => void;
  rubro: Rubro | null;
  accentColor?: string;
}

const PAGINAS_OPCIONES = [50, 100, 150, 300, 500];
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

const VH_MAX = 78;

const ModalDetallesRubro = ({ open, onClose, rubro, accentColor }: ModalDetallesRubroProps) => {
  const [filtroInput, setFiltroInput] = useState('');
  const [busquedaPersonalizada, setBusquedaPersonalizada] = useState('');
  const [proveedorSeleccionadoId, setProveedorSeleccionadoId] = useState<number | null>(null);
  const [paginacion, setPaginacion] = useState({ pagina: 0, limite: 150 });
  const { pagina, limite } = paginacion;

  const rubroId = rubro?.id ?? null;
  const rubroNombre = rubro?.nombre ?? 'Detalle del Rubro';
  const rubroCodigo = rubro?.codigo ?? '';
  const porcentajeRecargo = Number(rubro?.porcentajeRecargo ?? 0);
  const porcentajeDescuento = Number(rubro?.porcentajeDescuento ?? 0);
  const unidadMedida = rubro?.unidadMedida ?? 'Unidad';

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
        elevation: 0,
        sx: {
          borderRadius: 0,
          bgcolor: '#ffffff',
          maxHeight: `${VH_MAX}vh`,
          overflow: 'hidden',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: `${VH_MAX}vh` }}>

        {/* ===== HEADER ===== */}
        <Box sx={{
          bgcolor: azul.primary,
          color: '#fff',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 0,
          flexShrink: 0,
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon icon="mdi:tag-multiple" width={24} height={24} color="#fff" />
            <Box>
              <Typography variant="h6" fontWeight={700} letterSpacing={0}>
                {rubroNombre}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0}>
                {!!rubroCodigo && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    CÓD: {rubroCodigo}
                  </Typography>
                )}
                {!!rubroCodigo && <Typography variant="caption" sx={{ opacity: 0.6 }}>|</Typography>}
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {formatCount(totalArticulosRubro, 'ARTÍCULO', 'ARTÍCULOS')}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onCerrar} size="small" sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <Icon icon="mdi:close" width={24} />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            p: 3,
            bgcolor: '#ffffff',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Tarjetas de Recargo/Descuento */}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
            <Box
              sx={{
                flex: 1,
                p: 2,
                border: '1px solid #e0e0e0',
                bgcolor: '#f8f9fa',
                borderRadius: 0,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Recargo
              </Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary" mt={1}>
                {formatPorcentaje(porcentajeRecargo)}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 2,
                border: '1px solid #e0e0e0',
                bgcolor: '#f8f9fa',
                borderRadius: 0,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Descuento
              </Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary" mt={1}>
                {formatPorcentaje(porcentajeDescuento)}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 2,
                border: '1px solid #e0e0e0',
                bgcolor: '#f8f9fa',
                borderRadius: 0,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Unidad
              </Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary" mt={1}>
                {unidadMedida}
              </Typography>
            </Box>
          </Box>

          {/* Proveedores */}
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
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
                      bgcolor: proveedorSeleccionadoId === null ? azul.primary : 'transparent',
                      color: proveedorSeleccionadoId === null ? '#fff' : azul.primary,
                      borderColor: azul.primary,
                      '&:hover': { bgcolor: proveedorSeleccionadoId === null ? azul.primaryHover : azul.actionHover }
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
                          bgcolor: seleccionado ? azul.primary : 'transparent',
                          color: seleccionado ? '#fff' : azul.primary,
                          borderColor: azul.primary,
                          '&:hover': { bgcolor: seleccionado ? azul.primaryHover : azul.actionHover }
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
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
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
                  '& fieldset': { borderColor: '#e0e0e0' },
                  '&.Mui-focused fieldset': { borderColor: azul.primary, borderWidth: 2 },
                  '&:hover fieldset': { borderColor: '#b0bec5' },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:magnify" color="#757575" />
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
          <Button
            onClick={onCerrar}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: azul.primary,
              color: '#fff',
              px: 4,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 0,
              '&:hover': { bgcolor: azul.primaryHover }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>

      </Box>

      {/* Modal Eliminar */}
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
