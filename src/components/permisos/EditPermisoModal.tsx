"use client";

import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Box, Typography, IconButton, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PermisoListado } from './PermisosTable';
import { grisNeutro } from '@/ui/colores';
import { IconX, IconEdit, IconInfoCircle } from '@tabler/icons-react';

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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: `1px solid ${grisNeutro.borderOuter}`,
          boxShadow: 'none',
          bgcolor: '#fff'
        }
      }}
    >
      <DialogTitle sx={{
        p: 2,
        minHeight: 60,
        display: 'flex',
        alignItems: 'center',
        bgcolor: grisNeutro.primary,
        color: '#fff'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700}>
              Editar Permiso
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Modifica las propiedades del permiso
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton onClick={onClose} sx={{ color: '#fff' }}>
              <IconX size={24} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#f8fafb' }}>
        <Box p={3}>
          <Alert severity="warning" icon={<IconInfoCircle size={20} />} sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              <strong>Límite de cuidado:</strong> Modificar el <code>resource</code> o <code>action</code> de un permiso existente puede afectar a los roles que ya lo tienen asignado y a la lógica interna del sistema.
            </Typography>
          </Alert>

          <Box display="grid" gap={3}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Recurso (Resource)"
                size="small"
                {...register('resource')}
                error={!!errors.resource}
                helperText={errors.resource?.message}
                fullWidth
                InputProps={{ sx: { borderRadius: 0, bgcolor: '#fff' } }}
              />
              <TextField
                label="Acción (Action)"
                size="small"
                {...register('action')}
                error={!!errors.action}
                helperText={errors.action?.message}
                fullWidth
                InputProps={{ sx: { borderRadius: 0, bgcolor: '#fff' } }}
              />
            </Box>

            <TextField
              label="Descripción"
              size="small"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
              multiline
              rows={2}
              InputProps={{ sx: { borderRadius: 0, bgcolor: '#fff' } }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: grisNeutro.toolbarBg, borderTop: `1px solid ${grisNeutro.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: grisNeutro.textStrong }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disableElevation
          sx={{
            borderRadius: 0,
            fontWeight: 600,
            bgcolor: grisNeutro.primary,
            '&:hover': { bgcolor: grisNeutro.primaryHover }
          }}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}
