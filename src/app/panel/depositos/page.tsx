'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert, Box, LinearProgress, Typography, Paper } from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { Icon } from '@iconify/react';
import { grisRojizo, azulMarino } from '@/ui/colores';

import PageContainer from '@/components/container/PageContainer';
import TablaStockPuntoVenta from '@/components/puntos-venta/TablaStockPuntoVenta';
import ModalModificarStockPunto from '@/components/stock/ModalModificarStockPunto';
import ModalNuevaAsignacionStock from '@/components/stock/ModalNuevaAsignacionStock';
import ModalDetallesArticulo from '@/components/articulos/ModalDetallesArticulo';
import type { Articulo } from '@/app/interfaces/mudras.types';
import type { PuntoMudras } from '@/interfaces/puntos-mudras';
import StylizedTabbedPanel from '@/components/ui/StylizedTabbedPanel';
import {
  OBTENER_PUNTOS_MUDRAS,
  OBTENER_STOCK_PUNTO_MUDRAS,
  type ObtenerPuntosMudrasResponse,
  type ArticuloConStockPuntoMudras,
} from '@/components/puntos-mudras/graphql/queries';

export default function DepositosPage() {
  const [activeKey, setActiveKey] = useState<string>('empty');
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [modalAsignacionOpen, setModalAsignacionOpen] = useState(false);
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloConStockPuntoMudras | null>(null);
  const [articuloDetalles, setArticuloDetalles] = useState<Pick<Articulo, 'id' | 'Descripcion' | 'Codigo'> | null>(null);
  const [stockContext, setStockContext] = useState<{ value?: number; label?: string } | null>(null);

  const {
    data: depositosData,
    loading: loadingDepositos,
    error: errorDepositos,
    refetch: refetchDepositos,
  } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const handler = () => {
      void refetchDepositos();
    };
    window.addEventListener('puntosVentaActualizados', handler);
    return () => window.removeEventListener('puntosVentaActualizados', handler);
  }, [refetchDepositos]);

  const depositos = useMemo<PuntoMudras[]>(
    () => (depositosData?.obtenerPuntosMudras ?? [])
      .filter((p) => p.tipo === 'deposito')
      .sort((a, b) => Number(a.id) - Number(b.id)), // Ordenados por ID ASC (más viejos primero)
    [depositosData]
  );

  // Auto-select first deposit or keep selected
  useEffect(() => {
    if (!depositos.length) {
      setActiveKey('empty');
      return;
    }
    if (!activeKey || activeKey === 'empty' || !depositos.some((p) => String(p.id) === activeKey)) {
      setActiveKey(String(depositos[0].id));
    }
  }, [depositos, activeKey]);

  const depositoSeleccionado = useMemo(
    () => depositos.find((p) => String(p.id) === activeKey) ?? null,
    [depositos, activeKey]
  );
  const depositoSeleccionadoId = depositoSeleccionado?.id ?? null;

  const {
    data: stockData,
    loading: loadingStock,
    error: errorStock,
    refetch: refetchStock,
  } = useQuery<{ obtenerStockPuntoMudras: ArticuloConStockPuntoMudras[] }>(OBTENER_STOCK_PUNTO_MUDRAS, {
    skip: !depositoSeleccionadoId,
    variables: { puntoMudrasId: depositoSeleccionadoId ?? 0 },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const stockHandler = () => {
      if (depositoSeleccionadoId) {
        void refetchStock();
      }
    };
    window.addEventListener('stockGlobalActualizado', stockHandler);
    return () => window.removeEventListener('stockGlobalActualizado', stockHandler);
  }, [refetchStock, depositoSeleccionadoId]);

  const articulosDelDeposito = depositoSeleccionado ? stockData?.obtenerStockPuntoMudras ?? [] : [];

  const handleAbrirModalStock = useCallback((articulo: ArticuloConStockPuntoMudras) => {
    setArticuloSeleccionado(articulo);
    setModalStockOpen(true);
  }, []);

  const handleCerrarModalStock = useCallback(() => {
    setModalStockOpen(false);
    setArticuloSeleccionado(null);
  }, []);

  const handleStockActualizado = useCallback(async () => {
    handleCerrarModalStock();
    if (depositoSeleccionadoId) {
      await refetchStock({ puntoMudrasId: depositoSeleccionadoId });
    }
  }, [handleCerrarModalStock, depositoSeleccionadoId, refetchStock]);

  const handleNuevaAsignacion = useCallback(() => {
    if (!depositoSeleccionado) return;
    setModalAsignacionOpen(true);
  }, [depositoSeleccionado]);

  const handleCerrarAsignacion = useCallback(() => {
    setModalAsignacionOpen(false);
  }, []);

  const handleAsignacionCompletada = useCallback(async () => {
    setModalAsignacionOpen(false);
    if (depositoSeleccionadoId) {
      await refetchStock({ puntoMudrasId: depositoSeleccionadoId });
    }
  }, [depositoSeleccionadoId, refetchStock]);

  const handleVerDetalles = useCallback(
    (articulo: ArticuloConStockPuntoMudras) => {
      const articuloBase = articulo.articulo;
      const id = articuloBase?.id ?? articulo.id;
      setArticuloDetalles({
        id,
        Descripcion: articuloBase?.Descripcion ?? articulo.nombre,
        Codigo: articuloBase?.Codigo ?? articulo.codigo,
      });
      setStockContext({
        value: Number(articulo.stockAsignado ?? 0),
        label: depositoSeleccionado ? `Stock en ${depositoSeleccionado.nombre}` : 'Stock asignado',
      });
      setModalDetallesOpen(true);
    },
    [depositoSeleccionado]
  );

  const handleCerrarDetalles = useCallback(() => {
    setModalDetallesOpen(false);
    setArticuloDetalles(null);
    setStockContext(null);
  }, []);

  const tabsDefinition = useMemo(() => {
    if (depositos.length === 0) {
      return [{
        key: 'empty',
        label: 'No hay depósitos',
        icon: 'mdi:alert-circle',
        disabled: true
      }];
    }
    return depositos.map(p => ({
      key: String(p.id),
      label: p.nombre,
      icon: 'mdi:warehouse'
    }));
  }, [depositos]);

  return (
    <PageContainer title="Depósitos - Mudras" description="Gestión de stock en depósitos">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Icon icon="mdi:warehouse" width={32} height={32} color={azulMarino.primary} />
        <Typography variant="h4" fontWeight={600} color={azulMarino.primary}>
          Gestión de Depósitos
        </Typography>
      </Box>

      {loadingDepositos && <LinearProgress sx={{ mb: 2 }} />}
      {errorDepositos && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorDepositos.message || 'No se pudo cargar la lista de depósitos.'}
        </Alert>
      )}

      {!loadingDepositos && !errorDepositos && depositos.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No hay depósitos configurados.
        </Alert>
      )}

      {depositos.length > 0 && activeKey && (
        <StylizedTabbedPanel
          tabs={tabsDefinition}
          activeKey={activeKey}
          onChange={setActiveKey}
        >
          <Box sx={{ p: 3 }}>
            {!depositoSeleccionado ? (
              <Box p={3}>
                <Alert severity="info">
                  Seleccioná un depósito para ver su stock.
                </Alert>
              </Box>
            ) : (
              <TablaStockPuntoVenta
                articulos={articulosDelDeposito}
                loading={loadingStock}
                error={errorStock}
                puntoNombre={depositoSeleccionado.nombre}
                onEditStock={handleAbrirModalStock}
                onViewDetails={handleVerDetalles}
                onNewAssignment={handleNuevaAsignacion}
                theme={azulMarino} // Dynamic theme
              />
            )}
          </Box>
        </StylizedTabbedPanel>
      )}

      {modalStockOpen && articuloSeleccionado && depositoSeleccionadoId && (
        <ModalModificarStockPunto
          open={modalStockOpen}
          onClose={handleCerrarModalStock}
          articulo={{ ...articuloSeleccionado, puntoVentaId: depositoSeleccionadoId }}
          onStockActualizado={handleStockActualizado}
          theme={azulMarino} // Dynamic theme
        />
      )}

      {depositoSeleccionado && (
        <ModalNuevaAsignacionStock
          open={modalAsignacionOpen}
          onClose={handleCerrarAsignacion}
          destinoId={depositoSeleccionado.id}
          origen="deposito"
          tipoDestinoPreferido="deposito"
          onStockAsignado={handleAsignacionCompletada}
        />
      )}

      <ModalDetallesArticulo
        open={modalDetallesOpen}
        onClose={handleCerrarDetalles}
        articulo={articuloDetalles}
        stockContext={stockContext ?? undefined}
        accentColor={grisRojizo.primary}
      />
    </PageContainer>
  );
}
