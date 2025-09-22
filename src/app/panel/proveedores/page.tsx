'use client';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import TablaProveedores from '@/components/proveedores/TablaProveedores';
import { useState } from 'react';
import { azul } from '@/ui/colores';
import { rosa } from '@/components/rubros/colores-rosa';
import { Icon } from '@iconify/react';
import TablaRubros from '@/components/rubros/TablaRubros';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

export default function Proveedores() {
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);

  return (
    <PageContainer title="Proveedores - Mudras" description="Gestión de proveedores">
      <Box>

        {/* Marco metálico fino + textura sutil (dinámico según tab) */}
        <TexturedPanel
          accent={tabValue === 1 ? rosa.primary : "#1976d2"}
          radius={14}
          contentPadding={12}
        
          // Fondo + Color
          bgTintPercent={22}
          bgAlpha={0.98}
          tintMode="soft-light"
          tintOpacity={0.42}
        
          // Textura (sutil, sin competir con el borde)
          textureScale={1.1}
          textureBaseOpacity={0.18}
          textureBoostOpacity={0.12}
          textureContrast={0.92}
          textureBrightness={1.03}
        
          // Bisel (ahora sí se nota)
          bevelWidth={12}          // ya no se usa en shadows, pero mantenemos API
          bevelIntensity={1.0}
        
          glossStrength={1.0}
          vignetteStrength={0.9}
        >
          {/* Toolbar superior (mismos estilos que tenías) */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 1.5 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="proveedores tabs"
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
                  bgcolor: tabValue === 1 ? rosa.primary : '#42a5f5',
                  '&:hover': { bgcolor: tabValue === 1 ? rosa.accent : '#64b5f6' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: tabValue === 1 ? '#e91e63' : '#1565c0',
                  color: 'common.white'
                }
              }}
            >
              <Tab icon={<Icon icon="mdi:account-group" />} label="Proveedores" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:tag" />} label="Rubros" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Contenido */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <TablaProveedores puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
              )}
              {tabValue === 1 && (
                <TablaRubros puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
              )}
            </Box>
          </Box>
        </TexturedPanel>
      </Box>
    </PageContainer>
  );
}
