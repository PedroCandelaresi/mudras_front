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

/* --- Overlay de metal cepillado (no altera el color base) --- */
const metalBrushedSx = {
  position: 'relative',
  isolation: 'isolate',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    /* grano horizontal + grano vertical + brillo suave */
    backgroundImage: `
      repeating-linear-gradient(0deg, rgba(255,255,255,.10) 0 1px, rgba(0,0,0,.08) 1px 2px),
      repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 2px, rgba(0,0,0,.03) 2px 6px),
      linear-gradient(90deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.05) 28%, rgba(0,0,0,.08) 60%, rgba(255,255,255,.15) 100%)
    `,
    backgroundBlendMode: 'overlay, multiply, soft-light',
    backgroundSize: '100% 8px, 12px 100%, 100% 100%',
    borderRadius: 'inherit',
    mixBlendMode: 'overlay',
    opacity: 0.9, // ← bajá/subí para ajustar intensidad
  },
  /* asegura que el contenido quede por encima del overlay */
  '& > *': { position: 'relative', zIndex: 1 },
} as const;

const Sidebar = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
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
    if (isCollapse == "mini-sidebar") setIsSidebarHover(true);
  };
  const onHoverLeave = () => setIsSidebarHover(false);

  return (
    <>
      {!lgUp ? (
        <Box
          sx={{
            zIndex: 1100,
            width: MiniSidebarWidth,
            flexShrink: 0,
            position: "fixed",
            height: "100vh",
            top: 0,
            left: 0,
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
                  ...metalBrushedSx, // 👈 efecto metal
                  transition: theme.transitions.create("width", {
                    duration: theme.transitions.duration.standard,
                    easing: theme.transitions.easing.sharp,
                  }),
                  width: toggleWidth,
                  boxSizing: "border-box",
                  background:
                    'linear-gradient(135deg, #FFE4D6 0%, #FFD4B3 50%, #FFC299 100%)',
                  borderRight: '1px solid #FF8C42',
                  overflowX: 'hidden',
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                },
              }
            }}
          >
            <Box sx={{ height: "100%" }}>
              <Box px={2}><Logo /></Box>
              <Scrollbar sx={{ height: "calc(100% - 160px)" }}>
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
                ...metalBrushedSx, // 👈 también en mobile
                width: SidebarWidth,
                border: "0 !important",
                boxShadow: (theme) => theme.shadows[8],
                background:
                  'linear-gradient(135deg, #FFE4D6 0%, #FFD4B3 50%, #FFC299 100%)',
              },
            }
          }}
        >
          <Box px={1.5}><Logo /></Box>
          <SidebarItems />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
