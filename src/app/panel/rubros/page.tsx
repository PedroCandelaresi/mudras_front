'use client';
import { Grid, Box, Typography, Stack } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaRubros from '@/app/components/dashboards/mudras/TablaRubros';
import { useState } from 'react';

export default function Rubros() {
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  return (
    <PageContainer title="Rubros - Mudras" description="Gestión de rubros">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="success.main">
                Gestión de Rubros y Categorías
              </Typography>
            </Stack>
          </Grid>
          
          <Grid size={12}>
            <DashboardCard>
              <TablaRubros puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
