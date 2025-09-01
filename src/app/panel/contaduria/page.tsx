'use client';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function Contaduria() {
  return (
    <PageContainer title="Contaduría - Mudras" description="Gestión contable">
      <Box>
        <Typography variant="h4" mb={2}>
          Contaduría
        </Typography>
        <Typography variant="body1">
          Libros contables, balances e impuestos.
        </Typography>
      </Box>
    </PageContainer>
  );
}
