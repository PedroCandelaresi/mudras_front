'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Table,
  MenuItem,
  Pagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';
import PaginacionMudras from '@/components/ui/PaginacionMudras';
import { grisRojizo } from "@/ui/colores";
import {
  IconSearch,
  IconEye,
  IconX,
  IconRefresh,
  IconDownload,
  IconCalendar,
  IconFilter,
} from '@tabler/icons-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  OBTENER_HISTORIAL_VENTAS,
  OBTENER_DETALLE_VENTA,
  OBTENER_PUESTOS_VENTA,
  type HistorialVentasResponse,
  type DetalleVentaResponse,
  type PuestosVentaResponse,
  type FiltrosHistorialInput,
  type VentaCaja,
} from '@/components/ventas/caja-registradora/graphql/queries';
import { CANCELAR_VENTA_CAJA } from '@/components/ventas/caja-registradora/graphql/mutations';

const ESTADOS_VENTA = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'warning' as const },
  { value: 'CONFIRMADA', label: 'Confirmada', color: 'success' as const },
  { value: 'CANCELADA', label: 'Cancelada', color: 'error' as const },
  { value: 'DEVUELTA', label: 'Devuelta', color: 'info' as const },
  { value: 'DEVUELTA_PARCIAL', label: 'Devolución Parcial', color: 'secondary' as const },
];

