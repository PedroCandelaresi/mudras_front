"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert, LinearProgress } from '@mui/material';
import { IconShoppingBag } from '@tabler/icons-react';
import { useQuery } from '@apollo/client/react';

import PageContainer from '@/components/container/PageContainer';
import StylizedTabbedPanel, { type StylizedTabDefinition } from '@/components/ui/StylizedTabbedPanel';
import TablaStockPuntoVenta from '@/components/puntos-venta/TablaStockPuntoVenta';
import ModalModificarStockPunto from '@/components/stock/ModalModificarStockPunto';
import ModalNuevaAsignacionStock from '@/components/stock/ModalNuevaAsignacionStock';
import ModalDetallesArticulo from '@/components/articulos/ModalDetallesArticulo';
import type { Articulo } from '@/app/interfaces/mudras.types';
import {
  OBTENER_PUNTOS_MUDRAS,
  OBTENER_STOCK_PUNTO_MUDRAS,
  type PuntoMudras,
  type ObtenerPuntosMudrasResponse,
  type ArticuloConStockPuntoMudras,
} from '@/components/puntos-mudras/graphql/queries';

// Verde primaveral para los tabs de puntos de venta
const tabPalette = ['#66BB6A', '#5CAF63', '#57B15D', '#6ECB73', '#63C26B', '#5AB962'];

type ObtenerStockPuntoMudrasResponse = {
  obtenerStockPuntoMudras: ArticuloConStockPuntoMudras[];
};

