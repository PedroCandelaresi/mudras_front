'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert, Box, LinearProgress, Tab, Tabs, Typography, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@apollo/client/react';
import { Icon } from '@iconify/react';

import PageContainer from '@/components/container/PageContainer';
import TablaStockPuntoVenta from '@/components/puntos-venta/TablaStockPuntoVenta';
import ModalModificarStockPunto from '@/components/stock/ModalModificarStockPunto';
import ModalNuevaAsignacionStock from '@/components/stock/ModalNuevaAsignacionStock';
import ModalDetallesArticulo from '@/components/articulos/ModalDetallesArticulo';
import type { Articulo } from '@/app/interfaces/mudras.types';
import type { PuntoMudras } from '@/interfaces/puntos-mudras';
import {
  OBTENER_PUNTOS_MUDRAS,
  OBTENER_STOCK_PUNTO_MUDRAS,
  type ObtenerPuntosMudrasResponse,
  type ArticuloConStockPuntoMudras,
} from '@/components/puntos-mudras/graphql/queries';

const depositColor = '#0f3d73';

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
    () => (depositosData?.obtenerPuntosMudras ?? []).filter((p) => p.tipo === 'deposito'),
    [depositosData]
  );

  useEffect(() => {
    if (!depositos.length) {
      setActiveKey('empty');
      return;
    }
    if (!activeKey || !depositos.some((p) => String(p.id) === activeKey)) {
      setActiveKey(String(depositos[0].id));
    }
  }, [depositos, activeKey]);

  const depositoSeleccionado = useMemo(
    () => depositos.find((p) => String(p.id) === activeKey) ?? null,
    [depositos, activeKey]
  );
  const tabValue = useMemo(() => {
    if (!depositos.length) return 'empty';
    if (activeKey && depositos.some((p) => String(p.id) === activeKey)) return activeKey;
    return String(depositos[0].id);
  }, [depositos, activeKey]);
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

  return (
    <PageContainer title="Depósitos - Mudras" description="Gestión de stock en depósitos">
      {loadingDepositos && <LinearProgress sx={{ mb: 2 }} />}
      {errorDepositos && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorDepositos.message || 'No se pudo cargar la lista de depósitos.'}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Icon icon="mdi:warehouse" width={32} height={32} color={depositColor} />
        <Typography variant="h4" fontWeight={600} color={depositColor}>
          Gestión de Depósitos
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5', px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, key) => setActiveKey(String(key))}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Depósitos tabs"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: depositColor },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'text.secondary',
                '&.Mui-selected': { color: depositColor },
                py: 2
              }
            }}
          >
            {depositos.map((deposito) => (
              <Tab
                key={deposito.id}
                value={String(deposito.id)}
                icon={<Icon icon="mdi:warehouse" />}
                label={deposito.nombre}
                iconPosition="start"
              />
            ))}
            {depositos.length === 0 && (
              <Tab
                value="empty"
                icon={<Icon icon="mdi:alert-circle" />}
                label="No hay depósitos"
                iconPosition="start"
                disabled
              />
            )}
          </Tabs>
        </Box>

        <Box sx={{ p: 0 }}>
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
            />
          )}
        </Box>
      </Paper>

      {modalStockOpen && articuloSeleccionado && depositoSeleccionadoId && (
        <ModalModificarStockPunto
          open={modalStockOpen}
          onClose={handleCerrarModalStock}
          articulo={{ ...articuloSeleccionado, puntoVentaId: depositoSeleccionadoId }}
          onStockActualizado={handleStockActualizado}
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
        accentColor={depositColor}
      />
    </PageContainer>
  );
}
