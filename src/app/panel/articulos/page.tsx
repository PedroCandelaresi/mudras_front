'use client';
import { Grid, Box, Typography, Stack, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import TablaArticulos from '@/app/components/dashboards/mudras/TablaArticulos';
import TablaMovimientosStock from '@/app/components/dashboards/mudras/TablaMovimientosStock';
import EstadisticasStock from '@/components/stock/EstadisticasStock';
import ModalNuevoArticulo from '@/app/components/dashboards/mudras/ModalNuevoArticulo';
import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_STATS } from '@/app/queries/mudras.queries';
import { DashboardStatsResponse } from '@/app/interfaces/graphql.types';
import { Icon } from '@iconify/react';

// Componente para EstadisticasStock con datos reales
function EstadisticasStockConDatos() {
  const { data, loading } = useQuery<DashboardStatsResponse>(GET_DASHBOARD_STATS);
  
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

export default function Articulos() {
  const [tabValue, setTabValue] = useState(0);
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin'); // Demo: cambiar entre roles

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <PageContainer title="Artículos - Mudras" description="Gestión de artículos">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600} color="success.dark">
                Gestión de Artículos
              </Typography>
            </Stack>
          </Grid>

          {/* Tabs para navegación entre secciones */}
          <Grid size={12}>
            <Box sx={{ mb: 0, bgcolor: '#eaf6ea', borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, px: 1, py: 1, border: '1px solid', borderColor: 'success.light', borderBottom: 'none' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="articulos tabs"
                TabIndicatorProps={{ sx: { display: 'none' } }}
                sx={{
                  '& .MuiTabs-flexContainer': { gap: 1 },
                  '& .MuiTab-root': {
                    color: 'success.dark',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 40,
                    px: 2,
                    borderRadius: 1.5,
                    bgcolor: '#e0f0e0',
                    '&:hover': { bgcolor: '#d6ead6' },
                    '& .MuiTab-iconWrapper': { mr: 1 }
                  },
                  '& .MuiTab-root.Mui-selected': {
                    bgcolor: 'success.main',
                    color: 'common.white'
                  }
                }}
              >
                <Tab icon={<Icon icon="mdi:package-variant-closed" />} label="Artículos" iconPosition="start" />
                <Tab icon={<Icon icon="mdi:clipboard-list-outline" />} label="Movimientos Stock" iconPosition="start" />
                <Tab icon={<Icon icon="mdi:chart-line" />} label="Estadísticas Stock" iconPosition="start" />
                <Tab icon={<Icon icon="mdi:package-variant-remove" />} label="Sin stock" iconPosition="start" />
              </Tabs>
            </Box>
          </Grid>
          
          <Grid size={12}>
            <Box sx={{ mt: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: '1px solid', borderColor: 'success.light', pt: 0.5, overflow: 'hidden' }}>
              <DashboardCard>
              {/* Tab Panel 0 - Tabla de Artículos */}
              {tabValue === 0 && (
                <TablaArticulos 
                  onNuevoArticulo={() => setModalNuevoOpen(true)}
                  puedeCrear={userRole === 'admin' || userRole === 'diseñadora'}
                />
              )}

              {/* Tab Panel 1 - Movimientos de Stock */}
              {tabValue === 1 && <TablaMovimientosStock />}

              {/* Tab Panel 2 - Estadísticas de Stock */}
              {tabValue === 2 && <EstadisticasStockConDatos />}

              {/* Tab Panel 3 - Artículos sin stock */}
              {tabValue === 3 && (
                <TablaArticulos 
                  soloSinStock 
                  onNuevoArticulo={() => setModalNuevoOpen(true)}
                  puedeCrear={userRole === 'admin' || userRole === 'diseñadora'}
                />
              )}
              </DashboardCard>
            </Box>
          </Grid>
        </Grid>
        
        {/* Modal Nuevo Artículo */}
        <ModalNuevoArticulo
          open={modalNuevoOpen}
          onClose={() => setModalNuevoOpen(false)}
          userRole={userRole}
        />
      </Box>
    </PageContainer>
  );
}

