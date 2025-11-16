'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Alert, Snackbar, Stack, Autocomplete, TextField, Chip,
} from '@mui/material';
import { alpha, lighten, darken } from '@mui/material/styles';

import PageContainer from '@/components/container/PageContainer';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalSoftButton, forceWhiteIconsSX } from '@/components/ui/CrystalButton';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { naranjaCaja } from '@/ui/colores';

import { BusquedaArticulos } from '@/components/ventas/caja-registradora/BusquedaArticulos';
import {
  TablaArticulosCapturados,
  type ArticuloCapturado,
} from '@/components/ventas/caja-registradora/TablaArticulosCapturados';
import { ModalConfirmacionVenta } from '@/components/ventas/caja-registradora/ModalConfirmacionVenta';
import { IconCheck } from '@tabler/icons-react';

import { type ArticuloCaja } from '@/components/ventas/caja-registradora/graphql/queries';
import {
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerPuntosMudrasResponse,
  type PuntoMudras,
  type TipoPuntoMudras,
} from '@/components/puntos-mudras/graphql/queries';
import { useQuery } from '@apollo/client/react';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';

/* ======================== Tipos / helpers ======================== */
interface PuntoOption {
  puestoVentaId: number;
  nombre: string;
  puntoMudrasId: number;
  etiquetaDescripcion?: string;
  tipo: TipoPuntoMudras | string;
  requiereCliente?: boolean;
  puestoFallback: boolean;
}

const extraerPuntoMudrasId = (configuracion?: string | null): number | undefined => {
  if (!configuracion) return undefined;
  try {
    const parsed = typeof configuracion === 'string' ? JSON.parse(configuracion) : configuracion;
    const rawId =
      parsed?.puntoMudrasId ?? parsed?.puntoId ?? parsed?.puntoMudras?.id ?? parsed?.puntoMudrasID;
    const id = Number(rawId);
    return Number.isFinite(id) ? id : undefined;
  } catch {
    return undefined;
  }
};

/* ======================== Wrapper metálico (idéntico a Proveedores/Artículos) ======================== */
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

/* ======================== Inner frame (madera + bisel interno) ======================== */
const woodAccent = naranjaCaja.borderInner ?? '#8a4b20';
const woodTintInterior = naranjaCaja.chipBg;            // base madera (chapa clara)
const veloInterior = alpha(naranjaCaja.toolbarBg, 0.82);

// bisel interno (suave) como en tablas
const innerBevelCfg = crearConfiguracionBisel(woodAccent, 1.4);
const innerBevelSX = crearEstilosBisel(innerBevelCfg, { zContenido: 2 });

const InnerWoodFrame: React.FC<React.PropsWithChildren<{ p?: number | string }>> = ({ children, p = 2 }) => (
  <Box
    sx={{
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      border: '1px solid',
      borderColor: alpha(woodAccent, 0.38),
      bgcolor: 'transparent',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      ...innerBevelSX,
    }}
  >
    <WoodBackdrop accent={woodTintInterior} radius={0} inset={0} strength={0.12} texture="tabla" />
    <Box sx={{ position: 'absolute', inset: 0, backgroundColor: veloInterior, zIndex: 0 }} />
    <Box sx={{ position: 'relative', zIndex: 2, p }}>{children}</Box>
  </Box>
);
// --- arriba de tu componente (o junto a otros helpers) ---
const woodInputBg = (alphaBase = 0.7) => `
  linear-gradient(${alpha('#fffaf3', alphaBase)}, ${alpha('#fffaf3', alphaBase)}),
  repeating-linear-gradient(
    0deg,
    ${alpha(naranjaCaja.chipBg, 0.52)} 0px,
    ${alpha(naranjaCaja.chipBg, 0.52)} 8px,
    ${alpha(naranjaCaja.borderInner, 0.08)} 8px,
    ${alpha(naranjaCaja.borderInner, 0.08)} 16px
  )
`;

const activeFieldStyles = {
  backgroundImage: woodInputBg(0.75),
  borderColor: alpha(naranjaCaja.borderInner, 0.45),
  boxShadow: `inset 0 1px 0 rgba(255,255,255,.65)`,
};
/* ======================== Página ======================== */

