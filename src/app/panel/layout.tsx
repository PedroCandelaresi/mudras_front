"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import React, { useContext, useEffect, useState } from "react";
import Header from "./layout/vertical/header/Header";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Navigation from "./layout/horizontal/navbar/Navigation";
import HorizontalHeader from "./layout/horizontal/header/Header";
import { CustomizerContext } from "@/app/context/customizerContext";
import config from "@/app/context/config";
import { useRouter, usePathname } from "next/navigation";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const verificar = async () => {
      try {
        const res = await fetch("/api/auth/perfil", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            if (cancelled) return;
            const siguiente = encodeURIComponent(pathname || "/panel");
            router.replace(`/auth/auth1/login?siguiente=${siguiente}`);
            return;
          }
          const texto = await res.text();
          if (!cancelled) {
            setAuthError(texto || "Error al validar sesión");
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setAuthError(
            e instanceof Error ? e.message : "Error de red al validar sesión"
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    };
    verificar();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const { activeLayout, isLayout, activeMode, isSidebarPinned } = useContext(CustomizerContext);
  const theme = useTheme();
  const SidebarWidth = config.sidebarWidth;
  return (
    <MainWrapper className={activeMode === 'dark' ? 'darkbg mainwrapper' : 'mainwrapper'}>
      <title>Mudras Gestión</title>
      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      {activeLayout === 'horizontal' ? "" : <Sidebar />}
      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <PageWrapper
        className="page-wrapper"
        sx={{
          [theme.breakpoints.up("lg")]: {
            // Si la sidebar está fija, el contenido se corre;
            // en modo overlay ocupa todo el ancho.
            ml: isSidebarPinned ? `${SidebarWidth}px` : 0,
          },
        }}
      >
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        {activeLayout === 'horizontal' ? <HorizontalHeader /> : <Header />}
        {/* PageContent */}
        {activeLayout === 'horizontal' ? <Navigation /> : ""}
        <Container
          sx={{
            paddingTop: "84px", // Espacio para topbar fija
            maxWidth: isLayout === "boxed" ? "lg" : "100%!important",
          }}
        >
          {/* ------------------------------------------- */}
          {/* PageContent */}
          {/* ------------------------------------------- */}

          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
            {checkingAuth ? null : authError ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "40vh",
                  color: "text.secondary",
                }}
              >
                Error de autenticación: {authError}
              </Box>
            ) : (
              children
            )}
          </Box>

          {/* ------------------------------------------- */}
          {/* End Page */}
          {/* ------------------------------------------- */}
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
}
