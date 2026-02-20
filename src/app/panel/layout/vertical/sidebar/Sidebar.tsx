import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import SidebarItems from "./SidebarItems";
import { CustomizerContext } from "@/app/context/customizerContext";
import config from '@/app/context/config';
import Image from "next/image";
import Typography from "@mui/material/Typography";
import Link from 'next/link';
import { alpha } from "@mui/material/styles";

import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { useContext } from "react";
import { verdeMilitar } from "@/ui/colores";

const Sidebar = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const {
    isCollapse,
    isMobileSidebar,
    setIsMobileSidebar,
    setIsCollapse,
    isSidebarPinned,
    isSidebarHover,
  } = useContext(CustomizerContext);

  const SidebarWidth = config.sidebarWidth;
  const sidebarBg = '#ffffff';
  const sidebarBorder = alpha(verdeMilitar.primary, 0.22);

  // En escritorio distinguimos dos modos:
  // - Fijo (pinned): Drawer permanente que redimensiona el contenido.
  // - Overlay (auto-ocultar): Drawer temporal que no afecta el layout.
  const isDesktopOverlayOpen = !isSidebarPinned && isCollapse === "full-sidebar";

  // Zona sensible fija en el borde izquierdo para abrir el sidebar al acercar el mouse (solo overlay).
  // La hacemos bien angosta para no interferir con inputs cercanos al borde.
  const hoverZone = lgUp && !isSidebarPinned ? (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 8,
        height: "100vh",
        zIndex: 1050,
        backgroundColor: "transparent",
      }}
      onMouseEnter={() => setIsCollapse("full-sidebar")}
    />
  ) : null;

  const SidebarLogo = () => {
    // Si está colapsado y no está en hover (y no es mobile), mostrar versión reducida
    // Nota: El usuario no especificó versión reducida, pero mantenemos lógica de colapso.
    // Usaremos el mismo logo pero más chico o solo el icono si fuera posible.
    // Como es SVG, lo escalamos.
    const isMini = isCollapse === "mini-sidebar" && !isSidebarHover && !isMobileSidebar;

    return (
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            transition: 'all 0.3s ease',
            opacity: 0.9, // Watermark style
            '&:hover': { opacity: 1 }
          }}
        >
          {isMini ? (
            <Image
              src={"/logo.svg"}
              alt="Mudras"
              width={30}
              height={30}
              style={{
                // No filter needed for light bg
              }}
            />
          ) : (
            <>
              <Image
                src={"/logo.svg"}
                alt="Mudras"
                width={140}
                height={140}
                style={{
                  marginBottom: '8px'
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#333333',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.2rem',
                  fontSize: '0.75rem',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Serious font
                  textShadow: '0px 1px 1px rgba(255,255,255,0.8)' // Highlight on light bg
                }}
              >
                GESTION
              </Typography>
            </>
          )}
        </Box>
      </Link>
    );
  };

  const overlayDrawer = (
    <Drawer
      anchor="left"
      open={isDesktopOverlayOpen}
      onClose={() => setIsCollapse("mini-sidebar")}
      variant="temporary"
      ModalProps={{
        // No forzar el foco dentro del Drawer; así no roba el foco de inputs como la searchbox.
        disableEnforceFocus: true,
      }}
      sx={{
        zIndex: 1100,
        // Puro overlay: no ocupa ancho en el layout padre.
        width: 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SidebarWidth,
          boxSizing: "border-box",
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          overflowX: "hidden",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        },
      }}
    >
      <Box
        sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
        onMouseLeave={() => setIsCollapse("mini-sidebar")}
      >
        {/* Logo */}
        <Box px={2} pt={3} pb={2} display="flex" justifyContent="center">
          <SidebarLogo />
        </Box>

        {/* Items con scroll central */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <SidebarItems />
        </Scrollbar>
      </Box>
    </Drawer>
  );

  const pinnedDrawer = (
    <Drawer
      anchor="left"
      open={true}
      variant="permanent"
      sx={{
        zIndex: 1100,
        width: SidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SidebarWidth,
          boxSizing: "border-box",
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          overflowX: "hidden",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        },
      }}
    >
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <Box px={1.5} pt={3} pb={2} display="flex" justifyContent="center">
          <SidebarLogo />
        </Box>

        {/* Items */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <SidebarItems />
        </Scrollbar>
      </Box>
    </Drawer>
  );

  const mobileDrawer = (
    <Drawer
      anchor="left"
      open={isMobileSidebar}
      onClose={() => setIsMobileSidebar(false)}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            width: SidebarWidth,
            border: "0 !important",
            boxShadow: (theme) => theme.shadows[8],
            backgroundColor: sidebarBg,
            borderRight: `1px solid ${sidebarBorder}`,
          },
        },
      }}
    >
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <Box px={1.5} pt={3} pb={2} display="flex" justifyContent="center">
          <SidebarLogo />
        </Box>

        {/* Items */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <SidebarItems />
        </Scrollbar>
      </Box>
    </Drawer>
  );

  if (!lgUp) {
    return mobileDrawer;
  }

  // Escritorio: si está fija, mostramos Drawer permanente; si no, overlay + zona de hover.
  return (
    <>
      {isSidebarPinned ? pinnedDrawer : hoverZone}
      {!isSidebarPinned && overlayDrawer}
    </>
  );
};

export default Sidebar;
