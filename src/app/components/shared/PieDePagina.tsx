"use client";
import React from 'react';
import { Box, Container, Link, Typography } from '@mui/material';

export const PieDePagina: React.FC = () => {
  const anio = new Date().getFullYear();
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';

  return (
    <Box component="footer" sx={{
      mt: 6,
      py: 2.5,
      borderTop: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}>
      <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          Desarrollado por <Link href="https://intech.nqn.ar" target="_blank" rel="noopener" underline="hover">InTech.nqn</Link> — {anio}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Versión: {version} · Powered by InTech
        </Typography>
      </Container>
    </Box>
  );
}

