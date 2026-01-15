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
        Nuevo Rol
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} mt={1}>
          <TextField
            label="Nombre"
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            fullWidth
            size="small"
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <TextField
            label="Slug"
            {...register('slug')}
            error={Boolean(errors.slug)}
            helperText={errors.slug?.message}
            fullWidth
            size="small"
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <TextField
            label="Descripción"
            {...register('description')}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
            fullWidth
            multiline
            minRows={2}
            size="small"
            InputProps={{ sx: { borderRadius: 0 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600 }}>Cancelar</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
          disableElevation
          sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
