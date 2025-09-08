'use client';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import TablaRubros from '@/app/components/dashboards/mudras/TablaRubros';
import { useState } from 'react';
import { teal } from '@/ui/colores';
import { GraficoBarras } from '@/components/estadisticas/GraficoBarras';
import { Icon } from '@iconify/react';

export default function Rubros() {
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);
  return (
    <PageContainer title="Rubros - Mudras" description="Gestión de rubros">
      <Box>
        <Typography variant="h4" fontWeight={700} color={teal.textStrong} sx={{ mb: 2 }}>
          Gestión de Rubros y Categorías
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: teal.headerBorder, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
          {/* Toolbar superior estilo Usuarios */}
          <Box sx={{ bgcolor: teal.toolbarBg, px: 1, py: 1 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="rubros tabs"
              TabIndicatorProps={{ sx: { display: 'none' } }}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTab-root': {
                  color: teal.textStrong,
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: '#e6faf8',
                  '&:hover': { bgcolor: '#d9f4f1' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: teal.primary,
                  color: 'common.white'
                }
              }}
            >
              <Tab icon={<Icon icon="mdi:chart-line" />} label="Estadísticas" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:shape" />} label="Rubros" iconPosition="start" />
            </Tabs>
          </Box>
          {/* Contenido */}
          <Box sx={{ bgcolor: teal.toolbarBg, px: 2, pb: 2 }}>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <Box>
                  <GraficoBarras
                    titulo="Rubros con más ventas (demo)"
                    datos={[
                      { etiqueta: 'Sahumerios', valor: 180, color: '#26a69a' },
                      { etiqueta: 'Cristales', valor: 150, color: '#00897b' },
                      { etiqueta: 'Aceites', valor: 90, color: '#00695c' },
                      { etiqueta: 'Libros', valor: 70, color: '#004d40' },
                    ]}
                    anchoBarra={72}
                    colorBorde={teal.headerBorder}
                  />
                </Box>
              )}
              {tabValue === 1 && (
                <TablaRubros puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
}
