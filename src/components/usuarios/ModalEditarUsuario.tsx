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
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@apollo/client/react';
import { IconEdit } from '@tabler/icons-react';

import { azul } from '@/ui/colores';
import { UsuarioListado } from './TablaUsuarios';
import { ACTUALIZAR_USUARIO_ADMIN_MUTATION, OBTENER_ROLES_QUERY } from './graphql/mutations';
import { USUARIOS_ADMIN_QUERY } from './graphql/queries';

export interface EditarUsuarioForm {
  email?: string | null;
  displayName?: string;
  isActive?: boolean;
  roles?: string[];
}

const schema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  displayName: z.string().trim().min(1, 'El nombre a mostrar es obligatorio').optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
});

interface Props {
  open: boolean;
  usuario: UsuarioListado | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarUsuario({ open, usuario, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<EditarUsuarioForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      displayName: '',
      isActive: true,
      roles: []
    }
  });

  const [updateUser, { loading }] = useMutation(ACTUALIZAR_USUARIO_ADMIN_MUTATION, {
    refetchQueries: [{ query: USUARIOS_ADMIN_QUERY }],
  });

  const { data: rolesData } = useQuery<{ roles: { id: string; nombre: string; slug: string }[] }>(OBTENER_ROLES_QUERY);

  useEffect(() => {
    if (usuario && open) {
      reset({
        email: usuario.email ?? '',
        displayName: usuario.displayName ?? '',
        isActive: usuario.isActive ?? true,
        roles: usuario.roles || []
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
            isActive: data.isActive,
            roles: data.roles
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
          border: `1px solid ${azul.borderOuter}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: azul.headerBg,
          color: azul.headerText,
          borderBottom: `1px solid ${azul.headerBorder}`,
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
            onChange={(e) => {
              const val = e.target.value;
              const finalVal = val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val;
              setValue('displayName', finalVal, { shouldValidate: true });
            }}
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
                    sx={{ color: azul.primary, '&.Mui-checked': { color: azul.primary } }}
                  />
                }
                label="Usuario Activo"
              />
            )}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Roles</InputLabel>
            <Controller
              control={control}
              name="roles"
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Roles" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {rolesData?.roles?.map((r: any) => (
                    <MenuItem key={r.id} value={r.slug}>
                      {r.nombre} ({r.slug})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: azul.toolbarBg, borderTop: `1px solid ${azul.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: azul.textStrong }}>
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
            bgcolor: azul.primary,
            '&:hover': { bgcolor: azul.primaryHover }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
