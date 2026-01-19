'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  Alert,
  Autocomplete,
  Snackbar,
  Checkbox,
  Button
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import {
  OBTENER_PROVEEDORES_CON_STOCK,
  BUSCAR_ARTICULOS_PARA_ASIGNACION,
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerProveedoresConStockResponse,
  type BuscarArticulosParaAsignacionResponse,
  type ProveedorBasico,
  type ArticuloFiltrado,
  type ObtenerPuntosMudrasResponse,
  type PuntoMudras,
  OBTENER_RELACIONES_PROVEEDOR_RUBRO,
  type ObtenerRelacionesProveedorRubroResponse,
} from '@/components/puntos-mudras/graphql/queries';
import { ASIGNAR_STOCK_MASIVO } from '@/components/puntos-mudras/graphql/mutations';
import { oroNegro } from '@/ui/colores';

interface AsignacionStock {
  articuloId: number;
  cantidad: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  destinoId?: number | null; // punto o depósito
  onStockAsignado: () => void;
  titulo?: string;
  tipoDestinoPreferido?: 'venta' | 'deposito';
  articuloPreseleccionado?: { id: number; codigo: string; nombre: string; proveedorId?: number | null; rubro?: string | null } | null;
  origen?: 'venta' | 'deposito' | 'articulo';
}