export default function PuntosVentaPage() {
  const [activeKey, setActiveKey] = useState<string>('');
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [modalAsignacionOpen, setModalAsignacionOpen] = useState(false);
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloConStockPuntoMudras | null>(null);
  const [articuloDetalles, setArticuloDetalles] = useState<Pick<Articulo, 'id' | 'Descripcion' | 'Codigo'> | null>(null);
  const [detallesStockContext, setDetallesStockContext] = useState<{ value?: number; label?: string } | null>(null);

  const {
    data: puntosData,
    loading: loadingPuntos,
    error: errorPuntos,
  } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS, {
    fetchPolicy: 'cache-and-network',
  });

  const puntosVenta = useMemo<PuntoMudras[]>(
    () => (puntosData?.obtenerPuntosMudras ?? []).filter((p) => p.tipo === 'venta'),
    [puntosData]
  );

  useEffect(() => {
    if (!puntosVenta.length) {
      setActiveKey('');
      return;
    }
    if (!activeKey || !puntosVenta.some((p) => String(p.id) === activeKey)) {
      setActiveKey(String(puntosVenta[0].id));
    }
  }, [puntosVenta, activeKey]);

  const puntoSeleccionado = useMemo(
    () => puntosVenta.find((p) => String(p.id) === activeKey) ?? null,
    [puntosVenta, activeKey]
  );

  const puntoSeleccionadoId = puntoSeleccionado?.id ?? null;

  const {
    data: stockData,
    loading: loadingStock,
    error: errorStock,
    refetch: refetchStock,
  } = useQuery<ObtenerStockPuntoMudrasResponse>(OBTENER_STOCK_PUNTO_MUDRAS, {
    skip: !puntoSeleccionadoId,
    variables: { puntoMudrasId: puntoSeleccionadoId ?? 0 },
    fetchPolicy: 'cache-and-network',
  });

  const handleAbrirModalStock = useCallback(
    (articulo: ArticuloConStockPuntoMudras) => {
      setArticuloSeleccionado(articulo);
      setModalStockOpen(true);
    },
    []
  );

  const handleCerrarModalStock = useCallback(() => {
    setModalStockOpen(false);
    setArticuloSeleccionado(null);
  }, []);

  const handleStockActualizado = useCallback(async () => {
    handleCerrarModalStock();
    if (puntoSeleccionadoId) {
      await refetchStock({ puntoMudrasId: puntoSeleccionadoId });
    }
  }, [handleCerrarModalStock, puntoSeleccionadoId, refetchStock]);

  const handleNuevaAsignacion = useCallback(() => {
    if (!puntoSeleccionado) return;
    setModalAsignacionOpen(true);
  }, [puntoSeleccionado]);

  const handleCerrarAsignacion = useCallback(() => {
    setModalAsignacionOpen(false);
  }, []);

  const handleAsignacionCompletada = useCallback(async () => {
    setModalAsignacionOpen(false);
    if (puntoSeleccionadoId) {
      await refetchStock({ puntoMudrasId: puntoSeleccionadoId });
    }
  }, [puntoSeleccionadoId, refetchStock]);

  const handleVerDetalles = useCallback((articulo: ArticuloConStockPuntoMudras) => {
    const articuloBase = articulo.articulo;
    const id = articuloBase?.id ?? articulo.id;
    setArticuloDetalles({
      id,
      Descripcion: articuloBase?.Descripcion ?? articulo.nombre,
      Codigo: articuloBase?.Codigo ?? articulo.codigo,
    });
    setDetallesStockContext({
      value: Number(articulo.stockAsignado ?? 0),
      label: puntoSeleccionado ? `Stock en ${puntoSeleccionado.nombre}` : 'Stock asignado',
    });
    setModalDetallesOpen(true);
  }, [puntoSeleccionado]);

  const handleCerrarDetalles = useCallback(() => {
    setModalDetallesOpen(false);
    setArticuloDetalles(null);
    setDetallesStockContext(null);
  }, []);

  const tabsMeta = useMemo<StylizedTabDefinition[]>(
    () =>
      puntosVenta.map((punto, idx) => ({
        key: String(punto.id),
        label: punto.nombre,
        icon: <IconShoppingBag size={18} />,
        color: tabPalette[idx % tabPalette.length],
      })),
    [puntosVenta]
  );

  const estaCargandoStock = loadingStock;
  const articulosDelPunto = puntoSeleccionado ? stockData?.obtenerStockPuntoMudras ?? [] : [];

  return (
    <PageContainer title="Puntos de Venta" description="Consulta rápida del stock en cada punto de venta">
      {loadingPuntos && <LinearProgress sx={{ mb: 2 }} />}

      {errorPuntos && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorPuntos.message || 'No se pudo cargar la lista de puntos de venta.'}
        </Alert>
      )}

      {!loadingPuntos && !errorPuntos && puntosVenta.length === 0 && (
        <Alert severity="info">
          No hay puntos de venta configurados. Podés crearlos desde «Puntos Mudras».
        </Alert>
      )}

      {puntosVenta.length > 0 && activeKey && (
        <StylizedTabbedPanel
          tabs={tabsMeta}
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
          }}
        >
          {!puntoSeleccionado ? (
            <Alert severity="info">Seleccioná un punto de venta para ver su stock.</Alert>
          ) : (
            <TablaStockPuntoVenta
              articulos={articulosDelPunto}
              loading={estaCargandoStock}
              error={errorStock}
              puntoNombre={puntoSeleccionado?.nombre}
              onEditStock={puntoSeleccionadoId ? handleAbrirModalStock : undefined}
              onViewDetails={handleVerDetalles}
              onNewAssignment={puntoSeleccionado ? handleNuevaAsignacion : undefined}
            />
          )}
        </StylizedTabbedPanel>
      )}

      {modalStockOpen && articuloSeleccionado && puntoSeleccionadoId && (
        <ModalModificarStockPunto
          open={modalStockOpen}
          onClose={handleCerrarModalStock}
          articulo={{ ...articuloSeleccionado, puntoVentaId: puntoSeleccionadoId }}
          onStockActualizado={handleStockActualizado}
        />
      )}

      {puntoSeleccionado && (
        <ModalNuevaAsignacionStock
          open={modalAsignacionOpen}
          onClose={handleCerrarAsignacion}
          destinoId={puntoSeleccionado.id}
          origen="venta"
          tipoDestinoPreferido="venta"
          onStockAsignado={handleAsignacionCompletada}
        />
      )}

      <ModalDetallesArticulo
        open={modalDetallesOpen}
        onClose={handleCerrarDetalles}
        articulo={articuloDetalles}
        stockContext={detallesStockContext ?? undefined}
      />
    </PageContainer>
  );
}
