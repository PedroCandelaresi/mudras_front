import { Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';

import { IconPower } from '@tabler/icons-react';
import { CustomizerContext } from "@/app/context/customizerContext";
import Link from 'next/link';
import { useContext } from 'react';

export const Profile = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const { isSidebarHover, isCollapse } = useContext(CustomizerContext);
  const hideMenu = lgUp ? isCollapse == 'mini-sidebar' && !isSidebarHover : '';
  return (
    <Box
      display={'flex'}
      alignItems="center"
      gap={2}
      sx={{ m: 1.5, p: 1.5, bgcolor: `${'secondary.light'}` }}
    >
      {!hideMenu ? (
        <>
          <Avatar alt="Remy Sharp" src={"/images/profile/user-1.jpg"} sx={{ height: 32, width: 32 }} />

          <Box>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mathew</Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Designer</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Logout" placement="top">
              <IconButton
                color="primary"
                component={Link}
                href="/login"
                aria-label="logout"
                size="small"
              >
                <IconPower size="16" />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : (
        ''
      )}
    </Box>
  );
};
