'use client';

import { Grid, Box, Typography } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";

import AuthLogin from "../auth/authForms/AuthLogin";
import Image from "next/image";

export default function Login() {
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
                  Accede al panel de administración
                </Typography>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