export const HistorialVentas: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosHistorialInput>({
    pagina: 1,
    limite: 150,
  });
  const tableTopRef = React.useRef<HTMLDivElement>(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaCaja | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  // Queries
  const { data, loading, error, refetch } = useQuery<HistorialVentasResponse>(OBTENER_HISTORIAL_VENTAS, {
    variables: { filtros },
    fetchPolicy: 'cache-and-network',
  });

  const { data: detalleData, loading: loadingDetalle } = useQuery<DetalleVentaResponse>(OBTENER_DETALLE_VENTA, {
    variables: { id: ventaSeleccionada?.id || 0 },
    skip: !ventaSeleccionada?.id,
  });

  // Mutations
  const [cancelarVenta] = useMutation(CANCELAR_VENTA_CAJA, {
    onCompleted: () => {
      refetch();
      setModalDetalleAbierto(false);
    },
  });

  const handleFiltroChange = (campo: keyof FiltrosHistorialInput, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      pagina: 1, // Resetear a primera página al cambiar filtros
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFiltros(prev => ({
      ...prev,
      pagina: newPage + 1,
    }));
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setFiltros(prev => ({
      ...prev,
      limite: newRowsPerPage,
      pagina: 1,
    }));
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVerDetalle = (venta: VentaCaja) => {
    setVentaSeleccionada(venta);
    setModalDetalleAbierto(true);
  };

  const handleCancelarVenta = (ventaId: number, motivo: string) => {
    cancelarVenta({
      variables: { id: ventaId, motivo },
    });
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const obtenerEstadoChip = (estado: string) => {
    const estadoConfig = ESTADOS_VENTA.find(e => e.value === estado);
    return estadoConfig || { label: estado, color: 'default' as const };
  };

  const ventas = data?.obtenerHistorialVentas?.ventas || [];
  const totalRegistros = data?.obtenerHistorialVentas?.totalRegistros || 0;
  const resumen = data?.obtenerHistorialVentas?.resumen;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Historial de Ventas
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                startIcon={<IconRefresh size={16} />}
                onClick={() => refetch()}
                disabled={loading}
              >
                Actualizar
              </Button>
              <Button
                startIcon={<IconDownload size={16} />}
                variant="outlined"
              >
                Exportar
              </Button>
            </Box>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Fecha Desde"
                value={filtros.fechaDesde ? new Date(filtros.fechaDesde) : null}
                onChange={(fecha) => handleFiltroChange('fechaDesde', fecha?.toISOString().split('T')[0])}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Fecha Hasta"
                value={filtros.fechaHasta ? new Date(filtros.fechaHasta) : null}
                onChange={(fecha) => handleFiltroChange('fechaHasta', fecha?.toISOString().split('T')[0])}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado || ''}
                  onChange={(e) => handleFiltroChange('estado', e.target.value || undefined)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {ESTADOS_VENTA.map(estado => (
                    <MenuItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Número de Venta"
                value={filtros.numeroVenta || ''}
                onChange={(e) => handleFiltroChange('numeroVenta', e.target.value || undefined)}
                InputProps={{
                  startAdornment: <IconSearch size={16} style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<IconFilter size={16} />}
                onClick={() => setFiltros({ pagina: 1, limite: 10 })}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Ventas
                  </Typography>
                  <Typography variant="h4">
                    {resumen.totalVentas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Monto Total
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${resumen.montoTotal.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Confirmadas
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {resumen.ventasPorEstado?.find(v => v.estado === 'CONFIRMADA')?.cantidad || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Canceladas
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {resumen.ventasPorEstado?.find(v => v.estado === 'CANCELADA')?.cantidad || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabla de ventas */}
        <Paper elevation={0} sx={{ border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
          {loading && (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              Error al cargar el historial: {error.message}
            </Alert>
          )}

          {!loading && !error && (
            <>
              <Box ref={tableTopRef} />
              <PaginacionMudras
                page={(filtros.pagina || 1) - 1}
                rowsPerPage={filtros.limite || 150}
                total={totalRegistros}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                itemLabel="ventas"
                accentColor={grisRojizo.primary}
                rowsPerPageOptions={[50, 100, 150, 300, 500]}
              />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Puesto</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ventas.map((venta: VentaCaja) => {
                      const estadoConfig = obtenerEstadoChip(venta.estado);

                      return (
                        <TableRow key={venta.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {venta.numeroVenta}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {formatearFecha(venta.fecha)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color={venta.cliente ? 'inherit' : 'text.secondary'}>
                              {venta.cliente
                                ? `${venta.cliente.Nombre ?? ''} ${venta.cliente.Apellido ?? ''}`.trim() || 'Sin cliente'
                                : 'Sin cliente'}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {venta.puestoVenta?.nombre ?? venta.nombrePuesto ?? '—'}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={estadoConfig.label}
                              color={estadoConfig.color}
                              size="small"
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              ${venta.total.toFixed(2)}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleVerDetalle(venta)}
                            >
                              <IconEye size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <PaginacionMudras
                page={(filtros.pagina || 1) - 1}
                rowsPerPage={filtros.limite || 150}
                total={totalRegistros}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                itemLabel="ventas"
                accentColor={grisRojizo.primary}
                rowsPerPageOptions={[50, 100, 150, 300, 500]}
              />
            </>
          )}
        </Paper>

        {/* Modal de detalle */}
        <Dialog
          open={modalDetalleAbierto}
          onClose={() => setModalDetalleAbierto(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Detalle de Venta {ventaSeleccionada?.numeroVenta}
              </Typography>
              <IconButton onClick={() => setModalDetalleAbierto(false)}>
                <IconX size={20} />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            {loadingDetalle ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : detalleData?.obtenerDetalleVenta ? (
              <Grid container spacing={3}>
                {/* Información general */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Información General
                  </Typography>
                  <Box>
                    <Typography><strong>Número:</strong> {detalleData.obtenerDetalleVenta.numeroVenta}</Typography>
                    <Typography><strong>Fecha:</strong> {formatearFecha(detalleData.obtenerDetalleVenta.fecha)}</Typography>
                    <Typography><strong>Estado:</strong> {detalleData.obtenerDetalleVenta.estado}</Typography>
                    <Typography><strong>Puesto:</strong> {detalleData.obtenerDetalleVenta.puestoVenta.nombre}</Typography>
                    <Typography><strong>Usuario:</strong> {detalleData.obtenerDetalleVenta.usuario.Nombre}</Typography>
                    {detalleData.obtenerDetalleVenta.observaciones && (
                      <Typography><strong>Observaciones:</strong> {detalleData.obtenerDetalleVenta.observaciones}</Typography>
                    )}
                  </Box>
                </Grid>

                {/* Totales */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Totales
                  </Typography>
                  <Box>
                    <Typography><strong>Subtotal:</strong> ${detalleData.obtenerDetalleVenta.subtotal.toFixed(2)}</Typography>
                    <Typography><strong>Descuentos:</strong> ${detalleData.obtenerDetalleVenta.descuentoMonto.toFixed(2)}</Typography>
                    <Typography><strong>Impuestos:</strong> ${detalleData.obtenerDetalleVenta.impuestos.toFixed(2)}</Typography>
                    <Typography variant="h6" color="primary">
                      <strong>Total:</strong> ${detalleData.obtenerDetalleVenta.total.toFixed(2)}
                    </Typography>
                    {detalleData.obtenerDetalleVenta.cambio > 0 && (
                      <Typography><strong>Cambio:</strong> ${detalleData.obtenerDetalleVenta.cambio.toFixed(2)}</Typography>
                    )}
                  </Box>
                </Grid>

                {/* Artículos */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Artículos
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Código</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                          <TableCell align="right">Precio Unit.</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detalleData.obtenerDetalleVenta.detalles?.map((detalle: any) => (
                          <TableRow key={detalle.id}>
                            <TableCell>{detalle.articulo.Codigo}</TableCell>
                            <TableCell>{detalle.articulo.Descripcion}</TableCell>
                            <TableCell align="right">{detalle.cantidad}</TableCell>
                            <TableCell align="right">${detalle.precioUnitario.toFixed(2)}</TableCell>
                            <TableCell align="right">${detalle.subtotal.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Pagos */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Pagos
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Método</TableCell>
                          <TableCell align="right">Monto</TableCell>
                          <TableCell>Referencia</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detalleData.obtenerDetalleVenta.pagos?.map((pago: any) => (
                          <TableRow key={pago.id}>
                            <TableCell>{pago.metodoPago}</TableCell>
                            <TableCell align="right">${pago.monto.toFixed(2)}</TableCell>
                            <TableCell>{pago.referencia || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="error">
                No se pudo cargar el detalle de la venta
              </Alert>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setModalDetalleAbierto(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};
