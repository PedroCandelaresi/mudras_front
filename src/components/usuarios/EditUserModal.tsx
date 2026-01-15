"use client";
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, FormControlLabel, Checkbox, Box } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { UsuarioListado } from './UserTable';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export interface EditarUsuarioForm {
  email?: string | null;
  displayName?: string;
  isActive?: boolean;
}

const schema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  displayName: z.string().trim().min(1, 'El nombre a mostrar es obligatorio').optional(),
  isActive: z.boolean().optional(),
});

interface Props {
  open: boolean;
  usuario: UsuarioListado | null;
  onClose: () => void;
  onSubmit: (data: EditarUsuarioForm) => void;
}

export function EditUserModal({ open, usuario, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EditarUsuarioForm>({
    values: {
      email: usuario?.email ?? '',
      displayName: usuario?.displayName ?? '',
      isActive: usuario?.isActive ?? true,
    },
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    reset({ email: usuario?.email ?? '', displayName: usuario?.displayName ?? '', isActive: usuario?.isActive ?? true });
  }, [usuario, reset]);

  const submit = handleSubmit((data) => { onSubmit(data); });

  /* ======================== Render ======================== */
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' } }}
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontWeight: 700 }}>
        Editar Usuario
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Email"
            {...register('email')}
            size="small"
            error={!!errors.email}
            helperText={errors.email?.message || ''}
            fullWidth
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <TextField
            label="Nombre a mostrar"
            {...register('displayName')}
            size="small"
            error={!!errors.displayName}
            helperText={errors.displayName?.message || ''}
            fullWidth
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormControlLabel control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Activo" />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600 }}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disableElevation sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
