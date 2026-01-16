'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Alert, Snackbar, Stack, Autocomplete, TextField, Button, Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import PageContainer from '@/components/container/PageContainer';
import { naranjaCaja } from '@/ui/colores';

import { BusquedaArticulos } from '@/components/ventas/caja-registradora/BusquedaArticulos';
import {
  TablaArticulosCapturados,
  type ArticuloCapturado,
} from '@/components/ventas/caja-registradora/TablaArticulosCapturados';
import { ModalConfirmacionVenta } from '@/components/ventas/caja-registradora/ModalConfirmacionVenta';
import { IconCheck } from '@tabler/icons-react';
import { Icon } from '@iconify/react';

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

export default function CajaRegistradoraPage() {
  const [articulos, setArticulos] = useState<ArticuloCapturado[]>([]);
  const [modalVentaAbierto, setModalVentaAbierto] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoOption | null>(null);

  const { data: puntosMudrasData, loading: cargandoPuntos, error: errorPuntos } =
    useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);

  const mostrarMensaje = useCallback((texto: string, tipo: 'success' | 'error' | 'info' = 'info') => {
    setMensaje({ texto, tipo });
  }, []);

  const puntosDisponibles = useMemo<PuntoOption[]>(() => {
    const puntosMudras = (puntosMudrasData?.obtenerPuntosMudras ?? []) as PuntoMudras[];

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
  const articulosSeleccionados = useMemo(() => articulos.filter((a) => a.seleccionado), [articulos]);
  const totalSeleccionados = articulosSeleccionados.length;

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

  const handleCerrarMensaje = () => setMensaje(null);
  const sinPuntos = !cargandoPuntos && !errorPuntos && puntosDisponibles.length === 0;

  return (
    <PageContainer title="Caja - Mudras" description="Caja Registradora">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Icon icon="mdi:cash-register" width={32} height={32} color={naranjaCaja.primary} />
        <Typography variant="h4" fontWeight={600} color={naranjaCaja.primary}>
          Caja Registradora
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, p: 3, bgcolor: '#f5f5f5' }}>
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
                  borderRadius: 0,
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
              width: { xs: '100%', md: 320 },
              alignSelf: { xs: 'stretch', md: 'flex-start' }
            }}
          >
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 0 }}>
              <Autocomplete<PuntoOption>
                value={puntoSeleccionado}
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
              />

              <Button
                variant="contained"
                fullWidth
                startIcon={<IconCheck size={18} />}
                onClick={handleNuevaVenta}
                disabled={totalSeleccionados === 0 || !puntoSeleccionado?.puntoMudrasId}
                sx={{
                  mt: 2,
                  bgcolor: naranjaCaja.primary,
                  '&:hover': { bgcolor: naranjaCaja.primary }, // Simplificado
                  borderRadius: 0,
                  py: 1.5,
                  fontWeight: 700
                }}
              >
                Procesar venta
              </Button>
            </Paper>
          </Stack>
        </Stack>

        {/* Separador y Tabla */}
        <Box sx={{ mt: 3, p: 3, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
          <TablaArticulosCapturados
            articulos={articulos}
            onActualizarCantidad={handleActualizarCantidad}
            onEliminarArticulo={handleEliminarArticulo}
            onToggleSeleccion={handleToggleSeleccion}
            onToggleSeleccionTodos={handleToggleSeleccionTodos}
            onNuevaVenta={handleNuevaVenta}
          />
        </Box>
      </Paper>

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
        onVentaCreada={handleVentaCreada}
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
