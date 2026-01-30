"use client";

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '@/lib/api';
import { grisNeutro } from '@/ui/colores';

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
      <DialogTitle sx={{ bgcolor: grisNeutro.headerBg, color: grisNeutro.headerText, borderBottom: `1px solid ${grisNeutro.headerBorder}`, fontWeight: 700 }}>
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
      <DialogActions sx={{ p: 2, bgcolor: grisNeutro.toolbarBg, borderTop: `1px solid ${grisNeutro.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: grisNeutro.textStrong }}>Cancelar</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
          disableElevation
          sx={{ borderRadius: 0, fontWeight: 600, bgcolor: grisNeutro.primary, '&:hover': { bgcolor: grisNeutro.primaryHover } }}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
