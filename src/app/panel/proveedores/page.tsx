'use client';
import { Box } from '@mui/material';
import CrystalButton, { CrystalSoftButton, forceWhiteIconsSX } from '@/components/ui/CrystalButton';
import PageContainer from '@/components/container/PageContainer';
import ProveedoresTable from '@/components/proveedores/TablaProveedores';
import { useState } from 'react';
import { marron } from '@/components/rubros/colores-marron';
import { Icon } from '@iconify/react';
import TablaRubros from '@/components/rubros/TablaRubros';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { azul } from '@/ui/colores';

export default function Proveedores() {
  const [userRole] = useState<'admin' | 'diseñadora' | 'vendedor'>('admin');
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);

  const isRubros = tabValue === 1;
  const activeColor = isRubros ? marron.primary : azul.primary;
  const activeHover = isRubros ? (marron.primaryHover ?? '#4E342E') : (azul.primaryHover ?? '#1565c0');
  const baseBg = isRubros ? (marron.chipBg ?? '#E6D3C8') : (azul.toolbarBg ?? '#e3f2fd');

  return (
    <PageContainer title="Proveedores - Mudras" description="Gestión de proveedores">
      <Box>
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
          {/* Tabs */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Proveedores (azul) */}
              {tabValue === 0 ? (
                <CrystalButton
                  baseColor={azul.primary}
                  startIcon={<Icon icon="mdi:account-group" />}
                  onClick={() => setTabValue(0)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 12, px: 2 }}
                >
                  Proveedores
                </CrystalButton>
              ) : (
                <CrystalSoftButton
                  baseColor={azul.primary}
                  startIcon={<Icon icon="mdi:account-group" />}
                  onClick={() => setTabValue(0)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 12, px: 2 }}
                >
                  Proveedores
                </CrystalSoftButton>
              )}

              {/* Rubros (frambuesa) */}
              {tabValue === 1 ? (
                <CrystalButton
                  baseColor={marron.primary}
                  startIcon={<Icon icon="mdi:tag" />}
                  onClick={() => setTabValue(1)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 12, px: 2 }}
                >
                  Rubros
                </CrystalButton>
              ) : (
                <CrystalSoftButton
                  baseColor={marron.primary}
                  startIcon={<Icon icon="mdi:tag" />}
                  onClick={() => setTabValue(1)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 12, px: 2 }}
                >
                  Rubros
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
                    p: 1,
                    borderRadius: 2,
                    bgcolor: baseBg,
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
                    p: 1,
                    borderRadius: 2,
                    bgcolor: baseBg,
                    transition: 'background-color .2s ease',
                  }}
                >
                  {/* Usa tu wrapper con modales ya cableados */}
                  <TablaRubros puedeCrear={userRole === 'admin' || userRole === 'diseñadora'} />
                </Box>
              )}
            </Box>
          </Box>
        </TexturedPanel>
      </Box >
    </PageContainer >
  );
}
