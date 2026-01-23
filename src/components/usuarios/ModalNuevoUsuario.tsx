'use client';

import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { IconEye, IconEyeOff, IconUserPlus } from '@tabler/icons-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { azul } from '@/ui/colores';
import { CREAR_USUARIO_ADMIN_MUTATION, OBTENER_ROLES_QUERY } from './graphql/mutations';
import { USUARIOS_ADMIN_QUERY } from './graphql/queries';
import { useQuery } from '@apollo/client/react';

export interface CrearUsuarioForm {
  username: string;
  email?: string;
  displayName: string;
  passwordTemporal: string;
  isActive: boolean;
  roles?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schema = z.object({
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  displayName: z.string().trim().min(1, 'El nombre a mostrar es obligatorio'),
  passwordTemporal: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
    .regex(/\d/, 'Debe incluir al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un símbolo'),
  isActive: z.boolean(),
  roles: z.array(z.string()).optional(),
});

export default function ModalNuevoUsuario({ open, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<CrearUsuarioForm>({
    defaultValues: { isActive: true, roles: [] },
    resolver: zodResolver(schema),
  });
  const [mostrarPassword, setMostrarPassword] = React.useState(false);

  const [crearUsuario, { loading }] = useMutation(CREAR_USUARIO_ADMIN_MUTATION, {
    refetchQueries: [{ query: USUARIOS_ADMIN_QUERY }],
  });

  const { data: rolesData } = useQuery<{ roles: { id: string; nombre: string; slug: string }[] }>(OBTENER_ROLES_QUERY);

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      reset({ isActive: true, username: '', email: '', displayName: '', passwordTemporal: '', roles: [] });
    }
  }, [open, reset]);

  const onSubmit = async (data: CrearUsuarioForm) => {
    try {
      await crearUsuario({
        variables: {
          input: {
            username: data.username,
            email: data.email || null,
            displayName: data.displayName,
            passwordTemporal: data.passwordTemporal,
            isActive: data.isActive,
            roles: data.roles
          }
        }
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      alert('Error al crear usuario: ' + (error.message || 'Desconocido'));
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
        <IconUserPlus size={24} />
        Nuevo Usuario
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Box component="form" display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Usuario"
            {...register('username')}
            onChange={(e) => {
              const val = e.target.value;
              const finalVal = val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val;
              setValue('username', finalVal, { shouldValidate: true });
            }}
            size="small"
            error={!!errors.username}
            helperText={errors.username?.message}
            fullWidth
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <TextField
            label="Email"
            {...register('email')}
            size="small"
            error={!!errors.email}
            helperText={errors.email?.message}
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
            helperText={errors.displayName?.message}
            fullWidth
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <TextField
            label="Password temporal"
            type={mostrarPassword ? 'text' : 'password'}
            {...register('passwordTemporal')}
            size="small"
            error={!!errors.passwordTemporal}
            helperText={errors.passwordTemporal?.message}
            fullWidth
            InputProps={{
              sx: { borderRadius: 0 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="mostrar contraseña" onClick={() => setMostrarPassword((v) => !v)} edge="end" size="small">
                    {mostrarPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={<Checkbox defaultChecked {...register('isActive')} sx={{ color: azul.primary, '&.Mui-checked': { color: azul.primary } }} />}
            label="Usuario Activo"
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
          {loading ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
