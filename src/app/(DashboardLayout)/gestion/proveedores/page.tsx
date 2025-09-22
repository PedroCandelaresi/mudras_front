'use client';
import { Grid, Box, Typography, Button, Stack } from '@mui/material';
import { IconPlus, IconDownload, IconCurrencyDollar, IconTags } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaProveedores from '@/components/proveedores/TablaProveedores';

const GestionProveedores = () => {
  return (
    <PageContainer title="Gestión de Proveedores" description="Administra todos los proveedores y sus cuentas corrientes">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="#FF6B35">
                Gestión de Proveedores
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<IconTags size={18} />}
                  href="/gestion/proveedores/rubros"
                  sx={{ 
                    borderColor: '#FF6B35', 
                    color: '#FF6B35',
                    '&:hover': { 
                      borderColor: '#FF6B35', 
                      backgroundColor: 'rgba(255, 107, 53, 0.1)' 
                    }
                  }}
                >
                  Rubros por Proveedor
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconCurrencyDollar size={18} />}
                  sx={{ 
                    borderColor: '#FF6B35', 
                    color: '#FF6B35',
                    '&:hover': { 
                      borderColor: '#FF6B35', 
                      backgroundColor: 'rgba(255, 107, 53, 0.1)' 
                    }
                  }}
                >
                  Cuentas Corrientes
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
                  Nuevo Proveedor
                </Button>
              </Stack>
            </Stack>
          </Grid>
          
          <Grid size={12}>
            <DashboardCard>
              <TablaProveedores />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default GestionProveedores;
