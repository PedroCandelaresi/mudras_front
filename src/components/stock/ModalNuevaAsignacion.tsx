'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  Chip,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Autocomplete,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import { Icon } from '@iconify/react';
import { 
  OBTENER_ARTICULOS_DISPONIBLES, 
  CREAR_ASIGNACION_STOCK,
  ObtenerArticulosDisponiblesResponse,
  CrearAsignacionStockInput,
  CrearAsignacionResponse,
  FiltrosArticulosDisponiblesInput
} from '@/queries/stock-puntos-venta';
import { PuntoMudras } from '@/interfaces/puntos-mudras';
import { verde } from '@/ui/colores';

import { ArticuloDisponible } from '@/queries/stock-puntos-venta';

interface Props {
  open: boolean;
  onClose: () => void;
  puntoVenta: PuntoMudras;
  onAsignacionCreada: () => void;
}

type TipoAsignacion = 'cantidad' | 'porcentaje';
type TipoAjuste = 'ninguno' | 'descuento' | 'recargo';

function ModalNuevaAsignacion({ 
  open, 
  onClose, 
  puntoVenta, 
  onAsignacionCreada 
}: Props) {
  const [tabValue, setTabValue] = useState(0);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloDisponible | null>(null);
  const [tipoAsignacion, setTipoAsignacion] = useState<TipoAsignacion>('cantidad');
  const [cantidad, setCantidad] = useState(0);
  const [porcentaje, setPorcentaje] = useState(0);
  const [tipoAjuste, setTipoAjuste] = useState<TipoAjuste>('ninguno');
  const [porcentajeAjuste, setPorcentajeAjuste] = useState(0);
  const [precioPersonalizado, setPrecioPersonalizado] = useState(false);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(0);
  const [stockMaximo, setStockMaximo] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busquedaArticulos, setBusquedaArticulos] = useState('');

  // Query para buscar artículos
  const { data: articulosData, loading: loadingArticulos } = useQuery<ObtenerArticulosDisponiblesResponse>(OBTENER_ARTICULOS_DISPONIBLES, {
    variables: {
      filtros: {
        busqueda: busquedaArticulos,
        soloConStock: true,
        limite: 50
      }
    },
    skip: !busquedaArticulos
  });

  // Mutation para crear asignación
  const [crearAsignacion] = useMutation<CrearAsignacionResponse>(CREAR_ASIGNACION_STOCK);

  useEffect(() => {
    if (articuloSeleccionado) {
      setPrecioVenta(articuloSeleccionado.PrecioVenta);
    }
  }, [articuloSeleccionado]);

  const calcularCantidadAsignada = () => {
    if (!articuloSeleccionado) return 0;
    
    if (tipoAsignacion === 'cantidad') {
      return cantidad;
    } else {
      return Math.floor((articuloSeleccionado.stockDisponible * porcentaje) / 100);
    }
  };

  const calcularPrecioFinal = () => {
    if (!articuloSeleccionado) return 0;
    
    let precio = precioPersonalizado ? precioVenta : articuloSeleccionado.PrecioVenta;
    
    if (tipoAjuste === 'descuento') {
      precio = precio * (1 - porcentajeAjuste / 100);
    } else if (tipoAjuste === 'recargo') {
      precio = precio * (1 + porcentajeAjuste / 100);
    }
    
    return precio;
  };

  const handleGuardar = async () => {
    setError('');
    
    if (!articuloSeleccionado) {
      setError('Debe seleccionar un artículo');
      return;
    }

    const cantidadFinal = calcularCantidadAsignada();
    
    if (cantidadFinal <= 0) {
      setError('La cantidad a asignar debe ser mayor a 0');
      return;
    }

    if (cantidadFinal > articuloSeleccionado.stockDisponible) {
      setError('No hay suficiente stock disponible para esta asignación');
      return;
    }

    setLoading(true);
    
    try {
      // Mutation para crear asignación
      await crearAsignacion({
        variables: {
          input: {
            articuloId: articuloSeleccionado.id,
            puntoVentaId: puntoVenta.id,
            tipoAsignacion: tipoAsignacion,
            cantidad: tipoAsignacion === 'cantidad' ? cantidadFinal : undefined,
            porcentaje: tipoAsignacion === 'porcentaje' ? porcentaje : undefined,
            stockMinimo: stockMinimo,
            stockMaximo: stockMaximo > 0 ? stockMaximo : undefined,
            precioPersonalizado: precioPersonalizado,
            precioVenta: precioPersonalizado ? calcularPrecioFinal() : undefined,
            tipoAjuste: tipoAjuste,
            porcentajeAjuste: tipoAjuste !== 'ninguno' ? porcentajeAjuste : undefined,
            observaciones: observaciones || undefined
          }
        }
      });
      
      onAsignacionCreada();
      handleCerrar();
    } catch (err: any) {
      setError(err.message || 'Error al crear la asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setError('');
    setArticuloSeleccionado(null);
    setTipoAsignacion('cantidad');
    setCantidad(0);
    setPorcentaje(0);
    setTipoAjuste('ninguno');
    setPorcentajeAjuste(0);
    setPrecioPersonalizado(false);
    setPrecioVenta(0);
    setStockMinimo(0);
    setStockMaximo(0);
    setObservaciones('');
    setBusquedaArticulos('');
    setTabValue(0);
    onClose();
  };

  const articulos = articulosData?.obtenerArticulosDisponibles?.articulos || [];

  const cantidadAsignada = calcularCantidadAsignada();
  const precioFinal = calcularPrecioFinal();

  return (
    <Dialog 
      open={open} 
      onClose={handleCerrar}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon icon="mdi:store-plus" color={verde.primary} />
          <Typography variant="h6" fontWeight={600}>
            Nueva Asignación - {puntoVenta.nombre}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Asignar artículo al punto de venta
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Selección de Artículo" />
          <Tab label="Configuración de Stock" disabled={!articuloSeleccionado} />
          <Tab label="Precios y Ajustes" disabled={!articuloSeleccionado} />
        </Tabs>

        {/* Tab 0: Selección de Artículo */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Buscar y Seleccionar Artículo
            </Typography>
            
            <Autocomplete
              options={articulos}
              getOptionLabel={(option) => `${option.Codigo} - ${option.Descripcion}`}
              value={articuloSeleccionado}
              onChange={(event, newValue) => setArticuloSeleccionado(newValue)}
              inputValue={busquedaArticulos}
              onInputChange={(event, newInputValue) => setBusquedaArticulos(newInputValue)}
              loading={loadingArticulos}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar artículo por código o descripción"
                  placeholder="Escriba para buscar..."
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="mdi:magnify" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {option.Codigo} - {option.Descripcion}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stock disponible: {option.stockDisponible} | Precio: ${option.PrecioVenta.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
              sx={{ mb: 2 }}
            />

            {articuloSeleccionado && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Artículo Seleccionado
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2"><strong>Código:</strong> {articuloSeleccionado.Codigo}</Typography>
                    <Typography variant="body2"><strong>Descripción:</strong> {articuloSeleccionado.Descripcion}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2"><strong>Stock Total:</strong> {articuloSeleccionado.stockTotal}</Typography>
                    <Typography variant="body2"><strong>Stock Disponible:</strong> {articuloSeleccionado.stockDisponible}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        )}

        {/* Tab 1: Configuración de Stock */}
        {tabValue === 1 && articuloSeleccionado && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Configuración de Stock
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Asignación</InputLabel>
              <Select
                value={tipoAsignacion}
                onChange={(e) => setTipoAsignacion(e.target.value as TipoAsignacion)}
                label="Tipo de Asignación"
              >
                <MenuItem value="cantidad">Cantidad Específica</MenuItem>
                <MenuItem value="porcentaje">Porcentaje del Stock Disponible</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              {tipoAsignacion === 'cantidad' ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Cantidad a Asignar"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(0, parseInt(e.target.value) || 0))}
                    fullWidth
                    inputProps={{ 
                      min: 0, 
                      max: articuloSeleccionado.stockDisponible 
                    }}
                    helperText={`Máximo disponible: ${articuloSeleccionado.stockDisponible}`}
                  />
                </Grid>
              ) : (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Porcentaje del Stock"
                    type="number"
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ min: 0, max: 100 }}
                    helperText={`Cantidad resultante: ${cantidadAsignada}`}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Stock Mínimo"
                  type="number"
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(Math.max(0, parseInt(e.target.value) || 0))}
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Alerta cuando el stock baje de este nivel"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Stock Máximo (Opcional)"
                  type="number"
                  value={stockMaximo}
                  onChange={(e) => setStockMaximo(Math.max(0, parseInt(e.target.value) || 0))}
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Límite máximo para este punto de venta"
                />
              </Grid>
            </Grid>

            {/* Resumen de Asignación */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Resumen de Asignación
              </Typography>
              <Typography variant="body2">
                <strong>Cantidad a asignar:</strong> {cantidadAsignada} unidades
              </Typography>
              <Typography variant="body2">
                <strong>Stock restante disponible:</strong> {articuloSeleccionado.stockDisponible - cantidadAsignada} unidades
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Tab 2: Precios y Ajustes */}
        {tabValue === 2 && articuloSeleccionado && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Precios y Ajustes
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={precioPersonalizado}
                  onChange={(e) => setPrecioPersonalizado(e.target.checked)}
                />
              }
              label="Usar precio personalizado para este punto de venta"
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Precio de Venta"
                  type="number"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(Math.max(0, parseFloat(e.target.value) || 0))}
                  fullWidth
                  disabled={!precioPersonalizado}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText={precioPersonalizado ? "Precio personalizado" : `Precio base: $${articuloSeleccionado.PrecioVenta.toLocaleString()}`}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Ajuste</InputLabel>
                  <Select
                    value={tipoAjuste}
                    onChange={(e) => setTipoAjuste(e.target.value as TipoAjuste)}
                    label="Tipo de Ajuste"
                  >
                    <MenuItem value="ninguno">Sin ajuste</MenuItem>
                    <MenuItem value="descuento">Descuento</MenuItem>
                    <MenuItem value="recargo">Recargo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {tipoAjuste !== 'ninguno' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={`Porcentaje de ${tipoAjuste}`}
                    type="number"
                    value={porcentajeAjuste}
                    onChange={(e) => setPorcentajeAjuste(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Observaciones"
                  multiline
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  fullWidth
                  placeholder="Notas adicionales sobre esta asignación..."
                />
              </Grid>
            </Grid>

            {/* Resumen Final */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#f3e5f5', border: '1px solid #9c27b0' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Resumen Final
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2"><strong>Cantidad:</strong> {cantidadAsignada} unidades</Typography>
                  <Typography variant="body2"><strong>Precio base:</strong> ${articuloSeleccionado.PrecioVenta.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2"><strong>Precio final:</strong> ${precioFinal.toLocaleString()}</Typography>
                  <Typography variant="body2"><strong>Valor total:</strong> ${(precioFinal * cantidadAsignada).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCerrar} disabled={loading}>
          Cancelar
        </Button>
        {tabValue < 2 ? (
          <Button 
            onClick={() => setTabValue(tabValue + 1)}
            variant="contained"
            disabled={tabValue === 0 && !articuloSeleccionado}
            sx={{ 
              bgcolor: verde.primary,
              '&:hover': { bgcolor: verde.primaryHover }
            }}
          >
            Siguiente
          </Button>
        ) : (
          <Button 
            onClick={handleGuardar}
            variant="contained"
            disabled={loading || !articuloSeleccionado || cantidadAsignada <= 0}
            sx={{ 
              bgcolor: verde.primary,
              '&:hover': { bgcolor: verde.primaryHover }
            }}
          >
            {loading ? 'Creando Asignación...' : 'Crear Asignación'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ModalNuevaAsignacion;
