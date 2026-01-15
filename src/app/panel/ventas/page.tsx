'use client';
import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import TablaVentas from '@/app/components/dashboards/mudras/TablaVentas';
import { verde } from '@/ui/colores';
import { Icon } from '@iconify/react';

export default function Ventas() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);

  return (
    <PageContainer title="Ventas - Mudras" description="Gestión de ventas">
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Icon icon="mdi:finance" width={32} height={32} color={verde.textStrong} />
          <Typography variant="h4" fontWeight={700} color={verde.textStrong}>
            Gestión de Ventas
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5', px: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="ventas tabs"
              sx={{
                '& .MuiTabs-indicator': { backgroundColor: verde.primary },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'text.secondary',
                  '&.Mui-selected': { color: verde.primary },
                  py: 2
                }
              }}
            >
              <Tab icon={<Icon icon="mdi:receipt-text-outline" />} label="Historial de Ventas" iconPosition="start" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && <TablaVentas />}
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
}
