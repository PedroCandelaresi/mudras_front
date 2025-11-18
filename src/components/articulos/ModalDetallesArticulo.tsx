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
    textStrong: darken(primary, 0.48),
    chipBorder: 'rgba(255,255,255,0.35)',
  };
};

const VH_MAX = 88;
const HEADER_H = 74;
const FOOTER_H = 74;

/* ======================================================== */

const ModalDetallesArticulo = ({
  open,
  onClose,
  articulo,
  accentColor,
  stockContext,
}: {
  open: boolean;
  onClose: () => void;
  articulo?: Pick<Articulo, 'id' | 'Descripcion' | 'Codigo'> | null;
  accentColor?: string;
  stockContext?: { value?: number; label?: string };
}) => {
  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);

  const articuloId = useMemo(() => {
    if (!articulo?.id) return null;
    const n = Number(articulo.id);
    return Number.isFinite(n) ? n : null;
  }, [articulo]);

  const { data, loading, error, refetch } = useQuery<{ articulo: Articulo }>(
    GET_ARTICULO,
    {
      variables: { id: articuloId ?? 0 },
      skip: !open || articuloId == null,
      fetchPolicy: 'cache-and-network',
    },
  );

  const articuloCompleto = useMemo(() => {
    if (data?.articulo) return data.articulo;

    if (articuloId != null && articulo) {
      return {
        id: articuloId,
        Codigo: articulo.Codigo,
        Descripcion: articulo.Descripcion,
      } as Articulo;
    }
    return null;
  }, [data, articuloId, articulo]);

  const precioCalculado = useMemo(
    () => calcularPrecioDesdeArticulo(articuloCompleto ?? undefined),
    [articuloCompleto]
  );

  useEffect(() => {
    if (open && articuloId != null) refetch({ id: articuloId });
  }, [open, articuloId, refetch]);

  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  if (!articuloCompleto && !loading && !error) return null;

  /* ==================== Stock ==================== */

  const fallbackStock =
    typeof articuloCompleto?.totalStock === 'number'
      ? articuloCompleto.totalStock
      : Number(articuloCompleto?.Deposito ?? articuloCompleto?.Stock ?? 0);

  const stockActual =
    typeof stockContext?.value === 'number'
      ? stockContext.value
      : fallbackStock;

  const stockLabelText =
    stockContext?.label ??
    (typeof articuloCompleto?.totalStock === 'number'
      ? 'Stock total'
      : 'Stock actual');

  const stockMinimo = Number(articuloCompleto?.StockMinimo ?? 0);
  const stockChip =
    stockActual <= 0
      ? { label: 'Sin stock', color: 'error' as const }
      : stockActual <= stockMinimo
        ? { label: 'Stock bajo', color: 'warning' as const }
        : { label: 'Disponible', color: 'success' as const };

  const proveedorNombre =
    articuloCompleto?.proveedor?.Nombre ?? 'Sin proveedor';
  const rubroNombre = articuloCompleto?.Rubro ?? 'Sin rubro';

  const tituloHeader = `${articuloCompleto?.Codigo ?? ''} - ${articuloCompleto?.Descripcion ?? ''
    }`;

  const tooltipChips = `Proveedor: ${proveedorNombre}\nRubro: ${rubroNombre}`;

  /* ======================================================== */

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'transparent',
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
        },
      }}
    >
      {/* =====================================================
         BLOQUE COMPLETO: HEADER + CONTENIDO + FOOTER
      ====================================================== */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* =============== HEADER METÁLICO REAL =============== */}
        <Box sx={{ position: 'relative' }}>
          <TexturedPanel
            accent={COLORS.primary}
            radius={0}
            contentPadding={0}
            bgTintPercent={10}
            bgAlpha={1}
            textureScale={1.12}
            textureBaseOpacity={0.22}
            textureBoostOpacity={0.20}
            textureBrightness={1.15}
            textureContrast={1.08}
            tintOpacity={0.35}
            glossStrength={1}
            bevelWidth={10}
            bevelIntensity={1}
          />

          <DialogTitle
            sx={{
              position: 'relative',
              zIndex: 1,
              m: 0,
              px: 3,
              py: 2,
              height: HEADER_H,
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(1.5px)',
            }}
          >
            {/* Ícono */}
            <Box
              sx={{
                width: 42,
                height: 42,
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
              sx={{
                ml: 2,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.55)',
              }}
            >
              {tituloHeader}
            </Typography>

            {/* Chips */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Tooltip title={tooltipChips}>
                <Chip
                  label={rubroNombre}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.45)',
                    color: '#fff',
                    border: `1px solid ${COLORS.chipBorder}`,
                    fontWeight: 600,
                  }}
                />
              </Tooltip>

              {articuloCompleto?.proveedor?.Nombre && (
                <Chip
                  label={`Proveedor${NBSP}${proveedorNombre}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.45)',
                    color: '#fff',
                    border: `1px solid ${COLORS.chipBorder}`,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>

            <CrystalSoftButton
              baseColor={COLORS.primary}
              onClick={handleClose}
              sx={{
                ml: 2,
                width: 42,
                height: 42,
                borderRadius: '50%',
              }}
            >
              <Icon icon="mdi:close" width={22} height={22} color="#fff" />
            </CrystalSoftButton>
          </DialogTitle>
        </Box>

        {/* Divider */}
        <Divider sx={{ opacity: 0.25, background: 'rgba(255,255,255,0.4)' }} />

        {/* =============== CONTENIDO GRIS SUAVE =============== */}
        <DialogContent
          sx={{
            flex: 1,
            p: 0,
            overflow: 'auto',
            background: 'rgba(255,255,255,0.92)', // GRIS SUAVE
            backdropFilter: 'blur(1px)',
          }}
        >
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            {/* LO TUYO TAL CUAL — TARJETAS, DETALLES, ETC */}
            {/* ------------------------------------------ */}

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
                <CrystalButton
                  baseColor={COLORS.primary}
                  onClick={() => refetch()}
                  startIcon={<IconRefresh />}
                >
                  Reintentar
                </CrystalButton>
              </Box>
            ) : (
              <>
                {/* -------------------------
                    TARJETAS SUPERIORES
                -------------------------- */}
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.5,
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
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
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
                        {articuloCompleto?.Codigo}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Stock */}
                  <Card
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
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
                            bgcolor: alpha(COLORS.primary, 0.18),
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
                      border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
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
                            bgcolor: alpha(COLORS.primary, 0.18),
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
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
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
                            bgcolor: alpha(COLORS.primary, 0.18),
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
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
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
                            bgcolor: alpha(COLORS.primary, 0.18),
                          }}
                        >
                          <Icon icon="mdi:percent" width={15} height={15} color={COLORS.primary} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
                          % Ganancia
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={800} color={COLORS.primary}>
                        {articuloCompleto?.PrecioCompra
                          ? `${Math.round(((precioCalculado - articuloCompleto.PrecioCompra) /
                            articuloCompleto.PrecioCompra) * 100)}%`
                          : '—'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* INFORMACIÓN GENERAL */}
                <Box
                  sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
                  }}
                >
                  {/* Izquierda */}
                  <Box>
                    <Typography variant="h6" fontWeight={700} color={COLORS.textStrong}>
                      Información general
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Ficha del artículo con costos, categorización y stock.
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Descripción
                        </Typography>
                        <Typography fontWeight={600} color={COLORS.textStrong}>
                          {articuloCompleto?.Descripcion}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Categoría / Rubro
                        </Typography>
                        <Typography fontWeight={600}>
                          {articuloCompleto?.Rubro ?? 'No asignado'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Unidad
                        </Typography>
                        <Typography fontWeight={600}>
                          {articuloCompleto?.Unidad ?? 'Unidad'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Proveedor
                        </Typography>
                        <Typography fontWeight={600}>
                          {proveedorNombre}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Derecha */}
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.25)}`,
                      background: alpha('#fff', 0.9),
                      p: 2.4,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon icon="mdi:information-variant" width={20} height={20} color={COLORS.primary} />
                      <Typography variant="subtitle1" fontWeight={700} color={COLORS.textStrong}>
                        Datos adicionales
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: '1fr 1fr',
                        mt: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Stock mínimo
                        </Typography>
                        <Typography fontWeight={600}>{stockMinimo}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Alícuota IVA
                        </Typography>
                        <Typography fontWeight={600}>
                          {`${articuloCompleto?.AlicuotaIva ?? 0}%`}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Actualizado
                        </Typography>
                        <Typography fontWeight={600}>
                          {articuloCompleto?.FechaModif
                            ? format(new Date(articuloCompleto.FechaModif), 'dd/MM/yyyy', {
                              locale: es,
                            })
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
                    border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
                    background: alpha(COLORS.primary, 0.05),
                    p: 2.2,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} color={COLORS.textStrong}>
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

        {/* =============== FOOTER METÁLICO REAL =============== */}
        <Box sx={{ position: 'relative' }}>
          <TexturedPanel
            accent={COLORS.primary}
            radius={0}
            contentPadding={0}
            bgTintPercent={10}
            bgAlpha={1}
            textureScale={1.12}
            textureBaseOpacity={0.22}
            textureBoostOpacity={0.20}
            textureBrightness={1.15}
            textureContrast={1.08}
            tintOpacity={0.35}
            glossStrength={1}
            bevelWidth={10}
            bevelIntensity={1}
          />

          <DialogActions
            sx={{
              position: 'relative',
              zIndex: 1,
              height: FOOTER_H,
              px: 3,
              py: 2,
              backdropFilter: 'blur(1.5px)',
            }}
          >
            <Box sx={{ ml: 'auto' }}>
              <CrystalSoftButton baseColor={COLORS.primary} onClick={handleClose}>
                Cerrar
              </CrystalSoftButton>
            </Box>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ModalDetallesArticulo;
