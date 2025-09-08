'use client';
import { Grid, Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { TablaPromociones } from '@/components/promociones/TablaPromociones';

export default function Promociones() {
  return (
    <PageContainer title="Promociones - Mudras" description="Gestión de promociones">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h4" fontWeight={600} color="success.main" mb={2}>
              Gestión de Promociones
            </Typography>
          </Grid>
          <Grid size={12}>
            <DashboardCard>
              <TablaPromociones />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
