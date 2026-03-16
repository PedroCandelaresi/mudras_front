'use client'
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { loginType } from "@/app/types/auth/auth";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const esquema = z.object({
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type Formulario = z.infer<typeof esquema>;

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const params = useSearchParams();
  const siguiente = params.get('siguiente') || '/panel';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { username: '', password: '' },
  });

  const [mostrarPassword, setMostrarPassword] = React.useState(false);
  const [errorMensaje, setErrorMensaje] = React.useState<string | null>(null);

  const onSubmit = async (data: Formulario) => {
    try {
      setErrorMensaje(null);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Credenciales inválidas');
      }
      window.location.href = siguiente;
    } catch (e: unknown) {
      setErrorMensaje(e instanceof Error ? e.message : 'Error inesperado');
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      {errorMensaje && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMensaje(null)}>
          {errorMensaje}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="username">Usuario</CustomFormLabel>
            <CustomTextField id="username" variant="outlined" fullWidth
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register('username')}
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password">Contraseña</CustomFormLabel>
            <CustomTextField
              id="password"
              type={mostrarPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="mostrar contraseña" onClick={() => setMostrarPassword((v) => !v)} edge="end">
                      {mostrarPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Stack>
        <Box mt={3}>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
        </Box>
      </form>

      {subtitle}
    </>
  );
};

export default AuthLogin;
