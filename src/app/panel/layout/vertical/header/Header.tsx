import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material/styles";
import { IconMenu2 } from "@tabler/icons-react";
import Profile from "./Profile";
import { CustomizerContext } from "@/app/context/customizerContext";
import config from '@/app/context/config'
import { useContext, useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";

const Header = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const TopbarHeight = config.topbarHeight;

  // Estado para fecha y hora
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // drawer
  const {
    setIsCollapse,
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

  const ToolbarStyled = styled(Toolbar)(() => ({
    width: '100%',
    color: '#ffffff',
    minHeight: TopbarHeight,
    paddingTop: 0,
    paddingBottom: 0,
  }));

  return (
    <AppBar
      position="fixed"
      sx={(theme) => ({
        boxShadow: 'none',
        background: '#3E2723',
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
        <IconButton
          color="inherit"
          aria-label="menu"
          size="small"
          onClick={() => {
            if (lgUp) {
              if (isSidebarPinned) {
                setIsSidebarPinned(false);
                setIsCollapse("mini-sidebar");
              } else {
                setIsSidebarPinned(true);
                setIsCollapse("full-sidebar");
              }
            } else {
              setIsMobileSidebar(!isMobileSidebar);
            }
          }}
          sx={{ color: 'inherit' }}
        >
          <IconMenu2 size="20" />
        </IconButton>

        <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: 'inherit',
              textAlign: 'center',
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {isMounted && currentDateTime ? formatDateTime(currentDateTime) : ''}
          </Typography>
        </Box>

        <Stack spacing={1} direction="row" alignItems="center">
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBar>
  );
};

export default Header;
