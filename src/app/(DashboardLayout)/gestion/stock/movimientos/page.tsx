'use client';
import { Grid, Box, Typography, Button, Stack } from '@mui/material';
import { IconPlus, IconDownload, IconFilter } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaMovimientosStock from '@/app/components/dashboards/mudras/TablaMovimientosStock';

const MovimientosStock = () => {
  return (
    <PageContainer title="Movimientos de Stock" description="Historial completo de todos los movimientos de inventario">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="#FF6B35">
                Movimientos de Stock
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<IconFilter size={18} />}
                  sx={{ 
                    borderColor: '#FF6B35', 
                    color: '#FF6B35',
                    '&:hover': { 
                      borderColor: '#FF6B35', 
                      backgroundColor: 'rgba(255, 107, 53, 0.1)' 
                    }
                  }}
                >
                  Filtros
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconDownload size={18} />}
                  sx={{ 
                    borderColor: '#FF6B35', 
                    color: '#FF6B35',
                    '&:hover': { 
                      borderColor: '#FF6B35', 
                      backgroundColor: 'rgba(255, 107, 53, 0.1)' 
                    }
                  }}
                >
                  Exportar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  sx={{ 
                    backgroundColor: '#FF6B35',
                    '&:hover': { backgroundColor: '#E55A2B' }
                  }}
                >
                  Ajuste Manual
                </Button>
              </Stack>
            </Stack>
          </Grid>
          
          <Grid size={12}>
            <DashboardCard>
              <TablaMovimientosStock />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default MovimientosStock;
