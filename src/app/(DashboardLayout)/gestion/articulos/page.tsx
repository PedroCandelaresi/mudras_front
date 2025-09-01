'use client';
import { Grid, Box, Typography, Button, Stack, Tabs, Tab } from '@mui/material';
import { IconPlus, IconDownload, IconUpload } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaArticulos from '@/app/components/dashboards/mudras/TablaArticulos';
import TablaMovimientosStock from '@/app/components/dashboards/mudras/TablaMovimientosStock';
import EstadisticasStock from '@/components/stock/EstadisticasStock';
import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_STATS } from '@/app/queries/mudras.queries';

// Componente para EstadisticasStock con datos reales
function EstadisticasStockConDatos() {
  const { data, loading } = useQuery(GET_DASHBOARD_STATS);
  
  if (loading) {
    return <Box p={3}>Cargando estadísticas...</Box>;
  }

  // Calcular estadísticas reales usando los datos de la base de datos
  const totalArticulos = data?.articulos?.length || 0;
  
  const articulosConStock = data?.articulos?.filter((art: any) => {
    const stock = parseFloat(String(art.Deposito || 0));
    return stock > 0;
  }).length || 0;
  
  const articulosStockBajo = data?.articulos?.filter((art: any) => {
    const stock = parseFloat(String(art.Deposito || 0));
    const stockMinimo = parseFloat(String(art.StockMinimo || 0));
    return stock > 0 && stockMinimo > 0 && stock <= stockMinimo;
  }).length || 0;
  
  const articulosSinStock = data?.articulos?.filter((art: any) => {
    const stock = parseFloat(String(art.Deposito || 0));
    return stock === 0 || art.Deposito === null || art.Deposito === undefined;
  }).length || 0;

  const articulosActivos = data?.articulos?.filter((art: any) => art.Estado === 'ACTIVO').length || 0;

  const articulosEnPromocion = data?.articulos?.filter((art: any) => Boolean(art.EnPromocion)).length || 0;

  const valorTotal = data?.articulos?.reduce((total: number, art: any) => {
    const stock = parseFloat(String(art.Deposito || 0));
    const precio = parseFloat(String(art.PrecioVenta || 0));
    return total + (stock * precio);
  }, 0) || 0;

  const estadisticas = {
    totalArticulos,
    articulosActivos,
    articulosConStock,
    articulosSinStock,
    articulosStockBajo,
    articulosEnPromocion,
    articulosPublicadosEnTienda: 0,
    valorTotalStock: valorTotal,
    valorTotalInventario: valorTotal
  };

  return <EstadisticasStock estadisticas={estadisticas} />;
}

const GestionArticulos = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <PageContainer title="Gestión de Artículos" description="Administra todos los artículos del inventario">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="#FF6B35">
                Gestión de Artículos
              </Typography>
              <Stack direction="row" spacing={2}>
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
                  variant="outlined"
                  startIcon={<IconUpload size={18} />}
                  sx={{ 
                    borderColor: '#FF6B35', 
                    color: '#FF6B35',
                    '&:hover': { 
                      borderColor: '#FF6B35', 
                      backgroundColor: 'rgba(255, 107, 53, 0.1)' 
                    }
                  }}
                >
                  Importar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  sx={{ 
                    backgroundColor: '#FF6B35',
                    '&:hover': { backgroundColor: '#E55A2B' }
                  }}
                >
                  Nuevo Artículo
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Tabs para navegación entre secciones */}
          <Grid size={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="articulos tabs">
                <Tab label="📦 Artículos" />
                <Tab label="📋 Movimientos Stock" />
                <Tab label="📈 Estadísticas Stock" />
              </Tabs>
            </Box>
          </Grid>
          
          <Grid size={12}>
            <DashboardCard>
              {/* Tab Panel 0 - Tabla de Artículos */}
              {tabValue === 0 && <TablaArticulos />}

              {/* Tab Panel 1 - Movimientos de Stock */}
              {tabValue === 1 && <TablaMovimientosStock />}

              {/* Tab Panel 2 - Estadísticas de Stock */}
              {tabValue === 2 && <EstadisticasStockConDatos />}
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default GestionArticulos;
