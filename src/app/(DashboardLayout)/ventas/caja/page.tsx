'use client';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Stack,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent
} from '@mui/material';
import {
  IconCash,
  IconScan,
  IconPlus,
  IconTrash,
  IconShoppingCart,
  IconReceipt,
  IconCalculator,
  IconCreditCard,
  IconX,
  IconCamera,
  IconSearch,
  IconBarcode,
  IconCheck
} from '@tabler/icons-react';
import { useState, useRef } from 'react';
import PageContainer from '@/components/container/PageContainer';
import DashboardCard from '@/components/shared/DashboardCard';

interface ArticuloVenta {
  id: string;
  codigo: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  stock: number;
}

interface MetodoPago {
  tipo: 'efectivo' | 'tarjeta' | 'transferencia';
  monto: number;
}

const CajaRegistradora = () => {
  const [carrito, setCarrito] = useState<ArticuloVenta[]>([]);
  const [codigoInput, setCodigoInput] = useState('');
  const [cantidadInput, setCantidadInput] = useState(1);
  const [busquedaArticulo, setBusquedaArticulo] = useState('');
  const [escaneando, setEscaneando] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [efectivoRecibido, setEfectivoRecibido] = useState(0);
  const [ventaFinalizada, setVentaFinalizada] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulación de artículos (en producción vendría de la API)
  const articulos = [
    { id: '1', codigo: '7790001001', descripcion: 'Coca Cola 500ml', precio: 350, stock: 50 },
    { id: '2', codigo: '7790001002', descripcion: 'Pan Lactal', precio: 280, stock: 25 },
    { id: '3', codigo: '7790001003', descripcion: 'Leche Entera 1L', precio: 420, stock: 30 },
    { id: '4', codigo: '7790001004', descripcion: 'Arroz 1kg', precio: 680, stock: 15 },
  ];

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const totalPagado = metodosPago.reduce((sum, pago) => sum + pago.monto, 0);
  const cambio = efectivoRecibido - total;

  const agregarArticulo = (codigo: string, cantidad: number = 1) => {
    const articulo = articulos.find(a => 
      a.codigo === codigo || 
      a.descripcion.toLowerCase().includes(codigo.toLowerCase())
    );
    
    if (!articulo) {
      alert('Artículo no encontrado');
      return;
    }

    if (articulo.stock < cantidad) {
      alert('Stock insuficiente');
      return;
    }

    const existeEnCarrito = carrito.find(item => item.id === articulo.id);
    
    if (existeEnCarrito) {
      setCarrito(carrito.map(item => 
        item.id === articulo.id 
          ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * item.precio }
          : item
      ));
    } else {
      const nuevoItem: ArticuloVenta = {
        id: articulo.id,
        codigo: articulo.codigo,
        descripcion: articulo.descripcion,
        precio: articulo.precio,
        cantidad,
        subtotal: articulo.precio * cantidad,
        stock: articulo.stock
      };
      setCarrito([...carrito, nuevoItem]);
    }
    
    setCodigoInput('');
    setCantidadInput(1);
  };

  const eliminarArticulo = (id: string) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const modificarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarArticulo(id);
      return;
    }

    setCarrito(carrito.map(item => 
      item.id === id 
        ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio }
        : item
    ));
  };

  const iniciarEscaneo = async () => {
    setEscaneando(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara');
      setEscaneando(false);
    }
  };

  const detenerEscaneo = () => {
    setEscaneando(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const procesarVenta = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setModalPago(true);
  };

  const agregarMetodoPago = (tipo: MetodoPago['tipo'], monto: number) => {
    if (monto <= 0) return;
    
    const restante = total - totalPagado;
    const montoFinal = Math.min(monto, restante);
    
    setMetodosPago([...metodosPago, { tipo, monto: montoFinal }]);
  };

  const finalizarVenta = () => {
    if (totalPagado < total) {
      alert('El monto pagado es insuficiente');
      return;
    }

    // Aquí se enviaría la venta al backend
    console.log('Venta finalizada:', {
      items: carrito,
      total,
      metodosPago,
      cambio: efectivoRecibido > total ? cambio : 0
    });

    setVentaFinalizada(true);
    setTimeout(() => {
      // Limpiar todo después de mostrar el recibo
      setCarrito([]);
      setMetodosPago([]);
      setEfectivoRecibido(0);
      setModalPago(false);
      setVentaFinalizada(false);
    }, 3000);
  };

  return (
    <PageContainer title="Caja Registradora" description="Sistema de ventas con lector de códigos">
      <Box>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Panel de Entrada */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <DashboardCard title="Agregar Productos">
              <Stack spacing={2}>
                {/* Entrada manual */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Código o Descripción
                  </Typography>
                  <TextField
                    fullWidth
                    value={codigoInput}
                    onChange={(e) => setCodigoInput(e.target.value)}
                    placeholder="Escanea o escribe el código"
                    onKeyPress={(e) => e.key === 'Enter' && agregarArticulo(codigoInput, cantidadInput)}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => agregarArticulo(codigoInput, cantidadInput)}>
                          <IconPlus />
                        </IconButton>
                      )
                    }}
                  />
                </Box>

                {/* Cantidad */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Cantidad
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={cantidadInput}
                    onChange={(e) => setCantidadInput(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                  />
                </Box>

                {/* Botón de escaneo */}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<IconScan />}
                  onClick={iniciarEscaneo}
                  disabled={escaneando}
                >
                  {escaneando ? 'Escaneando...' : 'Escanear Código'}
                </Button>

                {/* Búsqueda rápida */}
                <Divider />
                <Typography variant="subtitle2">
                  Búsqueda Rápida
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Buscar producto..."
                  value={busquedaArticulo}
                  onChange={(e) => setBusquedaArticulo(e.target.value)}
                  InputProps={{
                    startAdornment: <IconSearch />
                  }}
                />
                
                {/* Lista de productos filtrados */}
                {busquedaArticulo && (
                  <List dense>
                    {articulos
                      .filter(art => 
                        art.descripcion.toLowerCase().includes(busquedaArticulo.toLowerCase()) ||
                        art.codigo.includes(busquedaArticulo)
                      )
                      .slice(0, 5)
                      .map(articulo => (
                        <ListItem 
                          key={articulo.id}
                          onClick={() => {
                            agregarArticulo(articulo.codigo, cantidadInput);
                            setBusquedaArticulo('');
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <IconBarcode />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={articulo.descripcion}
                            secondary={`$${articulo.precio} - Stock: ${articulo.stock}`}
                          />
                        </ListItem>
                      ))
                    }
                  </List>
                )}
              </Stack>
            </DashboardCard>
          </Box>

          {/* Carrito de Compras */}
          <Box sx={{ flex: '2 1 600px', minWidth: '600px' }}>
            <DashboardCard title="Carrito de Compras">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="center">Cantidad</TableCell>
                      <TableCell align="right">Precio Unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {carrito.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {item.descripcion}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Código: {item.codigo}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={item.cantidad}
                            onChange={(e) => modificarCantidad(item.id, Number(e.target.value))}
                            inputProps={{ min: 1, max: item.stock }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ${item.precio.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ${item.subtotal.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => eliminarArticulo(item.id)}
                          >
                            <IconTrash />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {carrito.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            El carrito está vacío
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Total y acciones */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" fontWeight={700}>
                    Total: ${total.toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<IconX />}
                      onClick={() => setCarrito([])}
                      disabled={carrito.length === 0}
                    >
                      Limpiar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<IconCash />}
                      onClick={procesarVenta}
                      disabled={carrito.length === 0}
                      size="large"
                    >
                      Procesar Venta
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </DashboardCard>
          </Box>
        </Box>

        {/* Modal de Escaneo */}
        <Dialog open={escaneando} onClose={detenerEscaneo} maxWidth="sm" fullWidth>
          <DialogTitle>
            Escanear Código de Barras/QR
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', maxWidth: 400, height: 300 }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <Alert severity="info" sx={{ mt: 2 }}>
                Apunta la cámara hacia el código de barras o QR del producto
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={detenerEscaneo} color="primary">
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Pago */}
        <Dialog open={modalPago} onClose={() => setModalPago(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Procesar Pago - Total: ${total.toLocaleString()}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Typography variant="h6" gutterBottom>
                  Métodos de Pago
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<IconCash />}
                    onClick={() => {
                      const monto = prompt('Monto en efectivo:');
                      if (monto) {
                        const valor = Number(monto);
                        agregarMetodoPago('efectivo', valor);
                        setEfectivoRecibido(valor);
                      }
                    }}
                  >
                    Efectivo
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<IconCreditCard />}
                    onClick={() => {
                      const monto = prompt('Monto con tarjeta:');
                      if (monto) agregarMetodoPago('tarjeta', Number(monto));
                    }}
                  >
                    Tarjeta
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<IconCalculator />}
                    onClick={() => {
                      const monto = prompt('Monto por transferencia:');
                      if (monto) agregarMetodoPago('transferencia', Number(monto));
                    }}
                  >
                    Transferencia
                  </Button>
                </Stack>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Typography variant="h6" gutterBottom>
                  Resumen de Pago
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total:</Typography>
                    <Typography fontWeight={600}>${total.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Pagado:</Typography>
                    <Typography fontWeight={600}>${totalPagado.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Restante:</Typography>
                    <Typography fontWeight={600} color={totalPagado >= total ? 'success.main' : 'error.main'}>
                      ${Math.max(0, total - totalPagado).toLocaleString()}
                    </Typography>
                  </Box>
                  {efectivoRecibido > total && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Cambio:</Typography>
                      <Typography fontWeight={600} color="info.main">
                        ${cambio.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {metodosPago.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Métodos Aplicados:
                    </Typography>
                    {metodosPago.map((pago, index) => (
                      <Chip
                        key={index}
                        label={`${pago.tipo}: $${pago.monto.toLocaleString()}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalPago(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconCheck />}
              onClick={finalizarVenta}
              disabled={totalPagado < total}
            >
              Finalizar Venta
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmación de venta */}
        <Dialog open={ventaFinalizada} maxWidth="sm" fullWidth>
          <DialogContent sx={{ textAlign: 'center', p: 4 }}>
            <IconCheck size={64} color="green" />
            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
              ¡Venta Finalizada!
            </Typography>
            <Typography color="text.secondary">
              La venta se procesó correctamente
            </Typography>
            {efectivoRecibido > total && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Cambio a entregar: ${cambio.toLocaleString()}
              </Alert>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default CajaRegistradora;
