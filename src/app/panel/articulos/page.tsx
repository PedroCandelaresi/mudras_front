'use client';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import { TablaArticulos, ModalNuevoArticulo } from '@/components/articulos';
import TablaMovimientosStock from '@/app/components/dashboards/mudras/TablaMovimientosStock';
import { useState } from 'react';
import { verde } from '@/ui/colores';
import { GraficoBarras } from '@/components/estadisticas/GraficoBarras';
import { Icon } from '@iconify/react';
import ModalModificarStock from '@/components/stock/ModalModificarStock';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';


export default function Articulos() {
  const [tabValue, setTabValue] = useState(0);
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStockActualizado = () => {
    setModalStockOpen(false);
    setArticuloSeleccionado(null);
  };

  const handleModificarStock = (articulo: any) => {
    setArticuloSeleccionado(articulo);
    setModalStockOpen(true);
  };

  return (
    <PageContainer title="Artículos - Mudras" description="Gestión de artículos">
      <Box>
        <Typography variant="h4" fontWeight={700} color={verde.textStrong} sx={{ mb: 2 }}>
          Gestión de Artículos
        </Typography>
        <TexturedPanel
          accent="#2e7d32"
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
          {/* Toolbar superior con fondo unificado */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 1.5 }}>
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
              <Tab icon={<Icon icon="mdi:package-variant" />} label="Artículos" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:clipboard-list-outline" />} label="Movimientos Stock" iconPosition="start" />
            </Tabs>
          </Box>
          {/* Zona de contenido con mismo fondo y padding */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <TablaArticulos puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} onModificarStock={handleModificarStock} />
              )}
              {tabValue === 1 && (
                <TablaMovimientosStock />
              )}
            </Box>
          </Box>
        </TexturedPanel>

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
          puntosVenta={[]}
          onStockActualizado={handleStockActualizado}
        />
      </Box>
    </PageContainer>
  );
}
