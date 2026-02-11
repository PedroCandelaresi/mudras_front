"use client";

import { Box, Typography, Alert } from '@mui/material';
import { Icon } from '@iconify/react';
import { azulMarino } from '@/ui/colores';

import PageContainer from '@/components/container/PageContainer';
import TablaMatrizStock from '@/components/stock/TablaMatrizStock';

export default function GlobalStockAssignmentPage() {
    return (
        <PageContainer title="Asignaciones" description="Visión general de stock en todas las sucursales">
            <TablaMatrizStock />
        </PageContainer>
    );
}
