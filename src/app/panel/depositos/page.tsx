'use client';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { grisRojizo } from '@/ui/colores';
import { Icon } from '@iconify/react';
import { OBTENER_PUNTOS_MUDRAS, ObtenerPuntosMudrasResponse } from '@/queries/puntos-mudras';
import { PuntoMudras } from '@/interfaces/puntos-mudras';
import TablaStockPuntoVenta from '@/components/stock/TablaStockPuntoVenta';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

export default function Depositos() {
  const [tabValue, setTabValue] = useState(0);
  const [depositos, setDepositos] = useState<PuntoMudras[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Obtener solo depósitos
  const { data: depositosData, refetch: refetchDepositos } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);

  useEffect(() => {
    if (depositosData?.obtenerPuntosMudras) {
      // Filtrar solo depósitos
      const soloDepositos = depositosData.obtenerPuntosMudras.filter(punto => punto.tipo === 'deposito');
      setDepositos(soloDepositos);
    }
  }, [depositosData]);

  // Refetch cuando se actualiza el trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetchDepositos();
    }
  }, [refetchTrigger, refetchDepositos]);

  // Escuchar eventos de actualización de puntos mudras
  useEffect(() => {
    const handlePuntosActualizados = () => {
      refetchDepositos();
    };

    window.addEventListener('puntosVentaActualizados', handlePuntosActualizados);
    
    return () => {
      window.removeEventListener('puntosVentaActualizados', handlePuntosActualizados);
    };
  }, [refetchDepositos]);

  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);

  const handleNuevaAsignacion = (deposito: PuntoMudras) => {
    console.log('Nueva asignación en depósito:', deposito.nombre);
  };

  const handleModificarStock = (articulo: any) => {
    console.log('Modificar stock en depósito:', articulo);
  };

  return (
    <PageContainer title="Depósitos - Mudras" description="Gestión de stock en depósitos">
      <Box>
        <Typography variant="h4" fontWeight={700} color={grisRojizo.textStrong} sx={{ mb: 2 }}>
          Stock en Depósitos
        </Typography>
        <TexturedPanel
          accent="#d32f2f"
          radius={14}
          contentPadding={12}
          bgTintPercent={22}
          bgAlpha={0.98}
          tintMode="soft-light"
          tintOpacity={0.42}
          textureScale={1.1}
          textureBaseOpacity={0.18}
          textureBoostOpacity={0.12}
          textureContrast={0.92}
          textureBrightness={1.03}
          bevelWidth={12}
          bevelIntensity={1.0}
          glossStrength={1.0}
          vignetteStrength={0.9}
        >
          {/* Toolbar superior con tabs dinámicos */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 1.5 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="depositos tabs"
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
                  bgcolor: '#f44336',
                  '&:hover': { bgcolor: '#ef5350' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: '#d32f2f',
                  color: 'common.white'
                }
              }}
            >
              {/* Tabs dinámicos para cada depósito */}
              {depositos.map((deposito, index) => (
                <Tab 
                  key={deposito.id}
                  icon={<Icon icon="mdi:warehouse" />} 
                  label={deposito.nombre} 
                  iconPosition="start" 
                />
              ))}
              {depositos.length === 0 && (
                <Tab 
                  icon={<Icon icon="mdi:alert-circle" />} 
                  label="No hay depósitos" 
                  iconPosition="start"
                  disabled
                />
              )}
            </Tabs>
          </Box>
          {/* Contenido */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              {/* Tabs dinámicos para stock por depósito */}
              {depositos.map((deposito, index) => {
                return tabValue === index && (
                  <TablaStockPuntoVenta 
                    key={deposito.id}
                    puntoVenta={deposito}
                    onModificarStock={handleModificarStock}
                    onNuevaAsignacion={() => handleNuevaAsignacion(deposito)}
                    refetchTrigger={refetchTrigger}
                  />
                );
              })}
              
              {/* Mensaje cuando no hay depósitos */}
              {depositos.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    No hay depósitos creados
                  </Typography>
                  <Typography color="text.secondary">
                    Ve a <strong>Administración → Puntos Mudras</strong> para crear depósitos
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </TexturedPanel>
      </Box>
    </PageContainer>
  );
}
