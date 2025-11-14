"use client";
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, FormControlLabel, Checkbox, IconButton, InputAdornment } from '@mui/material';
import { useForm } from 'react-hook-form';
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo Usuario</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-3 py-2">
          <TextField label="Usuario" {...register('username')} size="small" error={!!errors.username} helperText={errors.username?.message} />
          <TextField label="Email" {...register('email')} size="small" error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Nombre a mostrar" {...register('displayName')} size="small" error={!!errors.displayName} helperText={errors.displayName?.message} />
          <TextField 
            label="Password temporal" 
            type={mostrarPassword ? 'text' : 'password'} 
            {...register('passwordTemporal')} 
            size="small" 
            error={!!errors.passwordTemporal} 
            helperText={errors.passwordTemporal?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="mostrar contraseña" onClick={() => setMostrarPassword((v) => !v)} edge="end">
                    {mostrarPassword ? '🙈' : '👁️'}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel control={<Checkbox defaultChecked {...register('isActive')} />} label="Activo" />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Crear</Button>
      </DialogActions>
    </Dialog>
  );
}
