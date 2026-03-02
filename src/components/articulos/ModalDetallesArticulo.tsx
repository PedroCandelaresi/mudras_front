'use client';
/* eslint-disable @next/next/no-img-element */

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

import { azul } from '@/ui/colores';
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
  const primary = base || azul.primary;
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.5),
    chipBorder: 'rgba(255,255,255,0.35)',
  };
};

/* ======================== Layout ======================== */
const VH_MAX = 78;
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
          borderRadius: 0,
          bgcolor: '#ffffff',
          boxShadow: 'none',
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
        {/* HEADER FLAT */}
        <DialogTitle sx={{ p: 2, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center', bgcolor: azul.primary, color: '#fff' }}>
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="h6" fontWeight={700}>
                {tituloHeader}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Tooltip title="Cerrar">
                <Box
                  component="button"
                  onClick={handleClose}
                  sx={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    p: 1
                  }}
                >
                  <Icon icon="mdi:close" width={24} height={24} />
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

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
                <Box
                  component="button"
                  onClick={() => refetch()}
                  sx={{
                    p: 1,
                    px: 2,
                    border: '1px solid #ddd',
                    bgcolor: '#fff',
                    cursor: 'pointer',
                    borderRadius: 0,
                    fontWeight: 600,
                    color: COLORS.primary
                  }}
                >
                  Reintentar
                </Box>
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
                    },
                    mb: 3,
                  }}
                >

                  {/* Código */}
                  <Card
                    sx={{
                      borderRadius: 0,
                      border: '1px solid #e0e0e0',
                      boxShadow: 'none',
                      background: '#f9f9f9',
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
                            bgcolor: alpha(azul.primary, 0.18),
                          }}
                        >
                          <Icon icon="mdi:barcode" width={14} height={14} color={azul.primary} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} color={darken(azul.primary, 0.5)}>
                          Código
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700} color={azul.primary}>
                        {articuloCompleto?.Codigo || '—'}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Stock */}
                  <Card
                    sx={{
                      borderRadius: 0,
                      border: '1px solid #e0e0e0',
                      boxShadow: 'none',
                      background: '#f9f9f9',
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
                            bgcolor: alpha(azul.primary, 0.16),
                          }}
                        >
                          <Icon icon="mdi:package-variant-closed" width={14} height={14} color={azul.primary} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} color={darken(azul.primary, 0.5)}>
                          {stockLabelText}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight={800} color={azul.primary}>
                          {stockActual}
                        </Typography>
                        <Chip size="small" label={stockChip.label} color={stockChip.color} />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Precio venta */}
                  <Card
                    sx={{
                      borderRadius: 0,
                      border: '1px solid #e0e0e0',
                      boxShadow: 'none',
                      background: '#f9f9f9',
                    }}
                  >
                    <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{
                          width: 22, height: 22, borderRadius: '50%',
                          display: 'grid', placeItems: 'center',
                          bgcolor: alpha(azul.primary, 0.16)
                        }}>
                          <Icon icon="mdi:cash" width={14} height={14} color={azul.primary} />
                        </Box>

                        <Typography variant="subtitle2" fontWeight={700} color={darken(azul.primary, 0.5)}>
                          Precio venta
                        </Typography>
                      </Box>

                      <Typography variant="subtitle1" fontWeight={800} color={azul.primary}>
                        {currency(precioCalculado)}
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
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    alignItems: 'start',
                  }}
                >
                  {/* Imagen del producto */}
                  <Box
                    sx={{
                      borderRadius: 0,
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: '#fff',
                      p: 2,
                      minHeight: 380,
                      position: 'relative'
                    }}
                  >
                    {articuloCompleto?.ImagenUrl ? (
                      <img
                        src={
                          articuloCompleto.ImagenUrl.startsWith('http') || articuloCompleto.ImagenUrl.startsWith('data:')
                            ? articuloCompleto.ImagenUrl
                            : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${articuloCompleto.ImagenUrl.startsWith('/') ? '' : '/'}${articuloCompleto.ImagenUrl}`
                        }
                        alt={articuloCompleto.Descripcion}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Icon icon="mdi:image-off-outline" width={120} height={120} color="#ccc" />
                    )}
                  </Box>

                  {/* Información general */}
                  <Box>
                    <Typography variant="h6" fontWeight={700} color={darken(azul.primary, 0.5)} mb={2}>
                      Información general
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)' },
                      }}
                    >

                      <Box>
                        <Typography variant="caption" color="text.secondary">Descripción</Typography>
                        <Typography variant="body1" fontWeight={600} color={darken(azul.primary, 0.5)}>
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
                        <Typography variant="caption" color="text.secondary">Autor</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {articuloCompleto?.Autor || '—'}
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

                      <Box>
                        <Typography variant="caption" color="text.secondary">Stock mínimo</Typography>
                        <Typography variant="body1" fontWeight={600}>{stockMinimo}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">Estantería</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {articuloCompleto?.Estanteria || '—'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">Estante</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {articuloCompleto?.Estante || '—'}
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

              </>
            )}

          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, bgcolor: '#ffffff' }}>
          <Box
            component="button"
            onClick={handleClose}
            sx={{
              border: '1px solid #ccc',
              bgcolor: 'transparent',
              px: 3, py: 1,
              cursor: 'pointer',
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.875rem',
              borderRadius: 0,
              transition: 'background 0.2s',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            Cerrar
          </Box>
        </DialogActions>

      </Box>
    </Dialog >
  );
};

export default ModalDetallesArticulo;
