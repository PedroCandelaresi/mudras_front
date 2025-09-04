'use client';
import { Grid, Box, Typography, Stack } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaProveedores from '@/app/components/dashboards/mudras/TablaProveedores';
import { useState } from 'react';

export default function Proveedores() {
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  return (
    <PageContainer title="Proveedores - Mudras" description="Gestión de proveedores">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="secondary.main">
                Gestión de Proveedores
              </Typography>
            </Stack>
          </Grid>
          
          <Grid size={12}>
            <DashboardCard>
              <TablaProveedores puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
