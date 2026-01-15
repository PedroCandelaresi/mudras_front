'use client';

import { useState } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import PageContainer from '@/components/container/PageContainer';
import TablaAsientos from '@/components/contaduria/TablaAsientos';
import TablaCuentasContables from '@/components/contaduria/TablaCuentasContables';
import { azulOscuro } from '@/ui/colores';

export default function Contaduria() {

  return (
    <PageContainer title="Contaduría - Mudras" description="Gestión contable">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Icon icon="mdi:calculator-variant-outline" width={32} height={32} color={azulOscuro.primary} />
              <Typography variant="h4" fontWeight={600} color="success.main">
                Contaduría
              </Typography>
            </Box>
          </Grid>
          <Grid size={12}>
            <TablaAsientos />
          </Grid>
          <Grid size={12}>
            <TablaCuentasContables />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
