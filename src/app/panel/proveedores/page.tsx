'use client';
import { Box } from '@mui/material';
import { alpha, lighten, darken } from '@mui/material/styles';
import CrystalButton, { CrystalSoftButton, forceWhiteIconsSX } from '@/components/ui/CrystalButton';
import PageContainer from '@/components/container/PageContainer';
import ProveedoresTable from '@/components/proveedores/TablaProveedores';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import TablaPedidos from '@/components/pedidos/TablaPedidos';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { azul, azulOscuro } from '@/ui/colores';

const createBevelWrapper = (color: string) => {
  const edgeWidth = 2;
  const topHighlightColor = alpha(lighten(color, 0.7), 0.86);
  const bottomShadowColor = alpha(darken(color, 0.7), 0.82);
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
    '& > *': {
      position: 'relative',
      zIndex: 1,
    },
  };
};

export default function Proveedores() {
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);

  const isRubros = tabValue === 1;
  const activeColor = isRubros ? azulOscuro.primary : azul.primary;
  const activeHover = isRubros ? (azulOscuro.primaryHover ?? '#4E342E') : (azul.primaryHover ?? '#1565c0');
  const baseBg = isRubros ? (azulOscuro.chipBg ?? '#E6D3C8') : (azul.toolbarBg ?? '#e3f2fd');

  return (
    <PageContainer title="Proveedores - Mudras" description="Gestión de proveedores">
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
          {/* Tabs */}
          <Box sx={{ bgcolor: 'transparent', px: 1, py: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Proveedores (azul) */}
              {tabValue === 0 ? (
                <CrystalButton
                  baseColor={azul.primary}
                  startIcon={<Icon icon="mdi:account-group" />}
                  onClick={() => setTabValue(0)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Proveedores
                </CrystalButton>
              ) : (
                <CrystalSoftButton
                  baseColor={azul.primary}
                  startIcon={<Icon icon="mdi:account-group" />}
                  onClick={() => setTabValue(0)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Proveedores
                </CrystalSoftButton>
              )}

              {/* Rubros (frambuesa) */}
              {tabValue === 1 ? (
                <CrystalButton
                  baseColor={azulOscuro.primary}
                  startIcon={<Icon icon="mdi:tag" />}
                  onClick={() => setTabValue(1)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Pedidos
                </CrystalButton>
              ) : (
                <CrystalSoftButton
                  baseColor={azulOscuro.primary}
                  startIcon={<Icon icon="mdi:tag" />}
                  onClick={() => setTabValue(1)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Pedidos
                </CrystalSoftButton>
              )}
            </Box>
          </Box>

          {/* Contenido */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <Box
                  // wrapper tenue azul para acompañar la tabla
                  sx={{
                    borderRadius: 2,
                    bgcolor: azul.primary,
                    transition: 'background-color .2s ease',
                  }}
                >
                  {/* ⬇️ OJO: ProveedoresTable solo acepta { puedeCrear?, onNuevoProveedor? } */}
                  <ProveedoresTable
                    puedeCrear={userRole === 'admin' || userRole === 'diseñadora'}
                    onNuevoProveedor={() => {
                      // abre el modal interno de creación (si no pasás nada, igual abre)
                      // acá podés loguear si querés
                      console.log('Nuevo proveedor');
                    }}
                  />
                </Box>
              )}

              {tabValue === 1 && (
                <Box
                  // wrapper tenue frambuesa
                  sx={{
                    borderRadius: 2,
                    bgcolor: azulOscuro.primary,
                    transition: 'background-color .2s ease',
                  }}
                >
                  {/* Usa tu wrapper con modales ya cableados */}
                  <TablaPedidos puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
                </Box>
              )}
            </Box>
          </Box>
        </TexturedPanel>
      </Box >
    </PageContainer >
  );
}
