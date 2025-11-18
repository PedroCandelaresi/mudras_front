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
const HEADER_H = 76;
const FOOTER_H = 76;
const DIV_H = 2;
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
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>

        {/* ====================== HEADER METÁLICO SUAVE ====================== */}
        <Box sx={{ position: 'relative' }}>
          {/* Capa metálica */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <TexturedPanel
              accent={COLORS.primary}
              radius={0}
              contentPadding={0}
              bgTintPercent={14}
              bgAlpha={0.98}
              textureScale={1.08}
              textureBaseOpacity={0.18}
              textureBoostOpacity={0.12}
              textureContrast={1.04}
              textureBrightness={1.10}
              tintOpacity={0.28}
              tintMode="soft-light"
              bevelWidth={8}
              bevelIntensity={0.6}
              glossStrength={0.55}
            />
          </Box>

          {/* Contenido visible */}
          <DialogTitle
            sx={{
              p: 0,
              m: 0,
              minHeight: HEADER_H,
              display: 'flex',
              alignItems: 'center',
              background: 'transparent !important',
              bgcolor: 'transparent !important',
              backgroundColor: 'transparent !important',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                px: 3,
                py: 2,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  boxShadow:
                    'inset 0 2px 4px rgba(255,255,255,0.28), 0 4px 12px rgba(0,0,0,0.20)',
                  color: '#fff',
                }}
              >
                <Icon icon="mdi:cube-outline" width={20} height={20} />
              </Box>

              <Typography
                variant="h6"
                fontWeight={700}
                color="#fff"
                sx={{ textShadow: '0 2px 6px rgba(0,0,0,0.45)' }}
              >
                {tituloHeader}
              </Typography>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <CrystalSoftButton
                  baseColor={COLORS.primary}
                  title="Cerrar"
                  onClick={handleClose}
                  sx={{
                    width: 42,
                    height: 42,
                    minWidth: 42,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon icon="mdi:close" width={20} height={20} color="#fff" />
                </CrystalSoftButton>
              </Box>
            </Box>
          </DialogTitle>
        </Box>

        {/* Línea divisoria */}
        <Divider
          sx={{
            height: DIV_H,
            border: 0,
            background: alpha('#000', 0.22),
            boxShadow: '0 1px rgba(255,255,255,0.4)',
            flex: '0 0 auto',
          }}
        />

        {/* ====================== CONTENIDO PLANO ====================== */}
        <DialogContent
          sx={{
            p: 0,
            borderRadius: 0,
            overflow: 'auto',
            maxHeight: CONTENT_MAX,
            flex: '0 1 auto',
            background: '#f8fafb',
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
                <CrystalButton
                  baseColor={COLORS.primary}
                  startIcon={<IconRefresh />}
                  onClick={() => refetch()}
                >
                  Reintentar
                </CrystalButton>
              </Box>
            ) : (
              <>
                {/* Tarjetas rápidas */}
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
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                      background: alpha(COLORS.primary, 0.04),
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
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
                          <Icon
                            icon="mdi:barcode"
                            width={14}
                            height={14}
                            color={COLORS.primary}
                          />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color={COLORS.textStrong}
                        >
                          Código
                        </Typography>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color={COLORS.primary}
                      >
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
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
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
                          <Icon
                            icon="mdi:package-variant-closed"
                            width={14}
                            height={14}
                            color={COLORS.primary}
                          />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color={COLORS.textStrong}
                        >
                          {stockLabelText}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          color={COLORS.primary}
                        >
                          {stockActual}
                        </Typography>
                        <Chip
                          size="small"
                          label={stockChip.label}
                          color={stockChip.color}
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Precio Venta */}
                  <Card
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                      background: alpha(COLORS.primary, 0.03),
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
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
                          <Icon
                            icon="mdi:cash"
                            width={14}
                            height={14}
                            color={COLORS.primary}
                          />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color={COLORS.textStrong}
                        >
                          Precio venta
                        </Typography>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color={COLORS.primary}
                      >
                        {currency(precioCalculado)}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Precio Compra */}
                  <Card
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(COLORS.primary, 0.14)}`,
                      background: alpha(COLORS.primary, 0.03),
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
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
                          <Icon
                            icon="mdi:cart-arrow-down"
                            width={14}
                            height={14}
                            color={COLORS.primary}
                          />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color={COLORS.textStrong}
                        >
                          Precio compra
                        </Typography>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color={COLORS.primary}
                      >
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
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(COLORS.primary, 0.12),
                          }}
                        >
                          <Icon
                            icon="mdi:percent"
                            width={14}
                            height={14}
                            color={COLORS.primary}
                          />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color={COLORS.textStrong}
                        >
                          % Ganancia
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color={COLORS.primary}
                      >
                        {typeof articuloCompleto?.PrecioCompra === 'number' &&
                          articuloCompleto?.PrecioCompra > 0
                          ? `${Math.round(
                            ((precioCalculado -
                              articuloCompleto.PrecioCompra) /
                              articuloCompleto.PrecioCompra) *
                            100
                          )}%`
                          : '—'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* ===== DETALLES ===== */}
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
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={COLORS.textStrong}
                      mb={1}
                    >
                      Información general
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2,1fr)',
                        },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Descripción
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color={COLORS.textStrong}
                        >
                          {articuloCompleto?.Descripcion ||
                            'Sin descripción'}
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
                          Proveedor
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {articuloCompleto?.proveedor?.Nombre ||
                            'Sin proveedor'}
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
                      <Icon
                        icon="mdi:information-variant"
                        width={20}
                        height={20}
                        color={COLORS.primary}
                      />
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color={COLORS.textStrong}
                      >
                        Datos adicionales
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2,1fr)',
                        },
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
                            ? format(
                              new Date(articuloCompleto.FechaModif),
                              'dd/MM/yyyy',
                              { locale: es }
                            )
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
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color={COLORS.textStrong}
                    mb={0.5}
                  >
                    Observaciones del proveedor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {articuloCompleto?.proveedor?.Observaciones ||
                      'Sin observaciones'}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>

        {/* Línea divisoria footer */}
        <Divider
          sx={{
            height: DIV_H,
            border: 0,
            background: alpha('#000', 0.22),
            boxShadow: '0 -1px rgba(255,255,255,0.4)',
            flex: '0 0 auto',
          }}
        />

        {/* ====================== FOOTER METÁLICO SUAVE ====================== */}
        <Box sx={{ position: 'relative' }}>
          {/* Fondo metálico */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <TexturedPanel
              accent={COLORS.primary}
              radius={0}
              contentPadding={0}
              bgTintPercent={14}
              bgAlpha={0.98}
              textureScale={1.08}
              textureBaseOpacity={0.18}
              textureBoostOpacity={0.12}
              textureContrast={1.04}
              textureBrightness={1.10}
              tintOpacity={0.28}
              tintMode="soft-light"
              bevelWidth={8}
              bevelIntensity={0.6}
              glossStrength={0.55}
            />
          </Box>

          {/* Acciones */}
          <DialogActions
            sx={{
              p: 0,
              m: 0,
              minHeight: FOOTER_H,
              background: 'transparent !important',
              bgcolor: 'transparent !important',
              backgroundColor: 'transparent !important',
              display: 'flex',
              justifyContent: 'flex-end',
              px: 3,
              py: 2,
              gap: 1.5,
            }}
          >
            <CrystalSoftButton baseColor={COLORS.primary} onClick={handleClose}>
              Cerrar
            </CrystalSoftButton>

            <CrystalButton baseColor={COLORS.primary} disabled>
              Exportar ficha
            </CrystalButton>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ModalDetallesArticulo;
