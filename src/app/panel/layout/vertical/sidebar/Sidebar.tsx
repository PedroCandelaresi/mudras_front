import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SidebarItems from "./SidebarItems";
import Logo from "../../shared/logo/Logo";
import { CustomizerContext } from "@/app/context/customizerContext";
import config from '@/app/context/config';

import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { Profile } from "./SidebarProfile/Profile";
import { useContext } from "react";

const Sidebar = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const {
    isCollapse,
    isMobileSidebar,
    setIsMobileSidebar,
    setIsCollapse,
    isSidebarPinned,
  } = useContext(CustomizerContext);

  const SidebarWidth = config.sidebarWidth;
  const MiniSidebarWidth = config.miniSidebarWidth;
  const theme = useTheme();

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
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
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
        <Box px={2} pt={2} pb={1.5}>
          <Logo />
        </Box>

        {/* Items con scroll central */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <SidebarItems />
        </Scrollbar>

        {/* Perfil al pie */}
        <Profile />
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
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          overflowX: "hidden",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        },
      }}
    >
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <Box px={2} pt={2} pb={1.5}>
          <Logo />
        </Box>

        {/* Items con scroll central */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <SidebarItems />
        </Scrollbar>

        {/* Perfil al pie */}
        <Profile />
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
            backgroundColor: theme.palette.background.paper,
          },
        },
      }}
    >
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <Box px={1.5} pt={1.5} pb={1}>
          <Logo />
        </Box>

        {/* Items */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <SidebarItems />
        </Scrollbar>

        <Profile />
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
