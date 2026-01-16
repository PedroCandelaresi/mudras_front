'use client';

import { useState } from 'react';
import { Alert, Box, Paper, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import PageContainer from '@/components/container/PageContainer';
import { marron } from '@/ui/colores';

export default function ComprasPage() {
  return (
    <PageContainer title="Compras - Mudras" description="Gestión de órdenes de compra">
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Icon icon="mdi:cart-arrow-down" width={32} height={32} color={marron.primary} />
          <Typography variant="h4" fontWeight={600} color="primary.main">
            Compras
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0 }}>
          <Alert severity="info">
            La sección de órdenes de compra se encuentra temporalmente deshabilitada.
          </Alert>
        </Paper>
      </Box>
    </PageContainer>
  );
}
