'use client';
import { Grid, Box, Typography, Button, Stack } from '@mui/material';
import { IconPlus, IconDownload, IconPalette } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaRubros from '@/app/components/dashboards/mudras/TablaRubros';

const GestionRubros = () => {
  return (
    <PageContainer title="Gestión de Categorías" description="Administra todas las categorías y rubros de productos">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="#FF6B35">
                Gestión de Categorías
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<IconPalette size={18} />}
                  sx={{ 
                    borderColor: '#FF6B35', 
                    color: '#FF6B35',
                    '&:hover': { 
                      borderColor: '#FF6B35', 
                      backgroundColor: 'rgba(255, 107, 53, 0.1)' 
                    }
                  }}
                >
                  Personalizar
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
                  Nueva Categoría
                </Button>
              </Stack>
            </Stack>
          </Grid>
          
          <Grid size={12}>
            <DashboardCard>
              <TablaRubros />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default GestionRubros;
