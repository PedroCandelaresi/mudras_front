'use client';
import { Grid, Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaAsientos from '@/components/contaduria/TablaAsientos';
import TablaCuentasContables from '@/components/contaduria/TablaCuentasContables';

export default function Contaduria() {
  return (
    <PageContainer title="Contaduría - Mudras" description="Gestión contable">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h4" fontWeight={600} color="success.main" mb={2}>
              Contaduría
            </Typography>
          </Grid>
          <Grid size={12}>
            <DashboardCard>
              <TablaAsientos />
            </DashboardCard>
          </Grid>
          <Grid size={12}>
            <DashboardCard>
              <TablaCuentasContables />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
