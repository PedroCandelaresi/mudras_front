'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { IconEdit } from '@tabler/icons-react';

import { grisNeutro } from '@/ui/colores';
import { UsuarioListado } from './TablaUsuarios';
import { ACTUALIZAR_USUARIO_ADMIN_MUTATION } from './graphql/mutations';



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
  onSuccess: () => void;
}

export default function ModalEditarUsuario({ open, usuario, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EditarUsuarioForm>({
    resolver: zodResolver(schema),
  });

  const [updateUser, { loading }] = useMutation(ACTUALIZAR_USUARIO_ADMIN_MUTATION);

  useEffect(() => {
    if (usuario) {
      reset({
        email: usuario.email ?? '',
        displayName: usuario.displayName ?? '',
        isActive: usuario.isActive ?? true,
      });
    }
  }, [usuario, reset, open]);

  const onSubmit = async (data: EditarUsuarioForm) => {
    if (!usuario) return;
    try {
      await updateUser({
        variables: {
          id: usuario.id,
          input: {
            email: data.email || null,
            displayName: data.displayName,
            isActive: data.isActive
          }
        }
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error editando usuario:', error);
      alert('Error al editar usuario: ' + (error.message || 'Desconocido'));
    }
  };

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
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: grisNeutro.headerBg,
          color: grisNeutro.headerText,
          borderBottom: `1px solid ${grisNeutro.headerBorder}`,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <IconEdit size={24} />
        Editar Usuario
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Box component="form" display="flex" flexDirection="column" gap={2} mt={1}>
          {/* Info estática */}
          <TextField
            label="Usuario (No editable)"
            value={usuario?.username || ''}
            disabled
            size="small"
            fullWidth
            InputProps={{ sx: { borderRadius: 0, bgcolor: '#f5f5f5' } }}
          />

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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    sx={{ color: grisNeutro.primary, '&.Mui-checked': { color: grisNeutro.primary } }}
                  />
                }
                label="Usuario Activo"
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: grisNeutro.toolbarBg, borderTop: `1px solid ${grisNeutro.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: grisNeutro.textStrong }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disableElevation
          disabled={loading}
          sx={{
            borderRadius: 0,
            fontWeight: 600,
            bgcolor: grisNeutro.primary,
            '&:hover': { bgcolor: grisNeutro.primaryHover }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
