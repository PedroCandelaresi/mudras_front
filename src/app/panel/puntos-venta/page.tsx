'use client';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import { alpha, lighten, darken } from '@mui/material/styles';
import PageContainer from '@/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { Icon } from '@iconify/react';

import { grisVerdoso } from '@/ui/colores';
import {
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerPuntosMudrasResponse,
} from '@/components/puntos-mudras/graphql/queries';
import { PuntoMudras } from '@/interfaces/puntos-mudras';

import TablaStockPuntoVenta from '@/components/stock/TablaStockPuntoVenta';
import ModalModificarStockPunto from '@/components/stock/ModalModificarStockPunto';
import ModalNuevaAsignacionStock from '@/components/stock/ModalNuevaAsignacionStock';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton, forceWhiteIconsSX } from '@/components/ui/CrystalButton';

/* ——————————————————————————————————————————————————————————
   🔹 Utilidad: wrapper con bevel dinámico (idéntico a Artículos)
---------------------------------------------------------------- */
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
      position: 'absolute' as const,
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
      position: 'absolute' as const,
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
    '& > *': { position: 'relative' as const, zIndex: 1 },
  };
};

export default function PuntosVenta() {
  const [tabValue, setTabValue] = useState(0);
  const [puntosVenta, setPuntosVenta] = useState<PuntoMudras[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [modalModificarOpen, setModalModificarOpen] = useState(false);
  const [modalAsignacionOpen, setModalAsignacionOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<any>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoMudras | null>(null);

  const { data: puntosData, refetch: refetchPuntos } =
    useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);

  // Filtrar solo puntos de venta y mantener índice válido
  useEffect(() => {
    if (puntosData?.obtenerPuntosMudras) {
      const soloVentas = puntosData.obtenerPuntosMudras.filter((p) => p.tipo === 'venta');
      setPuntosVenta(soloVentas);
      if (tabValue >= soloVentas.length) setTabValue(0);
    }
  }, [puntosData, tabValue]);

  useEffect(() => {
    if (refetchTrigger > 0) refetchPuntos();
  }, [refetchTrigger, refetchPuntos]);

  useEffect(() => {
    const handlePuntosActualizados = () => refetchPuntos();
    window.addEventListener('puntosVentaActualizados', handlePuntosActualizados);
    return () => window.removeEventListener('puntosVentaActualizados', handlePuntosActualizados);
  }, [refetchPuntos]);

  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);
  const handleNuevaAsignacion = (puntoVenta: PuntoMudras) => {
    setPuntoSeleccionado(puntoVenta);
    setModalAsignacionOpen(true);
  };
  const handleModificarStock = (articulo: any) => {
    setArticuloSeleccionado(articulo);
    setModalModificarOpen(true);
  };
  const handleStockActualizado = () => setRefetchTrigger((prev) => prev + 1);

  // Paleta activa + fondo base (coherente con Artículos)
  const activeColor = grisVerdoso.primary;
  const baseBg = alpha('#2f3e2d', 0.9);

  return (
    <PageContainer title="Puntos de Venta - Mudras" description="Gestión de stock en puntos de venta">
      <Box sx={createBevelWrapper(activeColor)}>
        <TexturedPanel
          accent={activeColor}
          radius={14}
          contentPadding={12}
          bgTintPercent={22}
          bgAlpha={0.98}
          tintMode="soft-light"
          tintOpacity={0.42}
          textureScale={1.08}
          textureBaseOpacity={0.18}
          textureBoostOpacity={0.12}
          textureContrast={0.92}
          textureBrightness={1.02}
          bevelWidth={12}
          bevelIntensity={1.0}
          glossStrength={0.95}
          vignetteStrength={0.88}
        >
          {/* Título + tabs estilo Crystal (scrollable) */}
          <Box sx={{ bgcolor: 'transparent', px: 1, py: 1.5 }}>
            <Typography variant="h5" fontWeight={800} color={grisVerdoso.textStrong} sx={{ mb: 1 }}>
              <Icon icon="mdi:storefront-outline" style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Stock en Puntos de Venta
            </Typography>

            {/* Row de “tabs” con Crystal buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 0.5,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 6 },
              }}
            >
              {puntosVenta.length > 0 ? (
                puntosVenta.map((p, idx) =>
                  tabValue === idx ? (
                    <CrystalButton
                      key={p.id}
                      baseColor={grisVerdoso.primary}
                      startIcon={<Icon icon="mdi:store" />}
                      onClick={() => setTabValue(idx)}
                      sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2, whiteSpace: 'nowrap' }}
                    >
                      {p.nombre}
                    </CrystalButton>
                  ) : (
                    <CrystalSoftButton
                      key={p.id}
                      baseColor={grisVerdoso.primary}
                      startIcon={<Icon icon="mdi:store" />}
                      onClick={() => setTabValue(idx)}
                      sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2, whiteSpace: 'nowrap' }}
                    >
                      {p.nombre}
                    </CrystalSoftButton>
                  )
                )
              ) : (
                <CrystalSoftButton
                  baseColor={grisVerdoso.primary}
                  startIcon={<Icon icon="mdi:alert-circle" />}
                  disabled
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  No hay puntos de venta
                </CrystalSoftButton>
              )}
            </Box>
          </Box>


          {/* Contenido principal */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              <Box sx={{ borderRadius: 2, bgcolor: baseBg, transition: 'background-color .2s ease' }}>
                {puntosVenta.map((puntoVenta, index) =>
                  tabValue === index ? (
                    <TablaStockPuntoVenta
                      key={puntoVenta.id}
                      puntoVenta={puntoVenta}
                      onModificarStock={handleModificarStock}
                      onNuevaAsignacion={() => handleNuevaAsignacion(puntoVenta)}
                      refetchTrigger={refetchTrigger}
                    />
                  ) : null
                )}

                {puntosVenta.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" mb={2}>
                      No hay puntos de venta creados
                    </Typography>
                    <Typography color="text.secondary">
                      Ve a <strong>Administración → Puntos Mudras</strong> para crear puntos de venta
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </TexturedPanel>

        {/* Modales */}
        <ModalModificarStockPunto
          open={modalModificarOpen}
          onClose={() => setModalModificarOpen(false)}
          articulo={articuloSeleccionado}
          onStockActualizado={handleStockActualizado}
        />

        <ModalNuevaAsignacionStock
          open={modalAsignacionOpen}
          onClose={() => setModalAsignacionOpen(false)}
          puntoVenta={puntoSeleccionado}
          onStockAsignado={handleStockActualizado}
        />
      </Box>
    </PageContainer>
  );
}
