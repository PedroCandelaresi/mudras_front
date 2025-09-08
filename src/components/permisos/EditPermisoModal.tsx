"use client";

import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PermisoListado } from './PermisosTable';

export interface EditarPermisoForm {
  resource?: string;
  action?: string;
  description?: string | null;
}

interface Props {
  open: boolean;
  permiso: PermisoListado | null;
  onClose: () => void;
  onSubmit: (data: EditarPermisoForm) => void;
}

const schema = z.object({
  resource: z.string().trim().min(2, 'El recurso es obligatorio').optional(),
  action: z.string().trim().min(2, 'La acción es obligatoria').optional(),
  description: z.string().trim().optional().or(z.literal('')).nullable(),
});

export function EditPermisoModal({ open, permiso, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditarPermisoForm>({
    values: {
      resource: permiso?.resource ?? '',
      action: permiso?.action ?? '',
      description: permiso?.description ?? '',
    },
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    reset({ resource: permiso?.resource ?? '', action: permiso?.action ?? '', description: permiso?.description ?? '' });
  }, [permiso, reset]);

  const submit = handleSubmit((data) => { onSubmit({ ...data, description: data.description || null }); });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Permiso</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-3 py-2">
          <TextField label="Recurso" size="small" {...register('resource')} error={!!errors.resource} helperText={errors.resource?.message} />
          <TextField label="Acción" size="small" {...register('action')} error={!!errors.action} helperText={errors.action?.message} />
          <TextField label="Descripción (opcional)" size="small" {...register('description')} error={!!errors.description} helperText={errors.description?.message} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
