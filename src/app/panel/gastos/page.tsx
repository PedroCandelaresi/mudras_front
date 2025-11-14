'use client';
import { useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import PageContainer from '@/components/container/PageContainer';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';
import { GET_GASTOS } from '@/components/gastos/graphql/queries';
import { ELIMINAR_GASTO } from '@/components/gastos/graphql/mutations';
import TablaGastos from '@/components/gastos/ui/TablaGastos';
import ModalNuevoGasto from '@/components/gastos/ui/ModalNuevoGasto';

export default function GastosPage() {
  const { data, loading, error, refetch } = useQuery(GET_GASTOS, { fetchPolicy: 'cache-and-network', variables: {} });
  const gastos = data?.gastos ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [eliminar] = useMutation(ELIMINAR_GASTO);

  return (
    <PageContainer title="Gastos" description="Gestión de gastos e impuestos">
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        <TexturedPanel accent={verde.primary} radius={14} contentPadding={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography variant="h6" fontWeight={800} color={verde.headerText}>Gastos</Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <CrystalButton baseColor={verde.primary} onClick={() => setModalOpen(true)}>Nuevo Gasto</CrystalButton>
              <CrystalSoftButton baseColor={verde.primary} onClick={() => refetch()}>Refrescar</CrystalSoftButton>
            </Box>
          </Box>

          {loading ? (
            <Skeleton variant="rounded" height={360} />
          ) : error ? (
            <Typography color="error">{error.message}</Typography>
          ) : (
            <TablaGastos gastos={gastos} onDelete={async (id) => { await eliminar({ variables: { id } }); refetch(); }} />
          )}
        </TexturedPanel>
      </Box>

      <ModalNuevoGasto open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={() => { setModalOpen(false); refetch(); }} />
    </PageContainer>
  );
}

