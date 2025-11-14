'use client';
import { useMemo, useState } from 'react';
import { Box, Typography, Chip, Tooltip, TextField, InputAdornment, Skeleton } from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery, useMutation } from '@apollo/client/react';
import PageContainer from '@/components/container/PageContainer';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton, forceWhiteIconsSX } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';
import { GET_ORDENES_COMPRA, GET_ORDEN_COMPRA } from '@/components/compras/graphql/queries';
import { CREAR_ORDEN_COMPRA, EMITIR_ORDEN_COMPRA } from '@/components/compras/graphql/mutations';
import TablaOrdenesCompra from '@/components/compras/ui/TablaOrdenesCompra';
import ModalNuevaOrdenCompra from '@/components/compras/ui/ModalNuevaOrdenCompra';
import ModalRecepcionarOC from '@/components/compras/ui/ModalRecepcionarOC';
import ModalAgregarDetalleOC from '@/components/compras/ui/ModalAgregarDetalleOC';

export default function ComprasPage() {
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);
  const [modalRecepcionarOpen, setModalRecepcionarOpen] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<number | null>(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { data, loading, error, refetch } = useQuery(GET_ORDENES_COMPRA, { fetchPolicy: 'cache-and-network', variables: {} });
  const ordenes = data?.ordenesCompra ?? [];

  const [emitirOrden] = useMutation(EMITIR_ORDEN_COMPRA);

  const handleNueva = () => setModalNuevaOpen(true);
  const handleEmitir = async (id: number) => { await emitirOrden({ variables: { id } }); refetch(); };
  const handleRecepcionar = (id: number) => { setOrdenSeleccionada(id); setModalRecepcionarOpen(true); };
  const handleAgregarDetalle = (id: number) => { setOrdenSeleccionada(id); setModalDetalleOpen(true); };

  return (
    <PageContainer title="Compras - Mudras" description="Gestión de órdenes de compra">
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        <TexturedPanel accent={verde.primary} radius={14} contentPadding={12}>
          <Box sx={{ bgcolor: 'transparent', px: 1, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" fontWeight={800} color={verde.headerText} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="mdi:cart-arrow-down" />
                Órdenes de Compra
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <CrystalButton baseColor={verde.primary} onClick={handleNueva} startIcon={<Icon icon="mdi:plus" />}>Nueva Orden</CrystalButton>
                <CrystalSoftButton baseColor={verde.primary} onClick={() => refetch()} startIcon={<Icon icon="mdi:refresh" />}>Refrescar</CrystalSoftButton>
              </Box>
            </Box>
          </Box>

          {loading ? (
            <Skeleton variant="rounded" height={360} />
          ) : error ? (
            <Typography color="error">{error.message}</Typography>
          ) : (
            <TablaOrdenesCompra
              key={`oc-${reloadKey}`}
              ordenes={ordenes}
              onEmitir={handleEmitir}
              onRecepcionar={handleRecepcionar}
              onAgregarDetalle={handleAgregarDetalle}
            />
          )}
        </TexturedPanel>
      </Box>

      <ModalNuevaOrdenCompra
        open={modalNuevaOpen}
        onClose={() => setModalNuevaOpen(false)}
        onSuccess={() => { setModalNuevaOpen(false); refetch(); }}
      />

      <ModalRecepcionarOC
        open={modalRecepcionarOpen}
        onClose={() => setModalRecepcionarOpen(false)}
        ordenId={ordenSeleccionada}
        onSuccess={() => { setModalRecepcionarOpen(false); refetch(); }}
      />

      <ModalAgregarDetalleOC
        open={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        ordenId={ordenSeleccionada}
        onSuccess={() => { setModalDetalleOpen(false); refetch(); }}
      />
    </PageContainer>
  );
}
