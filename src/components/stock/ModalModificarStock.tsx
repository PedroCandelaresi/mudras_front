'use client';
import { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { Icon } from '@iconify/react';
// import { useMutation } from '@apollo/client';
import { PuntoMudras } from '@/interfaces/puntos-mudras';
import { verde } from '@/ui/colores';

interface StockPorPunto {
  puntoVentaId: number;
  puntoVentaNombre: string;
  stockActual: number;
  stockNuevo: string; // Cambiado a string para input controlado
}

interface Props {
  open: boolean;
  onClose: () => void;
  articulo: any;
  puntosVenta: PuntoMudras[];
  onStockActualizado: () => void;
}

export default function ModalModificarStock({
  open,
  onClose,
  articulo,
  puntosVenta,
  onStockActualizado
}: Props) {
  const [stockGeneral, setStockGeneral] = useState<string>('0');
  const [stockPorPuntos, setStockPorPuntos] = useState<StockPorPunto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (articulo && puntosVenta.length > 0) {
      setStockGeneral(articulo.stock || 0);

      // Inicializar stock por puntos
      const stockInicial = puntosVenta.map(punto => ({
        puntoVentaId: punto.id,
        puntoVentaNombre: punto.nombre,
        stockActual: articulo.stockPorPuntos?.[punto.id] || 0,
        stockNuevo: String(articulo.stockPorPuntos?.[punto.id] || 0)
      }));

      setStockGeneral(String(articulo.stock || 0));
      setStockPorPuntos(stockInicial);
    }
  }, [articulo, puntosVenta]);

  const calcularStockDistribuido = () => {
    return stockPorPuntos.reduce((total, punto) => total + (parseFloat(punto.stockNuevo) || 0), 0);
  };

  const calcularStockDisponible = () => {
    return (parseFloat(stockGeneral) || 0) - calcularStockDistribuido();
  };

  const handleStockPuntoChange = (puntoVentaId: number, nuevoStock: string) => {
    if (nuevoStock !== '' && !/^\d*[.,]?\d*$/.test(nuevoStock)) return;

    setStockPorPuntos(prev =>
      prev.map(punto =>
        punto.puntoVentaId === puntoVentaId
          ? { ...punto, stockNuevo: nuevoStock }
          : punto
      )
    );
  };

  const handleAjusteRapido = (puntoVentaId: number, cantidad: number) => {
    const punto = stockPorPuntos.find(p => p.puntoVentaId === puntoVentaId);
    if (punto) {
      const actual = parseFloat(punto.stockNuevo) || 0;
      const nuevoStock = Math.max(0, actual + cantidad);
      handleStockPuntoChange(puntoVentaId, String(nuevoStock));
    }
  };

  const handleGuardar = async () => {
    setError('');

    // Validaciones
    if (calcularStockDistribuido() > (parseFloat(stockGeneral) || 0)) {
      setError('El stock distribuido no puede ser mayor al stock general');
      return;
    }

    setLoading(true);

    try {
      // Aquí iría la mutation para actualizar el stock
      // Por ahora simulamos la operación
      await new Promise(resolve => setTimeout(resolve, 1000));

      onStockActualizado();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el stock');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setError('');
    onClose();
  };

  if (!articulo) return null;

  const stockDisponible = calcularStockDisponible();
  const stockDistribuido = calcularStockDistribuido();

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
          <Icon icon="mdi:package-variant" color={verde.primary} />
          <Typography variant="h6" fontWeight={600}>
            Modificar Stock - {articulo.nombre}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Código: {articulo.codigo}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Resumen de Stock */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Resumen de Stock
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Stock General"
                value={stockGeneral}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*[.,]?\d*$/.test(val)) {
                    setStockGeneral(val);
                  }
                }}
                fullWidth
                size="small"
                inputMode="decimal"
                InputProps={{
                  startAdornment: <Icon icon="mdi:warehouse" style={{ marginRight: 8, color: verde.primary }} />
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Stock Distribuido
                </Typography>
                <Typography variant="h6" color={verde.primary} fontWeight={600}>
                  {stockDistribuido}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Stock Disponible
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color={stockDisponible < 0 ? 'error.main' : 'text.primary'}
                >
                  {stockDisponible}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Estado
                </Typography>
                <Box mt={0.5}>
                  {stockDisponible < 0 ? (
                    <Chip label="Sobredistribuido" color="error" size="small" />
                  ) : stockDisponible === 0 ? (
                    <Chip label="Completamente distribuido" color="success" size="small" />
                  ) : (
                    <Chip label="Stock disponible" color="info" size="small" />
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ mb: 2 }} />

        {/* Distribución por Puntos de Venta */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Distribución por Puntos de Venta
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Punto de Venta</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Stock Actual</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Ajustes Rápidos</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Nuevo Stock</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Cambio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockPorPuntos.map((punto) => {
                const cambio = (parseFloat(punto.stockNuevo) || 0) - punto.stockActual;
                return (
                  <TableRow key={punto.puntoVentaId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Icon icon="mdi:store" color={verde.primary} />
                        <Typography variant="body2" fontWeight={500}>
                          {punto.puntoVentaNombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {punto.stockActual}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="Restar 10">
                          <IconButton
                            size="small"
                            onClick={() => handleAjusteRapido(punto.puntoVentaId, -10)}
                            disabled={(parseFloat(punto.stockNuevo) || 0) === 0}
                          >
                            <Icon icon="mdi:minus-circle" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Restar 1">
                          <IconButton
                            size="small"
                            onClick={() => handleAjusteRapido(punto.puntoVentaId, -1)}
                            disabled={(parseFloat(punto.stockNuevo) || 0) === 0}
                          >
                            <Icon icon="mdi:minus" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sumar 1">
                          <IconButton
                            size="small"
                            onClick={() => handleAjusteRapido(punto.puntoVentaId, 1)}
                          >
                            <Icon icon="mdi:plus" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sumar 10">
                          <IconButton
                            size="small"
                            onClick={() => handleAjusteRapido(punto.puntoVentaId, 10)}
                          >
                            <Icon icon="mdi:plus-circle" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        value={punto.stockNuevo}
                        onChange={(e) => handleStockPuntoChange(punto.puntoVentaId, e.target.value)}
                        size="small"
                        sx={{ color: verde.primary }}
                        inputMode="decimal"
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {cambio !== 0 && (
                        <Chip
                          label={`${cambio > 0 ? '+' : ''}${cambio}`}
                          size="small"
                          color={cambio > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCerrar} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={loading || stockDisponible < 0}
          sx={{
            bgcolor: verde.primary,
            '&:hover': { bgcolor: verde.primaryHover }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
