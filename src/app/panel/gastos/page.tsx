'use client';
import { useState } from 'react';
import { Box, Skeleton, Typography, Button, Paper } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import PageContainer from '@/components/container/PageContainer';
import { GET_GASTOS, type GastosResponse } from '@/components/gastos/graphql/queries';
import { ELIMINAR_GASTO } from '@/components/gastos/graphql/mutations';
import TablaGastos from '@/components/gastos/ui/TablaGastos';
import ModalNuevoGasto from '@/components/gastos/ui/ModalNuevoGasto';
import { Icon } from '@iconify/react';

export default function GastosPage() {
  const { data, loading, error, refetch } = useQuery<GastosResponse>(GET_GASTOS, {
    fetchPolicy: 'cache-and-network',
    variables: {},
  });
  const gastos = data?.gastos ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [eliminar] = useMutation(ELIMINAR_GASTO);

  return (
    <PageContainer title="Gastos" description="Gestión de gastos e impuestos">
      <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#5d4037',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon icon="mdi:cash-minus" width={24} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Gestión de Gastos
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Icon icon="mdi:refresh" />}
              onClick={() => refetch()}
              sx={{ borderRadius: 0, textTransform: 'none', fontWeight: 600 }}
            >
              Refrescar
            </Button>
            <Button
              variant="contained"
              disableElevation
              startIcon={<Icon icon="mdi:plus" />}
              onClick={() => setModalOpen(true)}
              sx={{ bgcolor: '#5d4037', borderRadius: 0, fontWeight: 700, '&:hover': { bgcolor: '#4e342e' } }}
            >
              Nuevo Gasto
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : error ? (
          <Typography color="error">{error.message}</Typography>
        ) : (
          <TablaGastos
            gastos={gastos}
            onDelete={async (id) => {
              if (confirm('¿Estás seguro de eliminar este gasto?')) {
                await eliminar({ variables: { id } });
                refetch();
              }
            }}
          />
        )}
      </Paper>

      <ModalNuevoGasto
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refetch();
        }}
      />
    </PageContainer>
  );
}
