'use client';
import { Grid, Box, Typography, Button, Stack } from '@mui/material';
import { IconPlus, IconDownload, IconUpload } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaRubros from '@/app/components/dashboards/mudras/TablaRubros';

export default function Rubros() {
  return (
    <PageContainer title="Rubros - Mudras" description="Gestión de rubros">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="success.main">
                Gestión de Rubros y Categorías
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<IconDownload size={18} />}
                  sx={{ 
                    borderColor: 'success.main', 
                    color: 'success.main',
                    '&:hover': { 
                      borderColor: 'success.main', 
                      backgroundColor: 'success.lighter' 
                    }
                  }}
                >
                  Exportar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconUpload size={18} />}
                  sx={{ 
                    borderColor: 'success.main', 
                    color: 'success.main',
                    '&:hover': { 
                      borderColor: 'success.main', 
                      backgroundColor: 'success.lighter' 
                    }
                  }}
                >
                  Importar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  sx={{ 
                    backgroundColor: 'success.main',
                    '&:hover': { backgroundColor: 'success.dark' }
                  }}
                >
                  Nuevo Rubro
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
}
