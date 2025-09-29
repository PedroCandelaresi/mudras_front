'use client';

import Link from "next/link";
import { Grid, Box, Typography, Stack, useTheme, alpha } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import AuthRegister from "../auth/authForms/AuthRegister";

export default function Registro() {
  const theme = useTheme();
  
  return (
    <PageContainer title="Registro - Mudras" description="Crea tu cuenta en Mudras">
      <Grid
        container
        spacing={0}
        justifyContent="center"
        sx={{ overflowX: "hidden" }}
      >
        <Grid
          sx={{
            position: "relative",
            "&:before": {
              content: '""',
              background: "radial-gradient(#E1BEE7, #D1C4E9, #C8E6C9)",
              backgroundSize: "400% 400%",
              animation: "gradient 15s ease infinite",
              position: "absolute",
              height: "100%",
              width: "100%",
              opacity: "0.4",
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
              <Typography 
                variant="h4" 
                fontWeight={700}
                sx={{ 
                  background: 'linear-gradient(45deg, #7B1FA2 30%, #4A148C 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ✨ Mudras
              </Typography>
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
                  background: `radial-gradient(circle, ${alpha('#E1BEE7', 0.3)} 0%, ${alpha('#7B1FA2', 0.1)} 70%)`,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  mb: 3
                }}
              >
                <Stack alignItems="center" spacing={3}>
                  <Box sx={{ fontSize: '5rem' }}>🌟💎🌿</Box>
                  <Typography variant="h4" color="primary" fontWeight={700} textAlign="center">
                    Únete a Mudras
                  </Typography>
                  <Typography variant="h6" color="text.secondary" textAlign="center">
                    Comienza tu viaje holístico
                  </Typography>
                </Stack>
              </Box>
              <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth="300px">
                Crea tu cuenta y descubre productos que elevarán tu energía
              </Typography>
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
            <AuthRegister
              title="Únete a Mudras"
              subtext={
                <Typography variant="subtitle1" color="textSecondary" mb={1}>
                  Crea tu cuenta personal
                </Typography>
              }
              subtitle={
                <Stack direction="row" spacing={1} mt={3}>
                  <Typography color="textSecondary" variant="h6" fontWeight="400">
                    ¿Ya tienes cuenta?
                  </Typography>
                  <Typography
                    component={Link}
                    href="/login"
                    fontWeight="500"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                    }}
                  >
                    Iniciar Sesión
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
