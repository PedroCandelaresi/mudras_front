'use client';
import { useState } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { TablaVentas } from '@/components/ventas/TablaVentas';
import StylizedTabbedPanel, { StylizedTabDefinition } from '@/components/ui/StylizedTabbedPanel';
import { grisRojizo } from '@/ui/colores';
import { IconReceipt } from '@tabler/icons-react';

export default function Ventas() {
  const [activeTab, setActiveTab] = useState('historial');

  const tabs: StylizedTabDefinition[] = [
    {
      key: 'historial',
      label: 'Historial de Ventas',
      icon: <IconReceipt size={20} />,
      color: grisRojizo.primary
    }
  ];

  return (
    <PageContainer title="Ventas - Mudras" description="Gestión de ventas">
      <StylizedTabbedPanel
        tabs={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        {activeTab === 'historial' && (
          <TablaVentas />
        )}
      </StylizedTabbedPanel>
    </PageContainer>
  );
}
