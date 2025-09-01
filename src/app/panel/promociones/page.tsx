'use client';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function Promociones() {
  return (
    <PageContainer title="Promociones - Mudras" description="Gestión de promociones">
      <Box>
        <Typography variant="h4" mb={2}>
          Gestión de Promociones
        </Typography>
        <Typography variant="body1">
          Ofertas, descuentos y promociones especiales.
        </Typography>
      </Box>
    </PageContainer>
  );
}
