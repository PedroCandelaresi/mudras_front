'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Divider,
  Stack,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  IconShoppingCart,
  IconPlus,
  IconMinus,
  IconTrash,
  IconCash,
  IconCreditCard,
  IconQrcode,
  IconPrinter,
  IconSearch,
  IconCalculator,
  IconX
} from '@tabler/icons-react';
import { Store } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import PageContainer from '@/components/container/PageContainer';
import DashboardCard from '@/components/shared/DashboardCard';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ARTICULOS } from '@/components/articulos/graphql/queries';
import { OBTENER_PUNTOS_MUDRAS } from '@/components/puntos-mudras/graphql/queries';
import {
  CREAR_VENTA,
  ACTUALIZAR_STOCK_VENTA,
  type CrearVentaInput,
  type ItemVentaStockInput,
} from '@/components/ventas/graphql/mutations';
import { ArticulosResponse } from '@/app/interfaces/graphql.types';
import { verde } from '@/ui/colores';

interface ArticuloCarrito {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  codigo?: string;
}

interface MetodoPago {
  tipo: 'efectivo' | 'tarjeta' | 'transferencia' | 'qr';
  monto: number;
}

export default function Caja() {
  const [carrito, setCarrito] = useState<ArticuloCarrito[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'qr'>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState<number>(0);
  const [dialogPago, setDialogPago] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(false);
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState<number | null>(null);
  const [procesandoVenta, setProcesandoVenta] = useState(false);
  
  const { data: articulosData, loading } = useQuery<ArticulosResponse>(GET_ARTICULOS);
  const { data: puntosVentaData } = useQuery(OBTENER_PUNTOS_MUDRAS);
  const [crearVenta] = useMutation(CREAR_VENTA);
  const [actualizarStockVenta] = useMutation(ACTUALIZAR_STOCK_VENTA);
  
  const articulos = articulosData?.articulos || [];
  const puntosVenta = useMemo(
    () => ((puntosVentaData as any)?.obtenerPuntosMudras ?? []) as Array<{ id: number }>,
    [puntosVentaData]
  );
  
  // Seleccionar primer punto de venta por defecto
  useEffect(() => {
    if (puntosVenta.length > 0 && !puntoVentaSeleccionado) {
      setPuntoVentaSeleccionado(puntosVenta[0].id);
    }
  }, [puntosVenta, puntoVentaSeleccionado]);
  
  // Filtrar artículos por búsqueda
  const articulosFiltrados = articulos.filter((articulo: any) =>
    articulo?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    (articulo?.codigo && articulo.codigo.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Calcular total del carrito
  const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  
  // Calcular cambio
  const cambio = montoRecibido - totalCarrito;

  // Agregar producto al carrito
  const agregarAlCarrito = (articulo: any) => {
    const existente = carrito.find(item => item.id === articulo.id);
    
    if (existente) {
      if (existente.cantidad < articulo.deposito) {
        setCarrito(carrito.map(item =>
          item.id === articulo.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      }
    } else {
      if (articulo.deposito > 0) {
        setCarrito([...carrito, {
          id: articulo.id,
          nombre: articulo.nombre,
          precio: articulo.precio,
          cantidad: 1,
          stock: articulo.deposito,
          codigo: articulo.codigo
        }]);
      }
    }
  };

  // Modificar cantidad en carrito
  const modificarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(item => item.id !== id));
    } else {
      const item = carrito.find(item => item.id === id);
      if (item && nuevaCantidad <= item.stock) {
        setCarrito(carrito.map(item =>
          item.id === id
            ? { ...item, cantidad: nuevaCantidad }
            : item
        ));
      }
    }
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (id: string) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Limpiar carrito
  const limpiarCarrito = () => {
    setCarrito([]);
    setMontoRecibido(0);
    setVentaCompletada(false);
  };

  // Procesar venta
  const procesarVenta = async () => {
    if (carrito.length === 0 || !puntoVentaSeleccionado) return;
    
    setProcesandoVenta(true);
    
    try {
      // Preparar datos de la venta
      const ventaInput: CrearVentaInput = {
        puntoVentaId: puntoVentaSeleccionado,
        metodoPago,
        montoRecibido: metodoPago === 'efectivo' ? montoRecibido : totalCarrito,
        cambio: metodoPago === 'efectivo' ? cambio : 0,
        items: carrito.map(item => ({
          articuloId: parseInt(item.id),
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          subtotal: item.precio * item.cantidad
        }))
      };
      
      // Crear la venta
      const { data: ventaData } = await crearVenta({
        variables: { input: ventaInput }
      });
      
      // Actualizar stock
      const itemsStock: ItemVentaStockInput[] = carrito.map(item => ({
        articuloId: parseInt(item.id),
        cantidad: item.cantidad
      }));
      
      await actualizarStockVenta({
        variables: {
          items: itemsStock,
          puntoVentaId: puntoVentaSeleccionado
        }
      });
      
      console.log('Venta procesada exitosamente:', (ventaData as any)?.crearVenta);
      
      setVentaCompletada(true);
      setDialogPago(false);
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        limpiarCarrito();
      }, 3000);
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setProcesandoVenta(false);
    }
  };

  return (
    <PageContainer title="Caja Registradora - Mudras" description="Sistema de punto de venta">
      <Box>
        <Typography variant="h4" fontWeight={700} color={verde.textStrong} sx={{ mb: 2 }}>
          Caja Registradora
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#2e7d32', borderRadius: 2, overflow: 'hidden', bgcolor: '#c8e6c9' }}>
          {/* Toolbar superior */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 2, borderRadius: 0 }}>
            <Tabs
              value={0}
              aria-label="caja tabs"
              TabIndicatorProps={{ sx: { display: 'none' } }}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTab-root': {
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#66bb6a' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: '#2e7d32',
                  color: 'common.white'
                }
              }}
            >
              <Tab icon={<Icon icon="mdi:cash-register" />} label="Punto de Venta" iconPosition="start" />
            </Tabs>
          </Box>
          {/* Contenido */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 2, borderRadius: 0 }}>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {/* Búsqueda y Productos */}
                <Grid size={8}>
            <DashboardCard>
              <Box p={2}>
                <Typography variant="h5" fontWeight={600} color="primary.main" mb={3}>
                  Productos Disponibles
                </Typography>
                
                {/* Búsqueda */}
                <TextField
                  fullWidth
                  placeholder="Buscar por nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  InputProps={{
                    startAdornment: <IconSearch size={20} style={{ marginRight: 8 }} />
                  }}
                  sx={{ mb: 3 }}
                />
                
                {/* Grid de Productos */}
                <Box 
                  sx={{ 
                    maxHeight: '60vh', 
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2
                  }}
                >
                  {loading ? (
                    <Typography>Cargando productos...</Typography>
                  ) : (
                    articulosFiltrados.map((articulo: any) => (
                      <Card 
                        key={articulo.id}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 3 },
                          opacity: articulo.deposito === 0 ? 0.5 : 1
                        }}
                        onClick={() => agregarAlCarrito(articulo)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" fontWeight={600} noWrap>
                            {articulo.nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Código: {articulo.codigo || 'N/A'}
                          </Typography>
                          <Typography variant="h6" color="success.main" fontWeight={700}>
                            ${articulo.precio?.toLocaleString() || 0}
                          </Typography>
                          <Chip 
                            label={`Stock: ${articulo.deposito || 0}`}
                            size="small"
                            color={articulo.deposito > 0 ? 'success' : 'error'}
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              </Box>
            </DashboardCard>
          </Grid>

                {/* Carrito y Pago */}
                <Grid size={4}>
            <DashboardCard>
              <Box p={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" fontWeight={600} color="warning.main">
                    Carrito de Compras
                  </Typography>
                  <IconButton onClick={limpiarCarrito} color="error">
                    <IconTrash size={20} />
                  </IconButton>
                </Stack>
                
                {/* Items del Carrito */}
                <Box sx={{ maxHeight: '40vh', overflowY: 'auto', mb: 2 }}>
                  {carrito.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <IconShoppingCart size={48} color="#ccc" />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Carrito vacío
                      </Typography>
                    </Box>
                  ) : (
                    carrito.map((item) => (
                      <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {item.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${item.precio.toLocaleString()} c/u
                        </Typography>
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton 
                              size="small" 
                              onClick={() => modificarCantidad(item.id, item.cantidad - 1)}
                            >
                              <IconMinus size={16} />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                              {item.cantidad}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => modificarCantidad(item.id, item.cantidad + 1)}
                              disabled={item.cantidad >= item.stock}
                            >
                              <IconPlus size={16} />
                            </IconButton>
                          </Stack>
                          
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              ${(item.precio * item.cantidad).toLocaleString()}
                            </Typography>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => eliminarDelCarrito(item.id)}
                            >
                              <IconX size={16} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Total */}
                <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main" textAlign="center">
                    Total: ${totalCarrito.toLocaleString()}
                  </Typography>
                </Box>
                
                {/* Botones de Acción */}
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<IconCalculator />}
                    onClick={() => setDialogPago(true)}
                    disabled={carrito.length === 0}
                    sx={{ 
                      backgroundColor: 'success.main',
                      '&:hover': { backgroundColor: 'success.dark' }
                    }}
                  >
                    Procesar Pago
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<IconPrinter />}
                    disabled={!ventaCompletada}
                  >
                    Imprimir Ticket
                  </Button>
                </Stack>
                
                {ventaCompletada && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    ¡Venta procesada exitosamente!
                  </Alert>
                )}
              </Box>
            </DashboardCard>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
        
        {/* Dialog de Pago */}
        <Dialog open={dialogPago} onClose={() => setDialogPago(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={600}>
                Procesar Pago
              </Typography>
              <IconButton onClick={() => setDialogPago(false)}>
                <IconX />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="h4" fontWeight={700} textAlign="center">
                Total: ${totalCarrito.toLocaleString()}
              </Typography>
            </Box>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Punto de Venta</InputLabel>
              <Select
                value={puntoVentaSeleccionado || ''}
                onChange={(e) => setPuntoVentaSeleccionado(Number(e.target.value))}
                label="Punto de Venta"
              >
                {puntosVenta.map((punto: any) => (
                  <MenuItem key={punto.id} value={punto.id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Store sx={{ fontSize: 20 }} />
                      <span>{punto.nombre}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as any)}
                label="Método de Pago"
              >
                <MenuItem value="efectivo">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconCash size={20} />
                    <span>Efectivo</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="tarjeta">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconCreditCard size={20} />
                    <span>Tarjeta</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="transferencia">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconCreditCard size={20} />
                    <span>Transferencia</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="qr">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconQrcode size={20} />
                    <span>QR / Billetera Digital</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
            
            {metodoPago === 'efectivo' && (
              <>
                <TextField
                  fullWidth
                  label="Monto Recibido"
                  type="number"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(Number(e.target.value))}
                  sx={{ mb: 2 }}
                />
                
                {montoRecibido > 0 && (
                  <Box sx={{ p: 2, bgcolor: cambio >= 0 ? 'success.light' : 'error.light', borderRadius: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Cambio: ${cambio.toLocaleString()}
                    </Typography>
                    {cambio < 0 && (
                      <Typography variant="body2" color="error">
                        Monto insuficiente
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDialogPago(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={procesarVenta}
              disabled={procesandoVenta || !puntoVentaSeleccionado || (metodoPago === 'efectivo' ? cambio < 0 : false)}
              sx={{ 
                backgroundColor: 'success.main',
                '&:hover': { backgroundColor: 'success.dark' }
              }}
            >
              {procesandoVenta ? 'Procesando...' : 'Confirmar Venta'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}
