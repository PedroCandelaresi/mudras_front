'use client';

import { Alert, Box } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';

export default function ComprasPage() {
  return (
    <PageContainer title="Compras - Mudras" description="Gestión de órdenes de compra">
      <Box mt={2}>
        <Alert severity="info">
          La sección de órdenes de compra se encuentra temporalmente deshabilitada.
        </Alert>
      </Box>
    </PageContainer>
  );
}
