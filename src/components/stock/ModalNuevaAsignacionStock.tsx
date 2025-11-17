'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useLazyQuery, useQuery } from '@apollo/client/react';
import {
  OBTENER_PROVEEDORES_CON_STOCK,
  OBTENER_RUBROS_POR_PROVEEDOR,
  BUSCAR_ARTICULOS_PARA_ASIGNACION,
  type ObtenerProveedoresConStockResponse,
  type ObtenerRubrosPorProveedorResponse,
  type BuscarArticulosParaAsignacionResponse,
  type ProveedorBasico,
  type RubroBasico,
  type ArticuloFiltrado,
} from '@/components/puntos-mudras/graphql/queries';
import { verde } from '@/ui/colores';

interface AsignacionStock {
  articuloId: number;
  cantidad: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  puntoVenta: any;
  onStockAsignado: () => void;
}

export default function ModalNuevaAsignacionStock({ open, onClose, puntoVenta, onStockAsignado }: Props) {
  // Estados para filtros
  const [proveedores, setProveedores] = useState<ProveedorBasico[]>([]);
  const [rubros, setRubros] = useState<RubroBasico[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ProveedorBasico | null>(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  
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
      getRubros({ variables: { proveedorId: String(proveedorSeleccionado.id) } });
    } else {
      setRubros([]);
      setRubroSeleccionado('');
    }
  }, [proveedorSeleccionado, getRubros]);
  useEffect(() => {
    if (rubrosData?.obtenerRubrosPorProveedor) {
      const list = rubrosData.obtenerRubrosPorProveedor;
      setRubros(list);
      if (list.length === 1) setRubroSeleccionado(list[0].rubro as string);
    }
  }, [rubrosData]);

  const [buscarArticulosQuery, { data: articulosData, loading: buscandoArticulos, error: errorBuscar }] =
    useLazyQuery<BuscarArticulosParaAsignacionResponse>(BUSCAR_ARTICULOS_PARA_ASIGNACION, {
      fetchPolicy: "network-only",
    });

  // Buscar artículos sólo cuando el usuario lo pide (Enter / botón),
  // no en cada pulsación, para que el input no pierda el foco ni se "trabe".
  const buscarArticulos = useCallback(async () => {
    if (!proveedorSeleccionado || busqueda.length < 3) return;
    setError("");
    await buscarArticulosQuery({
      variables: {
        proveedorId: proveedorSeleccionado.id,
        rubro: rubroSeleccionado || null,
        busqueda,
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
    if (event.key === "Enter" && busqueda.length >= 3 && proveedorSeleccionado) {
      event.preventDefault();
      void buscarArticulos();
    }
  };

  const handleAsignarStock = (articuloId: number, cantidad: number) => {
    if (cantidad <= 0) return;

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

  const handleConfirmarAsignaciones = async () => {
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
      for (const asignacion of asignaciones) {
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
            variables: { puntoMudrasId: puntoVenta.id, articuloId: asignacion.articuloId, nuevaCantidad: asignacion.cantidad },
          }),
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
      }
      setSnack({ open: true, msg: `Stock asignado a ${puntoVenta.nombre}`, sev: 'success' });
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
    onClose();
  };

  const getCantidadAsignada = (articuloId: number): number => {
    const asignacion = asignaciones.find(a => a.articuloId === articuloId);
    return asignacion?.cantidad || 0;
  };

  const totalAsignaciones = asignaciones.reduce((total, a) => total + a.cantidad, 0);

  return (
    <Dialog 
      open={open} 
      onClose={handleCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon icon="mdi:package-variant-plus" width={24} />
          <Typography variant="h6">
            Asignar Stock a {puntoVenta?.nombre}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Filtros de Búsqueda
          </Typography>
          
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            {/* Proveedor */}
            <Box flex={1}>
              <Autocomplete
                options={proveedores}
                getOptionLabel={(option) => option.nombre}
                value={proveedorSeleccionado}
                onChange={(_, newValue) => setProveedorSeleccionado(newValue)}
                loading={loadingProveedores}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Proveedor"
                    placeholder="Seleccione un proveedor"
                    required
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
            </Box>

            {/* Rubro */}
            <Box flex={1}>
              <FormControl fullWidth disabled={!proveedorSeleccionado || loadingRubros}>
                <InputLabel>Rubro</InputLabel>
                <Select
                  value={rubroSeleccionado}
                  onChange={(e) => setRubroSeleccionado(e.target.value)}
                  label="Rubro"
                  startAdornment={
                    <InputAdornment position="start">
                      <Icon icon="mdi:tag" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>Todos los rubros</em>
                  </MenuItem>
                  {rubros.map((rubro) => (
                    <MenuItem key={rubro.rubro} value={rubro.rubro}>
                      {rubro.rubro}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Búsqueda */}
            <Box flex={1}>
              <TextField
                fullWidth
                label="Buscar Artículo"
                placeholder="Mínimo 3 caracteres + Enter"
                value={busqueda}
                onChange={(e) => {
                  const value = e.target.value;
                  setBusqueda(value);
                  if (!value) {
                    setArticulos([]);
                  }
                }}
                onKeyPress={handleBusquedaKeyPress}
                disabled={!proveedorSeleccionado}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="mdi:magnify" />
                    </InputAdornment>
                  ),
                }}
                helperText="Presione Enter para buscar"
              />
            </Box>
          </Box>
        </Paper>

        {/* Resultados */}
        {(buscandoArticulos || loading) && (
          <Box display="flex" justifyContent="center" py={4}>
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
                  <TableCell align="right">Stock Disponible</TableCell>
                  <TableCell align="right">Cantidad a Asignar</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articulos.map((articulo) => {
                  const cantidadAsignada = getCantidadAsignada(articulo.id);
                  return (
                    <TableRow key={articulo.id}>
                      <TableCell>{articulo.codigo}</TableCell>
                      <TableCell>{articulo.nombre}</TableCell>
                      <TableCell>
                        <Chip size="small" label={articulo.rubro} />
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
                              max: articulo.stockDisponible,
                              style: { textAlign: 'right' }
                            }}
                            sx={{ width: 80 }}
                          />
                          <Tooltip title={`Asignar máximo (${articulo.stockDisponible})`}>
                            <IconButton size="small" onClick={() => handleAsignarStock(articulo.id, articulo.stockDisponible)}>
                              <Icon icon="mdi:arrow-collapse-down" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {cantidadAsignada > 0 && (
                          <Tooltip title="Remover asignación">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRemoverAsignacion(articulo.id)}
                            >
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

      {/* Resumen de asignaciones */}
      {asignaciones.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Resumen de Asignaciones
          </Typography>
          <Typography variant="body2">
            <strong>Total de artículos:</strong> {asignaciones.length}
          </Typography>
          <Typography variant="body2">
            <strong>Total de unidades:</strong> {totalAsignaciones}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button size="small" variant="outlined" onClick={() => setAsignaciones([])}>Limpiar todas</Button>
            <Button size="small" variant="contained" onClick={() => setAsignaciones(articulos.filter(a => a.stockDisponible > 0).map(a => ({ articuloId: a.id, cantidad: a.stockDisponible })))} sx={{ bgcolor: verde.primary }}>Asignar máximo (lote)</Button>
          </Box>
        </Paper>
      )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCerrar} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirmarAsignaciones}
          disabled={loading || asignaciones.length === 0}
          startIcon={<Icon icon="mdi:check" />}
          sx={{ bgcolor: verde.primary }}
        >
          {loading ? 'Asignando...' : `Asignar Stock (${asignaciones.length})`}
        </Button>
      </DialogActions>
      {/* Confirmación lote */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar asignaciones</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Se aplicarán {asignaciones.length} asignaciones por un total de {totalAsignaciones} unidades al punto “{puntoVenta?.nombre}”.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={aplicarAsignaciones} disabled={loading} sx={{ bgcolor: verde.primary }}>Aplicar</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
}
