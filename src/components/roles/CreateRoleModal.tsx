"use client";

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '@/lib/api';

export const esquemaRol = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  slug: z.string().min(2, 'Slug requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().optional(),
});

export type CrearRolForm = z.infer<typeof esquemaRol>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback para refrescar lista
}

export function CreateRoleModal({ open, onClose, onCreated }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CrearRolForm>({
    resolver: zodResolver(esquemaRol),
    defaultValues: { name: '', slug: '', description: '' },
  });

  async function onSubmit(values: CrearRolForm) {
    await apiFetch('/roles', { method: 'POST', body: values });
    onClose();
    reset();
    onCreated?.();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo Rol</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nombre"
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            fullWidth
          />
          <TextField
            label="Slug"
            {...register('slug')}
            error={Boolean(errors.slug)}
            helperText={errors.slug?.message}
            fullWidth
          />
          <TextField
            label="Descripción"
            {...register('description')}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>Crear</Button>
      </DialogActions>
    </Dialog>
  );
}
