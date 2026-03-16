import React, { useState } from 'react';
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
} from '@mui/material';
import { IconLogout } from '@tabler/icons-react';
import { Stack } from '@mui/system';
import { useRouter } from 'next/navigation';
import { usePermisos } from '@/lib/permisos';


const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const { perfil } = usePermisos();
  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) { }
    router.replace('/login');
  };

  const nombreUsuario = perfil?.username || perfil?.sub || 'Usuario';
  const inicial = nombreUsuario.charAt(0).toUpperCase();
  const rolPrincipal = (perfil?.roles && perfil.roles[0]) ? perfil.roles[0] : 'Cuenta';

  return (
    <Box>
      <IconButton
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          alt={nombreUsuario}
          sx={{
            width: 35,
            height: 35,
            bgcolor: 'secondary.main',
          }}
        >
          {inicial}
        </Avatar>
      </IconButton>
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiPaper-root': {
            width: '280px',
            p: 2,
          },
        }}
      >
        <Stack direction="row" py={2} spacing={2} alignItems="center">
          <Avatar alt={nombreUsuario} sx={{ width: 50, height: 50, bgcolor: 'secondary.main' }}>
            {inicial}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
              {nombreUsuario}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {rolPrincipal}
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ py: 1.5, px: 0 }}>
          <Button onClick={handleLogout} variant="text" color="error" sx={{ p: 0, textTransform: 'none', width: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', justifyContent: 'flex-start' }}>
              <Box
                width="40px"
                height="40px"
                bgcolor="error.light"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius={1}
              >
                <IconLogout size={20} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="textPrimary"
                >
                  Cerrar Sesión
                </Typography>
              </Box>
            </Stack>
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
