import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';

interface Pedido {
  proveedor: string;
  fecha: string;
  cantidad: string;
  costo: string;
}

interface ModalPedidoProps {
  open: boolean;
  onClose: () => void;
  pedido?: Pedido | null;
}

export default function ModalPedido({ open, onClose, pedido }: ModalPedidoProps) {
  const [form, setForm] = useState<Pedido>({ proveedor: '', fecha: '', cantidad: '', costo: '' });

  useEffect(() => {
    if (pedido) setForm(pedido);
    else setForm({ proveedor: '', fecha: '', cantidad: '', costo: '' });
  }, [pedido]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    // ...save logic...
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{pedido ? 'Editar Pedido' : 'Nuevo Pedido'}</DialogTitle>
      <DialogContent>
        <TextField label="Proveedor" name="proveedor" value={form.proveedor} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Fecha" name="fecha" value={form.fecha} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Cantidad" name="cantidad" value={form.cantidad} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Costo Total" name="costo" value={form.costo} onChange={handleChange} fullWidth margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
