"use client";
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, FormControlLabel, Checkbox } from '@mui/material';
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Usuario</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-3 py-2">
          <TextField label="Email" {...register('email')} size="small" error={!!errors.email} helperText={errors.email?.message || ''} />
          <TextField label="Nombre a mostrar" {...register('displayName')} size="small" error={!!errors.displayName} helperText={errors.displayName?.message || ''} />
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormControlLabel control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Activo" />
            )}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
