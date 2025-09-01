'use client';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function Tienda() {
  return (
    <PageContainer title="Tienda Online - Mudras" description="Gestión de tienda online">
      <Box>
        <Typography variant="h4" mb={2}>
          Tienda Online
        </Typography>
        <Typography variant="body1">
          Configuración y gestión de la tienda online.
        </Typography>
      </Box>
    </PageContainer>
  );
}
