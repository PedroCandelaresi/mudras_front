'use client';
import { useState } from 'react';
import { Box } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import ProveedoresTable from '@/components/proveedores/TablaProveedores';
import TablaPedidos from '@/components/pedidos/TablaPedidos';
import TablaRubros from '@/components/rubros/TablaRubros';
import StylizedTabbedPanel, { type StylizedTabDefinition } from '@/components/ui/StylizedTabbedPanel';
import { Icon } from '@iconify/react';
import { azul, azulOscuro, verdeMilitar } from '@/ui/colores';

const tabs: StylizedTabDefinition[] = [
  {
    key: 'proveedores',
    label: 'Proveedores',
    icon: <Icon icon="mdi:account-group" />,
    color: azul.primary,
  },
  {
    key: 'rubros',
    label: 'Rubros',
    icon: <Icon icon="mdi:tag" />,
    color: verdeMilitar.primary,
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
  const [activeTab, setActiveTab] = useState<'proveedores' | 'pedidos' | 'rubros'>('proveedores');

  return (
    <PageContainer title="Proveedores - Mudras" description="Gestión de proveedores">
      <StylizedTabbedPanel
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as any)}
      >
        <Box sx={{ pt: 1 }}>
          {activeTab === 'proveedores' && (
            <Box
              sx={{
                borderRadius: 0,
                bgcolor: azul.toolbarBg,
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

          {activeTab === 'rubros' && (
            <Box
              sx={{
                borderRadius: 0,
                bgcolor: '#ffffff',
                transition: 'background-color .2s ease',
              }}
            >
              <TablaRubros puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
            </Box>
          )}

          {activeTab === 'pedidos' && (
            <Box
              sx={{
                borderRadius: 0,
                bgcolor: azulOscuro.toolbarBg,
                transition: 'background-color .2s ease',
              }}
            >
              <TablaPedidos puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
            </Box>
          )}
        </Box>
      </StylizedTabbedPanel>
    </PageContainer>
  );
}
