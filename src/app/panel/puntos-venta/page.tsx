'use client';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { grisVerdoso } from '@/ui/colores';
import { Icon } from '@iconify/react';
import { OBTENER_PUNTOS_MUDRAS, ObtenerPuntosMudrasResponse } from '@/queries/puntos-mudras';
import { PuntoMudras } from '@/interfaces/puntos-mudras';
import TablaStockPuntoVenta from '@/components/stock/TablaStockPuntoVenta';
import ModalModificarStockPunto from '@/components/stock/ModalModificarStockPunto';
import ModalNuevaAsignacionStock from '@/components/stock/ModalNuevaAsignacionStock';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

export default function PuntosVenta() {
  const [tabValue, setTabValue] = useState(0);
  const [puntosVenta, setPuntosVenta] = useState<PuntoMudras[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [modalModificarOpen, setModalModificarOpen] = useState(false);
  const [modalAsignacionOpen, setModalAsignacionOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<any>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoMudras | null>(null);

  // Obtener solo puntos de venta
  const { data: puntosData, refetch: refetchPuntos } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);

  useEffect(() => {
    if (puntosData?.obtenerPuntosMudras) {
      // Filtrar solo puntos de venta
      const soloVentas = puntosData.obtenerPuntosMudras.filter(punto => punto.tipo === 'venta');
      setPuntosVenta(soloVentas);
    }
  }, [puntosData]);

  // Refetch cuando se actualiza el trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetchPuntos();
    }
  }, [refetchTrigger, refetchPuntos]);

  // Escuchar eventos de actualización de puntos mudras
  useEffect(() => {
    const handlePuntosActualizados = () => {
      refetchPuntos();
    };

    window.addEventListener('puntosVentaActualizados', handlePuntosActualizados);
    
    return () => {
      window.removeEventListener('puntosVentaActualizados', handlePuntosActualizados);
    };
  }, [refetchPuntos]);

  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);

  const handleNuevaAsignacion = (puntoVenta: PuntoMudras) => {
    setPuntoSeleccionado(puntoVenta);
    setModalAsignacionOpen(true);
  };

  const handleModificarStock = (articulo: any) => {
    setArticuloSeleccionado(articulo);
    setModalModificarOpen(true);
  };

  const handleStockActualizado = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return (
    <PageContainer title="Puntos de Venta - Mudras" description="Gestión de stock en puntos de venta">
      <Box>
        <Typography variant="h4" fontWeight={700} color={grisVerdoso.textStrong} sx={{ mb: 2 }}>
          Stock en Puntos de Venta
        </Typography>
        <TexturedPanel
          accent="#424242"
          radius={14}
          contentPadding={12}
          bgTintPercent={20}
          bgAlpha={0.98}
          tintMode="soft-light"
          tintOpacity={0.36}
          textureScale={1.08}
          textureBaseOpacity={0.18}
          textureBoostOpacity={0.10}
          textureContrast={0.92}
          textureBrightness={1.02}
          bevelWidth={12}
          bevelIntensity={0.95}
          glossStrength={0.9}
          vignetteStrength={0.8}
        >
          {/* Toolbar superior con tabs dinámicos */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 1.5 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="puntos venta tabs"
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
                  bgcolor: '#757575',
                  '&:hover': { bgcolor: '#9e9e9e' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: '#424242',
                  color: 'common.white'
                }
              }}
            >
              {/* Tabs dinámicos para cada punto de venta */}
              {puntosVenta.map((puntoVenta, index) => (
                <Tab 
                  key={puntoVenta.id}
                  icon={<Icon icon="mdi:store" />} 
                  label={puntoVenta.nombre} 
                  iconPosition="start" 
                />
              ))}
              {puntosVenta.length === 0 && (
                <Tab 
                  icon={<Icon icon="mdi:alert-circle" />} 
                  label="No hay puntos de venta" 
                  iconPosition="start"
                  disabled
                />
              )}
            </Tabs>
          </Box>
          {/* Contenido */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              {/* Tabs dinámicos para stock por punto de venta */}
              {puntosVenta.map((puntoVenta, index) => {
                return tabValue === index && (
                  <TablaStockPuntoVenta
                    key={puntoVenta.id}
                    puntoVenta={puntoVenta}
                    onModificarStock={handleModificarStock}
                    onNuevaAsignacion={() => handleNuevaAsignacion(puntoVenta)}
                    refetchTrigger={refetchTrigger}
                  />
                );
              })}
              
              {/* Mensaje cuando no hay puntos de venta */}
              {puntosVenta.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    No hay puntos de venta creados
                  </Typography>
                  <Typography color="text.secondary">
                    Ve a <strong>Administración → Puntos Mudras</strong> para crear puntos de venta
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </TexturedPanel>

        {/* Modal para modificar stock */}
        <ModalModificarStockPunto
          open={modalModificarOpen}
          onClose={() => setModalModificarOpen(false)}
          articulo={articuloSeleccionado}
          onStockActualizado={handleStockActualizado}
        />

        {/* Modal para nueva asignación de stock */}
        <ModalNuevaAsignacionStock
          open={modalAsignacionOpen}
          onClose={() => setModalAsignacionOpen(false)}
          puntoVenta={puntoSeleccionado}
          onStockAsignado={handleStockActualizado}
        />
      </Box>
    </PageContainer>
  );
}
