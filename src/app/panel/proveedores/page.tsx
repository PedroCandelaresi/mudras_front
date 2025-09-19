'use client';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import TablaProveedores from '@/app/components/dashboards/mudras/TablaProveedores';
import { useState } from 'react';
import { azul } from '@/ui/colores';
import { GraficoBarras } from '@/components/estadisticas/GraficoBarras';
import { Icon } from '@iconify/react';

export default function Proveedores() {
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);
  return (
    <PageContainer title="Proveedores - Mudras" description="Gestión de proveedores">
      <Box>
        <Typography variant="h4" fontWeight={700} color={azul.textStrong} sx={{ mb: 2 }}>
          Gestión de Proveedores
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#1565c0', borderRadius: 2, overflow: 'hidden', bgcolor: '#bbdefb' }}>
          {/* Toolbar superior estilo Usuarios */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 2, borderRadius: 0 }}>
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
                  bgcolor: '#42a5f5',
                  '&:hover': { bgcolor: '#64b5f6' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: '#1565c0',
                  color: 'common.white'
                }
              }}
            >
              <Tab icon={<Icon icon="mdi:chart-line" />} label="Estadísticas" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:account-group" />} label="Proveedores" iconPosition="start" />
            </Tabs>
          </Box>
          {/* Contenido */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 2, borderRadius: 0 }}>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <Box>
                  <GraficoBarras
                    titulo="Proveedores con más ventas (demo)"
                    datos={[
                      { etiqueta: 'NDALI', valor: 140, color: '#64b5f6' },
                      { etiqueta: 'VALLARIS', valor: 120, color: '#42a5f5' },
                      { etiqueta: 'ILUMINARTE', valor: 85, color: '#1e88e5' },
                      { etiqueta: 'AYURDEVAS', valor: 70, color: '#1565c0' },
                    ]}
                    anchoBarra={72}
                    colorBorde={azul.headerBorder}
                  />
                </Box>
              )}
              {tabValue === 1 && (
                <TablaProveedores puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
}
