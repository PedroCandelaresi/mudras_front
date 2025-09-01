'use client';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function Ventas() {
  return (
    <PageContainer title="Ventas - Mudras" description="Gestión de ventas">
      <Box>
        <Typography variant="h4" mb={2}>
          Gestión de Ventas
        </Typography>
        <Typography variant="body1">
          Historial y reportes de ventas realizadas.
        </Typography>
      </Box>
    </PageContainer>
  );
}
