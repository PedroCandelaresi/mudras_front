'use client';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Box, Tabs, Tab } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';

import TablaArticulos from '@/components/articulos/TablaArticulos';
import TablaRubros from '@/components/rubros/TablaRubros';
import TablaMovimientosStock from '@/components/stock/TablaMovimientosStock';
import ModalNuevoArticulo from '@/components/articulos/ModalNuevoArticulo';
import ModalModificarStock from '@/components/articulos/ModalModificarStock';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { verde } from '@/ui/colores';

interface TabDefinition {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  color: string;
}

const tabDefinitions: TabDefinition[] = [
  { key: 'articulos', label: 'Artículos', icon: <Icon icon="mdi:cube-outline" />, color: verde.primary },
  { key: 'rubros', label: 'Rubros', icon: <Icon icon="mdi:tag" />, color: verde.primary },
  { key: 'movimientos', label: 'Movimientos de Stock', icon: <Icon icon="mdi:swap-horizontal" />, color: verde.primary },
];

export default function ArticulosPage() {
  const [activeTab, setActiveTab] = useState<'articulos' | 'rubros' | 'movimientos'>('articulos');
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');

  const handleStockActualizado = () => {
    setModalStockOpen(false);
    setArticuloSeleccionado(null);
  };

  return (
    <PageContainer title="Artículos - Mudras" description="Gestión integral de artículos, rubros y stock">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="tabs articulos"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 48,
                borderRadius: 0,
                color: '#546e7a',
                '&.Mui-selected': {
                  color: verde.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: verde.primary,
                height: 3,
              },
            }}
          >
            {tabDefinitions.map((tab) => (
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

        {activeTab === 'articulos' && (
          <Box sx={{ borderRadius: 0 }}>
            <TablaArticulos
              key={`articulos-${reloadKey}`}
              title="Artículos"
              showToolbar
              showGlobalSearch
              allowCreate={userRole === 'admin' || userRole === 'diseñadora'}
              onCreateClick={() => {
                setArticuloSeleccionado(null);
                setModalNuevoOpen(true);
              }}
              columns={[
                { key: 'imagen', header: 'Img', width: 60 },
                { key: 'descripcion', header: 'Descripción', filterable: true, width: '40%' },
                { key: 'codigo', header: 'Código', filterable: true, width: 140 },
                { key: 'stock', header: 'Stock total', width: 140 },
                { key: 'precio', header: 'Precio', width: 140 },
                { key: 'estado', header: 'Estado', filterable: true, width: 200 },
                { key: 'acciones', header: 'Acciones', width: 180 },
              ]}
              initialServerFilters={{ pagina: 0, limite: 50, ordenarPor: 'Descripcion', direccionOrden: 'ASC' }}
              onEdit={(a) => {
                setArticuloSeleccionado(a);
                setModalNuevoOpen(true);
              }}
              dense
            />
          </Box>
        )}

        {activeTab === 'rubros' && (
          <Box sx={{ borderRadius: 0 }}>
            <TablaRubros puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
          </Box>
        )}

        {activeTab === 'movimientos' && (
          <Box sx={{ borderRadius: 0 }}>
            <TablaMovimientosStock />
          </Box>
        )}
      </Box>

      <ModalNuevoArticulo
        open={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        articulo={articuloSeleccionado ?? undefined}
        onSuccess={() => setReloadKey((k) => k + 1)}
      />
      <ModalModificarStock
        open={modalStockOpen}
        onClose={() => setModalStockOpen(false)}
        articulo={articuloSeleccionado}
        puntosVenta={[]}
        onStockActualizado={handleStockActualizado}
      />
    </PageContainer>
  );
}
