'use client';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function Pedidos() {
  return (
    <PageContainer title="Pedidos - Mudras" description="Gestión de pedidos">
      <Box>
        <Typography variant="h4" mb={2}>
          Gestión de Pedidos
        </Typography>
        <Typography variant="body1">
          Seguimiento y gestión de pedidos de clientes.
        </Typography>
      </Box>
    </PageContainer>
  );
}
