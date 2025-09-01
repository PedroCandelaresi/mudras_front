'use client';
import {
  Box,
  Grid,
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
  InputAdornment,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  IconSearch,
  IconEye,
  IconReceipt,
  IconRefresh,
  IconFilter,
  IconDownload,
  IconCalendar
} from '@tabler/icons-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';

interface Venta {
  id: string;
  numero: string;
  fecha: Date;
  cliente: string;
  total: number;
  estado: 'completada' | 'pendiente' | 'cancelada';
  metodoPago: string;
  vendedor: string;
  items: number;
}

const HistorialVentas = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  // Simulación de datos
  const ventas: Venta[] = [
    {
      id: '1',
      numero: 'V-2024-001',
      fecha: new Date('2024-01-15'),
      cliente: 'Juan Pérez',
      total: 1250,
      estado: 'completada',
      metodoPago: 'Efectivo',
      vendedor: 'Admin',
      items: 3
    },
    {
      id: '2',
      numero: 'V-2024-002',
      fecha: new Date('2024-01-15'),
      cliente: 'María García',
      total: 850,
      estado: 'completada',
      metodoPago: 'Tarjeta',
      vendedor: 'Admin',
      items: 2
    },
    {
      id: '3',
      numero: 'V-2024-003',
      fecha: new Date('2024-01-14'),
      cliente: 'Carlos López',
      total: 2100,
      estado: 'pendiente',
      metodoPago: 'Transferencia',
      vendedor: 'Admin',
      items: 5
    },
    {
      id: '4',
      numero: 'V-2024-004',
      fecha: new Date('2024-01-14'),
      cliente: 'Ana Rodríguez',
      total: 450,
      estado: 'cancelada',
      metodoPago: 'Efectivo',
      vendedor: 'Admin',
      items: 1
    },
  ];

  const ventasFiltradas = ventas.filter((venta) =>
    venta.numero.toLowerCase().includes(filtro.toLowerCase()) ||
    venta.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
    venta.metodoPago.toLowerCase().includes(filtro.toLowerCase())
  );

  const ventasPaginadas = ventasFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getEstadoColor = (estado: Venta['estado']) => {
    switch (estado) {
      case 'completada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'error';
      default: return 'default';
    }
  };

  const verDetalle = (venta: Venta) => {
    setVentaSeleccionada(venta);
    setModalDetalle(true);
  };

  const totalVentas = ventasFiltradas.reduce((sum, venta) => 
    venta.estado === 'completada' ? sum + venta.total : sum, 0
  );

  const ventasCompletadas = ventasFiltradas.filter(v => v.estado === 'completada').length;

  return (
    <PageContainer title="Historial de Ventas" description="Consultar historial de ventas realizadas">
      <Box>
        {/* Estadísticas rápidas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" fontWeight={700}>
              {ventasFiltradas.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Ventas
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {ventasCompletadas}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completadas
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight={700}>
              ${totalVentas.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Facturado
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight={700}>
              ${Math.round(totalVentas / Math.max(ventasCompletadas, 1)).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ticket Promedio
            </Typography>
          </Paper>
        </Box>

        <DashboardCard title="Historial de Ventas">
          {/* Controles */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <TextField
                placeholder="Buscar por número, cliente o método de pago..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <Button
                variant="outlined"
                startIcon={<IconFilter />}
                color="info"
              >
                Filtros
              </Button>
              <Button
                variant="outlined"
                startIcon={<IconCalendar />}
                color="info"
              >
                Rango de Fechas
              </Button>
              <Button
                variant="outlined"
                startIcon={<IconDownload />}
                color="success"
              >
                Exportar
              </Button>
              <Button
                variant="outlined"
                startIcon={<IconRefresh />}
                color="warning"
              >
                Actualizar
              </Button>
            </Stack>
          </Box>

          {/* Tabla */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>Número</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>Método Pago</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>Vendedor</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.dark', textAlign: 'center' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventasPaginadas.map((venta) => (
                  <TableRow 
                    key={venta.id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'primary.lighter',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                        {venta.numero}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(venta.fecha, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {venta.cliente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${venta.items} items`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ${venta.total.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {venta.metodoPago}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                        color={getEstadoColor(venta.estado) as any}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {venta.vendedor}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => verDetalle(venta)}
                        >
                          <IconEye size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                        >
                          <IconReceipt size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {ventasPaginadas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography color="text.secondary">
                        No se encontraron ventas
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={ventasFiltradas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </DashboardCard>

        {/* Modal Detalle de Venta */}
        <Dialog 
          open={modalDetalle} 
          onClose={() => setModalDetalle(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Detalle de Venta - {ventaSeleccionada?.numero}
          </DialogTitle>
          <DialogContent>
            {ventaSeleccionada && (
              <Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cliente
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {ventaSeleccionada.cliente}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha
                    </Typography>
                    <Typography variant="body1">
                      {format(ventaSeleccionada.fecha, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Método de Pago
                    </Typography>
                    <Typography variant="body1">
                      {ventaSeleccionada.metodoPago}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estado
                    </Typography>
                    <Chip
                      label={ventaSeleccionada.estado.charAt(0).toUpperCase() + ventaSeleccionada.estado.slice(1)}
                      color={getEstadoColor(ventaSeleccionada.estado) as any}
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Artículos Vendidos
                </Typography>
                
                {/* Aquí iría la tabla de artículos de la venta */}
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    {ventaSeleccionada.items} artículos por un total de ${ventaSeleccionada.total.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    * Los detalles de artículos se cargarían desde la base de datos
                  </Typography>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalDetalle(false)}>
              Cerrar
            </Button>
            <Button variant="contained" startIcon={<IconReceipt />}>
              Imprimir Recibo
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default HistorialVentas;
