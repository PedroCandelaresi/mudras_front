'use client';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
// ⬇️ Reemplazá este import:
// import { TablaArticulos, ModalNuevoArticulo } from '@/components/articulos';
import ArticulosTable from '@/components/articulos/TablaArticulos';
import { ModalNuevoArticulo } from '@/components/articulos';

import TablaMovimientosStock from '@/components/articulos/TablaMovimientosStock';
import { useState } from 'react';
import { verde } from '@/ui/colores';
import { Icon } from '@iconify/react';
import ModalModificarStock from '@/components/stock/ModalModificarStock';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
// (Opcional) Si tenés el tipo:
import type { Articulo } from '@/app/interfaces/mudras.types';

export default function Articulos() {
  const [tabValue, setTabValue] = useState(0);
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  const handleStockActualizado = () => {
    setModalStockOpen(false);
    setArticuloSeleccionado(null);
  };

  const handleModificarStock = (articulo: Articulo) => {
    setArticuloSeleccionado(articulo);
    setModalStockOpen(true);
  };

  return (
    <PageContainer title="Artículos - Mudras" description="Gestión de artículos">
      <Box>
        <TexturedPanel
          accent="#2e7d32"
          radius={14}
          contentPadding={12}
          bgTintPercent={22}
          bgAlpha={0.98}
          tintMode="soft-light"
          tintOpacity={0.42}
          textureScale={1.1}
          textureBaseOpacity={0.18}
          textureBoostOpacity={0.12}
          textureContrast={0.92}
          textureBrightness={1.03}
          bevelWidth={12}
          bevelIntensity={1.0}
          glossStrength={1.0}
          vignetteStrength={0.9}
        >
          {/* Toolbar superior con fondo unificado */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 1.5 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="articulos tabs"
              variant="scrollable"
              scrollButtons="auto"
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
              <Tab icon={<Icon icon="mdi:package-variant" />} label="Artículos" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:clipboard-list-outline" />} label="Movimientos Stock" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Contenido */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <ArticulosTable
                  title="Artículos"
                  showToolbar
                  showGlobalSearch
                  allowCreate={userRole === 'admin' || userRole === 'diseñadora'}
                  onCreateClick={() => setModalNuevoOpen(true)}
                  // Columnas “a full”
                  columns={[
                    { key: 'descripcion', header: 'Descripción', filterable: true, width: '40%' },
                    { key: 'codigo', header: 'Código', filterable: true, width: 140 },
                    { key: 'marca', header: 'Marca', filterable: true, width: 160 },
                    { key: 'rubro', header: 'Rubro', filterable: true, width: 160 },
                    { key: 'stock', header: 'Stock', width: 140 },
                    { key: 'precio', header: 'Precio', width: 140 },
                    { key: 'proveedor', header: 'Proveedor', filterable: true, width: '24%' },
                    { key: 'estado', header: 'Estado', filterable: true, width: 200 },
                    { key: 'acciones', header: 'Acciones', width: 180 },
                  ]}
                  // Filtros iniciales/paginación
                  initialServerFilters={{ pagina: 0, limite: 50, ordenarPor: 'Descripcion', direccionOrden: 'ASC' }}
                  // Callbacks de acciones
                  onView={(a) => {
                    // TODO: abrir modal de detalles si lo tenés
                    console.log('Ver artículo', a);
                  }}
                  onEdit={(a) => {
                    // TODO: abrir modal de edición si lo tenés
                    console.log('Editar artículo', a);
                    // Ejemplo: handleModificarStock(a) si querés tocar stock desde acá
                  }}
                  onDelete={(a) => {
                    // TODO: invocar mutation eliminar y luego refetch dentro de la tabla (exponeremos prop si querés)
                    console.log('Eliminar artículo', a);
                  }}
                  dense
                />
              )}

              {tabValue === 1 && <TablaMovimientosStock />}
            </Box>
          </Box>
        </TexturedPanel>

        {/* Modal Nuevo Artículo */}
        <ModalNuevoArticulo open={modalNuevoOpen} onClose={() => setModalNuevoOpen(false)} />

        {/* Modal Modificar Stock */}
        <ModalModificarStock
          open={modalStockOpen}
          onClose={() => setModalStockOpen(false)}
          articulo={articuloSeleccionado}
          puntosVenta={[]}
          onStockActualizado={handleStockActualizado}
        />
      </Box>
    </PageContainer>
  );
}
