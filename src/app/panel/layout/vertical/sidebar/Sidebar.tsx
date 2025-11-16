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
import { TexturedPanel } from "@/components/ui/TexturedFrame/TexturedPanel";

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
                  background: "transparent",
                  borderRight: "0",
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
            <TexturedPanel
              accent="#c49b3b"
              radius={0}
              contentPadding={0}
              bgTintPercent={26}
              bgAlpha={0.98}
              tintMode="soft-light"
              tintOpacity={0.4}
              textureScale={1.05}
              textureBaseOpacity={0.32}
              textureBoostOpacity={0.24}
              textureContrast={1.0}
              textureBrightness={1.02}
              bevelWidth={6}
              bevelIntensity={0.8}
              glossStrength={0.7}
              vignetteStrength={0.4}
              fullHeight
            >
              <Box sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
                {/* Logo */}
                <Box px={2} pt={2} pb={1.5}>
                  <Logo />
                </Box>

                {/* Items con scroll */}
                <Scrollbar sx={{ height: "calc(100% - 160px)" }}>
                  <SidebarItems />
                </Scrollbar>

                {/* Perfil al pie */}
                <Profile />
              </Box>
            </TexturedPanel>
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
                background: "transparent",
              },
            },
          }}
        >
          <TexturedPanel
            accent="#c49b3b"
            radius={0}
            contentPadding={0}
            bgTintPercent={26}
            bgAlpha={0.98}
            tintMode="soft-light"
            tintOpacity={0.4}
            textureScale={1.05}
            textureBaseOpacity={0.32}
            textureBoostOpacity={0.24}
            textureContrast={1.0}
            textureBrightness={1.02}
            bevelWidth={6}
            bevelIntensity={0.8}
            glossStrength={0.7}
            vignetteStrength={0.4}
            fullHeight
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Logo */}
              <Box px={1.5} pt={1.5} pb={1}>
                <Logo />
              </Box>

              {/* Items */}
              <SidebarItems />
            </Box>
          </TexturedPanel>
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
