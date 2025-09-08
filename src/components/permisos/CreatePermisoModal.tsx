"use client";

import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export interface CrearPermisoForm {
  resource: string;
  action: string;
  description?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CrearPermisoForm) => void;
}

const schema = z.object({
  resource: z.string().trim().min(2, 'El recurso es obligatorio'),
  action: z.string().trim().min(2, 'La acción es obligatoria'),
  description: z.string().trim().optional().or(z.literal('')).nullable(),
});

export function CreatePermisoModal({ open, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CrearPermisoForm>({
    defaultValues: { resource: '', action: '', description: '' },
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit((data) => { onSubmit({ ...data, description: data.description || null }); reset(); });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo Permiso</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-3 py-2">
          <TextField label="Recurso" size="small" {...register('resource')} error={!!errors.resource} helperText={errors.resource?.message} />
          <TextField label="Acción" size="small" {...register('action')} error={!!errors.action} helperText={errors.action?.message} />
          <TextField label="Descripción (opcional)" size="small" {...register('description')} error={!!errors.description} helperText={errors.description?.message} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Crear</Button>
      </DialogActions>
    </Dialog>
  );
}
