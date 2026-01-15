'use client';
import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { Icon } from '@iconify/react';
import { azul } from '@/ui/colores';

export default function Tienda() {

  return (
    <PageContainer title="Tienda Online - Mudras" description="Gestión de tienda online">
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Icon icon="mdi:shopping-outline" width={32} height={32} color={azul.primary} />
          <Typography variant="h4" fontWeight={600} color="primary.main">
            Tienda Online
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0 }}>
          <Typography variant="h6" mb={2}>
            Configuración y gestión de la tienda online
          </Typography>
          <Typography variant="body1">
            Próximamente...
          </Typography>
        </Paper>
      </Box>
    </PageContainer>
  );
}
