"use client";
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, FormControlLabel, Checkbox, IconButton, InputAdornment, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  onSubmit: (data: CrearUsuarioForm) => void;
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



export function CreateUserModal({ open, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CrearUsuarioForm>({
    defaultValues: { isActive: true },
    resolver: zodResolver(schema),
  });
  const [mostrarPassword, setMostrarPassword] = React.useState(false);

  const submit = handleSubmit((data) => { onSubmit(data); reset(); });

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
        Nuevo Usuario
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Usuario"
            {...register('username')}
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
          <FormControlLabel control={<Checkbox defaultChecked {...register('isActive')} />} label="Activo" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600 }}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disableElevation sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }}>Crear</Button>
      </DialogActions>
    </Dialog>
  );
}
