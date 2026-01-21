'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import type { Articulo } from '@/app/interfaces/mudras.types';

const ACCENT_COLOR = '#2b4735';

interface PuntoVenta {
  id: string;
  nombre: string;
}

interface ModalModificarStockProps {
  open: boolean;
  onClose: () => void;
  articulo?: Articulo | null;
  puntosVenta: PuntoVenta[];
  onStockActualizado: () => void;
}

const ModalModificarStock = ({
  open,
  onClose,
  articulo,
  puntosVenta,
  onStockActualizado,
}: ModalModificarStockProps) => {
  const [cantidad, setCantidad] = useState<string>('0');
  const [puntoVentaId, setPuntoVentaId] = useState<string>('');
  const [costo, setCosto] = useState<string>('0');

  useEffect(() => {
    if (!open) return;

    setCantidad('0');
    setCosto('0');
    setPuntoVentaId(puntosVenta[0]?.id ?? '');
  }, [open, puntosVenta]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    // TODO: Reemplazar por mutation real.
    console.log('Actualizar stock', { articulo, cantidad, puntoVentaId, costo });
    onStockActualizado();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 0,
          bgcolor: '#ffffff',
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: ACCENT_COLOR, color: '#ffffff', py: 2 }}>
        {`Modificar stock${articulo ? ` — ${articulo.Descripcion ?? ''}` : ''}`}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          {articulo ? (
            <Typography variant="subtitle2" color="text.secondary">
              {`Código: ${articulo.Codigo ?? '—'}`}
            </Typography>
          ) : null}

          <TextField
            label="Cantidad"
            value={cantidad}
            onChange={(event) => {
              const val = event.target.value;
              if (val === '' || /^\d*[.,]?\d*$/.test(val)) setCantidad(val);
            }}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            inputMode="decimal"
          />

          <TextField
            select
            label="Punto de venta"
            value={puntoVentaId}
            onChange={(event) => setPuntoVentaId(event.target.value)}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          >
            {puntosVenta.map((pv) => (
              <MenuItem key={pv.id} value={pv.id}>
                {pv.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Costo unitario"
            value={costo}
            onChange={(event) => {
              const val = event.target.value;
              if (val === '' || /^\d*[.,]?\d*$/.test(val)) setCosto(val);
            }}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            inputMode="decimal"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={handleClose} sx={{ color: 'text.secondary', borderRadius: 0 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ bgcolor: ACCENT_COLOR, borderRadius: 0, '&:hover': { bgcolor: ACCENT_COLOR } }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalModificarStock;
