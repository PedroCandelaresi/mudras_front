'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
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
  Tooltip,
  InputAdornment,
  Alert,
  Autocomplete,
  Snackbar,
  Alert as MuiAlert,
  MenuItem,
  Select,
  Checkbox,
  Divider,
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
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton, CrystalIconButton } from '@/components/ui/CrystalButton';
import { verde, azul, oroNegro } from '@/ui/colores';
import { darken, alpha } from '@mui/material/styles';

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
  const HEADER_H = 60;
  const FOOTER_H = 60;
  const DIV_H = 3;

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
  // (loadingProveedores/loadingRubros provienen de los hooks de Apollo)
  const [error, setError] = useState<string>('');
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>(() => ({ open: false, msg: '', sev: 'success' }));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const prevDestino = useRef<number | null>(null);

  const tablaAccent = '#2b4735';
  const tablaHeaderBg = darken(tablaAccent, 0.12);
  const tablaHeaderText = alpha('#ffffff', 0.95);
  const tablaBodyBg = 'rgba(235, 247, 238, 0.58)';
  const tablaBodyAlt = 'rgba(191, 214, 194, 0.32)';
  const busquedaActiva = useMemo(() => busqueda.trim().length > 0, [busqueda]);
  const filtrosProveedorActivos = useMemo(
    () => !busquedaActiva && (!!proveedorSeleccionado || !!rubroSeleccionado.trim()),
    [busquedaActiva, proveedorSeleccionado, rubroSeleccionado]
  );
  const dividerTop = `
                linear-gradient(to bottom, ${alpha('#fff', 0.68)}, ${alpha('#fff', 0.68)}),
                linear-gradient(to bottom, ${alpha(darken(oroNegro.primary, 0.5), 0.3)}, ${alpha(darken(oroNegro.primary, 0.5), 0.3)}),
                linear-gradient(90deg, ${alpha(oroNegro.primary, 0.12)}, ${oroNegro.primary}, ${alpha(oroNegro.primary, 0.12)})
              `;
  const dividerBottom = `
                linear-gradient(to bottom, ${alpha(darken(oroNegro.primary, 0.5), 0.3)}, ${alpha(darken(oroNegro.primary, 0.5), 0.3)}),
                linear-gradient(to bottom, ${alpha('#fff', 0.68)}, ${alpha('#fff', 0.68)}),
                linear-gradient(90deg, ${alpha(oroNegro.primary, 0.12)}, ${oroNegro.primary}, ${alpha(oroNegro.primary, 0.12)})
              `;

  // Cargar proveedores al abrir el modal
  // Apollo: cargar proveedores al abrir
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

  // Buscar artículos sólo cuando el usuario lo pide (Enter / botón),
  // no en cada pulsación, para que el input no pierda el foco ni se "trabe".
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

  const getArticuloSnapshot = useCallback(
    (id: number) => articuloPorId.get(id) || articulosSnapshot[id],
    [articuloPorId, articulosSnapshot]
  );

  // Limpiar lista de artículos cuando se cambia de proveedor
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

      // Prepare payload for bulk assignment
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

  // No buscar automáticamente al cambiar destino: esperamos Enter o botón (incluye el Enter del escáner)

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'transparent',
          boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
          overflow: 'hidden',
        }
      }}
    >
      <TexturedPanel
        accent={oroNegro.primary}
        radius={12}
        contentPadding={0}
        bgTintPercent={18}
        bgAlpha={1}
        textureBaseOpacity={0.3}
        textureBoostOpacity={0.26}
        textureBrightness={1.08}
        textureContrast={1.1}
        tintOpacity={0.5}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
          <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', px: 3, gap: 2 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${oroNegro.primary} 0%, ${darken(oroNegro.primary, 0.2)} 100%)`,
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
                color: '#fff'
              }}>
                <Icon icon="mdi:package-variant-plus" width={22} height={22} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography
                  variant="h5"
                  fontWeight={900}
                  color="#ffda74"
                  sx={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}
                >
                  {titulo || 'Asignar stock'}{destinoSeleccionado ? ' · Destino seleccionado' : ''}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
                <CrystalIconButton baseColor={oroNegro.dark} onClick={handleCerrar}>
                  <Icon icon="mdi:close" color="#fff" width={20} height={20} />
                </CrystalIconButton>
              </Box>
            </Box>
          </DialogTitle>

          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: dividerTop,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto'
            }}
          />

          <DialogContent sx={{ p: 0, overflow: 'auto', maxHeight: `calc(85vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`, background: '#f8fafb' }}>
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ p: { xs: 3, md: 4 }, display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr auto auto' }, gap: 1 }}>
                <TextField
                  fullWidth
                  label="Artículo (escáner)"
                  placeholder="Escaneá código o escribí y Enter"
                  value={busqueda}
                  autoFocus
                  disabled={filtrosProveedorActivos}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBusqueda(value);
                    if (!value) setArticulos([]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void buscarArticulos();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="mdi:barcode-scan" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Enter o botón buscar"
                />
                <CrystalButton
                  baseColor={oroNegro.primary}
                  onClick={() => void buscarArticulos()}
                  disabled={!busqueda.trim() && !proveedorSeleccionado && !rubroSeleccionado}
                  sx={{ minHeight: 52, px: 3.5, fontWeight: 700 }}
                >
                  Buscar
                </CrystalButton>
                <CrystalSoftButton
                  baseColor={oroNegro.dark}
                  onClick={limpiarFiltros}
                  sx={{ minHeight: 52, px: 2.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <Icon icon="mdi:trash-can-outline" width={18} height={18} />
                </CrystalSoftButton>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 1.5 }}>
                <Autocomplete
                  options={puntosFiltrados}
                  getOptionLabel={(p) => `${p.nombre} (${p.tipo === 'venta' ? 'Punto de venta' : 'Depósito'})`}
                  value={puntosFiltrados.find((p) => p.id === destinoSeleccionado) ?? null}
                  onChange={(_, val) => setDestinoSeleccionado(val ? val.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Destino"
                      placeholder="Elegí punto o depósito"
                    />
                  )}
                />

                <Autocomplete
                  options={proveedoresFiltrados}
                  getOptionLabel={(option) => option.nombre}
                  value={proveedorSeleccionado}
                  onChange={(_, newValue) => {
                    setProveedorSeleccionado(newValue);
                    if (newValue) setBusqueda('');
                  }}
                  loading={loadingProveedores}
                  disabled={Boolean(articuloPreseleccionado?.proveedorId) || busquedaActiva}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Proveedor"
                      placeholder={rubroSeleccionado ? 'Filtrado por rubro' : 'Buscá proveedor'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void buscarArticulos();
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:factory" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Autocomplete
                  options={rubrosOpciones}
                  getOptionLabel={(r) => r || ''}
                  value={rubroSeleccionado || ''}
                  onChange={(_, val) => {
                    setRubroSeleccionado(val ?? '');
                    if (val) setBusqueda('');
                  }}
                  disabled={Boolean(articuloPreseleccionado?.rubro) || busquedaActiva}
                  loading={loadingRelaciones}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rubro"
                      placeholder={proveedorSeleccionado ? 'Filtrá por rubro' : 'Elegí proveedor o rubro'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void buscarArticulos();
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:tag" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {(buscandoArticulos || loading) && (
                <Box display="flex" justifyContent="center" py={3}>
                  <Typography>Buscando artículos...</Typography>
                </Box>
              )}

              {articulosOrdenados.length > 0 && (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 0,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(tablaAccent, 0.38)}`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
                    bgcolor: 'rgba(235, 247, 238, 0.9)',
                  }}
                >
                  <Table
                    size="small"
                    stickyHeader
                    sx={{
                      '& thead': {
                        bgcolor: tablaHeaderBg,
                      },
                      '& thead .MuiTableCell-root': {
                        color: tablaHeaderText,
                        fontWeight: 800,
                        borderBottom: `2px solid ${alpha('#fff', 0.16)}`,
                        fontSize: '0.82rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                        bgcolor: tablaHeaderBg,
                      },
                      '& .MuiTableHead-root .MuiTableCell-head:not(:last-of-type)': {
                        borderRight: `3px solid ${alpha(tablaAccent, 0.5)}`,
                      },
                      '& tbody .MuiTableCell-root': {
                        borderBottomColor: alpha(tablaAccent, 0.15),
                        fontSize: '0.85rem',
                        bgcolor: tablaBodyBg,
                      },
                      '& tbody .MuiTableRow-root:hover': {
                        backgroundColor: alpha(tablaAccent, 0.08),
                      },
                      '& tbody .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
                        backgroundColor: tablaBodyBg,
                      },
                      '& tbody .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
                        backgroundColor: tablaBodyAlt,
                      },
                      '& .MuiTableRow-root': { minHeight: 62 },
                      '& .MuiTableCell-root': { px: 1, py: 1.1 },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" sx={{ width: 52 }} />
                        <TableCell sx={{ width: 150 }}>Código</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell sx={{ width: 160 }}>Rubro</TableCell>
                        <TableCell align="right" sx={{ width: 140 }}>Stock destino</TableCell>
                        <TableCell align="right" sx={{ width: 180 }}>Asignar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {articulosOrdenados.map((articulo) => {
                        const asignacion = asignaciones.find((a) => Number(a.articuloId) === Number(articulo.id));
                        const cantidadAsignada = asignacion?.cantidad ?? 0;
                        const seleccionado = Boolean(asignacion);
                        return (
                          <TableRow key={articulo.id}>
                            <TableCell padding="checkbox" sx={{ width: 52 }}>
                              <Checkbox
                                checked={seleccionado}
                                onChange={(e) => toggleSeleccion(articulo, e.target.checked)}
                              />
                            </TableCell>
                            <TableCell sx={{ width: 150, fontFamily: 'monospace', fontWeight: 700 }}>
                              {articulo.codigo}
                            </TableCell>
                            <TableCell>{articulo.nombre}</TableCell>
                            <TableCell sx={{ width: 160 }}>
                              <Chip size="small" label={(articulo as any)?.rubro || '—'} />
                            </TableCell>
                            <TableCell align="right" sx={{ width: 140 }}>
                              <Chip
                                size="small"
                                label={articulo.stockEnDestino ?? 0}
                                color={(articulo.stockEnDestino ?? 0) > 0 ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ width: 180 }}>
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={cantidadAsignada || ''}
                                  onChange={(e) => {
                                    const next = e.target.value;
                                    const parsed = next === '' ? 0 : parseInt(next, 10) || 0;
                                    handleAsignarStock(articulo.id, parsed, { allowZero: next === '' });
                                  }}
                                  inputProps={{
                                    min: 0,
                                    style: { textAlign: 'right' }
                                  }}
                                  sx={{ width: 90 }}
                                  disabled={!seleccionado}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {asignaciones.length > 0 && (
                <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: alpha(verde.primary, 0.06), border: `1px solid ${alpha(verde.primary, 0.35)}` }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Resumen de asignaciones
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Total de artículos:</strong> {asignaciones.length} · <strong>Total de unidades:</strong> {totalAsignaciones}
                  </Typography>
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      borderRadius: 0,
                      border: `1px solid ${alpha(tablaAccent, 0.38)}`,
                      overflow: 'hidden',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
                    }}
                  >
                    <Table
                      size="small"
                      stickyHeader
                      sx={{
                        '& thead': { bgcolor: tablaHeaderBg },
                        '& thead .MuiTableCell-root': {
                          bgcolor: tablaHeaderBg,
                          color: tablaHeaderText,
                          fontWeight: 800,
                          borderBottom: `2px solid ${alpha('#fff', 0.16)}`,
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          letterSpacing: 0.3,
                        },
                        '& tbody .MuiTableCell-root': {
                          borderBottomColor: alpha(tablaAccent, 0.15),
                          fontSize: '0.82rem',
                        },
                        '& tbody .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
                          bgcolor: tablaBodyBg,
                        },
                        '& tbody .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
                          bgcolor: tablaBodyAlt,
                        },
                        '& .MuiTableCell-root': { px: 1, py: 0.7 },
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Código</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {asignaciones
                          .map((a) => {
                            const art = getArticuloSnapshot(Number(a.articuloId));
                            return {
                              ...a,
                              codigo: art?.codigo || '',
                              nombre: art?.nombre || 'Artículo',
                            };
                          })
                          .sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''))
                          .map((row) => (
                            <TableRow key={row.articuloId}>
                              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.codigo || row.articuloId}</TableCell>
                              <TableCell>{row.nombre}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>{row.cantidad}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <CrystalSoftButton baseColor={oroNegro.dark} onClick={() => setAsignaciones([])}>
                      Limpiar todas
                    </CrystalSoftButton>
                  </Box>
                </Paper>
              )}
            </Box>
          </DialogContent>

          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: dividerBottom,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto'
            }}
          />

          <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3, gap: 1.5 }}>
              <CrystalSoftButton baseColor={oroNegro.dark} onClick={handleCerrar} disabled={loading}>
                Cancelar
              </CrystalSoftButton>
              <CrystalButton baseColor={oroNegro.primary} onClick={handleConfirmarAsignaciones} disabled={loading || asignaciones.length === 0 || !destinoSeleccionado} sx={{ minHeight: 44, fontWeight: 800 }}>
                {loading ? 'Asignando…' : `Asignar Stock (${asignaciones.length})`}
              </CrystalButton>
            </Box>
          </DialogActions>
        </Box>
      </TexturedPanel>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'transparent',
            boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          },
        }}
      >
        <TexturedPanel
          accent={oroNegro.primary}
          radius={12}
          contentPadding={0}
          bgTintPercent={16}
          bgAlpha={1}
          textureBaseOpacity={0.28}
          textureBoostOpacity={0.22}
          textureBrightness={1.08}
          textureContrast={1.05}
          tintOpacity={0.42}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <DialogTitle sx={{ p: 0, m: 0, minHeight: 56, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', px: 3, gap: 1.5 }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${oroNegro.primary} 0%, ${darken(oroNegro.primary, 0.18)} 100%)`,
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
                  color: '#fff'
                }}>
                  <Icon icon="mdi:check-decagram" width={20} height={20} />
                </Box>
                <Typography variant="h6" fontWeight={800} color="#ffda74" sx={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                  Confirmar asignaciones
                </Typography>
              </Box>
            </DialogTitle>

            <Divider
              sx={{
                height: DIV_H,
                border: 0,
                backgroundImage: `
                  linear-gradient(to bottom, ${alpha('#fff', 0.68)}, ${alpha('#fff', 0.68)}),
                  linear-gradient(to bottom, ${alpha(darken(oroNegro.primary, 0.5), 0.3)}, ${alpha(darken(oroNegro.primary, 0.5), 0.3)}),
                  linear-gradient(90deg, ${alpha(oroNegro.primary, 0.12)}, ${oroNegro.primary}, ${alpha(oroNegro.primary, 0.12)})
                `,
                backgroundRepeat: 'no-repeat, no-repeat, repeat',
                backgroundSize: '100% 1px, 100% 1px, 100% 100%',
                backgroundPosition: 'top left, bottom left, center',
                flex: '0 0 auto'
              }}
            />

            <DialogContent sx={{ p: 3, background: '#f8fafb' }}>
              <Typography variant="body1" fontWeight={700} color={oroNegro.primary} gutterBottom>
                Vas a aplicar {asignaciones.length} asignaciones ({totalAsignaciones} unidades) al destino seleccionado.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confirmá para actualizar el stock en el punto/deposito elegido.
              </Typography>
            </DialogContent>

            <Divider
              sx={{
                height: DIV_H,
                border: 0,
                backgroundImage: `
                  linear-gradient(to bottom, ${alpha(darken(oroNegro.primary, 0.5), 0.3)}, ${alpha(darken(oroNegro.primary, 0.5), 0.3)}),
                  linear-gradient(to bottom, ${alpha('#fff', 0.68)}, ${alpha('#fff', 0.68)}),
                  linear-gradient(90deg, ${alpha(oroNegro.primary, 0.12)}, ${oroNegro.primary}, ${alpha(oroNegro.primary, 0.12)})
                `,
                backgroundRepeat: 'no-repeat, no-repeat, repeat',
                backgroundSize: '100% 1px, 100% 1px, 100% 100%',
                backgroundPosition: 'top left, bottom left, center',
                flex: '0 0 auto'
              }}
            />

            <DialogActions sx={{ p: 0, m: 0, minHeight: 60 }}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3, gap: 1 }}>
                <CrystalSoftButton baseColor={oroNegro.dark} onClick={() => setConfirmOpen(false)} disabled={loading}>
                  Volver
                </CrystalSoftButton>
                <CrystalButton baseColor={oroNegro.primary} onClick={aplicarAsignaciones} disabled={loading}>
                  {loading ? 'Aplicando…' : 'Confirmar'}
                </CrystalButton>
              </Box>
            </DialogActions>
          </Box>
        </TexturedPanel>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
}
