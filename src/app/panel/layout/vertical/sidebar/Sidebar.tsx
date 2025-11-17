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
  } = useContext(CustomizerContext);

  const SidebarWidth = config.sidebarWidth;
  const theme = useTheme();

  // En escritorio tratamos el sidebar como overlay:
  // isCollapse === "full-sidebar" => Drawer abierto
  // isCollapse === "mini-sidebar" => Drawer cerrado
  const isDesktopSidebarOpen = isCollapse === "full-sidebar";

  const desktopDrawer = (
    <Drawer
      anchor="left"
      open={isDesktopSidebarOpen}
      onClose={() => setIsCollapse("mini-sidebar")}
      variant="temporary"
      sx={{
        zIndex: 1100,
        // Puro overlay: no ocupa ancho en el layout padre.
        width: 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SidebarWidth,
          boxSizing: "border-box",
          // Dorado anaranjado con textura metálica
          backgroundImage:
            'linear-gradient(135deg, #FFE4D6 0%, #FFD4B3 40%, #FFC299 100%), url("/textures/brushed-metal-1024.png")',
          backgroundBlendMode: 'overlay',
          backgroundSize: 'cover, cover',
          backgroundRepeat: 'no-repeat, repeat-y',
          backgroundPosition: 'center, center',
          backgroundColor: '#FFC299',
          borderRight: '1px solid rgba(0,0,0,0.25)',
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
            backgroundImage:
              'linear-gradient(135deg, #FFE4D6 0%, #FFD4B3 40%, #FFC299 100%), url("/textures/brushed-metal-1024.png")',
            backgroundBlendMode: 'overlay',
            backgroundSize: 'cover, cover',
            backgroundRepeat: 'no-repeat, repeat-y',
            backgroundPosition: 'center, center',
            backgroundColor: '#FFC299',
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

  return lgUp ? desktopDrawer : mobileDrawer;
};

export default Sidebar;
