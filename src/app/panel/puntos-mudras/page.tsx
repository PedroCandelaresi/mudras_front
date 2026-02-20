
'use client';

import React, { useState } from 'react';
import { Box, Chip, Snackbar, Alert } from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery } from '@apollo/client/react';
import PageContainer from '@/components/container/PageContainer';
import TablaPuntosMudras from '@/components/puntos-mudras/TablaPuntosMudras';
import ModalPuntoMudras from '@/components/puntos-mudras/ModalPuntoMudras';
import ModalInventarioPunto from '@/components/puntos-mudras/ModalInventarioPunto';
import { grisRojizo } from '@/ui/colores';
import StylizedTabbedPanel, { type StylizedTabDefinition } from '@/components/ui/StylizedTabbedPanel';
import {
  OBTENER_ESTADISTICAS_PUNTOS_MUDRAS,
  type ObtenerEstadisticasPuntosMudrasResponse,
} from '@/components/puntos-mudras/graphql/queries';
import { type PuntoMudras } from '@/interfaces/puntos-mudras';

export default function PuntosMudrasPage() {
  const [activeTab, setActiveTab] = useState<'venta' | 'deposito'>('venta');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoModal, setTipoModal] = useState<'venta' | 'deposito'>('venta');
  const [puntoEditar, setPuntoEditar] = useState<PuntoMudras | undefined>(undefined);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [inventarioOpen, setInventarioOpen] = useState(false);
  const [puntoInventario, setPuntoInventario] = useState<PuntoMudras | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>({ open: false, msg: '', sev: 'success' });

  // Query para estadísticas
  const { data: estadisticas, refetch: refetchEstadisticas } = useQuery<ObtenerEstadisticasPuntosMudrasResponse>(
    OBTENER_ESTADISTICAS_PUNTOS_MUDRAS,
    { fetchPolicy: 'cache-and-network' }
  );

  const tabs: StylizedTabDefinition[] = [
    {
      key: 'venta',
      label: (
        <Box display="flex" alignItems="center" gap={1}>
          Puntos de Venta
          <Chip
            label={estadisticas?.obtenerEstadisticasPuntosMudras?.puntosVenta || 0}
            size="small"
            sx={{ borderRadius: 0, height: 20, bgcolor: 'action.hover' }}
          />
        </Box>
      ),
      icon: <Icon icon="mdi:store" width={20} />,
      color: grisRojizo.primary,
    },
    {
      key: 'deposito',
      label: (
        <Box display="flex" alignItems="center" gap={1}>
          Depósitos
          <Chip
            label={estadisticas?.obtenerEstadisticasPuntosMudras?.depositos || 0}
            size="small"
            sx={{ borderRadius: 0, height: 20, bgcolor: 'action.hover' }}
          />
        </Box>
      ),
      icon: <Icon icon="mdi:warehouse" width={20} />,
      color: grisRojizo.primary,
    }
  ];

  const abrirModalCrear = (tipo: 'venta' | 'deposito') => {
    setTipoModal(tipo);
    setPuntoEditar(undefined);
    setModalAbierto(true);
  };

  const abrirModalEditar = (punto: PuntoMudras) => {
    setPuntoEditar(punto);
    setTipoModal(punto.tipo as 'venta' | 'deposito');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPuntoEditar(undefined);
  };

  const manejarExito = () => {
    refetchEstadisticas();
    setRefetchTrigger(prev => prev + 1);
    setSnack({ open: true, msg: 'Punto guardado correctamente', sev: 'success' });
  };

  return (
    <PageContainer title="Puntos Mudras" description="Gestión de puntos de venta y depósitos">
      <StylizedTabbedPanel
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as any)}
      >
        <Box sx={{ pt: 0 }}>
          {activeTab === 'venta' && (
            <Box sx={{
              borderRadius: 0,
              bgcolor: '#ffffff',
              transition: 'background-color .2s ease',
            }}>
              <TablaPuntosMudras
                tipo="venta"
                onEditarPunto={abrirModalEditar}
                onNuevoPunto={() => abrirModalCrear('venta')}
                onVerInventario={(p) => { setPuntoInventario(p as any); setInventarioOpen(true); }}
                onEliminado={(p) => setSnack({ open: true, msg: `Punto eliminado: ${p.nombre}`, sev: 'success' })}
                refreshTrigger={refetchTrigger}
              />
            </Box>
          )}

          {activeTab === 'deposito' && (
            <Box sx={{
              borderRadius: 0,
              bgcolor: '#ffffff',
              transition: 'background-color .2s ease',
            }}>
              <TablaPuntosMudras
                tipo="deposito"
                onEditarPunto={abrirModalEditar}
                onNuevoPunto={() => abrirModalCrear('deposito')}
                onVerInventario={(p) => { setPuntoInventario(p as any); setInventarioOpen(true); }}
                onEliminado={(p) => setSnack({ open: true, msg: `Depósito eliminado: ${p.nombre}`, sev: 'success' })}
                refreshTrigger={refetchTrigger}
              />
            </Box>
          )}
        </Box>
      </StylizedTabbedPanel>

      <ModalPuntoMudras
        abierto={modalAbierto}
        onCerrar={cerrarModal}
        onExito={manejarExito}
        punto={puntoEditar}
        tipo={tipoModal}
      />

      <ModalInventarioPunto
        open={inventarioOpen}
        onClose={() => setInventarioOpen(false)}
        punto={puntoInventario as any}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          variant="filled"
          sx={{ width: '100%', borderRadius: 0 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
