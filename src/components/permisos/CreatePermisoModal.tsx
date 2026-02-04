"use client";

import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Box, Typography, Divider, IconButton, Alert, Autocomplete } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { grisNeutro, azul } from '@/ui/colores';
import { IconKey, IconX, IconInfoCircle } from '@tabler/icons-react';

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

const SYSTEM_RESOURCES = [
  'dashboard', 'productos', 'stock', 'depositos', 'puntos_venta', 'rubros',
  'ventas', 'caja', 'clientes', 'pedidos', 'tienda_online', 'promociones',
  'proveedores', 'compras', 'gastos', 'admin', 'usuarios', 'roles', 'contabilidad'
];

const SYSTEM_ACTIONS = ['read', 'create', 'update', 'delete', 'info', 'precios', 'costos', 'stock'];

export function CreatePermisoModal({ open, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CrearPermisoForm>({
    defaultValues: { resource: '', action: '', description: '' },
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit((data) => { onSubmit({ ...data, description: data.description || null }); reset(); });

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
              Nuevo Permiso
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Registra una nueva capacidad en el sistema
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

          <Alert severity="info" icon={<IconInfoCircle size={20} />} sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Los permisos definen <strong>qué se puede hacer</strong>. Para que surtan efecto, deben coincidir con los definidos en el código del sistema.
            </Typography>
          </Alert>

          <Box display="grid" gap={3}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Autocomplete
                freeSolo
                options={SYSTEM_RESOURCES}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recurso (Resource)"
                    placeholder="ej: productos"
                    size="small"
                    error={!!errors.resource}
                    helperText={errors.resource?.message}
                    fullWidth
                    InputProps={{ ...params.InputProps, sx: { borderRadius: 0, bgcolor: '#fff' } }}
                  />
                )}
                onInputChange={(_, val) => setValue('resource', val)}
              />

              <Autocomplete
                freeSolo
                options={SYSTEM_ACTIONS}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Acción (Action)"
                    placeholder="ej: create"
                    size="small"
                    error={!!errors.action}
                    helperText={errors.action?.message}
                    fullWidth
                    InputProps={{ ...params.InputProps, sx: { borderRadius: 0, bgcolor: '#fff' } }}
                  />
                )}
                onInputChange={(_, val) => setValue('action', val)}
              />
            </Box>

            <TextField
              label="Descripción (Opcional)"
              placeholder="Explica para qué sirve este permiso..."
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
          Crear Permiso
        </Button>
      </DialogActions>
    </Dialog>
  );
}
