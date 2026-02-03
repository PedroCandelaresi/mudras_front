'use client';

import Link from "next/link";
import { Grid, Box, Stack, Typography, useTheme, alpha } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";

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
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8
          }}
          sx={{
            position: "relative",
            backgroundImage: 'linear-gradient(135deg, #FFE0B2 0%, #FB8C00 100%), url("/textures/brushed-metal-1024.png")',
            backgroundBlendMode: 'soft-light',
            backgroundSize: 'cover, cover',
            backgroundRepeat: 'no-repeat, repeat-y',
            backgroundPosition: 'center, center',
            backgroundColor: '#FB8C00',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box display="flex" alignItems="center" justifyItems="center" flexDirection="column">
            <Image
              src={"/logo.svg"}
              alt="Mudras Logo"
              width={450}
              height={450}
              style={{
                width: "100%",
                maxWidth: "450px",
                height: "auto",
                filter: "brightness(0) invert(1)", // Makes the logo white
                opacity: 0.9,
              }}
            />
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
