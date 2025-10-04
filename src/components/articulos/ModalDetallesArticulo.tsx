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
  Stack,
  Grid,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useCallback, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { IconRefresh } from '@tabler/icons-react';
import { useQuery } from '@apollo/client/react';

import { GET_ARTICULO } from '@/components/articulos/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde, marron } from '@/ui/colores';

interface ModalDetallesArticuloProps {
  open: boolean;
  onClose: () => void;
  articulo?: Pick<Articulo, 'id' | 'Descripcion' | 'Codigo'> | null;
  accentColor?: string;
}

const NBSP = '\u00A0';
const VH_MAX = 82;
const HEADER_H = 90;
const FOOTER_H = 88;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

const formatoMoneda = (valor?: number | null) =>
  typeof valor === 'number'
    ? valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    : '—';

const ModalDetallesArticulo = ({ open, onClose, articulo, accentColor }: ModalDetallesArticuloProps) => {
  const COLORS = useMemo(() => {
    const base = accentColor || verde.primary;
    return {
      primary: base,
      primaryHover: darken(base, 0.15),
      textStrong: darken(base, 0.35),
      chipBorder: 'rgba(255,255,255,0.35)',
    };
  }, [accentColor]);

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

  useEffect(() => {
    if (open && articuloId != null) {
      void refetch({ id: articuloId });
    }
  }, [open, articuloId, refetch]);

  const articuloCompleto: Articulo | null = useMemo(() => {
    if (data?.articulo) return data.articulo as Articulo;
    return articuloId != null && articulo ? ({
      id: articuloId,
      Descripcion: articulo.Descripcion,
      Codigo: articulo.Codigo,
    } as Partial<Articulo> as Articulo) : null;
  }, [data?.articulo, articuloId, articulo]);

  const cerrar = useCallback(() => {
    if (loading) return;
    onClose();
  }, [loading, onClose]);

  const chipsPrincipales = useMemo(() => (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        label={articuloCompleto?.Codigo ? `Código${NBSP}${articuloCompleto.Codigo}` : 'Sin código asignado'}
        size="small"
        sx={{
          bgcolor: 'rgba(0,0,0,0.32)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.3)',
          fontWeight: 600,
          px: 1.2,
          height: 28,
        }}
      />
      <Chip
        label={articuloCompleto?.Rubro || 'Sin rubro asociado'}
        size="small"
        sx={{
          bgcolor: 'rgba(0,0,0,0.28)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.25)',
          fontWeight: 600,
          px: 1.2,
          height: 28,
        }}
      />
      {articuloCompleto?.proveedor?.Nombre && (
        <Chip
          label={`Proveedor${NBSP}${articuloCompleto.proveedor.Nombre}`}
          size="small"
          sx={{
            bgcolor: 'rgba(0,0,0,0.28)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            fontWeight: 600,
            px: 1.2,
            height: 28,
          }}
        />
      )}
    </Stack>
  ), [articuloCompleto]);

  const stockActual = Number(articuloCompleto?.Deposito ?? 0);
  const stockMinimo = Number(articuloCompleto?.StockMinimo ?? 0);
  const stockChip = stockActual <= 0
    ? { label: 'Sin stock', color: 'error' as const }
    : stockActual <= stockMinimo
      ? { label: 'Stock bajo', color: 'warning' as const }
      : { label: 'Disponible', color: 'success' as const };

  const detallePrincipal = (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Box display="flex" flexDirection="column" gap={1.25}>
          <Typography variant="h6" fontWeight={700} color={COLORS.textStrong}>
            Información general
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revisa la ficha completa del artículo, incluyendo categorización, costos y estado de inventario.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
              mt: 1,
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
              <Typography variant="caption" color="text.secondary">Proveedor asociado</Typography>
              <Typography variant="body1" fontWeight={600}>
                {articuloCompleto?.proveedor?.Nombre || 'Sin proveedor'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={5}>
        <Box
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(COLORS.primary, 0.28)}`,
            background: alpha('#fff', 0.88),
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
            p: 2.2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon icon="mdi:cash-register" width={20} height={20} color={COLORS.primary} />
            <Typography variant="subtitle1" fontWeight={700} color={COLORS.textStrong}>
              Información de precios
            </Typography>
          </Stack>
          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">Precio de venta</Typography>
              <Typography variant="body1" fontWeight={700} color={COLORS.textStrong}>
                {formatoMoneda(articuloCompleto?.PrecioVenta)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Precio de compra</Typography>
              <Typography variant="body1" fontWeight={700} color={COLORS.textStrong}>
                {formatoMoneda(articuloCompleto?.PrecioCompra)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Stock actual</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body1" fontWeight={700}>
                  {stockActual}
                </Typography>
                <Chip label={stockChip.label} size="small" color={stockChip.color} />
              </Stack>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Stock mínimo</Typography>
              <Typography variant="body1" fontWeight={600}>{stockMinimo}</Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );

  const detalleSecundario = (
    <Box
      sx={{
        mt: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(COLORS.primary, 0.26)}`,
        background: alpha('#fff', 0.9),
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
        p: 2.2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.75,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Icon icon="mdi:information-variant" width={20} height={20} color={COLORS.primary} />
        <Typography variant="subtitle1" fontWeight={700} color={COLORS.textStrong}>
          Datos adicionales
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">Alícuota IVA</Typography>
          <Typography variant="body1" fontWeight={600}>
            {articuloCompleto?.AlicuotaIva != null ? `${articuloCompleto.AlicuotaIva}%` : 'No especificado'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">Costo promedio</Typography>
          <Typography variant="body1" fontWeight={600}>
            {formatoMoneda(articuloCompleto?.CostoPromedio)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">Actualizado</Typography>
          <Typography variant="body1" fontWeight={600}>
            {articuloCompleto?.FechaModif ? format(new Date(articuloCompleto.FechaModif), 'dd/MM/yyyy', { locale: es }) : '—'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">Observaciones del proveedor</Typography>
          <Typography variant="body1" color="text.secondary">
            {articuloCompleto?.proveedor?.Observaciones || 'Sin observaciones'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  if (!articuloCompleto && !loading && !error) return null;

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 36px rgba(0,0,0,0.18)',
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
        bgAlpha={1}
        textureBaseOpacity={0.2}
        textureBoostOpacity={0.16}
        textureBrightness={1.12}
        textureContrast={1.04}
        tintOpacity={0.4}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
          <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', px: 3, py: 2.25, gap: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 6px 18px rgba(0,0,0,0.22)',
                  color: '#fff',
                }}
              >
                <Icon icon="mdi:cube-outline" width={20} height={20} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                <Typography variant="h6" fontWeight={700} color="#fff" sx={{ textShadow: '0 2px 6px rgba(0,0,0,0.45)' }}>
                  Detalle del artículo
                </Typography>
                <Typography variant="subtitle2" color="rgba(255,255,255,0.86)" sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
                  {articuloCompleto?.Descripcion || 'Descripción no disponible'}
                </Typography>
              </Box>

              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {chipsPrincipales}
                <CrystalIconButton
                  baseColor={COLORS.primary}
                  onClick={cerrar}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    '&:hover': { background: 'rgba(0,0,0,0.45)' },
                  }}
                >
                  <Icon icon="mdi:close" width={20} height={20} />
                </CrystalIconButton>
              </Box>
            </Box>
          </DialogTitle>

          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.7)),
                linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
                linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
              `,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto',
            }}
          />

          <DialogContent
            sx={{
              p: 0,
              borderRadius: 0,
              overflow: 'auto',
              maxHeight: CONTENT_MAX,
              flex: '0 1 auto',
            }}
          >
            <Box sx={{ position: 'relative', borderRadius: 0, overflow: 'hidden' }}>
              <WoodBackdrop accent={COLORS.primary} radius={0} inset={0} strength={0.55} texture="wide" />
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: 3,
                  borderRadius: 0,
                  backdropFilter: 'saturate(118%) blur(0.4px)',
                  background: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {loading ? (
                  <Skeleton variant="rounded" height={260} />
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
                    {detallePrincipal}
                    {detalleSecundario}
                  </>
                )}
              </Box>
            </Box>
          </DialogContent>

          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: `
                linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
                linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.7)),
                linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
              `,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto',
            }}
          />

          <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 3, py: 2.5, gap: 1.5 }}>
              <CrystalSoftButton baseColor={COLORS.primary} onClick={cerrar}>
                Cerrar
              </CrystalSoftButton>
              <CrystalButton baseColor={COLORS.primary} onClick={() => {}} disabled>
                Exportar ficha
              </CrystalButton>
            </Box>
          </DialogActions>
        </Box>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalDetallesArticulo;
