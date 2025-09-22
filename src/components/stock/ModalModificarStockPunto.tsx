'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { verde } from '@/ui/colores';

interface Props {
  open: boolean;
  onClose: () => void;
  articulo: any;
  onStockActualizado: () => void;
}

export default function ModalModificarStockPunto({ 
  open, 
  onClose, 
  articulo, 
  onStockActualizado 
}: Props) {
  const [nuevaCantidad, setNuevaCantidad] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!articulo || !nuevaCantidad) return;

    const cantidad = parseFloat(nuevaCantidad);
    if (isNaN(cantidad) || cantidad < 0) {
      setError('La cantidad debe ser un número válido mayor o igual a 0');
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
            mutation ModificarStockPunto($puntoMudrasId: Int!, $articuloId: Int!, $nuevaCantidad: Float!) {
              modificarStockPunto(
                puntoMudrasId: $puntoMudrasId
                articuloId: $articuloId
                nuevaCantidad: $nuevaCantidad
              )
            }
          `,
          variables: {
            puntoMudrasId: articulo.puntoVentaId,
            articuloId: articulo.id,
            nuevaCantidad: cantidad
          }
        })
      });

      const result = await response.json();
      
      if (result.data?.modificarStockPunto) {
        console.log(`✅ Stock actualizado para ${articulo.nombre}`);
        onStockActualizado();
        handleClose();
      } else {
        setError(result.errors?.[0]?.message || 'Error al actualizar el stock');
      }
    } catch (error) {
      console.error('Error al modificar stock:', error);
      setError('Error de conexión al actualizar el stock');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNuevaCantidad('');
    setError('');
    onClose();
  };

  const handleAjusteRapido = (ajuste: number) => {
    const stockActual = articulo?.stockAsignado || 0;
    const nuevoStock = Math.max(0, stockActual + ajuste);
    setNuevaCantidad(nuevoStock.toString());
  };

  if (!articulo) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon icon="mdi:package-variant" color={verde.primary} width={24} />
          <Typography variant="h6" fontWeight={600}>
            Modificar Stock
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Artículo
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="body1" fontWeight={600}>
              {articulo.nombre}
            </Typography>
            <Chip 
              label={articulo.codigo} 
              size="small" 
              variant="outlined"
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Punto: {articulo.puntoVentaNombre}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box display="flex" gap={3}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Stock Actual
            </Typography>
            <Typography variant="h4" fontWeight={600} color={verde.textStrong}>
              {articulo.stockAsignado || 0}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Stock Total Sistema
            </Typography>
            <Typography variant="h4" fontWeight={600} color="text.secondary">
              {articulo.stockTotal || 0}
            </Typography>
          </Box>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Nueva Cantidad
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={nuevaCantidad}
            onChange={(e) => setNuevaCantidad(e.target.value)}
            placeholder="Ingresa la nueva cantidad"
            inputProps={{ min: 0, step: 1 }}
            size="medium"
            sx={{ mb: 2 }}
          />

          <Box display="flex" gap={1} flexWrap="wrap">
            <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
              Ajustes rápidos:
            </Typography>
            <Tooltip title="Restar 10">
              <IconButton 
                size="small" 
                onClick={() => handleAjusteRapido(-10)}
                sx={{ bgcolor: 'error.light', color: 'white', '&:hover': { bgcolor: 'error.main' } }}
              >
                <Typography variant="caption" fontWeight={600}>-10</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="Restar 1">
              <IconButton 
                size="small" 
                onClick={() => handleAjusteRapido(-1)}
                sx={{ bgcolor: 'error.light', color: 'white', '&:hover': { bgcolor: 'error.main' } }}
              >
                <Typography variant="caption" fontWeight={600}>-1</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="Sumar 1">
              <IconButton 
                size="small" 
                onClick={() => handleAjusteRapido(1)}
                sx={{ bgcolor: verde.primary, color: 'white', '&:hover': { bgcolor: verde.primaryHover } }}
              >
                <Typography variant="caption" fontWeight={600}>+1</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="Sumar 10">
              <IconButton 
                size="small" 
                onClick={() => handleAjusteRapido(10)}
                sx={{ bgcolor: verde.primary, color: 'white', '&:hover': { bgcolor: verde.primaryHover } }}
              >
                <Typography variant="caption" fontWeight={600}>+10</Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !nuevaCantidad}
          sx={{
            bgcolor: verde.primary,
            '&:hover': { bgcolor: verde.primaryHover }
          }}
        >
          {loading ? 'Actualizando...' : 'Actualizar Stock'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
