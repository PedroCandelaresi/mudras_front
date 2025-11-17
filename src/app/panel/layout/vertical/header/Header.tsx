import AppBar from "@mui/material/AppBar";
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

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: 'linear-gradient(135deg, #2D1810 0%, #4A2318 50%, #3D1B0F 100%)',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    position: 'fixed',
    zIndex: 1300,
    top: 0,
    left: `${leftOffsetPx}px`,
    right: 0,
    width: `calc(100vw - ${leftOffsetPx}px)`,
    
    // Sin animaciones complejas: priorizar rendimiento
    minHeight: TopbarHeight,
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: '#FFE4D6',
    minHeight: TopbarHeight,
    paddingTop: 0,
    paddingBottom: 0,
  }));

  return (
    <ProductProvider>
      <AppBarStyled position="sticky" color="default">
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
          >
            <IconMenu2 size="18" />
          </IconButton>

          {/* ------------------------------------------- */}
          {/* Fecha y Hora Central */}
          {/* ------------------------------------------- */}
          <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500,
                color: 'white',
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
      </AppBarStyled>
    </ProductProvider>

  );
};

export default Header;
