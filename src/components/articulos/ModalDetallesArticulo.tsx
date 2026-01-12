'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Skeleton,
} from '@mui/material';

import { alpha, darken } from '@mui/material/styles';
import { useCallback, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { IconRefresh } from '@tabler/icons-react';

import { useQuery } from '@apollo/client/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { GET_ARTICULO } from '@/components/articulos/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';

import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';

import { verde as verdePalette } from '@/ui/colores';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';

/* ======================== Props ======================== */
interface StockContextProps {
  value?: number;
  label?: string;
}

interface ModalDetallesArticuloProps {
  open: boolean;
  onClose: () => void;
  articulo?: Pick<Articulo, 'id' | 'Descripcion' | 'Codigo'> | null;
  accentColor?: string;
  stockContext?: StockContextProps;
}

/* ======================== Utils ======================== */
const NBSP = '\u00A0';

const currency = (v?: number | null) =>
  typeof v === 'number'
    ? v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    : '—';

const makeColors = (base?: string) => {
  const primary = base || verdePalette.primary;
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.5),
    chipBorder: 'rgba(255,255,255,0.35)',
  };
};

/* ======================== Layout ======================== */
const VH_MAX = 85;
const HEADER_H = 60;      // Igual al modal de proveedores
const FOOTER_H = 60;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

