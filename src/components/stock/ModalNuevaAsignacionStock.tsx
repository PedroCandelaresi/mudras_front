'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import {
  OBTENER_PROVEEDORES_CON_STOCK,
  BUSCAR_ARTICULOS_PARA_ASIGNACION,
  OBTENER_PUNTOS_MUDRAS,
  OBTENER_RUBROS_POR_PROVEEDOR,
  type ObtenerProveedoresConStockResponse,
  type BuscarArticulosParaAsignacionResponse,
  type ProveedorBasico,
  type ArticuloFiltrado,
  type ObtenerPuntosMudrasResponse,
  type PuntoMudras,
  type ObtenerRubrosPorProveedorResponse,
} from '@/components/puntos-mudras/graphql/queries';
import { ASIGNAR_STOCK_MASIVO } from '@/components/puntos-mudras/graphql/mutations';
import { verde } from '@/ui/colores';

interface AsignacionStock {
  articuloId: number;
  cantidad: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  destinoId?: number | null; // Pre-selected destination ID (optional)
  onStockAsignado: () => void;
  titulo?: string;
  tipoDestinoPreferido?: 'venta' | 'deposito';
  articuloPreseleccionado?: { id: number; codigo: string; nombre: string; proveedorId?: number | null; rubro?: string | null } | null;
  origen?: 'venta' | 'deposito' | 'articulo';
}

