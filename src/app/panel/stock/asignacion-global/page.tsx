'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { Icon } from '@iconify/react';
import { azulMarino } from '@/ui/colores';

import PageContainer from '@/components/container/PageContainer';
import TablaMatrizStock from '@/components/stock/TablaMatrizStock';
import StylizedTabbedPanel, { type StylizedTabDefinition } from '@/components/ui/StylizedTabbedPanel';

const tabs: StylizedTabDefinition[] = [
    { key: 'asignaciones', label: 'Asignaciones', icon: <Icon icon="mdi:clipboard-list-outline" />, color: azulMarino.primary },
];

export default function GlobalStockAssignmentPage() {
    const [activeTab, setActiveTab] = useState('asignaciones');

    return (
        <PageContainer title="Asignaciones" description="Visión general de stock en todas las sucursales">
            <StylizedTabbedPanel
                tabs={tabs}
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
            >
                <Box sx={{ pt: 1 }}>
                    {activeTab === 'asignaciones' && (
                        <Box sx={{
                            borderRadius: 0,
                            bgcolor: '#ffffff',
                            transition: 'background-color .2s ease',
                        }}>
                            <TablaMatrizStock />
                        </Box>
                    )}
                </Box>
            </StylizedTabbedPanel>
        </PageContainer>
    );
}
