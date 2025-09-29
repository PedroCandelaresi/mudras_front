'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  IconButton,
} from '@mui/material';
import {
  IconPlus,
  IconTrash,
  IconCreditCard,
  IconCash,
  IconBuildingBank,
} from '@tabler/icons-react';
import { OBTENER_PUESTOS_VENTA, type ArticuloCaja, type PuestoVenta, type PuestosVentaResponse } from '@/components/caja-registradora/graphql/queries';
import {
  CREAR_VENTA_CAJA,
  type MetodoPago,
  type PagoVenta,
  type CrearVentaCajaResponse,
  type CrearVentaCajaInput,
} from '@/components/caja-registradora/graphql/mutations';

interface ArticuloVenta {
  id: number;
  Codigo: string;
  Descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}


interface ModalConfirmacionVentaProps {
  open: boolean;
  onClose: () => void;
  articulos: ArticuloVenta[];
  onVentaCreada: (venta: any) => void;
}

const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: IconCash },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito', icon: IconCreditCard },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito', icon: IconCreditCard },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: IconBuildingBank },
  { value: 'CHEQUE', label: 'Cheque', icon: IconBuildingBank },
  { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente', icon: IconBuildingBank },
  { value: 'OTRO', label: 'Otro', icon: IconBuildingBank },
] as const;

const TIPOS_VENTA = [
  { value: 'MOSTRADOR', label: 'Mostrador' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'TELEFONICA', label: 'Telefónica' },
] as const;

