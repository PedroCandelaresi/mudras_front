'use client';
import { Box } from '@mui/material';
import { alpha, lighten, darken } from '@mui/material/styles';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import PageContainer from '@/components/container/PageContainer';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton, forceWhiteIconsSX } from '@/components/ui/CrystalButton';

// Módulos
import TablaArticulos from '@/components/articulos/TablaArticulos';
import TablaRubros from '@/components/rubros/TablaRubros';
import TablaMovimientosStock from '@/components/stock/TablaMovimientosStock';
import ModalNuevoArticulo from '@/components/articulos/ModalNuevoArticulo';
import ModalModificarStock from '@/components/articulos/ModalModificarStock';
import type { Articulo } from '@/app/interfaces/mudras.types';

// Paletas
import { verde, marron, borgoña } from '@/ui/colores';

// ——————————————————————————————————————————————————————————
// 🔹 Utilidad: wrapper con bevel dinámico (idéntico a Proveedores)
const createBevelWrapper = (color: string) => {
  const edgeWidth = 2;
  const topHighlightColor = alpha(lighten(color, 0.85), 0.9);
  const bottomShadowColor = alpha(darken(color, 0.6), 0.85);
  const leftHighlightColor = alpha(lighten(color, 0.6), 0.8);
  const rightShadowColor = alpha(darken(color, 0.6), 0.76);
  const borderTint = alpha(lighten(color, 0.2), 0.6);
  const innerLight = alpha(lighten(color, 0.58), 0.22);
  const innerShadow = alpha(darken(color, 0.62), 0.26);

  return {
    position: 'relative' as const,
    borderRadius: 2,
    overflow: 'hidden' as const,
    background: 'transparent',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none' as const,
      boxShadow: `
        inset 0 ${edgeWidth}px 0 ${topHighlightColor},
        inset 0 -${edgeWidth + 0.4}px 0 ${bottomShadowColor},
        inset ${edgeWidth}px 0 0 ${leftHighlightColor},
        inset -${edgeWidth + 0.4}px 0 0 ${rightShadowColor}
      `,
      zIndex: 3,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: edgeWidth,
      borderRadius: 'inherit',
      pointerEvents: 'none' as const,
      border: `1px solid ${borderTint}`,
      boxShadow: `
        inset 0 ${edgeWidth * 5.2}px ${edgeWidth * 6.4}px ${innerLight},
        inset 0 -${edgeWidth * 5.2}px ${edgeWidth * 6.4}px ${innerShadow}
      `,
      mixBlendMode: 'soft-light' as const,
      zIndex: 2,
    },
    '& > *': { position: 'relative', zIndex: 1 },
  };
};

// ——————————————————————————————————————————————————————————
export default function ArticulosPage() {
  const [tabValue, setTabValue] = useState(0);
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');

  const handleTabChange = (v: number) => setTabValue(v);
  const handleStockActualizado = () => {
    setModalStockOpen(false);
    setArticuloSeleccionado(null);
  };

  // ——— Colores activos según pestaña ———
  const isArticulos = tabValue === 0;
  const isRubros = tabValue === 1;
  const isMovimientos = tabValue === 2;

  // 🎨 Colores principales reforzados
  const activeColor = isArticulos
    ? '#1B3B25'        // verde militar oscuro
    : isRubros
      ? '#3E2723'      // marrón tostado oscuro
      : '#4A0E21';     // borgoña oscuro

  // 💡 Fondo del wrapper con más opacidad
  const baseBg = isArticulos
    ? alpha('#243C2D', 0.88)   // verde bosque semi-opaco
    : isRubros
      ? alpha('#4B2E25', 0.9)  // marrón más profundo
      : alpha('#501C2A', 0.9); // borgoña intenso

  return (
    <PageContainer title="Artículos - Mudras" description="Gestión integral de artículos, rubros y stock">
      <Box sx={createBevelWrapper(activeColor)}>
        <TexturedPanel
          accent={activeColor}
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
          {/* Tabs con estilo Crystal */}
          <Box sx={{ bgcolor: 'transparent', px: 1, py: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Artículos */}
              {isArticulos ? (
                <CrystalButton
                  baseColor={verde.primary}
                  startIcon={<Icon icon="mdi:cube-outline" />}
                  onClick={() => handleTabChange(0)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Artículos
                </CrystalButton>
              ) : (
                <CrystalSoftButton
                  baseColor={verde.primary}
                  startIcon={<Icon icon="mdi:cube-outline" />}
                  onClick={() => handleTabChange(0)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Artículos
                </CrystalSoftButton>
              )}

              {/* Rubros */}
              {isRubros ? (
                <CrystalButton
                  baseColor={marron.primary}
                  startIcon={<Icon icon="mdi:tag" />}
                  onClick={() => handleTabChange(1)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Rubros
                </CrystalButton>
              ) : (
                <CrystalSoftButton
                  baseColor={marron.primary}
                  startIcon={<Icon icon="mdi:tag" />}
                  onClick={() => handleTabChange(1)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Rubros
                </CrystalSoftButton>
              )}

              {/* Movimientos */}
              {isMovimientos ? (
                <CrystalButton
                  baseColor={borgoña.primary}
                  startIcon={<Icon icon="mdi:swap-horizontal" />}
                  onClick={() => handleTabChange(2)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Movimientos de Stock
                </CrystalButton>
              ) : (
                <CrystalSoftButton
                  baseColor={borgoña.primary}
                  startIcon={<Icon icon="mdi:swap-horizontal" />}
                  onClick={() => handleTabChange(2)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Movimientos de Stock
                </CrystalSoftButton>
              )}
            </Box>
          </Box>

          {/* Contenido principal */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              {isArticulos && (
                <Box sx={{ borderRadius: 2, bgcolor: baseBg, transition: 'background-color .2s ease' }}>
                  <TablaArticulos
                    title="Artículos"
                    showToolbar
                    showGlobalSearch
                    allowCreate={userRole === 'admin' || userRole === 'diseñadora'}
                    onCreateClick={() => setModalNuevoOpen(true)}
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
                    initialServerFilters={{ pagina: 0, limite: 50, ordenarPor: 'Descripcion', direccionOrden: 'ASC' }}
                    onView={(a) => console.log('Ver artículo', a)}
                    onEdit={(a) => console.log('Editar artículo', a)}
                    onDelete={(a) => console.log('Eliminar artículo', a)}
                    dense
                  />
                </Box>
              )}

              {isRubros && (
                <Box sx={{ borderRadius: 2, bgcolor: baseBg, transition: 'background-color .2s ease' }}>
                  <TablaRubros puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
                </Box>
              )}

              {isMovimientos && (
                <Box sx={{ borderRadius: 2, bgcolor: baseBg, transition: 'background-color .2s ease' }}>
                  <TablaMovimientosStock />
                </Box>
              )}
            </Box>
          </Box>
        </TexturedPanel>

        {/* Modales */}
        <ModalNuevoArticulo open={modalNuevoOpen} onClose={() => setModalNuevoOpen(false)} />
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
