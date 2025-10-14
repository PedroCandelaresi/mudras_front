"use client";
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UsuarioInterno, RolUsuario, EstadoUsuario } from './graphql/internos';

export interface EditarUsuarioInternoForm {
  nombre?: string;
  apellido?: string;
  username?: string;
  email?: string;
  password?: string; // opcional para cambio
  rol?: RolUsuario;
  estado?: EstadoUsuario;
  salario?: number;
}

const schema = z.object({
  nombre: z.string().trim().min(1).optional(),
  apellido: z.string().trim().min(1).optional(),
  username: z.string().trim().min(3).optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(['ADMINISTRADOR', 'PROGRAMADOR', 'CAJA', 'DEPOSITO', 'DIS_GRAFICO']).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).optional(),
  salario: z.number().nonnegative().optional(),
});

interface Props {
  open: boolean;
  usuario: UsuarioInterno | null;
  onClose: () => void;
  onSubmit: (data: EditarUsuarioInternoForm) => void;
}

export function EditInternalUserModal({ open, usuario, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditarUsuarioInternoForm>({
    resolver: zodResolver(schema),
    values: usuario ? {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
    } : {},
  });

  React.useEffect(() => {
    if (usuario) {
      reset({ nombre: usuario.nombre, apellido: usuario.apellido, username: usuario.username, email: usuario.email, rol: usuario.rol, estado: usuario.estado });
    }
  }, [usuario, reset]);

  const submit = handleSubmit((data) => { onSubmit(data); });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar empleado</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField label="Nombre" fullWidth size="small" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Apellido" fullWidth size="small" {...register('apellido')} error={!!errors.apellido} helperText={errors.apellido?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Usuario" fullWidth size="small" {...register('username')} error={!!errors.username} helperText={errors.username?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" fullWidth size="small" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Nuevo password (opcional)" type="password" fullWidth size="small" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select label="Rol" fullWidth size="small" defaultValue={usuario?.rol ?? 'CAJA'} {...register('rol')} error={!!errors.rol} helperText={errors.rol?.message}>
              {['ADMINISTRADOR','PROGRAMADOR','CAJA','DEPOSITO','DIS_GRAFICO'].map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select label="Estado" fullWidth size="small" defaultValue={usuario?.estado ?? 'ACTIVO'} {...register('estado')} error={!!errors.estado} helperText={errors.estado?.message}>
              {['ACTIVO','INACTIVO','SUSPENDIDO'].map((e) => (
                <MenuItem key={e} value={e}>{e}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Salario" type="number" fullWidth size="small" inputProps={{ step: '0.01' }} {...register('salario', { valueAsNumber: true })} error={!!errors.salario} helperText={errors.salario?.message} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}

