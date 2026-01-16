'use client';
import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import ProveedoresTable from '@/components/proveedores/TablaProveedores';
import TablaPedidos from '@/components/pedidos/TablaPedidos';
import { Icon } from '@iconify/react';
import { azul } from '@/ui/colores';

interface TabDefinition {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  color: string;
}

const tabs: TabDefinition[] = [
  {
    key: 'proveedores',
    label: 'Proveedores',
    icon: <Icon icon="mdi:account-group" />,
    color: azul.primary,
  },
  {
    key: 'pedidos',
    label: 'Pedidos',
    icon: <Icon icon="mdi:clipboard-text-outline" />,
    color: azul.primary,
  },
];

export default function Proveedores() {
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  const [activeTab, setActiveTab] = useState<'proveedores' | 'pedidos'>('proveedores');

  return (
    <PageContainer title="Proveedores - Mudras" description="Gestión de proveedores">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="tabs proveedores"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 48,
                borderRadius: 0,
                color: '#546e7a',
                '&.Mui-selected': {
                  color: azul.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: azul.primary,
                height: 3,
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                }
                value={tab.key}
              />
            ))}
          </Tabs>
        </Box>

        {activeTab === 'proveedores' && (
          <Box
            sx={{
              borderRadius: 0,
              transition: 'background-color .2s ease',
            }}
          >
            <ProveedoresTable
              puedeCrear={userRole === 'admin' || userRole === 'diseñadora'}
              onNuevoProveedor={() => {
                console.log('Nuevo proveedor');
              }}
            />
          </Box>
        )}

        {activeTab === 'pedidos' && (
          <Box
            sx={{
              borderRadius: 0,
              transition: 'background-color .2s ease',
            }}
          >
            <TablaPedidos puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}
