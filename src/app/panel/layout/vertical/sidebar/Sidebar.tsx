import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SidebarItems from "./SidebarItems";
import Logo from "../../shared/logo/Logo";
import { CustomizerContext } from "@/app/context/customizerContext";
import config from '@/app/context/config'

import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { Profile } from "./SidebarProfile/Profile";
import { useContext } from "react";


const Sidebar = () => {
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
    isCollapse == "mini-sidebar" && !isSidebarHover
      ? MiniSidebarWidth
      : SidebarWidth;

  const onHoverEnter = () => {
    if (isCollapse == "mini-sidebar") {
      setIsSidebarHover(true);
    }
  };

  const onHoverLeave = () => {
    setIsSidebarHover(false);
  };


  return (
    <>
      {!lgUp ? (
        <Box
          sx={{
            zIndex: 1100,
            width: MiniSidebarWidth, // Siempre ancho de mini-sidebar
            flexShrink: 0,
            position: "fixed",
            height: "100vh",
            top: 0,
            left: 0,
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar for desktop */}
          {/* ------------------------------------------- */}
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
                    duration: theme.transitions.duration.shortest,
                  }),
                  width: toggleWidth,
                  boxSizing: "border-box",
                  background: 'linear-gradient(135deg, #FFE4D6 0%, #FFD4B3 50%, #FFC299 100%)',
                  borderRight: '1px solid #FF8C42',
                  overflowX: 'hidden',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  scrollbarWidth: 'none',
                },
              }
            }}
          >
            {/* ------------------------------------------- */}
            {/* Sidebar Box */}
            {/* ------------------------------------------- */}
            <Box
              sx={{
                height: "100%",
              }}
            >
              {/* ------------------------------------------- */}
              {/* Logo */}
              {/* ------------------------------------------- */}
              <Box px={2}>
                <Logo />
              </Box>
              <Scrollbar sx={{ height: "calc(100% - 160px)" }}>
                {/* ------------------------------------------- */}
                {/* Sidebar Items */}
                {/* ------------------------------------------- */}
                <SidebarItems />
              </Scrollbar>
              <Profile />
            </Box>
          </Drawer>
        </Box>
      ) : (
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
            }
          }}
        >
          {/* ------------------------------------------- */}
          {/* Logo */}
          {/* ------------------------------------------- */}
          <Box px={1.5}>
            <Logo />
          </Box>
          {/* ------------------------------------------- */}
          {/* Sidebar For Mobile */}
          {/* ------------------------------------------- */}
          <SidebarItems />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
