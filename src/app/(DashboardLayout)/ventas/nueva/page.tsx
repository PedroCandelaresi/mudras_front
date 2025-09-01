'use client';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
  Stack,
  IconButton,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  IconPlus,
  IconTrash,
  IconShoppingCart,
  IconUser,
  IconSearch,
  IconReceipt,
  IconDeviceFloppy,
  IconX
} from '@tabler/icons-react';
import { useState } from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';

interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  documento?: string;
}

interface ArticuloVenta {
  id: string;
  codigo: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  descuento: number;
  subtotal: number;
}

const NuevaVenta = () => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [articulos, setArticulos] = useState<ArticuloVenta[]>([]);
  const [modalCliente, setModalCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState<Partial<Cliente>>({});
  const [descuentoGeneral, setDescuentoGeneral] = useState(0);
  const [observaciones, setObservaciones] = useState('');

  // Simulación de datos
  const clientesDisponibles: Cliente[] = [
    { id: '1', nombre: 'Cliente Consumidor Final', documento: '00000000' },
    { id: '2', nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '123456789', documento: '12345678' },
    { id: '3', nombre: 'María García', email: 'maria@email.com', telefono: '987654321', documento: '87654321' },
  ];

  const productosDisponibles = [
    { id: '1', codigo: '001', descripcion: 'Producto A', precio: 100, stock: 50 },
    { id: '2', codigo: '002', descripcion: 'Producto B', precio: 250, stock: 30 },
    { id: '3', codigo: '003', descripcion: 'Producto C', precio: 180, stock: 25 },
  ];

  const subtotal = articulos.reduce((sum, item) => sum + item.subtotal, 0);
  const descuentoTotal = (subtotal * descuentoGeneral) / 100;
  const total = subtotal - descuentoTotal;

  const agregarArticulo = () => {
    const nuevoArticulo: ArticuloVenta = {
      id: Date.now().toString(),
      codigo: '',
      descripcion: '',
      precio: 0,
      cantidad: 1,
      descuento: 0,
      subtotal: 0
    };
    setArticulos([...articulos, nuevoArticulo]);
  };

  const actualizarArticulo = (id: string, campo: keyof ArticuloVenta, valor: any) => {
    setArticulos(articulos.map(art => {
      if (art.id === id) {
        const articuloActualizado = { ...art, [campo]: valor };
        
        // Recalcular subtotal
        const subtotalSinDescuento = articuloActualizado.precio * articuloActualizado.cantidad;
        const descuentoItem = (subtotalSinDescuento * articuloActualizado.descuento) / 100;
        articuloActualizado.subtotal = subtotalSinDescuento - descuentoItem;
        
        return articuloActualizado;
      }
      return art;
    }));
  };

  const eliminarArticulo = (id: string) => {
    setArticulos(articulos.filter(art => art.id !== id));
  };

  const seleccionarProducto = (articuloId: string, producto: any) => {
    actualizarArticulo(articuloId, 'codigo', producto.codigo);
    actualizarArticulo(articuloId, 'descripcion', producto.descripcion);
    actualizarArticulo(articuloId, 'precio', producto.precio);
  };

  const crearCliente = () => {
    if (!nuevoCliente.nombre) return;
    
    const cliente: Cliente = {
      id: Date.now().toString(),
      nombre: nuevoCliente.nombre,
      email: nuevoCliente.email,
      telefono: nuevoCliente.telefono,
      documento: nuevoCliente.documento
    };
    
    setCliente(cliente);
    setNuevoCliente({});
    setModalCliente(false);
  };

  const guardarVenta = () => {
    if (!cliente) {
      alert('Debe seleccionar un cliente');
      return;
    }
    
    if (articulos.length === 0) {
      alert('Debe agregar al menos un artículo');
      return;
    }

    const venta = {
      cliente,
      articulos,
      subtotal,
      descuentoGeneral,
      descuentoTotal,
      total,
      observaciones,
      fecha: new Date().toISOString()
    };

    console.log('Guardando venta:', venta);
    alert('Venta guardada correctamente');
    
    // Limpiar formulario
    setCliente(null);
    setArticulos([]);
    setDescuentoGeneral(0);
    setObservaciones('');
  };

  return (
    <PageContainer title="Nueva Venta" description="Crear una nueva venta">
      <Box>
        <Grid container spacing={3}>
          {/* Información del Cliente */}
          <Grid item xs={12}>
            <DashboardCard title="Cliente">
              <Stack direction="row" spacing={2} alignItems="center">
                <Autocomplete
                  options={clientesDisponibles}
                  getOptionLabel={(option) => option.nombre}
                  value={cliente}
                  onChange={(_, newValue) => setCliente(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Cliente"
                      placeholder="Buscar cliente..."
                    />
                  )}
                  sx={{ minWidth: 300 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<IconPlus />}
                  onClick={() => setModalCliente(true)}
                >
                  Nuevo Cliente
                </Button>
              </Stack>
              
              {cliente && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Cliente Seleccionado:</Typography>
                  <Typography variant="body2">
                    <strong>{cliente.nombre}</strong>
                    {cliente.documento && ` - Doc: ${cliente.documento}`}
                    {cliente.email && ` - Email: ${cliente.email}`}
                    {cliente.telefono && ` - Tel: ${cliente.telefono}`}
                  </Typography>
                </Box>
              )}
            </DashboardCard>
          </Grid>

          {/* Artículos */}
          <Grid item xs={12}>
            <DashboardCard title="Artículos">
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<IconPlus />}
                  onClick={agregarArticulo}
                >
                  Agregar Artículo
                </Button>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Precio Unit.</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Desc. %</TableCell>
                        <TableCell>Subtotal</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {articulos.map((articulo) => (
                        <TableRow key={articulo.id}>
                          <TableCell>
                            <Autocomplete
                              options={productosDisponibles}
                              getOptionLabel={(option) => option.codigo}
                              onChange={(_, newValue) => newValue && seleccionarProducto(articulo.id, newValue)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  value={articulo.codigo}
                                  onChange={(e) => actualizarArticulo(articulo.id, 'codigo', e.target.value)}
                                />
                              )}
                              sx={{ minWidth: 120 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={articulo.descripcion}
                              onChange={(e) => actualizarArticulo(articulo.id, 'descripcion', e.target.value)}
                              sx={{ minWidth: 200 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={articulo.precio}
                              onChange={(e) => actualizarArticulo(articulo.id, 'precio', Number(e.target.value))}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={articulo.cantidad}
                              onChange={(e) => actualizarArticulo(articulo.id, 'cantidad', Number(e.target.value))}
                              inputProps={{ min: 1 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={articulo.descuento}
                              onChange={(e) => actualizarArticulo(articulo.id, 'descuento', Number(e.target.value))}
                              inputProps={{ min: 0, max: 100 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              ${articulo.subtotal.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => eliminarArticulo(articulo.id)}
                            >
                              <IconTrash />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {articulos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary">
                              No hay artículos agregados
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </DashboardCard>
          </Grid>

          {/* Totales y Observaciones */}
          <Grid item xs={12} md={6}>
            <DashboardCard title="Observaciones">
              <TextField
                fullWidth
                multiline
                rows={4}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones adicionales..."
              />
            </DashboardCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <DashboardCard title="Totales">
              <Stack spacing={2}>
                <TextField
                  label="Descuento General (%)"
                  type="number"
                  value={descuentoGeneral}
                  onChange={(e) => setDescuentoGeneral(Number(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
                
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Subtotal:</Typography>
                      <Typography>${subtotal.toLocaleString()}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Descuento:</Typography>
                      <Typography>-${descuentoTotal.toLocaleString()}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={700}>Total:</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        ${total.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<IconX />}
                    onClick={() => {
                      setCliente(null);
                      setArticulos([]);
                      setDescuentoGeneral(0);
                      setObservaciones('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IconDeviceFloppy />}
                    onClick={guardarVenta}
                    disabled={!cliente || articulos.length === 0}
                  >
                    Guardar Venta
                  </Button>
                </Stack>
              </Stack>
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Modal Nuevo Cliente */}
        <Dialog open={modalCliente} onClose={() => setModalCliente(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nombre *"
                fullWidth
                value={nuevoCliente.nombre || ''}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
              />
              <TextField
                label="Documento"
                fullWidth
                value={nuevoCliente.documento || ''}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, documento: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={nuevoCliente.email || ''}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
              />
              <TextField
                label="Teléfono"
                fullWidth
                value={nuevoCliente.telefono || ''}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalCliente(false)}>Cancelar</Button>
            <Button variant="contained" onClick={crearCliente} disabled={!nuevoCliente.nombre}>
              Crear Cliente
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default NuevaVenta;
