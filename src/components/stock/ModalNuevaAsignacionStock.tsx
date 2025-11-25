'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useLazyQuery, useQuery } from '@apollo/client/react';
import {
  OBTENER_PROVEEDORES_CON_STOCK,
  OBTENER_RUBROS_POR_PROVEEDOR,
  BUSCAR_ARTICULOS_PARA_ASIGNACION,
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerProveedoresConStockResponse,
  type ObtenerRubrosPorProveedorResponse,
  type BuscarArticulosParaAsignacionResponse,
  type ProveedorBasico,
  type RubroBasico,
  type ArticuloFiltrado,
  type ObtenerPuntosMudrasResponse,
  type PuntoMudras,
} from '@/components/puntos-mudras/graphql/queries';
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
  // Estados para filtros
  const [proveedores, setProveedores] = useState<ProveedorBasico[]>([]);
  const [rubros, setRubros] = useState<string[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ProveedorBasico | null>(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<number | null>(destinoId ?? null);
  
  // Estados para artículos y asignaciones
  const [articulos, setArticulos] = useState<ArticuloFiltrado[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionStock[]>([]);
  const [loading, setLoading] = useState(false);
  // (loadingProveedores/loadingRubros provienen de los hooks de Apollo)
  const [error, setError] = useState<string>('');
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success'|'error'|'info' }>(() => ({ open: false, msg: '', sev: 'success' }));
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Cargar proveedores al abrir el modal
  // Apollo: cargar proveedores al abrir
  const { data: proveedoresData, loading: loadingProveedores } = useQuery<ObtenerProveedoresConStockResponse>(OBTENER_PROVEEDORES_CON_STOCK, { skip: !open, fetchPolicy: 'cache-and-network' });
  useEffect(() => {
    if (!open) return;
    setProveedores(proveedoresData?.obtenerProveedoresConStock ?? []);
  }, [open, proveedoresData]);

  // Cargar rubros cuando se selecciona un proveedor
  const [getRubros, { data: rubrosData, loading: loadingRubros }] = useLazyQuery<ObtenerRubrosPorProveedorResponse>(OBTENER_RUBROS_POR_PROVEEDOR, { fetchPolicy: 'network-only' });
  useEffect(() => {
    if (proveedorSeleccionado) {
      const proveedorId = Number(proveedorSeleccionado.id);
      getRubros({ variables: { proveedorId } });
    } else {
      setRubros([]);
      setRubroSeleccionado('');
    }
  }, [proveedorSeleccionado, getRubros]);
  useEffect(() => {
    if (rubrosData?.obtenerRubrosPorProveedor) {
      const list = rubrosData.obtenerRubrosPorProveedor.map(({ rubro }) => rubro || '');
      setRubros(list);
      if (list.length === 1) setRubroSeleccionado(list[0] ?? '');
    }
  }, [rubrosData]);

  const [buscarArticulosQuery, { data: articulosData, loading: buscandoArticulos, error: errorBuscar }] =
    useLazyQuery<BuscarArticulosParaAsignacionResponse>(BUSCAR_ARTICULOS_PARA_ASIGNACION, {
      fetchPolicy: "network-only",
    });

  const { data: puntosData } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS, {
    fetchPolicy: 'cache-and-network',
    skip: !open,
  });
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
    await buscarArticulosQuery({
      variables: {
        proveedorId: proveedorSeleccionado?.id ?? null,
        rubro: rubroSeleccionado.trim() || null,
        busqueda: term || null,
      },
    });
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda, buscarArticulosQuery]);
  useEffect(() => {
    if (articulosData?.buscarArticulosParaAsignacion) {
      setArticulos(articulosData.buscarArticulosParaAsignacion as any[]);
    }
  }, [articulosData]);
  useEffect(() => {
    if (errorBuscar) setError(errorBuscar.message);
  }, [errorBuscar]);

  // Limpiar lista de artículos cuando se cambia de proveedor
  useEffect(() => {
    if (!proveedorSeleccionado) {
      setArticulos([]);
      setBusqueda("");
    }
  }, [proveedorSeleccionado]);

  const handleBusquedaKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void buscarArticulos();
    }
  };

  const handleAsignarStock = (articuloId: number, cantidad: number) => {
    if (cantidad <= 0) {
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

  const toggleSeleccion = (articulo: ArticuloFiltrado, checked: boolean) => {
    if (checked) {
      const ya = asignaciones.find(a => a.articuloId === articulo.id);
      if (!ya) setAsignaciones(prev => [...prev, { articuloId: articulo.id, cantidad: 1 }]);
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

  const aplicarAsignaciones = async () => {
    setLoading(true);
    setError('');

    try {
      // Procesamos en serie para evitar solapar la actualización del stock por destino.
      for (const asignacion of asignaciones) {
        const articulo = articulos.find(a => a.id === asignacion.articuloId);
        const base = Number(articulo?.stockDisponible ?? 0);
        const nuevaCantidad = base + asignacion.cantidad;
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              mutation ModificarStockPunto($puntoMudrasId: Int!, $articuloId: Int!, $nuevaCantidad: Float!) {
                modificarStockPunto(
                  puntoMudrasId: $puntoMudrasId,
                  articuloId: $articuloId,
                  nuevaCantidad: $nuevaCantidad
                )
              }
            `,
            variables: { puntoMudrasId: destinoSeleccionado, articuloId: asignacion.articuloId, nuevaCantidad },
          }),
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
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
          <DialogTitle sx={{ p: 0, m: 0, minHeight: 60, display: 'flex', alignItems: 'center' }}>
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

          <DialogContent sx={{ p: 0, overflow: 'auto', maxHeight: 'calc(85vh - 120px)', background: '#f8fafb' }}>
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ p: { xs: 3, md: 4 }, display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr auto' }, gap: 1 }}>
              <TextField
                fullWidth
                label="Artículo (escáner)"
                placeholder="Escaneá código o escribí y Enter"
                value={busqueda}
                  autoFocus
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
                  options={proveedores}
                  getOptionLabel={(option) => option.nombre}
                  value={proveedorSeleccionado}
                  onChange={(_, newValue) => setProveedorSeleccionado(newValue)}
                  loading={loadingProveedores}
                  disabled={Boolean(articuloPreseleccionado?.proveedorId)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Proveedor"
                      placeholder="Buscá proveedor"
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
                  options={rubros}
                  getOptionLabel={(r) => r || ''}
                  value={rubroSeleccionado || ''}
                  onChange={(_, val) => setRubroSeleccionado(val ?? '')}
                  disabled={!proveedorSeleccionado || Boolean(articuloPreseleccionado?.rubro)}
                  loading={loadingRubros}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rubro"
                      placeholder={proveedorSeleccionado ? 'Filtrá por rubro' : 'Elegí proveedor primero'}
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

              {articulos.length > 0 && (
                <TableContainer component={Paper} elevation={1}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Rubro</TableCell>
                        <TableCell align="right">Precio</TableCell>
                        <TableCell align="right">Stock destino</TableCell>
                        <TableCell align="right">Asignar</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {articulos.map((articulo) => {
                        const cantidadAsignada = getCantidadAsignada(articulo.id);
                        const seleccionado = cantidadAsignada > 0;
                        return (
                          <TableRow key={articulo.id}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={seleccionado}
                                onChange={(e) => toggleSeleccion(articulo, e.target.checked)}
                              />
                            </TableCell>
                            <TableCell>{articulo.codigo}</TableCell>
                            <TableCell>{articulo.nombre}</TableCell>
                            <TableCell>
                              <Chip size="small" label={(articulo as any)?.rubro || '—'} />
                            </TableCell>
                            <TableCell align="right">
                              ${articulo.precio.toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                size="small"
                                label={articulo.stockDisponible}
                                color={articulo.stockDisponible > 0 ? 'success' : 'error'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={cantidadAsignada}
                                  onChange={(e) => handleAsignarStock(articulo.id, parseInt(e.target.value) || 0)}
                                  inputProps={{
                                    min: 0,
                                    style: { textAlign: 'right' }
                                  }}
                                  sx={{ width: 90 }}
                                  disabled={!seleccionado}
                                />
                                <Tooltip title={`Asignar máximo (stock destino ${articulo.stockDisponible})`}>
                                  <IconButton size="small" onClick={() => handleAsignarStock(articulo.id, articulo.stockDisponible)}>
                                    <Icon icon="mdi:arrow-collapse-down" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {cantidadAsignada > 0 && (
                                <Tooltip title="Remover asignación">
                                  <IconButton size="small" color="error" onClick={() => handleRemoverAsignacion(articulo.id)}>
                                    <Icon icon="mdi:delete" />
                                  </IconButton>
                                </Tooltip>
                              )}
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
                  <Typography variant="body2">
                    <strong>Total de artículos:</strong> {asignaciones.length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total de unidades:</strong> {totalAsignaciones}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <CrystalSoftButton baseColor={azul.primary} onClick={() => setAsignaciones([])}>
                      Limpiar todas
                    </CrystalSoftButton>
                    <CrystalButton baseColor={verde.primary} onClick={() => setAsignaciones(articulos.filter(a => a.stockDisponible > 0).map(a => ({ articuloId: a.id, cantidad: a.stockDisponible })))}>
                      Asignar máximo (lote)
                    </CrystalButton>
                  </Box>
                </Paper>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 0, m: 0, minHeight: 60 }}>
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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar asignaciones</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Se aplicarán {asignaciones.length} asignaciones por un total de {totalAsignaciones} unidades al destino seleccionado.</Typography>
        </DialogContent>
        <DialogActions>
          <CrystalSoftButton baseColor={azul.primary} onClick={() => setConfirmOpen(false)}>Cancelar</CrystalSoftButton>
          <CrystalButton baseColor={verde.primary} onClick={aplicarAsignaciones} disabled={loading}>Aplicar</CrystalButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
}
