'use client';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import TablaArticulos from '@/app/components/dashboards/mudras/TablaArticulos';
import TablaMovimientosStock from '@/app/components/dashboards/mudras/TablaMovimientosStock';
import EstadisticasStock from '@/components/stock/EstadisticasStock';
import ModalNuevoArticulo from '@/app/components/dashboards/mudras/ModalNuevoArticulo';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_STATS } from '@/app/queries/mudras.queries';
import { OBTENER_PUNTOS_MUDRAS, OBTENER_STOCK_PUNTO_MUDRAS } from '@/queries/puntos-mudras';
import { DashboardStatsResponse } from '@/app/interfaces/graphql.types';
import { PuntoMudras } from '@/interfaces/puntos-mudras';
import { Icon } from '@iconify/react';
import { verde } from '@/ui/colores';
import { GraficoBarras } from '@/components/estadisticas/GraficoBarras';
import TablaStockPuntoVenta from '@/components/stock/TablaStockPuntoVenta';
import ModalModificarStock from '@/components/stock/ModalModificarStock';

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
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  const [puntosVenta, setPuntosVenta] = useState<PuntoMudras[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Obtener puntos de venta
  const { data: puntosData, refetch: refetchPuntos } = useQuery(OBTENER_PUNTOS_MUDRAS, {
    variables: {
      filtros: { tipo: 'venta', activo: true }
    }
  });

  useEffect(() => {
    if (puntosData?.obtenerPuntosMudras?.puntos) {
      setPuntosVenta(puntosData.obtenerPuntosMudras.puntos);
    }
  }, [puntosData]);

  // Refetch cuando se actualiza el trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetchPuntos();
    }
  }, [refetchTrigger, refetchPuntos]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleModificarStock = (articulo: any) => {
    setArticuloSeleccionado(articulo);
    setModalStockOpen(true);
  };

  const handleStockActualizado = () => {
    setRefetchTrigger(prev => prev + 1);
    setModalStockOpen(false);
    setArticuloSeleccionado(null);
  };

  // Calcular número total de tabs (4 fijos + puntos de venta)
  const tabsBasicos = 4;
  const totalTabs = tabsBasicos + puntosVenta.length;

  return (
    <PageContainer title="Artículos - Mudras" description="Gestión de artículos">
      <Box>
        <Typography variant="h4" fontWeight={700} color={verde.textStrong} sx={{ mb: 2 }}>
          Gestión de Artículos
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#2e7d32', borderRadius: 2, overflow: 'hidden', bgcolor: '#c8e6c9' }}>
          {/* Toolbar superior con fondo unificado */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 2, borderRadius: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="articulos tabs"
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ sx: { display: 'none' } }}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTab-root': {
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#66bb6a' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: '#2e7d32',
                  color: 'common.white'
                }
              }}
            >
              <Tab icon={<Icon icon="mdi:chart-line" />} label="Estadísticas" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:package-variant-closed" />} label="Artículos" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:clipboard-list-outline" />} label="Movimientos Stock" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:package-variant-remove" />} label="Sin stock" iconPosition="start" />
              {/* Tabs dinámicos para puntos de venta */}
              {puntosVenta.map((punto, index) => (
                <Tab 
                  key={punto.id}
                  icon={<Icon icon="mdi:store" />} 
                  label={punto.nombre} 
                  iconPosition="start" 
                />
              ))}
            </Tabs>
          </Box>
          {/* Zona de contenido con mismo fondo y padding */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 2, borderRadius: 0 }}>
            <Box sx={{ pt: 2 }}>
              {/* Tab 0 - Estadísticas */}
              {tabValue === 0 && (
                <Box>
                  <GraficoBarras
                    titulo="Ventas por artículo (demo)"
                    datos={[
                      { etiqueta: 'Sahumerios', valor: 120, color: '#66bb6a' },
                      { etiqueta: 'Dijes', valor: 95, color: '#43a047' },
                      { etiqueta: 'Cristales', valor: 80, color: '#2e7d32' },
                      { etiqueta: 'Aceites', valor: 60, color: '#1b5e20' },
                    ]}
                    anchoBarra={72}
                    colorBorde={verde.headerBorder}
                  />
                </Box>
              )}

              {/* Tab 1 - Tabla de Artículos */}
              {tabValue === 1 && (
                <TablaArticulos
                  puedeCrear={userRole === 'admin' || userRole === 'diseñadora'}
                  onNuevoClick={() => setModalNuevoOpen(true)}
                  onModificarStock={handleModificarStock}
                />
              )}
              {/* Tab 2 - Movimientos de Stock */}
              {tabValue === 2 && <TablaMovimientosStock />}
              {/* Tab 3 - Sin stock */}
              {tabValue === 3 && (
                <TablaArticulos 
                  filtroSinStock={true}
                  puedeCrear={false}
                  onModificarStock={handleModificarStock}
                />
              )}
              
              {/* Tabs dinámicos para stock por punto de venta */}
              {puntosVenta.map((punto, index) => {
                const tabIndex = tabsBasicos + index;
                return tabValue === tabIndex && (
                  <TablaStockPuntoVenta 
                    key={punto.id}
                    puntoVenta={punto}
                    onModificarStock={handleModificarStock}
                    refetchTrigger={refetchTrigger}
                  />
                );
              })}
            </Box>
          </Box>
        </Paper>

        {/* Modal Nuevo Artículo */}
        <ModalNuevoArticulo
          open={modalNuevoOpen}
          onClose={() => setModalNuevoOpen(false)}
        />
        
        {/* Modal Modificar Stock */}
        <ModalModificarStock
          open={modalStockOpen}
          onClose={() => setModalStockOpen(false)}
          articulo={articuloSeleccionado}
          puntosVenta={puntosVenta}
          onStockActualizado={handleStockActualizado}
        />
      </Box>
    </PageContainer>
  );
}
