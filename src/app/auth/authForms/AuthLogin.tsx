'use client'
import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginType } from "@/app/(DashboardLayout)/types/auth/auth";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import AuthSocialButtons from "./AuthSocialButtons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const esquema = z.object({
  username: z.string().min(1, 'Usuario o email requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
  recordar: z.boolean().optional(),
});

type Formulario = z.infer<typeof esquema>;

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const router = useRouter();
  const params = useSearchParams();
  const siguiente = params.get('siguiente') || '/panel';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { username: '', password: '', recordar: true },
  });

  const [mostrarPassword, setMostrarPassword] = React.useState(false);

  const onSubmit = async (data: Formulario) => {
    try {
      // Si ingresa un email, derivar al login de clientes (OAuth)
      if (/@/.test(data.username)) {
        const next = encodeURIComponent(siguiente || '/cliente/panel');
        router.replace(`/cliente?next=${next}`);
        return;
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });
      if (!res.ok) {
        throw new Error(await res.text() || 'Credenciales inválidas');
      }
      // Cookie se setea en el handler; redirigimos
      router.replace(siguiente);
    } catch (e: unknown) {
      // se maneja visualmente con estado local
      setErrorMensaje(e instanceof Error ? e.message : 'Error inesperado');
    }
  };

  const [errorMensaje, setErrorMensaje] = React.useState<string | null>(null);

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

      <AuthSocialButtons title="Ingresar con" />
      <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            ingresar con usuario nombre.apellido
          </Typography>
        </Divider>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Box>
            <CustomFormLabel htmlFor="username">Email o Usuario</CustomFormLabel>
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
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              <FormControlLabel
                control={<CustomCheckbox defaultChecked {...register('recordar')} />}
                label="Recordar este dispositivo"
              />
            </FormGroup>
            <Typography
              component={Link}
              href="/auth/auth1/forgot-password"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Stack>
        </Stack>
        <Box>
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
