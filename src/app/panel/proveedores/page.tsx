'use client';
import { Grid, Box, Typography, Button, Stack } from '@mui/material';
import { IconPlus, IconDownload, IconUpload } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaProveedores from '@/app/components/dashboards/mudras/TablaProveedores';

export default function Proveedores() {
  return (
    <PageContainer title="Proveedores - Mudras" description="Gestión de proveedores">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="secondary.main">
                Gestión de Proveedores
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<IconDownload size={18} />}
                  sx={{ 
                    borderColor: 'secondary.main', 
                    color: 'secondary.main',
                    '&:hover': { 
                      borderColor: 'secondary.main', 
                      backgroundColor: 'secondary.lighter' 
                    }
                  }}
                >
                  Exportar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconUpload size={18} />}
                  sx={{ 
                    borderColor: 'secondary.main', 
                    color: 'secondary.main',
                    '&:hover': { 
                      borderColor: 'secondary.main', 
                      backgroundColor: 'secondary.lighter' 
                    }
                  }}
                >
                  Importar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  sx={{ 
                    backgroundColor: 'secondary.main',
                    '&:hover': { backgroundColor: 'secondary.dark' }
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
}
