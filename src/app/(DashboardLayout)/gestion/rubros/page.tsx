'use client';
import { Grid, Box, Typography, Button, Stack } from '@mui/material';
import { IconPlus, IconDownload, IconPalette } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaRubros from '@/components/rubros/TablaRubros';

const GestionRubros = () => {
  return (
    <PageContainer title="Gestión de Categorías" description="Administra todas las categorías y rubros de productos">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="#f48fb1">
                Gestión de Categorías
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<IconPalette size={18} />}
                  sx={{ 
                    borderColor: '#f48fb1', 
                    color: '#f48fb1',
                    '&:hover': { 
                      borderColor: '#f48fb1', 
                      backgroundColor: 'rgba(244, 143, 177, 0.1)' 
                    }
                  }}
                >
                  Personalizar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconDownload size={18} />}
                  sx={{ 
                    borderColor: '#f48fb1', 
                    color: '#f48fb1',
                    '&:hover': { 
                      borderColor: '#f48fb1', 
                      backgroundColor: 'rgba(244, 143, 177, 0.1)' 
                    }
                  }}
                >
                  Exportar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  sx={{ 
                    backgroundColor: '#f48fb1',
                    '&:hover': { backgroundColor: '#f06292' }
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
