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
  // NOTA: lgUp acá significa "pantallas <= lg" (por tu uso de down("lg"))
  const lgUp = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const {
    isCollapse,
    isSidebarHover,
    setIsSidebarHover,
    isMobileSidebar,
    setIsMobileSidebar,
  } = useContext(CustomizerContext);

  const MiniSidebarWidth = config.miniSidebarWidth;
  const SidebarWidth = config.sidebarWidth;

  const theme = useTheme();

  const toggleWidth =
    isCollapse === "mini-sidebar" && !isSidebarHover
      ? MiniSidebarWidth
      : SidebarWidth;

  const onHoverEnter = () => {
    if (isCollapse === "mini-sidebar") {
      setIsSidebarHover(true);
    }
  };

  const onHoverLeave = () => {
    setIsSidebarHover(false);
  };

  return (
    <>
      {/* Desktop (no es <= lg) */}
      {!lgUp ? (
        <Box
          sx={{
            zIndex: 1100,
            // ⬇️ ahora el contenedor acompaña el ancho del paper
            width: toggleWidth,
            flexShrink: 0,
            position: "fixed",
            height: "100vh",
            top: 0,
            left: 0,
            overflow: "hidden",
            transition: theme.transitions.create("width", {
              duration: `${config.transitionDuration}ms`,
              easing: config.transitionEasing,
            }),
            willChange: "width",
          }}
        >
          <Drawer
            anchor="left"
            open
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            variant="permanent"
            slotProps={{
              paper: {
                sx: {
                  transition: theme.transitions.create("width", {
                    duration: `${config.transitionDuration}ms`,
                    easing: config.transitionEasing,
                  }),
                  width: toggleWidth,
                  boxSizing: "border-box",
                  background:
                    "linear-gradient(135deg, #FFE4D6 0%, #FFD4B3 50%, #FFC299 100%)",
                  borderRight: "1px solid #FF8C42",
                  overflowX: "hidden",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  willChange: "width",
                },
              },
            }}
          >
            {/* ------------------------------------------- */}
            {/* Sidebar Box */}
            {/* ------------------------------------------- */}
            <Box sx={{ height: "100%" }}>
              {/* Logo */}
              <Box px={2}>
                <Logo />
              </Box>

              {/* Items con scroll */}
              <Scrollbar sx={{ height: "calc(100% - 160px)" }}>
                <SidebarItems />
              </Scrollbar>

              {/* Perfil al pie */}
              <Profile />
            </Box>
          </Drawer>
        </Box>
      ) : (
        // Mobile / <= lg
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
              },
            },
          }}
        >
          {/* Logo */}
          <Box px={1.5}>
            <Logo />
          </Box>

          {/* Items */}
          <SidebarItems />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
