'use client';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import TablaVentas from '@/app/components/dashboards/mudras/TablaVentas';
import { verde } from '@/ui/colores';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { GraficoBarras } from '@/components/estadisticas/GraficoBarras';

export default function Ventas() {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);
  return (
    <PageContainer title="Ventas - Mudras" description="Gestión de ventas">
      <Box>
        <Typography variant="h4" fontWeight={700} color={verde.textStrong} sx={{ mb: 2 }}>
          Gestión de Ventas
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#2e7d32', borderRadius: 2, overflow: 'hidden', bgcolor: '#c8e6c9' }}>
          {/* Tabs superiores */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 2, borderRadius: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="ventas tabs"
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
              <Tab icon={<Icon icon="mdi:receipt-text-outline" />} label="Historial de Ventas" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Contenido */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 2, borderRadius: 0 }}>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <Box>
                  <GraficoBarras
                    titulo="Ventas por día (demo)"
                    datos={[
                      { etiqueta: 'Lun', valor: 12, color: '#66bb6a' },
                      { etiqueta: 'Mar', valor: 18, color: '#43a047' },
                      { etiqueta: 'Mié', valor: 9, color: '#2e7d32' },
                      { etiqueta: 'Jue', valor: 22, color: '#1b5e20' },
                      { etiqueta: 'Vie', valor: 16, color: '#388e3c' },
                    ]}
                    anchoBarra={72}
                    colorBorde={verde.headerBorder}
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
