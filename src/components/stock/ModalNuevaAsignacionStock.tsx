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
  Autocomplete
} from '@mui/material';
import { Icon } from '@iconify/react';
import { verde } from '@/ui/colores';

interface ProveedorBasico {
  id: number;
  nombre: string;
  codigo?: number;
}

interface RubroBasico {
  rubro: string;
}

interface ArticuloFiltrado {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stockTotal: number;
  stockAsignado: number;
  stockDisponible: number;
  rubro: string;
  proveedor: string;
}

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
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [loadingRubros, setLoadingRubros] = useState(false);
  const [error, setError] = useState<string>('');

  // Cargar proveedores al abrir el modal
  useEffect(() => {
    if (open) {
      cargarProveedores();
    }
  }, [open]);

  // Cargar rubros cuando se selecciona un proveedor
  useEffect(() => {
    if (proveedorSeleccionado) {
      cargarRubrosPorProveedor(proveedorSeleccionado.id);
    } else {
      setRubros([]);
      setRubroSeleccionado('');
    }
  }, [proveedorSeleccionado]);

  const buscarArticulos = useCallback(async () => {
    if (!proveedorSeleccionado || busqueda.length < 3) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query BuscarArticulosParaAsignacion($proveedorId: Int, $rubro: String, $busqueda: String) {
              buscarArticulosParaAsignacion(proveedorId: $proveedorId, rubro: $rubro, busqueda: $busqueda) {
                id
                nombre
                codigo
                precio
                stockTotal
                stockAsignado
                stockDisponible
                rubro
                proveedor
              }
            }
          `,
          variables: {
            proveedorId: proveedorSeleccionado.id,
            rubro: rubroSeleccionado || null,
            busqueda,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setArticulos(result.data.buscarArticulosParaAsignacion || []);
      console.log(`🔍 Encontrados ${result.data.buscarArticulosParaAsignacion?.length || 0} artículos`);
    } catch (error) {
      console.error('Error al buscar artículos:', error);
      setError('Error al buscar artículos');
    } finally {
      setLoading(false);
    }
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda]);

  // Buscar artículos cuando se aplican filtros
  useEffect(() => {
    if (proveedorSeleccionado && busqueda.length >= 3) {
      buscarArticulos();
    } else {
      setArticulos([]);
    }
  }, [proveedorSeleccionado, busqueda, buscarArticulos]);

  const cargarProveedores = async () => {
    setLoadingProveedores(true);
    setError('');
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ObtenerProveedoresConStock {
              obtenerProveedoresConStock {
                id
                nombre
                codigo
              }
            }
          `
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setProveedores(result.data.obtenerProveedoresConStock || []);
      console.log(`🏭 Cargados ${result.data.obtenerProveedoresConStock?.length || 0} proveedores`);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError('Error al cargar la lista de proveedores');
    } finally {
      setLoadingProveedores(false);
    }
  };

  const cargarRubrosPorProveedor = async (proveedorId: number) => {
    setLoadingRubros(true);
    setError('');
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ObtenerRubrosPorProveedor($proveedorId: Int!) {
              obtenerRubrosPorProveedor(proveedorId: $proveedorId) {
                rubro
              }
            }
          `,
          variables: { proveedorId }
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const rubrosData = result.data.obtenerRubrosPorProveedor || [];
      setRubros(rubrosData);
      
      // Si solo hay un rubro, seleccionarlo automáticamente
      if (rubrosData.length === 1) {
        setRubroSeleccionado(rubrosData[0].rubro);
      } else {
        setRubroSeleccionado('');
      }
      
      console.log(`📋 Cargados ${rubrosData.length} rubros para proveedor ${proveedorId}`);
    } catch (error) {
      console.error('Error al cargar rubros:', error);
      setError('Error al cargar los rubros del proveedor');
    } finally {
      setLoadingRubros(false);
    }
  };

  const handleBusquedaKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && busqueda.length >= 3 && proveedorSeleccionado) {
      buscarArticulos();
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

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Enviando asignaciones:', asignaciones);
      
      // Procesar cada asignación
      for (const asignacion of asignaciones) {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
            variables: {
              puntoMudrasId: puntoVenta.id,
              articuloId: asignacion.articuloId,
              nuevaCantidad: asignacion.cantidad
            }
          })
        });

        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
      }
      
      console.log(`✅ Stock asignado exitosamente a ${puntoVenta.nombre}`);
      onStockAsignado();
      handleCerrar();
    } catch (error) {
      console.error('Error al asignar stock:', error);
      setError('Error al asignar el stock: ' + (error as Error).message);
    } finally {
      setLoading(false);
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
                onChange={(e) => setBusqueda(e.target.value)}
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
        {loading && (
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
    </Dialog>
  );
}
