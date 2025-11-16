'use client';

import { useState } from 'react';
import { Alert, Box } from '@mui/material';
import { Icon } from '@iconify/react';
import PageContainer from '@/components/container/PageContainer';
import StylizedTabbedPanel, { type StylizedTabDefinition } from '@/components/ui/StylizedTabbedPanel';
import { marron } from '@/ui/colores';

const tabs: StylizedTabDefinition[] = [
  {
    key: 'compras',
    label: 'Compras',
    icon: <Icon icon="mdi:cart-arrow-down" />,
    color: marron.primary,
  },
];

export default function ComprasPage() {
  const [activeTab, setActiveTab] = useState('compras');

  return (
    <PageContainer title="Compras - Mudras" description="Gestión de órdenes de compra">
      <StylizedTabbedPanel
        tabs={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <Box mt={2}>
          <Alert severity="info">
            La sección de órdenes de compra se encuentra temporalmente deshabilitada.
          </Alert>
        </Box>
      </StylizedTabbedPanel>
    </PageContainer>
  );
}
