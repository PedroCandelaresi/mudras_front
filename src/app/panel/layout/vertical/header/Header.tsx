import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material/styles";
import { IconMenu2 } from "@tabler/icons-react";
import Notifications from "./Notification";
import Profile from "./Profile";
import Search from "./Search";
import { CustomizerContext } from "@/app/context/customizerContext";
import MobileRightSidebar from "./MobileRightSidebar";
import config from '@/app/context/config'
import { useContext, useState, useEffect } from "react";
import { ProductProvider } from '@/app/context/Ecommercecontext/index'
import AppBar from "@mui/material/AppBar";

const Header = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const lgDown = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const TopbarHeight = config.topbarHeight;

  // Estado para fecha y hora
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // drawer
  const {
    isSidebarHover,
    activeMode,
    setActiveMode,
    setIsCollapse,
    isCollapse,
    setIsSidebarHover,
    isMobileSidebar,
    setIsMobileSidebar,
    isSidebarPinned,
    setIsSidebarPinned,
  } = useContext(CustomizerContext);

  // Inicializar fecha solo en el cliente
  useEffect(() => {
    setIsMounted(true);
    setCurrentDateTime(new Date());

    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Actualizar cada minuto en lugar de cada segundo

    return () => clearInterval(timer);
  }, []);

  // Formatear fecha y hora
  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false
    };
    return date.toLocaleDateString('es-AR', options);
  };

  const SidebarWidth = config.sidebarWidth;

  // En escritorio, si la sidebar está fija, el header se corre;
  // en modo overlay ocupa todo el ancho.
  const leftOffsetPx = lgUp && isSidebarPinned ? SidebarWidth : 0;

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
    minHeight: TopbarHeight,
    paddingTop: 0,
    paddingBottom: 0,
  }));

  return (
    <ProductProvider>
      <AppBar
        position="fixed"
        sx={(theme) => ({
          boxShadow: 'none',
          background: theme.palette.background.paper,
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          [theme.breakpoints.up('lg')]: {
            minHeight: TopbarHeight,
          },
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 1300,
          width: lgUp && isSidebarPinned ? `calc(100% - ${SidebarWidth}px)` : '100%',
          transition: 'width 0.3s ease',
        })}
      >
        <ToolbarStyled>
          {/* ------------------------------------------- */}
          {/* Toggle Button Sidebar (izquierda) */}
          {/* ------------------------------------------- */}
          <IconButton
            color="inherit"
            aria-label="menu"
            size="small"
            onClick={() => {
              if (lgUp) {
                // En escritorio: alternar entre modo fijo (pinned) y overlay.
                if (isSidebarPinned) {
                  setIsSidebarPinned(false);
                  setIsCollapse("mini-sidebar");
                } else {
                  setIsSidebarPinned(true);
                  setIsCollapse("full-sidebar");
                }
              } else {
                // En móviles, seguir usando el drawer temporal clásico.
                setIsMobileSidebar(!isMobileSidebar);
              }
            }}
            sx={{ color: 'text.secondary' }}
          >
            <IconMenu2 size="20" />
          </IconButton>

          {/* ------------------------------------------- */}
          {/* Fecha y Hora Central */}
          {/* ------------------------------------------- */}
          <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
                textAlign: 'center',
                fontSize: { xs: '0.8rem', md: '0.9rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {isMounted && currentDateTime ? formatDateTime(currentDateTime) : ''}
            </Typography>
          </Box>

          <Stack spacing={1} direction="row" alignItems="center">
            {/* Search a la derecha */}
            <Search />
            <Notifications />
            {/* ------------------------------------------- */}
            {/* Toggle Right Sidebar for mobile */}
            {/* ------------------------------------------- */}
            {lgDown ? <MobileRightSidebar /> : null}
            <Profile />
          </Stack>
        </ToolbarStyled>
      </AppBar>
    </ProductProvider>

  );
};

export default Header;
