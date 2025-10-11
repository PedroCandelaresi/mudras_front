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
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';

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
  const [cantidad, setCantidad] = useState<number>(0);
  const [puntoVentaId, setPuntoVentaId] = useState<string>('');
  const [costo, setCosto] = useState<number>(0);

  useEffect(() => {
    if (!open) return;

    setCantidad(0);
    setCosto(0);
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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <TexturedPanel accent={ACCENT_COLOR} radius={10} contentPadding={0}>
        <DialogTitle>
          {`Modificar stock${articulo ? ` — ${articulo.Descripcion ?? ''}` : ''}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {articulo ? (
              <Typography variant="subtitle2">
                {`Código: ${articulo.Codigo ?? '—'}`}
              </Typography>
            ) : null}

            <TextField
              label="Cantidad"
              type="number"
              value={cantidad}
              onChange={(event) => setCantidad(Number(event.target.value))}
              fullWidth
            />

            <TextField
              select
              label="Punto de venta"
              value={puntoVentaId}
              onChange={(event) => setPuntoVentaId(event.target.value)}
              fullWidth
            >
              {puntosVenta.map((pv) => (
                <MenuItem key={pv.id} value={pv.id}>
                  {pv.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Costo unitario"
              type="number"
              value={costo}
              onChange={(event) => setCosto(Number(event.target.value))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ pr: 2.5, pb: 2.5 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Confirmar
          </Button>
        </DialogActions>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalModificarStock;
