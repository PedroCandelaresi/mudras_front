"use client";

import { Box, Typography, Alert } from '@mui/material';
import { Icon } from '@iconify/react';
import { azulMarino } from '@/ui/colores';

import PageContainer from '@/components/container/PageContainer';
import TablaMatrizStock from '@/components/stock/TablaMatrizStock';

export default function GlobalStockAssignmentPage() {
    return (
        <PageContainer title="Matriz de Stock Global" description="Visión general de stock en todas las sucursales">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Icon icon="mdi:warehouse" width={32} height={32} color={azulMarino.primary} />
                <Typography variant="h4" fontWeight={600} color={azulMarino.primary}>
                    Matriz de Stock Global
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                Consulta y transfiere stock entre puntos de venta y depósitos desde una vista unificada.
            </Alert>

            <TablaMatrizStock />
        </PageContainer>
    );
}
