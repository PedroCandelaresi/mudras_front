"use client";
import Link from "next/link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/GridLegacy";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AuthLogin from "../auth/authForms/AuthLogin";
import Logo from "@/app/components/shared/Logo";
import PageContainer from "@/components/container/PageContainer";

const Login2 = () => {
  return (
    <PageContainer title="Login" description="this is Login page">
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Grid container sx={{ height: "100%" }}>
          {/* Logo Section - 60% width */}
          <Grid
            item
            xs={12}
            md={7}
            lg={8}
            sx={{
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                transform: "scale(2.5)", // Make logo significantly larger
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Logo color="#ffffff" />
            </Box>

            {/* Decorative circles/shapes for texture if needed, kept minimal for now */}
            <Box
              sx={{
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
                zIndex: 1,
              }}
            />
          </Grid>

          {/* Login Form Section - 40% width */}
          <Grid
            item
            xs={12}
            md={5}
            lg={4}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "background.paper",
            }}
          >
            <Box p={4} width="100%" maxWidth="450px">
              <AuthLogin
                subtext={
                  <Typography variant="subtitle1" color="textSecondary" mb={1}>
                    Ingresa tus credenciales para continuar
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" spacing={1} mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="500">
                      ¿No tienes una cuenta?
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
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login2;
