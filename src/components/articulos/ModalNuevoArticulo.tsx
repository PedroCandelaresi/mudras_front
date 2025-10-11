'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';

const ACCENT_COLOR = '#2b4735';

type UserRole = 'admin' | 'diseñadora' | 'vendedor';

type FormState = {
  descripcion: string;
  codigo: string;
  rubro: string;
  precio: string;
};

interface ModalNuevoArticuloProps {
  open: boolean;
  onClose: () => void;
  userRole?: UserRole;
  onSubmit?: (payload: FormState & { creadorRole: UserRole }) => void;
}

const INITIAL_STATE: FormState = {
  descripcion: '',
  codigo: '',
  rubro: '',
  precio: '',
};

const ModalNuevoArticulo = ({
  open,
  onClose,
  userRole = 'admin',
  onSubmit,
}: ModalNuevoArticuloProps) => {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  useEffect(() => {
    if (open) {
      setForm(INITIAL_STATE);
    }
  }, [open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setForm(INITIAL_STATE);
    onClose();
  };

  const handleSave = () => {
    const payload = { ...form, creadorRole: userRole };
    if (onSubmit) {
      onSubmit(payload);
    } else {
      // Placeholder hasta conectar con el backend
      console.log('Crear artículo', payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <TexturedPanel accent={ACCENT_COLOR} radius={10} contentPadding={0}>
        <DialogTitle>Nuevo artículo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 1 }}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              fullWidth
            />
            <TextField label="Código" name="codigo" value={form.codigo} onChange={handleChange} fullWidth />
            <TextField label="Rubro" name="rubro" value={form.rubro} onChange={handleChange} fullWidth />
            <TextField
              label="Precio"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              type="number"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ pr: 2.5, pb: 2.5 }}>
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalNuevoArticulo;
