import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
} from '@mui/material';
import * as dropdownData from './data';

import { IconUser, IconLogout } from '@tabler/icons-react';
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
          src={"/images/profile/user-1.jpg"}
          alt={'ProfileImg'}
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
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
          <Avatar src={"/images/profile/user-1.jpg"} alt={"ProfileImg"} sx={{ width: 50, height: 50 }} />
          <Box>
            <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
              {perfil?.username || perfil?.sub || 'Usuario'}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {(perfil?.roles && perfil.roles[0]) ? perfil.roles[0] : 'Cuenta'}
            </Typography>
          </Box>
        </Stack>
        <Divider />

        {/* Mi Perfil */}
        <Box sx={{ py: 1.5, px: 0 }} className="hover-text-primary">
          <Link href="#">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                width="40px"
                height="40px"
                bgcolor="primary.light"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius={1}
              >
                <IconUser size={20} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="textPrimary"
                  className="text-hover"
                >
                  Mi Perfil
                </Typography>
                <Typography
                  color="textSecondary"
                  variant="caption"
                >
                  Configuración de cuenta
                </Typography>
              </Box>
            </Stack>
          </Link>
        </Box>

        <Divider />

        {/* Cerrar Sesión */}
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