export default function CajaRegistradoraPage() {
  const [articulos, setArticulos] = useState<ArticuloCapturado[]>([]);
  const [modalVentaAbierto, setModalVentaAbierto] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoOption | null>(null);

  const { data: puntosMudrasData, loading: cargandoPuntos, error: errorPuntos } =
    useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);
  // Ya no se consultan puestos_venta; se trabaja sólo con puntos_mudras

  const mostrarMensaje = useCallback((texto: string, tipo: 'success' | 'error' | 'info' = 'info') => {
    setMensaje({ texto, tipo });
  }, []);

  const puntosDisponibles = useMemo<PuntoOption[]>(() => {
    const puntosMudras = (puntosMudrasData?.obtenerPuntosMudras ?? []) as PuntoMudras[];
    const normalizar = (v?: string | null) => v?.trim().toLowerCase() ?? '';

    return puntosMudras
      .filter((p) => p.activo && (String(p.tipo).toLowerCase() === 'venta'))
      .map((p) => ({
        puestoVentaId: p.id,
        nombre: p.nombre,
        puntoMudrasId: p.id,
        etiquetaDescripcion: p.descripcion ? `${p.nombre} · ${p.descripcion}` : p.nombre,
        tipo: p.tipo,
        requiereCliente: false,
        puestoFallback: false,
      } as PuntoOption));
  }, [puntosMudrasData]);

  useEffect(() => {
    if (puntosDisponibles.length && !puntoSeleccionado) {
      setPuntoSeleccionado(puntosDisponibles[0]);
    }
  }, [puntosDisponibles, puntoSeleccionado]);

  useEffect(() => {
    if (!puntoSeleccionado?.puntoMudrasId) return;
    setArticulos((prev) => {
      const filtrados = prev.filter((a) => a.puntoOrigenId === puntoSeleccionado.puntoMudrasId);
      if (filtrados.length !== prev.length) {
        mostrarMensaje('Se quitaron artículos que no pertenecían al punto seleccionado.', 'info');
      }
      return filtrados;
    });
  }, [puntoSeleccionado?.puntoMudrasId, mostrarMensaje]);

  const articulosEnCarrito = useMemo(
    () => articulos.reduce((acc, a) => ((acc[a.id] = a.cantidad), acc), {} as Record<number, number>),
    [articulos]
  );
  const totalCarrito = useMemo(() => articulos.reduce((t, a) => t + a.subtotal, 0), [articulos]);
  const articulosSeleccionados = useMemo(() => articulos.filter((a) => a.seleccionado), [articulos]);
  const totalSeleccionados = articulosSeleccionados.length;
  const subtotalSeleccionados = articulosSeleccionados.reduce((t, a) => t + a.subtotal, 0);

  const handleAgregarArticulo = useCallback(
    (articulo: ArticuloCaja, cantidad: number) => {
      if (!puntoSeleccionado?.puntoMudrasId) {
        mostrarMensaje('Selecciona un punto de venta antes de agregar artículos', 'error');
        return;
      }

      const precioCalculado = calcularPrecioDesdeArticulo(articulo);
      const precioFinal = precioCalculado && precioCalculado > 0
        ? precioCalculado
        : Number(articulo.PrecioVenta ?? 0);

      setArticulos((prev) => {
        const existente = prev.find((a) => a.id === articulo.id);
        if (existente) {
          return prev.map((a) =>
            a.id === articulo.id
              ? {
                  ...a,
                  PrecioVenta: precioFinal,
                  cantidad: a.cantidad + cantidad,
                  subtotal: (a.cantidad + cantidad) * precioFinal,
                  puntoOrigenId: puntoSeleccionado.puntoMudrasId,
                }
              : a
          );
        }
        return [
          ...prev,
          {
            ...articulo,
            PrecioVenta: precioFinal,
            Unidad: articulo.Unidad ?? 'UN',
            Rubro: articulo.rubro?.Rubro || articulo.Rubro || 'Sin rubro',
            rubro: {
              id: articulo.rubro?.Id ?? 0,
              Descripcion: articulo.rubro?.Rubro || articulo.Rubro || 'Sin rubro',
              Id: articulo.rubro?.Id,
              Rubro: articulo.rubro?.Rubro || articulo.Rubro || 'Sin rubro',
              PorcentajeRecargo: articulo.rubro?.PorcentajeRecargo ?? null,
              PorcentajeDescuento: articulo.rubro?.PorcentajeDescuento ?? null,
            },
            proveedor: {
              IdProveedor: articulo.proveedor?.IdProveedor ?? 0,
              Nombre: articulo.proveedor?.Nombre ?? 'Sin proveedor',
              PorcentajeRecargoProveedor: articulo.proveedor?.PorcentajeRecargoProveedor ?? null,
              PorcentajeDescuentoProveedor: articulo.proveedor?.PorcentajeDescuentoProveedor ?? null,
            },
            cantidad,
            subtotal: cantidad * precioFinal,
            seleccionado: true,
            puntoOrigenId: puntoSeleccionado.puntoMudrasId,
          },
        ];
      });
      mostrarMensaje(`${articulo.Descripcion} agregado al carrito (${cantidad} unidades)`, 'success');
    },
    [mostrarMensaje, puntoSeleccionado]
  );

  const handleActualizarCantidad = useCallback((id: number, n: number) => {
    setArticulos((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, cantidad: n, subtotal: n * a.PrecioVenta } : a
      )
    );
  }, []);

  const handleEliminarArticulo = useCallback(
    (id: number) => {
      setArticulos((prev) => prev.filter((a) => a.id !== id));
      mostrarMensaje('Artículo eliminado del carrito', 'info');
    },
    [mostrarMensaje]
  );

  const handleToggleSeleccion = useCallback((id: number) => {
    setArticulos((prev) => prev.map((a) => (a.id === id ? { ...a, seleccionado: !a.seleccionado } : a)));
  }, []);

  const handleToggleSeleccionTodos = useCallback(() => {
    const todosSel = articulos.every((a) => a.seleccionado);
    setArticulos((prev) => prev.map((a) => ({ ...a, seleccionado: !todosSel })));
  }, [articulos]);

  const handleNuevaVenta = useCallback(() => {
    if (!puntoSeleccionado?.puntoMudrasId) {
      mostrarMensaje('Selecciona un punto de venta para procesar la venta', 'error');
      return;
    }
    if (articulosSeleccionados.length === 0) {
      mostrarMensaje('Selecciona al menos un artículo para continuar', 'error');
      return;
    }
    const puntoActual = puntoSeleccionado.puntoMudrasId;
    const articulosInvalidos = articulosSeleccionados.filter(
      (a) => a.puntoOrigenId !== puntoActual
    );
    if (articulosInvalidos.length > 0) {
      mostrarMensaje('Hay artículos que no pertenecen al punto seleccionado. Eliminalos antes de procesar la venta.', 'error');
      return;
    }
    setModalVentaAbierto(true);
  }, [articulosSeleccionados, mostrarMensaje, puntoSeleccionado]);

  const handleVentaCreada = useCallback(
    (venta: any) => {
      mostrarMensaje(`Venta ${venta.numeroVenta} creada exitosamente`, 'success');
      setArticulos((prev) => prev.filter((a) => !a.seleccionado));
    },
    [mostrarMensaje]
  );
  const [abierto, setAbierto] = useState(false);
  const handleCerrarMensaje = () => setMensaje(null);

  const colorCaja = naranjaCaja.primary;
  const sinPuntos = !cargandoPuntos && !errorPuntos && puntosDisponibles.length === 0;

  return (
    <PageContainer title="Caja - Mudras" description="Caja Registradora">
      <Box sx={createBevelWrapper(naranjaCaja.primary)}>
        <TexturedPanel
          accent={naranjaCaja.primary}
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
              {tabValue === 0 ? (
                <CrystalButton
                  baseColor={naranjaCaja.primary}
                  onClick={() => setTabValue(0)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Caja Registradora
                </CrystalButton>
              ) : (
                <CrystalSoftButton
                  baseColor={naranjaCaja.primary}
                  onClick={() => setTabValue(0)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  Caja Registradora
                </CrystalSoftButton>
              )}
            </Box>
          </Box>

          {/* Contenido con MADERA + BISEL INTERNO */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
            <InnerWoodFrame p={3}>
              {/* bloque superior (búsqueda + columna derecha) */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
                {/* Izquierda: Búsqueda de artículos (ancha) */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {puntoSeleccionado?.puntoMudrasId ? (
                    <BusquedaArticulos
                      puntoMudrasId={puntoSeleccionado.puntoMudrasId}
                      onAgregarArticulo={handleAgregarArticulo}
                      articulosEnCarrito={articulosEnCarrito}
                    />
                  ) : (
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        bgcolor: alpha('#ffffff', 0.5),
                        p: 4,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Selecciona un punto de venta para comenzar a buscar artículos
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Derecha: columna con selector arriba y botón abajo */}
                <Stack
                  spacing={2}
                  sx={{
                    width: { xs: '100%', md: 320 },                // ancho fijo en desktop
                    alignSelf: { xs: 'stretch', md: 'flex-start' } // alineado arriba al costado
                  }}
                >
                  {/* Selector de punto (informativo hasta hover/focus/open) */}
                  <Autocomplete<PuntoOption>
                    value={puntoSeleccionado}
                    onOpen={() => setAbierto(true)}
                    onClose={() => setAbierto(false)}
                    onChange={(_, value) => setPuntoSeleccionado(value)}
                    options={puntosDisponibles}
                    isOptionEqualToValue={(o, v) => o.puntoMudrasId === v.puntoMudrasId}
                    getOptionLabel={(o) => o.etiquetaDescripcion || o.nombre}
                    loading={Boolean(cargandoPuntos)}
                    loadingText="Cargando puntos de venta..."
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Punto de venta"
                        placeholder="Selecciona el punto de venta"
                        size="medium"
                        helperText={
                          errorPuntos
                            ? `Error: ${errorPuntos.message}`
                            : sinPuntos
                              ? 'No se encontraron puntos de venta activos.'
                              : undefined
                        }
                      />
                    )}
                    disabled={sinPuntos}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'background .2s ease, box-shadow .2s ease, border-color .2s ease',
                        backgroundColor: 'transparent',                // estado “informativo”
                        backgroundImage: 'none',
                        '& fieldset': { borderColor: alpha(naranjaCaja.borderInner, 0.2) },

                        // hover: aplica "textura" (velo + halo)
                        '&:hover': {
                          ...activeFieldStyles,
                          '& fieldset': { borderColor: alpha(naranjaCaja.borderInner, 0.45) },
                        },

                        // focus: igual que hover + borde primario
                        '&.Mui-focused': {
                          ...activeFieldStyles,
                          '& fieldset': { borderColor: naranjaCaja.primary },
                        },

                        // si el popup está abierto, forzar estado activo
                        ...(abierto
                          ? {
                            ...activeFieldStyles,
                            '& fieldset': { borderColor: naranjaCaja.primary },
                          }
                          : null),
                      },

                      // Tipografía más “título” cuando no hay selección
                      '& .MuiOutlinedInput-input': {
                        color: puntoSeleccionado ? 'inherit' : alpha(naranjaCaja.textStrong, 0.92),
                        fontWeight: puntoSeleccionado ? 500 : 700,
                      },
                      '& .MuiInputLabel-root': {
                        color: alpha(naranjaCaja.textStrong, 0.9),
                        fontWeight: 700,
                      },
                      '& .MuiFormHelperText-root': {
                        color: alpha(naranjaCaja.textStrong, 0.8),
                      },
                    }}
                  />

                  {/* Botón procesar (full width) */}
                  <CrystalButton
                    baseColor={naranjaCaja.primary}
                    startIcon={<IconCheck size={18} />}
                    onClick={handleNuevaVenta}
                    disabled={totalSeleccionados === 0 || !puntoSeleccionado?.puntoMudrasId}
                    sx={{
                      ...forceWhiteIconsSX,
                      minHeight: 46,
                      borderRadius: 1,
                      px: 3,
                      width: '100%',
                    }}
                  >
                    Procesar venta
                  </CrystalButton>
                </Stack>
              </Stack>

              {/* separador sutil + espacio antes de la tabla */}
              <Stack spacing={2.5} sx={{ mt: 2 }}>
                <Box sx={{ height: 1, bgcolor: alpha(naranjaCaja.borderInner, 0.18), mx: 0.5 }} />

                {/* Tabla carrito */}
                <TablaArticulosCapturados
                  articulos={articulos}
                  onActualizarCantidad={handleActualizarCantidad}
                  onEliminarArticulo={handleEliminarArticulo}
                  onToggleSeleccion={handleToggleSeleccion}
                  onToggleSeleccionTodos={handleToggleSeleccionTodos}
                  onNuevaVenta={handleNuevaVenta}
                />
              </Stack>
            </InnerWoodFrame>
            </Box>
          </Box>
        </TexturedPanel>

      </Box>

      {/* ====== Modal ====== */}
      <ModalConfirmacionVenta
        open={modalVentaAbierto}
        onClose={() => setModalVentaAbierto(false)}
        articulos={articulosSeleccionados.map((a) => ({
          id: a.id,
          Codigo: a.Codigo,
          Descripcion: a.Descripcion,
          cantidad: a.cantidad,
          precioUnitario: a.PrecioVenta,
          subtotal: a.subtotal,
        }))}
        presetPuestoVentaId={puntoSeleccionado?.puestoVentaId}
        presetPuntoMudrasId={puntoSeleccionado?.puntoMudrasId}
        descripcionPuntoSeleccionado={puntoSeleccionado?.etiquetaDescripcion || undefined}
        onVentaCreada={handleVentaCreada}  // ✅ agrega esto
      />


      {/* ====== Snackbar ====== */}
      <Snackbar
        open={!!mensaje}
        autoHideDuration={5000}
        onClose={handleCerrarMensaje}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {mensaje && (
          <Alert onClose={handleCerrarMensaje} severity={mensaje.tipo} sx={{ width: '100%' }}>
            {mensaje.texto}
          </Alert>
        )}
      </Snackbar>
    </PageContainer>
  );
}
