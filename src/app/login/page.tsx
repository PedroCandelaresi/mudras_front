'use client';

import Link from "next/link";
import { Grid, Box, Stack, Typography, useTheme, alpha } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import Logo from "@/app/components/shared/Logo";
import AuthLogin from "../auth/authForms/AuthLogin"; // Updated import path
import Image from "next/image";

export default function Login() {
  const theme = useTheme();

  return (
    <PageContainer title="Iniciar Sesión - Mudras" description="Accede a tu cuenta de Mudras">
      <Grid
        container
        spacing={0}
        justifyContent="center"
        sx={{ height: "100vh" }}
      >
        <Grid
          sx={{
            position: "relative",
            "&:before": {
              content: '""',
              background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
              backgroundSize: "400% 400%",
              animation: "gradient 15s ease infinite",
              position: "absolute",
              height: "100%",
              width: "100%",
              opacity: "0.3",
            },
          }}
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8
          }}>
          <Box position="relative">
            <Box px={3}>
              <Logo />
            </Box>
            <Box
              alignItems="center"
              justifyContent="center"
              height={"calc(100vh - 75px)"}
              sx={{
                display: {
                  xs: "none",
                  lg: "flex",
                },
              }}
            >
              <Image
                src={"/images/backgrounds/login-bg.svg"}
                alt="bg" width={500} height={500}
                style={{
                  width: "100%",
                  maxWidth: "500px", maxHeight: '500px',
                }}
              />
            </Box>
          </Box>
        </Grid>
        <Grid
          display="flex"
          justifyContent="center"
          alignItems="center"
          size={{
            xs: 12,
            sm: 12,
            lg: 5,
            xl: 4
          }}>
          <Box p={4}>
            <AuthLogin
              title="Bienvenido a Mudras"
              subtext={
                <Typography variant="subtitle1" color="textSecondary" mb={1}>
                  Accede a tu espacio personal
                </Typography>
              }
            // POR AHORA COMENTAMOS ESTO, NO SE PUEDEN CREAR NUEVAS CUENTAS HASTA QUE EL SISTEMA ESTE FUNCIONANDO CORRECTAMENTE.
            /* subtitle={
              <Stack direction="row" spacing={1} mt={3}>
                <Typography
                  color="textSecondary"
                  variant="h6"
                  fontWeight="500"
                >
                  ¿Nuevo en Mudras?
                </Typography>
                <Typography
                  component={Link}
                  href="/auth/auth1/register"
                  fontWeight="500"
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                  }}
                >
                  Crear cuenta
                </Typography>
              </Stack>
            } */
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