export default function ModalNuevaAsignacionStock({ open, onClose, destinoId, onStockAsignado, titulo, tipoDestinoPreferido, articuloPreseleccionado, origen }: Props) {
  // --- Estados de Filtros ---
  const [proveedores, setProveedores] = useState<ProveedorBasico[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ProveedorBasico | null>(null);
  const [rubros, setRubros] = useState<{ rubro: string }[]>([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  // --- Estados de Destino (Multi-select) ---
  const [destinosSeleccionados, setDestinosSeleccionados] = useState<PuntoMudras[]>([]);

  // --- Estados de Datos ---
  const [articulos, setArticulos] = useState<ArticuloFiltrado[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionStock[]>([]);

  // --- Estados de UI ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>(() => ({ open: false, msg: '', sev: 'success' }));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingRubros, setLoadingRubros] = useState(false);

  // --- GraphQL Queries ---
  const { data: proveedoresData } = useQuery<ObtenerProveedoresConStockResponse>(OBTENER_PROVEEDORES_CON_STOCK, {
    skip: !open,
    fetchPolicy: 'cache-and-network'
  });

  const [obtenerRubros, { data: rubrosData }] = useLazyQuery<ObtenerRubrosPorProveedorResponse>(OBTENER_RUBROS_POR_PROVEEDOR, {
    fetchPolicy: 'network-only'
  });

  const [buscarArticulosQuery, { data: articulosData, loading: buscandoArticulos }] =
    useLazyQuery<BuscarArticulosParaAsignacionResponse>(BUSCAR_ARTICULOS_PARA_ASIGNACION, {
      fetchPolicy: "network-only",
    });

  const { data: puntosData } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS, {
    fetchPolicy: 'cache-and-network',
    skip: !open,
  });

  const [asignarMasivoMutation] = useMutation<{ asignarStockMasivo: boolean }>(ASIGNAR_STOCK_MASIVO);

  // --- Effects: Data Loading ---

  // Cargar puntos y preseleccionar si corresponde
  useEffect(() => {
    if (!open || !puntosData?.obtenerPuntosMudras) return;

    const todosLosPuntos = puntosData.obtenerPuntosMudras.filter(p => p.activo);

    // Filtro por preferencia o origen si es necesario, aunque en multi-select mostremos todos
    // Pero si viene un destinoId, lo preseleccionamos
    if (destinoId && destinosSeleccionados.length === 0) {
      const target = todosLosPuntos.find(p => Number(p.id) === Number(destinoId));
      if (target) setDestinosSeleccionados([target]);
    }
  }, [open, puntosData, destinoId]);

  // Cargar proveedores
  useEffect(() => {
    if (proveedoresData?.obtenerProveedoresConStock) {
      setProveedores(proveedoresData.obtenerProveedoresConStock.map(p => ({
        ...p,
        id: Number(p.id)
      })));
    }
  }, [proveedoresData]);

  // Cargar rubros al seleccionar proveedor
  useEffect(() => {
    if (proveedorSeleccionado) {
      setLoadingRubros(true);
      obtenerRubros({ variables: { proveedorId: proveedorSeleccionado.id } })
        .catch(err => console.error("Error cargando rubros", err))
        .finally(() => setLoadingRubros(false));
    } else {
      setRubros([]);
      setRubroSeleccionado('');
    }
  }, [proveedorSeleccionado, obtenerRubros]);

  useEffect(() => {
    if (rubrosData?.obtenerRubrosPorProveedor) {
      setRubros(rubrosData.obtenerRubrosPorProveedor);
      // Auto-select si solo hay uno
      if (rubrosData.obtenerRubrosPorProveedor.length === 1) {
        setRubroSeleccionado(rubrosData.obtenerRubrosPorProveedor[0].rubro);
      } else {
        setRubroSeleccionado(''); // Reset si cambian las opciones
      }
    }
  }, [rubrosData]);

  // Prellenado desde articuloPreseleccionado
  useEffect(() => {
    if (!open || !articuloPreseleccionado) return;

    // Si hay un proveedor predefinido, buscarlo
    if (articuloPreseleccionado.proveedorId && proveedores.length > 0) {
      const p = proveedores.find(pr => Number(pr.id) === Number(articuloPreseleccionado.proveedorId));
      if (p) setProveedorSeleccionado(p);
    }

    // Rubro se seteará cuando carguen los rubros del proveedor (podría necesitar un efecto adicional o logica de espera, 
    // pero usualmente el usuario seleccionará manual si falla)
    // El articuloPreseleccionado también setea la búsqueda
    setBusqueda(articuloPreseleccionado.codigo || articuloPreseleccionado.nombre || '');
  }, [open, articuloPreseleccionado, proveedores]);


  // --- Actions ---

  const buscarArticulos = useCallback(async () => {
    // Validar minimos para buscar
    if (!proveedorSeleccionado && busqueda.trim().length < 3) {
      // Si no hay proveedor, exigimos al menos 3 caracteres de busqueda
      return;
    }

    setError("");
    const term = busqueda.trim();

    try {
      await buscarArticulosQuery({
        variables: {
          proveedorId: proveedorSeleccionado ? Number(proveedorSeleccionado.id) : null,
          rubro: rubroSeleccionado || null,
          busqueda: term || null,
          destinoId: destinosSeleccionados.length === 1 ? Number(destinosSeleccionados[0].id) : null, // Solo enviamos destino si es unico para ver stock actual
        },
      });
    } catch (e: any) {
      setError(e.message);
    }
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda, destinosSeleccionados, buscarArticulosQuery]);

  // Auto-buscar si hay filtros suficientes
  useEffect(() => {
    // Debounce simple o condicion de triggers
    if (proveedorSeleccionado) {
      void buscarArticulos();
    } else if (busqueda.length >= 3) {
      const timer = setTimeout(() => {
        void buscarArticulos();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setArticulos([]);
    }
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda]); // Quitamos buscarArticulos de deps para evitar loop si no es memoized

  useEffect(() => {
    if (articulosData?.buscarArticulosParaAsignacion) {
      setArticulos(articulosData.buscarArticulosParaAsignacion.map(a => ({
        ...a,
        id: Number(a.id),
        stockDisponible: Number(a.stockDisponible ?? 0),
        stockEnDestino: Number(a.stockEnDestino ?? 0),
      })));
    }
  }, [articulosData]);

  const handleAsignarStock = (articuloId: number, cantidad: string) => {
    if (cantidad !== '' && !/^\d*[.,]?\d*$/.test(cantidad)) return;

    const asignacionExistente = asignaciones.find(a => a.articuloId === articuloId);

    if (asignacionExistente) {
      if (cantidad === '' || parseFloat(cantidad) === 0) {
        setAsignaciones(prev => prev.filter(a => a.articuloId !== articuloId));
      } else {
        setAsignaciones(prev =>
          prev.map(a =>
            a.articuloId === articuloId
              ? { ...a, cantidad }
              : a
          )
        );
      }
    } else {
      if (cantidad !== '' && parseFloat(cantidad) > 0) {
        setAsignaciones(prev => [...prev, { articuloId, cantidad }]);
      }
    }
  };

  const confirmarAplicacion = async () => {
    setLoading(true);
    setError('');

    try {
      if (destinosSeleccionados.length === 0) throw new Error('Debe seleccionar al menos un destino');

      const errores: string[] = [];
      let exitos = 0;

      // Iteramos por cada destino seleccionado para aplicar la asignacion
      // Esto es secuencial para no saturar si son muchos (aunque suelen ser pocos)
      for (const destino of destinosSeleccionados) {
        try {
          const payload = {
            puntoMudrasId: Number(destino.id),
            asignaciones: asignaciones.map(a => ({
              articuloId: Number(a.articuloId),
              cantidad: parseFloat(a.cantidad) || 0
            })),
            motivo: 'Asignación masiva (Multi-destino)'
          };

          const { data } = await asignarMasivoMutation({
            variables: { input: payload }
          });

          if (data?.asignarStockMasivo) {
            exitos++;
          } else {
            errores.push(`Falló asignación para ${destino.nombre}`);
          }

        } catch (e: any) {
          console.error(`Error asignando a ${destino.nombre}:`, e);
          errores.push(`${destino.nombre}: ${e.message}`);
        }
      }

      if (errores.length > 0) {
        setError(`Se completaron ${exitos} destinos. Errores: ${errores.join(', ')}`);
        setSnack({ open: true, msg: 'Hubo errores en la asignación', sev: 'info' });
        // No cerramos si hubo error parcial para permitir reintentar o ver que pasó
        if (exitos > 0) {
          // Limpiamos las asignaciones si al menos uno pasò? Mejor no, para no perder info
          onStockAsignado(); // Refrescar tablas de fondo
        }
      } else {
        setSnack({ open: true, msg: `Stock asignado correctamente a ${exitos} destinos`, sev: 'success' });
        onStockAsignado();
        handleCerrar();
      }

    } catch (e: any) {
      setError(e.message);
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
    // No reseteamos destinosSeleccionados si vino por props, pero si es manual si?
    // Mejor resetear todo para limpieza
    if (!destinoId) setDestinosSeleccionados([]);
    onClose();
  };

  // Calcular totales
  const totalUnidades = asignaciones.reduce((acc, curr) => acc + (parseFloat(curr.cantidad) || 0), 0);
  const totalAsignarGlobal = totalUnidades * destinosSeleccionados.length;

  const puntosDisponibles = useMemo(() => {
    const all = (puntosData?.obtenerPuntosMudras || []).filter(p => p.activo);
    // Filtrar por preferencia si se quiere, o dejar todos
    // Si tipoDestinoPreferido es 'venta', podriamos ordenar primero los de venta
    return all.sort((a, b) => {
      if (tipoDestinoPreferido && a.tipo === tipoDestinoPreferido && b.tipo !== tipoDestinoPreferido) return -1;
      if (tipoDestinoPreferido && a.tipo !== tipoDestinoPreferido && b.tipo === tipoDestinoPreferido) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [puntosData, tipoDestinoPreferido]);

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 4,
        sx: {
          borderRadius: 0,
          bgcolor: '#ffffff',
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      {/* HEADER VERDE */}
      <Box sx={{
        bgcolor: verde.primary,
        color: '#ffffff',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `4px solid ${verde.headerBorder}`,
        borderRadius: 0,
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon icon="mdi:package-variant-plus" width={24} height={24} />
          <Box>
            <Typography variant="h6" fontWeight={600} letterSpacing={0.5}>
              {titulo || 'ASIGNACIÓN DE STOCK'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
              {destinosSeleccionados.length > 0
                ? `${destinosSeleccionados.length} destinos seleccionados`
                : 'Seleccione destinos'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleCerrar} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 0 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* SECCIÓN DESTINO MULTIPLE */}
          <Box p={2} bgcolor="#fff" border="1px solid #e0e0e0">
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2} textTransform="uppercase">
              Destinos ({destinosSeleccionados.length})
            </Typography>
            <Autocomplete
              multiple
              options={puntosDisponibles}
              disableCloseOnSelect
              getOptionLabel={(option) => `${option.nombre} (${option.tipo})`}
              value={destinosSeleccionados}
              onChange={(_, newValue) => setDestinosSeleccionados(newValue)}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Seleccionar Puntos de Venta / Depósitos" placeholder="Destinos" />
              )}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox style={{ marginRight: 8 }} checked={selected} />
                  {option.nombre} ({option.tipo})
                </li>
              )}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 0 }
              }}
            />
          </Box>

          {/* SECCIÓN FILTROS */}
          <Box p={2} bgcolor="#fff" border="1px solid #e0e0e0">
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2} textTransform="uppercase">
              Búsqueda de Artículos
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={2}>
              <Autocomplete
                options={proveedores}
                getOptionLabel={(option) => option.nombre}
                value={proveedorSeleccionado}
                onChange={(_, newValue) => setProveedorSeleccionado(newValue)}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="Proveedor" placeholder="Seleccione..." InputProps={{ ...params.InputProps, sx: { borderRadius: 0 } }} />
                )}
              />

              <FormControl fullWidth size="small" disabled={!proveedorSeleccionado || loadingRubros}>
                <InputLabel>Rubro</InputLabel>
                <Select
                  value={rubroSeleccionado}
                  onChange={(e) => setRubroSeleccionado(e.target.value)}
                  label="Rubro"
                  sx={{ borderRadius: 0 }}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {rubros.map((r) => (<MenuItem key={r.rubro} value={r.rubro}>{r.rubro}</MenuItem>))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Buscar Artículo"
                placeholder="Nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void buscarArticulos(); }}
                InputProps={{
                  sx: { borderRadius: 0 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => void buscarArticulos()} edge="end">
                        <Icon icon="mdi:magnify" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>

          {buscandoArticulos && <Typography align="center">Buscando artículos...</Typography>}

          {articulos.length > 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0', maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>CÓDIGO</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>DESCRIPCIÓN</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>RUBRO</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>STOCK DISP.</TableCell>
                    {destinosSeleccionados.length === 1 && (
                      <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>EN DESTINO</TableCell>
                    )}
                    <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>ASIGNAR (c/u)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {articulos.map((articulo) => {
                    const asignacion = asignaciones.find((a) => Number(a.articuloId) === Number(articulo.id));
                    const cantidad = asignacion?.cantidad || '';

                    // Validacion visual de disponibilidad global
                    const totalRequerido = (parseFloat(cantidad) || 0) * (destinosSeleccionados.length || 1);
                    const isExcedido = totalRequerido > articulo.stockDisponible;

                    return (
                      <TableRow key={articulo.id} hover selected={!!asignacion}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{articulo.codigo}</TableCell>
                        <TableCell>{articulo.nombre}</TableCell>
                        <TableCell>{articulo.rubro}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={articulo.stockDisponible}
                            color={articulo.stockDisponible > 0 ? "success" : "default"}
                            variant="outlined"
                            sx={{ borderRadius: 0 }}
                          />
                        </TableCell>
                        {destinosSeleccionados.length === 1 && (
                          <TableCell align="right">
                            {articulo.stockEnDestino}
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <TextField
                            size="small"
                            value={cantidad}
                            onChange={(e) => handleAsignarStock(articulo.id, e.target.value)}
                            placeholder="0"
                            error={isExcedido}
                            helperText={isExcedido ? 'Sin stock suficiente' : ''}
                            sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 0, bgcolor: !!asignacion ? '#e8f5e9' : 'transparent' } }}
                            inputMode="decimal"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* FOOTER RESUMEN */}
          {asignaciones.length > 0 && (
            <Box p={2} bgcolor={alpha(verde.primary, 0.08)} border={`1px solid ${verde.primary}`} display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color={verde.textStrong}>Resumen de Asignación</Typography>
                <Typography variant="body2">
                  Artículos: <b>{asignaciones.length}</b> | Unidades por Destino: <b>{totalUnidades}</b> <br />
                  Total Global a descontar: <b>{totalAsignarGlobal}</b> unidades ({destinosSeleccionados.length} destinos)
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setConfirmOpen(true)}
                disabled={destinosSeleccionados.length === 0}
                sx={{ bgcolor: verde.primary, fontWeight: 700, borderRadius: 0, '&:hover': { bgcolor: verde.primaryHover } }}
              >
                CONFIRMAR
              </Button>
            </Box>
          )}

        </Box>
      </DialogContent>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box p={3}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Confirmar Asignación Masiva</Typography>
          <Typography variant="body2" mb={2}>
            Vas a asignar stock a <strong>{destinosSeleccionados.length}</strong> destinos.<br />
            Total global de unidades a mover: <strong>{totalAsignarGlobal}</strong>.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción descontará stock del depósito central y lo sumará a cada destino seleccionado.
          </Alert>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void confirmarAplicacion()}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar'}
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
