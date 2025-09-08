'use client';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import TablaVentas from '@/app/components/dashboards/mudras/TablaVentas';
import { violeta } from '@/ui/colores';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { GraficoBarras } from '@/components/estadisticas/GraficoBarras';

export default function Ventas() {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);
  return (
    <PageContainer title="Ventas - Mudras" description="Gestión de ventas">
      <Box>
        <Typography variant="h4" fontWeight={700} color={violeta.textStrong} sx={{ mb: 2 }}>
          Gestión de Ventas
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: violeta.headerBorder, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
          {/* Tabs superiores */}
          <Box sx={{ bgcolor: violeta.toolbarBg, px: 1, py: 1 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="ventas tabs"
              TabIndicatorProps={{ sx: { display: 'none' } }}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTab-root': {
                  color: violeta.textStrong,
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: '#f1e6f7',
                  '&:hover': { bgcolor: '#ead8f4' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: violeta.primary,
                  color: 'common.white'
                }
              }}
            >
              <Tab icon={<Icon icon="mdi:chart-line" />} label="Estadísticas" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:receipt-text-outline" />} label="Ventas" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Contenido */}
          <Box sx={{ bgcolor: violeta.toolbarBg, px: 2, pb: 2 }}>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <Box>
                  <GraficoBarras
                    titulo="Ventas por día (demo)"
                    datos={[
                      { etiqueta: 'Lun', valor: 12, color: '#ba68c8' },
                      { etiqueta: 'Mar', valor: 18, color: '#ab47bc' },
                      { etiqueta: 'Mié', valor: 9, color: '#8e24aa' },
                      { etiqueta: 'Jue', valor: 22, color: '#7b1fa2' },
                      { etiqueta: 'Vie', valor: 16, color: '#6a1b9a' },
                    ]}
                    anchoBarra={72}
                    colorBorde={violeta.headerBorder}
                  />
                </Box>
              )}
              {tabValue === 1 && (
                <TablaVentas />
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
}