export default function ModalNuevaAsignacionStock({ open, onClose, destinoId, onStockAsignado, titulo, tipoDestinoPreferido, articuloPreseleccionado, origen }: Props) {
  // Estados para filtros
  const [proveedores, setProveedores] = useState<ProveedorBasico[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ProveedorBasico | null>(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<number | null>(destinoId ?? null);

  // Estados para artículos y asignaciones
  const [articulos, setArticulos] = useState<ArticuloFiltrado[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionStock[]>([]);
  const [articulosSnapshot, setArticulosSnapshot] = useState<Record<number, ArticuloFiltrado>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>(() => ({ open: false, msg: '', sev: 'success' }));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const prevDestino = useRef<number | null>(null);

  const busquedaActiva = useMemo(() => busqueda.trim().length > 0, [busqueda]);

  const { data: proveedoresData, loading: loadingProveedores } = useQuery<ObtenerProveedoresConStockResponse>(OBTENER_PROVEEDORES_CON_STOCK, { skip: !open, fetchPolicy: 'cache-and-network' });
  useEffect(() => {
    if (!open) return;
    const normalizados = (proveedoresData?.obtenerProveedoresConStock ?? []).map((p) => ({
      ...p,
      id: Number(p.id),
    }));
    setProveedores(normalizados);
  }, [open, proveedoresData]);

  const { data: relacionesData, loading: loadingRelaciones } = useQuery<ObtenerRelacionesProveedorRubroResponse>(
    OBTENER_RELACIONES_PROVEEDOR_RUBRO,
    { skip: !open, fetchPolicy: 'cache-and-network' }
  );

  const [buscarArticulosQuery, { data: articulosData, loading: buscandoArticulos, error: errorBuscar }] =
    useLazyQuery<BuscarArticulosParaAsignacionResponse>(BUSCAR_ARTICULOS_PARA_ASIGNACION, {
      fetchPolicy: "network-only",
    });

  const { data: puntosData } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS, {
    fetchPolicy: 'cache-and-network',
    skip: !open,
  });

  const relacionesProveedorRubro = useMemo(
    () => relacionesData?.obtenerRelacionesProveedorRubro ?? [],
    [relacionesData]
  );

  const rubrosOpciones = useMemo(() => {
    if (proveedorSeleccionado) {
      const rubros = relacionesProveedorRubro
        .filter((r) => Number(r.proveedorId) === Number(proveedorSeleccionado.id))
        .map((r) => r.rubroNombre || '')
        .filter(Boolean);
      return Array.from(new Set(rubros));
    }
    const rubros = relacionesProveedorRubro.map((r) => r.rubroNombre || '').filter(Boolean);
    return Array.from(new Set(rubros));
  }, [relacionesProveedorRubro, proveedorSeleccionado]);

  const proveedoresFiltrados = useMemo(() => {
    if (!rubroSeleccionado) return proveedores;
    const proveedoresIds = new Set(
      relacionesProveedorRubro
        .filter((r) => (r.rubroNombre || '').toLowerCase() === rubroSeleccionado.toLowerCase())
        .map((r) => Number(r.proveedorId))
    );
    return proveedores.filter((p) => proveedoresIds.has(Number(p.id)));
  }, [proveedores, relacionesProveedorRubro, rubroSeleccionado]);

  useEffect(() => {
    if (!proveedorSeleccionado) return;
    if (rubroSeleccionado && !rubrosOpciones.includes(rubroSeleccionado)) {
      setRubroSeleccionado('');
    }
  }, [proveedorSeleccionado, rubrosOpciones, rubroSeleccionado]);

  useEffect(() => {
    if (proveedorSeleccionado && !proveedoresFiltrados.some((p) => Number(p.id) === Number(proveedorSeleccionado.id))) {
      setProveedorSeleccionado(null);
    }
  }, [proveedorSeleccionado, proveedoresFiltrados]);

  const puntosDisponibles: PuntoMudras[] = useMemo(
    () => (puntosData?.obtenerPuntosMudras ?? []).filter((p) => p.activo),
    [puntosData]
  );

  const puntosFiltrados = useMemo(() => {
    const prefer = origen === 'venta' ? 'venta' : origen === 'deposito' ? 'deposito' : tipoDestinoPreferido;
    if (prefer === 'venta' || prefer === 'deposito') {
      return puntosDisponibles.filter((p) => p.tipo === prefer);
    }
    return puntosDisponibles;
  }, [puntosDisponibles, origen, tipoDestinoPreferido]);

  const buscarArticulos = useCallback(async () => {
    const term = busqueda.trim();
    if (!term && !proveedorSeleccionado && !rubroSeleccionado) {
      setError('Ingresá un artículo o seleccioná proveedor/rubro para buscar');
      return;
    }
    setError("");
    const proveedorIdToSend = busquedaActiva ? null : (proveedorSeleccionado ? Number(proveedorSeleccionado.id) : null);
    const rubroToSend = busquedaActiva ? null : (rubroSeleccionado.trim() || null);
    await buscarArticulosQuery({
      variables: {
        proveedorId: proveedorIdToSend,
        rubro: rubroToSend,
        busqueda: term || null,
        destinoId: destinoSeleccionado ?? null,
      },
    });
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda, destinoSeleccionado, buscarArticulosQuery, busquedaActiva]);

  useEffect(() => {
    if (articulosData?.buscarArticulosParaAsignacion) {
      const normalizados = (articulosData.buscarArticulosParaAsignacion as any[]).map((a) => ({
        ...a,
        id: Number(a.id),
        stockDisponible: Number(a.stockDisponible ?? 0),
        stockEnDestino: Number(a.stockEnDestino ?? 0),
      }));
      setArticulos(normalizados);
      setArticulosSnapshot((prev) => {
        const next = { ...prev };
        normalizados.forEach((a) => {
          next[a.id] = { ...a };
        });
        return next;
      });
    }
  }, [articulosData]);

  useEffect(() => {
    if (errorBuscar) setError(errorBuscar.message);
  }, [errorBuscar]);

  const articulosOrdenados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    const score = (valor?: string | null) => {
      const v = (valor || '').trim().toLowerCase();
      if (!v) return 4;
      if (v === term) return 0;
      if (v.startsWith(term)) return 1;
      if (v.includes(term)) return 2;
      return 3;
    };

    if (!term) {
      return [...articulos].sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''));
    }

    return [...articulos]
      .map((a) => {
        const codeScore = score(a.codigo);
        const descScore = score(a.nombre);
        const best = Math.min(codeScore, descScore);
        const codigoLower = (a.codigo || '').toLowerCase();
        const exactCode = codigoLower === term;
        return { a, s: best, exactCode, len: (a.codigo || '').length };
      })
      .sort((x, y) =>
        x.s - y.s ||
        Number(y.exactCode) - Number(x.exactCode) ||
        x.len - y.len ||
        (x.a.codigo || '').localeCompare(y.a.codigo || '')
      )
      .map((x) => x.a);
  }, [articulos, busqueda]);

  const articuloPorId = useMemo(() => {
    const map = new Map<number, ArticuloFiltrado>();
    articulos.forEach((a) => map.set(Number(a.id), a));
    return map;
  }, [articulos]);

  useEffect(() => {
    if (!proveedorSeleccionado) {
      setArticulos([]);
      setBusqueda("");
    }
  }, [proveedorSeleccionado]);

  const handleAsignarStock = (articuloId: number, cantidad: number, opts?: { allowZero?: boolean }) => {
    const allowZero = opts?.allowZero ?? false;
    if (cantidad <= 0 && !allowZero) {
      handleRemoverAsignacion(articuloId);
      return;
    }

    const asignacionExistente = asignaciones.find(a => a.articuloId === articuloId);

    if (asignacionExistente) {
      setAsignaciones(prev =>
        prev.map(a =>
          a.articuloId === articuloId
            ? { ...a, cantidad }
            : a
        )
      );
    } else {
      setAsignaciones(prev => [...prev, { articuloId, cantidad }]);
    }
  };

  const handleRemoverAsignacion = (articuloId: number) => {
    setAsignaciones(prev => prev.filter(a => a.articuloId !== articuloId));
  };

  const limpiarFiltros = () => {
    setProveedorSeleccionado(null);
    setRubroSeleccionado('');
    setBusqueda('');
    setArticulos([]);
    setError('');
  };

  const toggleSeleccion = (articulo: ArticuloFiltrado, checked: boolean) => {
    if (checked) {
      const ya = asignaciones.find(a => a.articuloId === articulo.id);
      if (!ya) {
        setAsignaciones(prev => [...prev, { articuloId: articulo.id, cantidad: articulo.stockDisponible > 0 ? articulo.stockDisponible : 1 }]);
        setArticulosSnapshot((prev) => ({ ...prev, [Number(articulo.id)]: { ...articulo } }));
      }
    } else {
      handleRemoverAsignacion(articulo.id);
    }
  };

  const handleConfirmarAsignaciones = async () => {
    if (!destinoSeleccionado) {
      setError('Debe seleccionar un destino (punto o depósito)');
      return;
    }
    if (asignaciones.length === 0) {
      setError('Debe asignar stock a al menos un artículo');
      return;
    }
    setConfirmOpen(true);
  };

  const [asignarMasivoMutation] = useMutation<{ asignarStockMasivo: boolean }>(ASIGNAR_STOCK_MASIVO);

  const aplicarAsignaciones = async () => {
    setLoading(true);
    setError('');

    try {
      if (!destinoSeleccionado) throw new Error('No hay destino seleccionado');

      const payload = {
        puntoMudrasId: destinoSeleccionado,
        asignaciones: asignaciones.map(a => ({
          articuloId: Number(a.articuloId),
          cantidad: Number(a.cantidad)
        })),
        motivo: 'Asignación masiva desde panel'
      };

      const { data } = await asignarMasivoMutation({
        variables: { input: payload }
      });

      if (!data?.asignarStockMasivo) {
        throw new Error('La operación no retornó éxito');
      }

      const destinoNombre = puntosDisponibles.find((p) => p.id === destinoSeleccionado)?.nombre || 'destino';
      setSnack({ open: true, msg: `Stock asignado a ${destinoNombre}`, sev: 'success' });
      onStockAsignado();
      handleCerrar();
    } catch (error) {
      console.error('Error al asignar stock:', error);
      setError('Error al asignar el stock: ' + (error as Error).message);
      setSnack({ open: true, msg: 'Error al asignar el stock', sev: 'error' });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleCerrar = () => {
    setProveedorSeleccionado(null);
    setRubroSeleccionado('');
    setBusqueda('');
    setArticulos([]);
    setAsignaciones([]);
    setError('');
    setDestinoSeleccionado(destinoId ?? null);
    onClose();
  };

  const getCantidadAsignada = (articuloId: number): number => {
    const asignacion = asignaciones.find(a => a.articuloId === articuloId);
    return asignacion?.cantidad || 0;
  };

  const totalAsignaciones = asignaciones.reduce((total, a) => total + a.cantidad, 0);

  useEffect(() => {
    if (!open) return;
    setError('');
    setDestinoSeleccionado(destinoId ?? null);
    if (articuloPreseleccionado) {
      setBusqueda(articuloPreseleccionado.codigo || articuloPreseleccionado.nombre || '');
    }
  }, [open, destinoId, articuloPreseleccionado]);

  useEffect(() => {
    if (!open || !articuloPreseleccionado) return;
    if (articuloPreseleccionado.proveedorId && !proveedorSeleccionado) {
      const p = proveedores.find((pr) => Number(pr.id) === Number(articuloPreseleccionado.proveedorId));
      if (p) setProveedorSeleccionado(p);
    }
    if (articuloPreseleccionado.rubro && !rubroSeleccionado) {
      setRubroSeleccionado(articuloPreseleccionado.rubro);
    }
  }, [open, articuloPreseleccionado, proveedores, proveedorSeleccionado, rubroSeleccionado]);

  useEffect(() => {
    if (!open) return;
    if (destinoSeleccionado) return;
    const prefer = origen === 'venta' ? 'venta' : origen === 'deposito' ? 'deposito' : tipoDestinoPreferido;
    const match = (prefer ? puntosFiltrados.find((p) => p.tipo === prefer) : null) || puntosFiltrados[0];
    if (match) setDestinoSeleccionado(match.id);
  }, [open, destinoSeleccionado, puntosFiltrados, origen, tipoDestinoPreferido]);

  useEffect(() => {
    if (!open) return;
    if (destinoSeleccionado && puntosFiltrados.some(p => p.id === destinoSeleccionado)) return;
    const fallback = puntosFiltrados[0];
    if (fallback) setDestinoSeleccionado(fallback.id);
  }, [open, puntosFiltrados, destinoSeleccionado]);

  useEffect(() => {
    if (!open) return;
    if (prevDestino.current !== destinoSeleccionado) {
      prevDestino.current = destinoSeleccionado ?? null;
      setAsignaciones([]);
      setArticulos([]);
      if (destinoSeleccionado && (busquedaActiva || proveedorSeleccionado || rubroSeleccionado)) {
        void buscarArticulos();
      }
    }
  }, [open, destinoSeleccionado, busquedaActiva, proveedorSeleccionado, rubroSeleccionado, buscarArticulos]);

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0,
          border: 'none', // Removed white border
          bgcolor: '#ffffff',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header - Oro Negro */}
      <Box sx={{
        bgcolor: oroNegro.headerBg,
        color: oroNegro.headerText,
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${oroNegro.headerBorder}`,
        borderRadius: 0,
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon icon="mdi:package-variant-plus" width={24} height={24} color={oroNegro.primary} />
          <Box>
            <Typography variant="h6" fontWeight={700} letterSpacing={0}>
              {titulo || 'Asignar stock'}
            </Typography>
            {destinoSeleccionado && (
              <Typography variant="caption" sx={{ color: oroNegro.primary, opacity: 0.8 }}>
                Destino: {puntosDisponibles.find(p => p.id === destinoSeleccionado)?.nombre}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={handleCerrar} size="small" sx={{ color: oroNegro.actionHover, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <Box display="grid" gap={3}>
          {/* Toolbar */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex="1 1 auto" display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Artículo (escáner)"
                placeholder="Escaneá código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void buscarArticulos();
                  }
                }}
                disabled={Boolean(proveedorSeleccionado || rubroSeleccionado)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Icon icon="mdi:barcode-scan" color={oroNegro.primary} /></InputAdornment>,
                  sx: { borderRadius: 0 }
                }}
                helperText="Enter para buscar"
              />
              <Button
                variant="contained"
                onClick={() => void buscarArticulos()}
                disabled={!busqueda.trim() && !proveedorSeleccionado && !rubroSeleccionado}
                disableElevation
                sx={{
                  borderRadius: 0,
                  fontWeight: 700,
                  px: 3,
                  bgcolor: oroNegro.primary,
                  color: oroNegro.textStrong,
                  '&:hover': { bgcolor: oroNegro.primaryHover }
                }}
              >
                Buscar
              </Button>
              <IconButton onClick={limpiarFiltros} title="Limpiar filtros" sx={{ borderRadius: 0, border: '1px solid #e0e0e0', color: oroNegro.primary }}>
                <Icon icon="mdi:trash-can-outline" />
              </IconButton>
            </Box>
          </Box>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={2}>
            <Autocomplete
              options={puntosFiltrados}
              getOptionLabel={(p) => `${p.nombre} (${p.tipo})`}
              value={puntosFiltrados.find((p) => p.id === destinoSeleccionado) ?? null}
              onChange={(_, val) => setDestinoSeleccionado(val ? val.id : null)}
              renderInput={(params) => <TextField {...params} label="Destino" size="small" InputProps={{ ...params.InputProps, sx: { borderRadius: 0 } }} />}
            />
            <Autocomplete
              options={proveedoresFiltrados}
              getOptionLabel={(p) => p.nombre}
              value={proveedorSeleccionado}
              onChange={(_, val) => setProveedorSeleccionado(val)}
              disabled={Boolean(articuloPreseleccionado?.proveedorId) || busquedaActiva}
              renderInput={(params) => <TextField {...params} label="Proveedor" size="small" InputProps={{ ...params.InputProps, sx: { borderRadius: 0 } }} />}
            />
            <Autocomplete
              options={rubrosOpciones}
              value={rubroSeleccionado}
              onChange={(_, val) => setRubroSeleccionado(val || '')}
              disabled={Boolean(articuloPreseleccionado?.rubro) || busquedaActiva}
              renderInput={(params) => <TextField {...params} label="Rubro" size="small" InputProps={{ ...params.InputProps, sx: { borderRadius: 0 } }} />}
            />
          </Box>

          {(buscandoArticulos || loading) && (
            <Typography align="center" color="text.secondary">Buscando...</Typography>
          )}

          {/* Table */}
          {articulosOrdenados.length > 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0', maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ bgcolor: oroNegro.toolbarBg, borderBottom: `1px solid ${oroNegro.headerBorder}` }}>
                      {/* Checkbox Header */}
                    </TableCell>
                    <TableCell sx={{ bgcolor: oroNegro.toolbarBg, fontWeight: 700, color: oroNegro.primary, borderBottom: `1px solid ${oroNegro.headerBorder}` }}>CÓDIGO</TableCell>
                    <TableCell sx={{ bgcolor: oroNegro.toolbarBg, fontWeight: 700, color: oroNegro.primary, borderBottom: `1px solid ${oroNegro.headerBorder}` }}>DESCRIPCIÓN</TableCell>
                    <TableCell sx={{ bgcolor: oroNegro.toolbarBg, fontWeight: 700, color: oroNegro.primary, borderBottom: `1px solid ${oroNegro.headerBorder}` }}>RUBRO</TableCell>
                    <TableCell align="right" sx={{ bgcolor: oroNegro.toolbarBg, fontWeight: 700, color: oroNegro.primary, borderBottom: `1px solid ${oroNegro.headerBorder}` }}>STOCK DEST.</TableCell>
                    <TableCell align="right" sx={{ bgcolor: oroNegro.toolbarBg, fontWeight: 700, color: oroNegro.primary, borderBottom: `1px solid ${oroNegro.headerBorder}` }}>ASIGNAR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {articulosOrdenados.map((articulo) => {
                    const asignacion = asignaciones.find((a) => Number(a.articuloId) === Number(articulo.id));
                    const cantidadAsignada = asignacion?.cantidad ?? 0;
                    const seleccionado = Boolean(asignacion);
                    return (
                      <TableRow key={articulo.id} hover selected={seleccionado}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={seleccionado}
                            onChange={(e) => toggleSeleccion(articulo, e.target.checked)}
                            size="small"
                            sx={{
                              color: oroNegro.primary,
                              '&.Mui-checked': { color: oroNegro.primary }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{articulo.codigo}</TableCell>
                        <TableCell>{articulo.nombre}</TableCell>
                        <TableCell>{(articulo as any)?.rubro || '—'}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={articulo.stockEnDestino ?? 0}
                            sx={{ borderRadius: 0, bgcolor: oroNegro.chipBg, color: oroNegro.chipText }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={cantidadAsignada || ''}
                            onChange={(e) => {
                              const next = e.target.value;
                              const parsed = next === '' ? 0 : parseInt(next, 10) || 0;
                              handleAsignarStock(articulo.id, parsed, { allowZero: next === '' });
                            }}
                            sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                            disabled={!seleccionado}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Summary */}
          {asignaciones.length > 0 && (
            <Alert severity="info" sx={{ borderRadius: 0, '& .MuiAlert-icon': { color: oroNegro.primary } }}>
              <Typography variant="subtitle2" fontWeight={700}>Resumen de asignaciones</Typography>
              <Typography variant="body2">
                Total Artículos: <strong>{asignaciones.length}</strong> | Unidades Total: <strong>{totalAsignaciones}</strong>
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={handleCerrar} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button
          onClick={handleConfirmarAsignaciones}
          disabled={loading || asignaciones.length === 0}
          variant="contained"
          disableElevation
          sx={{
            bgcolor: oroNegro.primary,
            color: oroNegro.textStrong,
            borderRadius: 0,
            px: 3,
            fontWeight: 700,
            '&:hover': { bgcolor: oroNegro.primaryHover }
          }}
        >
          CONFIRMAR ASIGNACIÓN
        </Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Confirmar Asignación</Typography>
          <Typography variant="body2" mb={2}>
            Estás a punto de asignar <strong>{totalAsignaciones}</strong> unidades de <strong>{asignaciones.length}</strong> artículos
            al destino seleccionado.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button
              onClick={aplicarAsignaciones}
              variant="contained"
              disableElevation
              sx={{
                bgcolor: oroNegro.primary,
                color: oroNegro.textStrong,
                fontWeight: 700,
                borderRadius: 0,
                '&:hover': { bgcolor: oroNegro.primaryHover }
              }}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack(prev => ({ ...prev, open: false }))}>
        <Alert onClose={() => setSnack(prev => ({ ...prev, open: false }))} severity={snack.sev as any} sx={{ width: '100%', borderRadius: 0 }}>
          {snack.msg}
        </Alert>
      </Snackbar>

    </Dialog>
  );
}
