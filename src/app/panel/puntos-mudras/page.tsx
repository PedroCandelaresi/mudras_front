
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery } from '@apollo/client/react';
import PageContainer from '@/components/container/PageContainer';
import TablaPuntosMudras from '@/components/puntos-mudras/TablaPuntosMudras';
import ModalPuntoMudras from '@/components/puntos-mudras/ModalPuntoMudras';
import ModalInventarioPunto from '@/components/puntos-mudras/ModalInventarioPunto';
import { grisVerdoso, grisRojizo } from '@/ui/colores';
import {
  OBTENER_ESTADISTICAS_PUNTOS_MUDRAS,
  type ObtenerEstadisticasPuntosMudrasResponse,
} from '@/components/puntos-mudras/graphql/queries';
import { type PuntoMudras } from '@/interfaces/puntos-mudras';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`puntos-mudras-tabpanel-${index}`}
      aria-labelledby={`puntos-mudras-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `puntos-mudras-tab-${index}`,
    'aria-controls': `puntos-mudras-tabpanel-${index}`,
  };
}

export default function PuntosMudrasPage() {
  const paleta = grisRojizo;
  const [tabActual, setTabActual] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoModal, setTipoModal] = useState<'venta' | 'deposito'>('venta');
  const [puntoEditar, setPuntoEditar] = useState<PuntoMudras | undefined>(undefined);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [inventarioOpen, setInventarioOpen] = useState(false);
  const [puntoInventario, setPuntoInventario] = useState<PuntoMudras | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>({ open: false, msg: '', sev: 'success' });

  // Query para estadísticas
  const { data: estadisticas, loading: loadingEstadisticas, error: errorEstadisticas, refetch: refetchEstadisticas } = useQuery<ObtenerEstadisticasPuntosMudrasResponse>(
    OBTENER_ESTADISTICAS_PUNTOS_MUDRAS,
    {
      fetchPolicy: 'cache-and-network'
    }
  );

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabActual(newValue);
  };

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
    // Refrescar estadísticas después de crear/actualizar
    refetchEstadisticas();
    // Trigger refetch de las tablas
    setRefetchTrigger(prev => prev + 1);
    setSnack({ open: true, msg: 'Punto guardado correctamente', sev: 'success' });
    // El modal se cerrará automáticamente desde handleGuardar
  };

  return (
    <PageContainer title="Puntos Mudras" description="Gestión de puntos de venta y depósitos">
      <Box>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={700} color={paleta.textStrong}>
            Gestión de Puntos Mudras
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabActual}
            onChange={handleChangeTab}
            aria-label="puntos mudras tabs"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: paleta.primary },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'text.secondary',
                '&.Mui-selected': { color: paleta.primary }
              }
            }}
          >
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Icon icon="mdi:store" width={20} />
                  Puntos de Venta
                  <Chip label={estadisticas?.obtenerEstadisticasPuntosMudras?.puntosVenta || 0} size="small" sx={{ borderRadius: 0, height: 20, bgcolor: 'action.hover' }} />
                </Box>
              }
              {...a11yProps(0)}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Icon icon="mdi:warehouse" width={20} />
                  Depósitos
                  <Chip label={estadisticas?.obtenerEstadisticasPuntosMudras?.depositos || 0} size="small" sx={{ borderRadius: 0, height: 20, bgcolor: 'action.hover' }} />
                </Box>
              }
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>

        <Box>
          {/* Tab 0 - Puntos de Venta */}
          {tabActual === 0 && (
            <TablaPuntosMudras
              tipo="venta"
              onEditarPunto={abrirModalEditar}
              onNuevoPunto={() => abrirModalCrear('venta')}
              onVerInventario={(p) => { setPuntoInventario(p as any); setInventarioOpen(true); }}
              onEliminado={(p) => setSnack({ open: true, msg: `Punto eliminado: ${p.nombre}`, sev: 'success' })}
              key={`venta-${refetchTrigger}`}
            />
          )}

          {/* Tab 1 - Depósitos */}
          {tabActual === 1 && (
            <TablaPuntosMudras
              tipo="deposito"
              onEditarPunto={abrirModalEditar}
              onNuevoPunto={() => abrirModalCrear('deposito')}
              onVerInventario={(p) => { setPuntoInventario(p as any); setInventarioOpen(true); }}
              onEliminado={(p) => setSnack({ open: true, msg: `Depósito eliminado: ${p.nombre}`, sev: 'success' })}
              key={`deposito-${refetchTrigger}`}
            />
          )}
        </Box>
      </Box>

      {/* Modal para crear/editar puntos */}
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
      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
