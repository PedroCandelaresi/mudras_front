'use client';
import React, { useState, useEffect } from 'react';
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
  Alert
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
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { useQuery } from '@apollo/client/react';
import { GET_ARTICULOS } from '@/app/queries/mudras.queries';
import { ArticulosResponse } from '@/app/interfaces/graphql.types';

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
  
  const { data: articulosData, loading } = useQuery<ArticulosResponse>(GET_ARTICULOS);
  
  const articulos = articulosData?.articulos || [];
  
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
  const procesarVenta = () => {
    if (carrito.length === 0) return;
    
    // Aquí iría la lógica para guardar la venta en la BD
    console.log('Procesando venta:', {
      items: carrito,
      total: totalCarrito,
      metodoPago,
      montoRecibido,
      cambio
    });
    
    setVentaCompletada(true);
    setDialogPago(false);
    
    // Limpiar después de 3 segundos
    setTimeout(() => {
      limpiarCarrito();
    }, 3000);
  };

  return (
    <PageContainer title="Caja Registradora - Mudras" description="Sistema de punto de venta">
      <Box>
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
              disabled={metodoPago === 'efectivo' ? cambio < 0 : false}
              sx={{ 
                backgroundColor: 'success.main',
                '&:hover': { backgroundColor: 'success.dark' }
              }}
            >
              Confirmar Venta
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}
