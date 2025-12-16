'use client';

import Link from "next/link";
import { Grid, Box, Stack, Typography, useTheme, alpha } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import AuthLogin from "../auth/authForms/AuthLogin";
import Logo from "@/app/components/shared/Logo";

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
              background: "radial-gradient(#fce6d7, #ffffff, #e0e0df)",
              backgroundSize: "400% 400%",
              animation: "gradient 15s ease infinite",
              position: "absolute",
              height: "100%",
              width: "100%",
              opacity: "0.6",
            },
          }}
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8
          }}>
          <Box position="relative">
            <Box px={3} py={2}>
              <Logo />
            </Box>
            <Box
              alignItems="center"
              justifyContent="center"
              height={"calc(100vh - 100px)"}
              sx={{
                display: {
                  xs: "none",
                  lg: "flex",
                },
                flexDirection: "column"
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "400px",
                  background: `radial-gradient(circle, ${alpha('#ed8236', 0.1)} 0%, ${alpha('#66655f', 0.05)} 70%)`,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  mb: 3
                }}
              >
                <Stack alignItems="center" spacing={3}>
                  <Box sx={{
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main'
                  }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 198.43 198.43"
                      width="100%"
                      height="100%"
                    >
                      <path
                        fill="#ed8236"
                        fillRule="evenodd"
                        d="M99.17,61.09c1.58,1.31.05,4.21-3.63,4-11.96-.66-15.17,1.45-15.04,5.58.13,4.04,8.46,9.68,16.84,9.87,7.76.17,15.38-6.51,18.02-4.98,3.31,1.92-11.58,11.72-18.24,11.72-15.11,0-27.49-11.98-27.49-20.01,0-6.04,13.17-7.88,22.16-7.81,2.97.02,6.34.76,7.39,1.63Z"
                      />
                      <path
                        fill="#ed8236"
                        fillRule="evenodd"
                        d="M101.06,61.09c-1.58,1.31-.05,4.21,3.63,4,11.96-.66,15.17,1.45,15.04,5.58-.13,4.03-2.62,9.66-9.85,13.9-2.89,1.7-7.22,3.28-12.1,4.06-5.7.91-12.02-1.8-14.88.99-2.73,2.68,10.86,5.09,17.53,5.09,15.11,0,30.18-19.41,30.18-27.45,0-6.04-13.17-7.88-22.16-7.81-2.98.02-6.34.76-7.39,1.63Z"
                      />
                    </svg>
                  </Box>
                  <Typography variant="h4" color="primary" fontWeight={700} textAlign="center">
                    Gestión Integral
                  </Typography>
                  <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ fontWeight: 400 }}>
                    Administra tu negocio con armonía y eficiencia
                  </Typography>
                </Stack>
              </Box>
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
                  Ingresa tus credenciales para continuar
                </Typography>
              }
              subtitle={
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
                    href="/registro"
                    fontWeight="500"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                    }}
                  >
                    Crear cuenta
                  </Typography>
                </Stack>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