export const ModalConfirmacionVenta: React.FC<ModalConfirmacionVentaProps> = ({
  open,
  onClose,
  articulos,
  onVentaCreada,
}) => {
  const [tipoVenta, setTipoVenta] = useState<'MOSTRADOR' | 'DELIVERY' | 'ONLINE' | 'TELEFONICA'>('MOSTRADOR');
  const [puestoVentaId, setPuestoVentaId] = useState<number>(0);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [pagos, setPagos] = useState<PagoVenta[]>([]);
  const [nuevoPago, setNuevoPago] = useState<PagoVenta>({
    metodoPago: 'EFECTIVO',
    monto: 0,
  });

  // Queries
  const { data: puestosData, loading: loadingPuestos } = useQuery<PuestosVentaResponse>(OBTENER_PUESTOS_VENTA);

  // Mutations
  const [crearVenta, { loading: creandoVenta }] = useMutation<CrearVentaCajaResponse>(CREAR_VENTA_CAJA, {
    onCompleted: (data) => {
      onVentaCreada(data.crearVentaCaja);
      handleClose();
    },
    onError: (error) => {
      console.error('Error al crear venta:', error);
    },
  });

  // Calcular totales
  const subtotal = articulos.reduce((sum, art) => sum + art.subtotal, 0);
  const totalPagos = pagos.reduce((sum, pago) => sum + pago.monto, 0);
  const diferencia = totalPagos - subtotal;
  const cambio = diferencia > 0 ? diferencia : 0;

  // Resetear formulario al abrir
  useEffect(() => {
    if (open) {
      setTipoVenta('MOSTRADOR');
      setPuestoVentaId(puestosData?.obtenerPuestosVenta?.[0]?.id || 0);
      setClienteId(null);
      setObservaciones('');
      setPagos([]);
      setNuevoPago({
        metodoPago: 'EFECTIVO',
        monto: subtotal,
      });
    }
  }, [open, subtotal, puestosData]);

  const handleClose = () => {
    onClose();
  };

  const handleAgregarPago = () => {
    if (nuevoPago.monto > 0) {
      setPagos(prev => [...prev, { ...nuevoPago }]);
      setNuevoPago({
        metodoPago: 'EFECTIVO',
        monto: Math.max(0, subtotal - totalPagos - nuevoPago.monto),
      });
    }
  };

  const handleEliminarPago = (index: number) => {
    setPagos(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmarVenta = () => {
    if (!puestoVentaId || pagos.length === 0) return;

    const input: CrearVentaCajaInput = {
      tipoVenta,
      puestoVentaId,
      clienteId: clienteId || undefined,
      observaciones: observaciones || undefined,
      detalles: articulos.map(art => ({
        articuloId: art.id,
        cantidad: art.cantidad,
        precioUnitario: art.precioUnitario,
      })),
      pagos: pagos.map(pago => ({
        metodoPago: pago.metodoPago,
        monto: pago.monto,
        referencia: pago.referencia,
        numeroTarjetaUltimos4: pago.numeroTarjetaUltimos4,
        tipoTarjeta: pago.tipoTarjeta,
        numeroCuotas: pago.numeroCuotas,
        observaciones: pago.observaciones,
      })),
    };

    crearVenta({ variables: { input } });
  };

  const puedeConfirmar = puestoVentaId > 0 && pagos.length > 0 && Math.abs(diferencia) < 0.01;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">Confirmar Venta</Typography>
        <Typography variant="body2" color="text.secondary">
          Revisa los detalles y configura el pago
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Configuración de venta */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Configuración de Venta
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Venta</InputLabel>
                    <Select
                      value={tipoVenta}
                      onChange={(e) => setTipoVenta(e.target.value as any)}
                      label="Tipo de Venta"
                    >
                      {TIPOS_VENTA.map(tipo => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Puesto de Venta</InputLabel>
                    <Select
                      value={puestoVentaId}
                      onChange={(e) => setPuestoVentaId(Number(e.target.value))}
                      label="Puesto de Venta"
                      disabled={loadingPuestos}
                    >
                      {puestosData?.obtenerPuestosVenta?.map((puesto: PuestoVenta) => (
                        <MenuItem key={puesto.id} value={puesto.id}>
                          {puesto.nombre}
                          {puesto.emitirComprobanteAfip && (
                            <Chip label="AFIP" size="small" sx={{ ml: 1 }} />
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={2}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Observaciones adicionales..."
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Resumen de artículos */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Artículos ({articulos.length})
              </Typography>
              
              <TableContainer sx={{ maxHeight: 200 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Artículo</TableCell>
                      <TableCell align="right">Cant.</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {articulos.map((articulo) => (
                      <TableRow key={articulo.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {articulo.Codigo} - {articulo.Descripcion}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{articulo.cantidad}</TableCell>
                        <TableCell align="right">${articulo.precioUnitario.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            ${articulo.subtotal.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${subtotal.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Configuración de pagos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Métodos de Pago
              </Typography>

              {/* Agregar nuevo pago */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Método</InputLabel>
                      <Select
                        value={nuevoPago.metodoPago}
                        onChange={(e) => setNuevoPago(prev => ({ ...prev, metodoPago: e.target.value as any }))}
                        label="Método"
                      >
                        {METODOS_PAGO.map(metodo => (
                          <MenuItem key={metodo.value} value={metodo.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <metodo.icon size={16} />
                              {metodo.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Monto"
                      value={nuevoPago.monto}
                      onChange={(e) => setNuevoPago(prev => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<IconPlus size={16} />}
                      onClick={handleAgregarPago}
                      disabled={nuevoPago.monto <= 0}
                    >
                      Agregar
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Lista de pagos */}
              {pagos.length > 0 && (
                <TableContainer sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Método</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagos.map((pago, index) => {
                        const metodo = METODOS_PAGO.find(m => m.value === pago.metodoPago);
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                {metodo && <metodo.icon size={16} />}
                                {metodo?.label}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              ${pago.monto.toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleEliminarPago(index)}
                                color="error"
                              >
                                <IconTrash size={16} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Resumen de pagos */}
              <Divider sx={{ my: 2 }} />
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Total Pagos:</Typography>
                  <Typography color={totalPagos >= subtotal ? 'success.main' : 'error.main'}>
                    ${totalPagos.toFixed(2)}
                  </Typography>
                </Box>
                {diferencia !== 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography fontWeight="bold">
                      {diferencia > 0 ? 'Cambio:' : 'Faltante:'}
                    </Typography>
                    <Typography
                      fontWeight="bold"
                      color={diferencia > 0 ? 'success.main' : 'error.main'}
                    >
                      ${Math.abs(diferencia).toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Alertas */}
              {diferencia < -0.01 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Falta ${Math.abs(diferencia).toFixed(2)} para completar el pago
                </Alert>
              )}
              {diferencia > 0.01 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Cambio a entregar: ${cambio.toFixed(2)}
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={creandoVenta}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmarVenta}
          disabled={!puedeConfirmar || creandoVenta}
          startIcon={creandoVenta ? <CircularProgress size={16} /> : undefined}
        >
          {creandoVenta ? 'Procesando...' : 'Confirmar Venta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
