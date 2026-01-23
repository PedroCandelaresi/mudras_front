"use client";

import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { azul } from '@/ui/colores';

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' } }}>
      <DialogTitle sx={{ bgcolor: azul.headerBg, color: azul.headerText, borderBottom: `1px solid ${azul.headerBorder}`, fontWeight: 700 }}>
        Nuevo Permiso
      </DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-3 py-2">
          <TextField label="Recurso" size="small" {...register('resource')} error={!!errors.resource} helperText={errors.resource?.message} />
          <TextField label="Acción" size="small" {...register('action')} error={!!errors.action} helperText={errors.action?.message} />
          <TextField label="Descripción (opcional)" size="small" {...register('description')} error={!!errors.description} helperText={errors.description?.message} />
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: azul.toolbarBg, borderTop: `1px solid ${azul.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: azul.textStrong }}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disableElevation sx={{ borderRadius: 0, fontWeight: 600, bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }}>
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
