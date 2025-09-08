'use client';
import { Grid, Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { TablaVentas } from '@/components/ventas/TablaVentas';

export default function Ventas() {
  return (
    <PageContainer title="Ventas - Mudras" description="Gestión de ventas">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h4" fontWeight={600} color="success.main" mb={2}>
              Gestión de Ventas
            </Typography>
          </Grid>
          <Grid size={12}>
            <DashboardCard>
              <TablaVentas puedeCrear={false} />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
