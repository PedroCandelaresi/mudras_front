'use client';
import { Grid, Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaPedidos from '@/components/pedidos/TablaPedidos';

export default function Pedidos() {
  return (
    <PageContainer title="Pedidos - Mudras" description="Gestión de pedidos">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h4" fontWeight={600} color="success.main" mb={2}>
              Gestión de Pedidos
            </Typography>
          </Grid>
          <Grid size={12}>
            <DashboardCard>
              <TablaPedidos />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
