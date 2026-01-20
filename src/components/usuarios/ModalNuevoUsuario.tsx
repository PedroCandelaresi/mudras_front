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
  Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { IconEye, IconEyeOff, IconUserPlus } from '@tabler/icons-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { grisNeutro } from '@/ui/colores';
import { CREAR_USUARIO_ADMIN_MUTATION } from './graphql/mutations';



export interface CrearUsuarioForm {
  username: string;
  email?: string;
  displayName: string;
  passwordTemporal: string;
  isActive: boolean;
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
});

export default function ModalNuevoUsuario({ open, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CrearUsuarioForm>({
    defaultValues: { isActive: true },
    resolver: zodResolver(schema),
  });
  const [mostrarPassword, setMostrarPassword] = React.useState(false);

  const [crearUsuario, { loading }] = useMutation(CREAR_USUARIO_ADMIN_MUTATION);

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      reset({ isActive: true, username: '', email: '', displayName: '', passwordTemporal: '' });
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
            isActive: data.isActive
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
              // We need to call the original register onChange if we want standard behavior, 
              // but setValue works if we manage it. 
              // Creating a wrapper around register is safer but overriding onChange works if we use setValue with validate.
              // However, simply passing onChange AFTER register overrides the hook form on change.
              // Let's use setValue directly and assume it updates the state.
              // Actually, the best way with RHF is to let it handle it, or use Controller.
              // But simplified:
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
            control={<Checkbox defaultChecked {...register('isActive')} sx={{ color: grisNeutro.primary, '&.Mui-checked': { color: grisNeutro.primary } }} />}
            label="Usuario Activo"
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
          {loading ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
