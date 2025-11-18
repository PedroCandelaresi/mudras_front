// /src/components/articulos/ModalDetallesArticulo.tsx
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
const HEADER_H = 68;
const FOOTER_H = 68;
const DIV_H = 2;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

/* ======================== Componente ======================== */
const ModalDetallesArticulo = ({ open, onClose, articulo, accentColor, stockContext }: ModalDetallesArticuloProps) => {
  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);

  const articuloId = useMemo(() => {
    if (!articulo?.id) return null;
    const parsed = Number(articulo.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [articulo?.id]);

  const { data, loading, error, refetch } = useQuery<{ articulo: Articulo }>(GET_ARTICULO, {
    variables: { id: articuloId ?? 0 },
    skip: !open || articuloId == null,
    fetchPolicy: 'cache-and-network',
  });

  const articuloCompleto: Articulo | null = useMemo(() => {
    if (data?.articulo) return data.articulo as Articulo;
    if (articuloId != null && articulo) {
      return {
        id: articuloId,
        Descripcion: articulo.Descripcion,
        Codigo: articulo.Codigo,
      } as unknown as Articulo;
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

  // ==== Stock & datos ====
  const fallbackStock =
    typeof articuloCompleto?.totalStock === 'number'
      ? Number(articuloCompleto.totalStock)
      : Number(articuloCompleto?.Deposito ?? articuloCompleto?.Stock ?? 0);

  const stockActual =
    typeof stockContext?.value === 'number'
      ? stockContext.value
      : fallbackStock;

  const stockLabelText =
    stockContext?.label ??
    (typeof articuloCompleto?.totalStock === 'number' ? 'Stock total' : 'Stock actual');

  const stockMinimo = Number(articuloCompleto?.StockMinimo ?? 0);

  const stockChip =
    stockActual <= 0
      ? { label: 'Sin stock', color: 'error' as const }
      : stockActual <= stockMinimo
      ? { label: 'Stock bajo', color: 'warning' as const }
      : { label: 'Disponible', color: 'success' as const };

  const tituloHeader =
    (articuloCompleto?.Codigo ? `${articuloCompleto.Codigo} - ` : '') +
    (articuloCompleto?.Descripcion ?? 'Detalle del artículo');

  const renderTooltip = (text: string) => (
    <Box sx={{ whiteSpace: 'pre-line', lineHeight: 1.4, maxWidth: 320 }}>{text}</Box>
  );

  const proveedorNombre = articuloCompleto?.proveedor?.Nombre || 'Sin proveedor';
  const rubroNombre = (articuloCompleto?.Rubro || 'Sin rubro').toString();
  const chipsTooltip = `Proveedor: ${proveedorNombre}\nRubro: ${rubroNombre}`;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          bgcolor: 'transparent',
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
        },
      }}
    >
      <TexturedPanel
        accent={COLORS.primary}
        radius={12}
        contentPadding={0}
        bgTintPercent={12}
        bgAlpha={0.98}
        textureScale={1.08}
        textureBaseOpacity={0.22}
        textureBoostOpacity={0.18}
        textureBrightness={1.12}
        textureContrast={1.03}
        tintOpacity={0.35}
        tintMode="soft-light"
        bevelWidth={10}
        bevelIntensity={0.9}
        glossStrength={0.9}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>

          {/* ===== HEADER ELEGANTE ===== */}
          <DialogTitle
            sx={{
              p: 0,
              m: 0,
              minHeight: HEADER_H,
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'saturate(140%) blur(2px)',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryHover})`,
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.25)',
                  color: '#fff',
                }}
              >
                <Icon icon="mdi:cube-outline" width={20} height={20} />
              </Box>

              <Typography
                variant="h6"
                fontWeight={700}
                color="white"
                sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                {tituloHeader}
              </Typography>

              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip arrow placement="top" title={renderTooltip(chipsTooltip)}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={articuloCompleto?.Rubro || 'Sin rubro'}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.4)',
                        color: '#fff',
                        border: `1px solid ${COLORS.chipBorder}`,
                        fontWeight: 600,
                        px: 1.5,
                        py: 0.5,
                        height: 28,
                      }}
                    />
                    {!!articuloCompleto?.proveedor?.Nombre && (
                      <Chip
                        label={`Proveedor${NBSP}${articuloCompleto.proveedor.Nombre}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.4)',
                          color: '#fff',
                          border: `1px solid ${COLORS.chipBorder}`,
                          fontWeight: 600,
                          px: 1.5,
                          py: 0.5,
                          height: 28,
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              </Box>

              <CrystalSoftButton
                baseColor={COLORS.primary}
                onClick={handleClose}
                title="Cerrar"
                sx={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon icon="mdi:close" color="#fff" width={22} height={22} />
              </CrystalSoftButton>
            </Box>
          </DialogTitle>

          {/* Divider opcional */}
          <Divider
            sx={{
              height: DIV_H,
              opacity: 0.25,
              background: 'rgba(255,255,255,0.25)',
            }}
          />

          {/* ===== CONTENIDO ===== */}
          <DialogContent
            sx={{
              p: 0,
              overflow: 'auto',
              maxHeight: CONTENT_MAX,
            }}
          >
            <Box sx={{ position: 'relative', p: { xs: 3, md: 4 } }}>
              {loading ? (
                <Skeleton variant="rounded" height={320} />
              ) : error ? (
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
              ) : (
                <>
                  {/* TARJETAS */}
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1,
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                        md: 'repeat(5, 1fr)',
                      },
                      mb: 3,
                    }}
                  >
                    {/* Código */}
                    <Card
                      sx={{
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
                        background: alpha(COLORS.primary, 0.06),
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.2),
                            }}
                          >
                            <Icon icon="mdi:barcode" width={15} height={15} color={COLORS.primary} />
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
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
                        background: alpha(COLORS.primary, 0.05),
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.2),
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
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
                        background: alpha(COLORS.primary, 0.05),
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.2),
                            }}
                          >
                            <Icon icon="mdi:cash" width={15} height={15} color={COLORS.primary} />
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
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
                        background: alpha(COLORS.primary, 0.05),
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.2),
                            }}
                          >
                            <Icon icon="mdi:cart-arrow-down" width={15} height={15} color={COLORS.primary} />
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

                    {/* Ganancia */}
                    <Card
                      sx={{
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
                        background: alpha(COLORS.primary, 0.05),
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(COLORS.primary, 0.15),
                            }}
                          >
                            <Icon icon="mdi:percent" width={14} height={14} color={COLORS.primary} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                            % Ganancia
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.primary}>
                          {typeof articuloCompleto?.PrecioCompra === 'number' &&
                          articuloCompleto?.PrecioCompra > 0
                            ? `${Math.round(
                                ((precioCalculado - articuloCompleto.PrecioCompra) /
                                  articuloCompleto.PrecioCompra) *
                                  100
                              )}%`
                            : '—'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* INFO GENERAL */}
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 3,
                      gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
                      alignItems: 'start',
                    }}
                  >
                    {/* COLUMNA IZQUIERDA */}
                    <Box>
                      <Typography variant="h6" fontWeight={700} color={COLORS.textStrong}>
                        Información general
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ficha del artículo con categorización, costos y estado de inventario.
                      </Typography>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                          gap: 2,
                          mt: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Descripción
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color={COLORS.textStrong}>
                            {articuloCompleto?.Descripcion || 'Sin descripción'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Categoría / Rubro
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.Rubro || 'No asignado'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Unidad
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.Unidad || 'Unidad'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Proveedor asociado
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {proveedorNombre}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* COLUMNA DERECHA */}
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.25)}`,
                        background: alpha('#fff', 0.85),
                        p: 2.2,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Icon
                          icon="mdi:information-variant"
                          width={20}
                          height={20}
                          color={COLORS.primary}
                        />
                        <Typography variant="subtitle1" fontWeight={700} color={COLORS.textStrong}>
                          Datos adicionales
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          mt: 2,
                          display: 'grid',
                          gap: 2,
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Stock mínimo
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {stockMinimo}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Alícuota IVA
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.AlicuotaIva != null
                              ? `${articuloCompleto.AlicuotaIva}%`
                              : 'No especificado'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Actualizado
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {articuloCompleto?.FechaModif
                              ? format(new Date(articuloCompleto.FechaModif), 'dd/MM/yyyy', { locale: es })
                              : '—'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* OBSERVACIONES */}
                  <Box
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
                      background: alpha(COLORS.primary, 0.06),
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

          {/* ==== FOOTER ELEGANTE ==== */}
          <DialogActions
            sx={{
              p: 0,
              m: 0,
              minHeight: FOOTER_H,
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'saturate(140%) blur(2px)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                px: 2,
                py: 1.5,
                gap: 1,
              }}
            >
              <CrystalSoftButton baseColor={COLORS.primary} onClick={handleClose}>
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
