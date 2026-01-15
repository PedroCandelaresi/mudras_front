'use client';
import { useState } from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { TablaPromociones } from '@/components/promociones/TablaPromociones';
import { Icon } from '@iconify/react';

export default function Promociones() {

  return (
    <PageContainer title="Promociones - Mudras" description="Gestión de promociones">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Icon icon="mdi:star-circle-outline" width={32} height={32} color="#f9a825" />
              <Typography variant="h4" fontWeight={600} color="#f9a825">
                Gestión de Promociones
              </Typography>
            </Box>
          </Grid>
          <Grid size={12}>
            <TablaPromociones />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