/* ======================== Componente ======================== */
const ModalDetallesArticulo = ({
  open,
  onClose,
  articulo,
  accentColor,
  stockContext,
}: ModalDetallesArticuloProps) => {

  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);

  const articuloId = useMemo(() => {
    if (!articulo?.id) return null;
    const parsed = Number(articulo.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [articulo?.id]);

  const { data, loading, error, refetch } = useQuery<{ articulo: Articulo }>(
    GET_ARTICULO,
    {
      variables: { id: articuloId ?? 0 },
      skip: !open || articuloId == null,
      fetchPolicy: 'cache-and-network',
    }
  );

  const articuloCompleto: Articulo | null = useMemo(() => {
    if (data?.articulo) return data.articulo as Articulo;

    if (articuloId != null && articulo) {
      return {
        id: articuloId,
        Descripcion: articulo.Descripcion,
        Codigo: articulo.Codigo,
      } as Articulo;
    }
    return null;
  }, [data?.articulo, articuloId, articulo]);

  const precioCalculado = useMemo(
    () => calcularPrecioDesdeArticulo(articuloCompleto ?? undefined),
    [articuloCompleto]
  );

  useEffect(() => {
    if (open && articuloId != null) {
      void refetch({ id: articuloId });
    }
  }, [open, articuloId, refetch]);

  const handleClose = useCallback(() => {
    if (loading) return;
    onClose();
  }, [loading, onClose]);

  if (!articuloCompleto && !loading && !error) return null;

  /* ===== Datos derivados ===== */
  const fallbackStock =
    typeof articuloCompleto?.totalStock === 'number'
      ? Number(articuloCompleto.totalStock)
      : Number(articuloCompleto?.Deposito ?? articuloCompleto?.Stock ?? 0);

  const stockActual =
    typeof stockContext?.value === 'number'
      ? stockContext.value
      : fallbackStock;

  const stockMinimo = Number(articuloCompleto?.StockMinimo ?? 0);

  const stockLabelText =
    stockContext?.label ??
    (typeof articuloCompleto?.totalStock === 'number'
      ? 'Stock total'
      : 'Stock actual');

  const stockChip =
    stockActual <= 0
      ? { label: 'Sin stock', color: 'error' as const }
      : stockActual <= stockMinimo
        ? { label: 'Stock bajo', color: 'warning' as const }
        : { label: 'Disponible', color: 'success' as const };

  const tituloHeader =
    (articuloCompleto?.Codigo ? `${articuloCompleto.Codigo} - ` : '') +
    (articuloCompleto?.Descripcion ?? 'Detalle del artículo');

  /* ======================== RENDER ======================== */

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'transparent !important',
          backgroundColor: 'transparent !important',
          boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
        },
      }}
    >

      {/* PANEL TEXTURIZADO IGUAL QUE PROVEEDORES */}
      <TexturedPanel
        accent={COLORS.primary}
        radius={12}
        contentPadding={0}
        bgTintPercent={12}
        bgAlpha={1}
        textureBaseOpacity={0.22}
        textureBoostOpacity={0.19}
        textureBrightness={1.12}
        textureContrast={1.03}
        tintOpacity={0.38}
      >

        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>

          {/* =======================================================
             ================== HEADER METÁLICO =====================
             ======================================================= */}
          <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',   // ← clave para respetar HEADER_H exacto
                display: 'flex',
                alignItems: 'center',
                px: 3,
                gap: 2,
              }}
            >
              {/* Icono redondo */}
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
                color: '#fff'
              }}>
                <Icon icon="mdi:cube-outline" width={22} height={22} />
              </Box>

              {/* Título */}
              <Typography variant="h6" fontWeight={700} color="#fff" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {tituloHeader}
              </Typography>

              {/* Cerrar */}
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
                <CrystalSoftButton
                  baseColor={COLORS.primary}
                  onClick={handleClose}
                  sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    maxWidth: 40,
                    minHeight: 40,
                    maxHeight: 40,
                    borderRadius: '50%',
                    border: 0,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    flexShrink: 0,      // evita estiramiento vertical
                    flexGrow: 0,        // evita estiramiento horizontal
                    flexBasis: 'auto',  // evita expansión inesperada

                    '& .MuiButton-startIcon': { margin: 0 },
                    '& .MuiButton-endIcon': { margin: 0 },

                    // 🔥 ESTE ES EL CLAVE: fuerza shape PERFECTO
                    lineHeight: 1,
                    aspectRatio: '1 / 1',
                  }}
                >
                  <Icon icon="mdi:close" width={20} height={20} color="#fff" />
                </CrystalSoftButton>

              </Box>
            </Box>
          </DialogTitle>

          {/* Línea divisoria Header */}
          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: `
                linear-gradient(to bottom, ${alpha('#fff', 0.68)}, ${alpha('#fff', 0.68)}),
                linear-gradient(to bottom, ${alpha(darken(COLORS.primary, 0.5), 0.3)}, ${alpha(darken(COLORS.primary, 0.5), 0.3)}),
                linear-gradient(90deg, ${alpha(COLORS.primary, 0.12)}, ${COLORS.primary}, ${alpha(COLORS.primary, 0.12)})
              `,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto'
            }}
          />

          {/* =======================================================
             ====================== CONTENIDO ======================
             ======================================================= */}
          <DialogContent
            sx={{
              p: 0,
              overflow: 'auto',
              maxHeight: CONTENT_MAX,
              background: '#f8fafb',
            }}
          >
            <Box sx={{ p: { xs: 3, md: 4 } }}>

              {/* Loading */}
              {loading && <Skeleton variant="rounded" height={320} />}

              {/* Error */}
              {error && (
                <Box textAlign="center" py={6}>
                  <Typography color="error" variant="h6" mb={1}>
                    Error al cargar el artículo
                  </Typography>
                  <Typography color="text.secondary" mb={2}>
                    {error.message}
                  </Typography>
                  <CrystalButton baseColor={COLORS.primary} startIcon={<IconRefresh />} onClick={() => refetch()}>
                    Reintentar
                  </CrystalButton>
                </Box>
              )}

              {/* CONTENIDO NORMAL */}
              {!loading && !error && articuloCompleto && (
                <>

                  {/* =======================================================
                     TARJETAS DE INFO RÁPIDA
                     ======================================================= */}

                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1,
                      gridTemplateColumns: {
                        xs: 'repeat(2,1fr)',
                        sm: 'repeat(3,1fr)',
                        md: 'repeat(5,1fr)',
                      },
                      mb: 3,
                    }}
                  >

                    {/* Código */}
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                        background: alpha(COLORS.primary, 0.04),
                      }}
                    >
                      <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.18),
                            }}
                          >
                            <Icon icon="mdi:barcode" width={14} height={14} color={COLORS.primary} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            Código
                          </Typography>
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} color={COLORS.primary}>
                          {articuloCompleto?.Codigo || '—'}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Stock */}
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                        background: alpha(COLORS.primary, 0.03),
                      }}
                    >
                      <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.16),
                            }}
                          >
                            <Icon icon="mdi:package-variant-closed" width={14} height={14} color={COLORS.primary} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            {stockLabelText}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight={800} color={COLORS.primary}>
                            {stockActual}
                          </Typography>
                          <Chip size="small" label={stockChip.label} color={stockChip.color} />
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Precio venta */}
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                        background: alpha(COLORS.primary, 0.03),
                      }}
                    >
                      <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{
                            width: 22, height: 22, borderRadius: '50%',
                            display: 'grid', placeItems: 'center',
                            bgcolor: alpha(COLORS.primary, 0.16)
                          }}>
                            <Icon icon="mdi:cash" width={14} height={14} color={COLORS.primary} />
                          </Box>

                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            Precio venta
                          </Typography>
                        </Box>

                        <Typography variant="subtitle1" fontWeight={800} color={COLORS.primary}>
                          {currency(precioCalculado)}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Precio compra */}
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                        background: alpha(COLORS.primary, 0.03),
                      }}
                    >
                      <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(COLORS.primary, 0.16)
                          }}>
                            <Icon icon="mdi:cart-arrow-down" width={14} height={14} color={COLORS.primary} />
                          </Box>

                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            Precio compra
                          </Typography>
                        </Box>

                        <Typography variant="subtitle1" fontWeight={800} color={COLORS.primary}>
                          {currency(articuloCompleto?.PrecioCompra)}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* % Ganancia */}
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                        background: alpha(COLORS.primary, 0.03),
                      }}
                    >
                      <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{
                            width: 22, height: 22, borderRadius: '50%',
                            display: 'grid', placeItems: 'center',
                            bgcolor: alpha(COLORS.primary, 0.12)
                          }}>
                            <Icon icon="mdi:percent" width={14} height={14} color={COLORS.primary} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            % Ganancia
                          </Typography>
                        </Box>

                        <Typography variant="h6" fontWeight={800} color={COLORS.primary}>
                          {articuloCompleto?.PorcentajeGanancia != null
                            ? `${articuloCompleto.PorcentajeGanancia}%`
                            : '—'}
                        </Typography>
                      </CardContent>
                    </Card>

                  </Box>

                  {/* =======================================================
                     DETALLES DEL ARTÍCULO
                     ======================================================= */}

                  <Box
                    sx={{
                      display: 'grid',
                      gap: 3,
                      gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
                      alignItems: 'start',
                    }}
                  >
                    {/* Columna izquierda */}
                    <Box>
                      <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} mb={1}>
                        Información general
                      </Typography>


                      {/* IMAGEN GRANDE */}
                      {articuloCompleto?.ImagenUrl && (
                        <Box
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
                            display: 'flex',
                            justifyContent: 'center',
                            bgcolor: '#fff',
                            p: 1
                          }}
                        >
                          <img
                            src={
                              articuloCompleto.ImagenUrl.startsWith('http') || articuloCompleto.ImagenUrl.startsWith('data:')
                                ? articuloCompleto.ImagenUrl
                                : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${articuloCompleto.ImagenUrl.startsWith('/') ? '' : '/'}${articuloCompleto.ImagenUrl}`
                            }
                            alt={articuloCompleto.Descripcion}
                            style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                          />
                        </Box>
                      )}

                      <Box
                        sx={{
                          display: 'grid',
                          gap: 2,
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)' },
                        }}
                      >

                        <Box>
                          <Typography variant="caption" color="text.secondary">Descripción</Typography>
                          <Typography variant="body1" fontWeight={600} color={COLORS.textStrong}>
                            {articuloCompleto?.Descripcion || 'Sin descripción'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">Categoría / Rubro</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.Rubro || 'No asignado'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">Unidad</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.Unidad || 'Unidad'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">Proveedor</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.proveedor?.Nombre || 'Sin proveedor'}
                          </Typography>
                        </Box>

                      </Box>
                    </Box>

                    {/* Columna derecha */}
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.26)}`,
                        background: alpha('#fff', 0.9),
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                        p: 2.2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.2,
                      }}
                    >

                      <Box display="flex" alignItems="center" gap={1}>
                        <Icon icon="mdi:information-variant" width={20} height={20} color={COLORS.primary} />
                        <Typography variant="subtitle1" fontWeight={700} color={COLORS.textStrong}>
                          Datos adicionales
                        </Typography>
                      </Box>

                      <Box sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)' }
                      }}>

                        <Box>
                          <Typography variant="caption" color="text.secondary">Stock mínimo</Typography>
                          <Typography variant="body1" fontWeight={600}>{stockMinimo}</Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">Alicuota IVA</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.AlicuotaIva != null
                              ? `${articuloCompleto.AlicuotaIva}%`
                              : 'No especificado'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">Actualizado</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.FechaModif
                              ? format(new Date(articuloCompleto.FechaModif), 'dd/MM/yyyy', { locale: es })
                              : '—'}
                          </Typography>
                        </Box>

                      </Box>

                    </Box>

                  </Box>

                  {/* Observaciones */}
                  <Box
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                      background: alpha(COLORS.primary, 0.05),
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                      p: 2.2,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong} mb={0.5}>
                      Observaciones del proveedor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {articuloCompleto?.proveedor?.Observaciones || 'Sin observaciones'}
                    </Typography>
                  </Box>

                </>
              )}

            </Box>
          </DialogContent>

          {/* =======================================================
             ==================== DIVIDER FOOTER ====================
             ======================================================= */}
          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: `
                linear-gradient(to bottom, ${alpha(darken(COLORS.primary, 0.5), 0.3)}, ${alpha(darken(COLORS.primary, 0.5), 0.3)}),
                linear-gradient(to bottom, ${alpha('#fff', 0.68)}, ${alpha('#fff', 0.68)}),
                linear-gradient(90deg, ${alpha(COLORS.primary, 0.12)}, ${COLORS.primary}, ${alpha(COLORS.primary, 0.12)})
              `,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto'
            }}
          />

          {/* =======================================================
             ====================== FOOTER =========================
             ======================================================= */}
          <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',   // ← clave
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                px: 3,
                gap: 1.5,
              }}
            >              <CrystalSoftButton baseColor={COLORS.primary} onClick={handleClose}>
                Cerrar
              </CrystalSoftButton>
            </Box>
          </DialogActions>

        </Box>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalDetallesArticulo;
