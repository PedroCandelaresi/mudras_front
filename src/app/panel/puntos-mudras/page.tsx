'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Chip,
  Paper
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery } from '@apollo/client/react';
import PageContainer from '@/app/components/container/PageContainer';
import TablaPuntosMudras from '@/components/puntos-mudras/TablaPuntosMudras';
import ModalPuntoMudras from '@/components/puntos-mudras/ModalPuntoMudras';
import { grisVerdoso, grisRojizo } from '@/ui/colores';
import {
  OBTENER_ESTADISTICAS_PUNTOS_MUDRAS,
  type ObtenerEstadisticasPuntosMudrasResponse,
  type PuntoMudras,
} from '@/queries/puntos-mudras';

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
  const [tabActual, setTabActual] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoModal, setTipoModal] = useState<'venta' | 'deposito'>('venta');
  const [puntoEditar, setPuntoEditar] = useState<PuntoMudras | undefined>(undefined);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

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
    // El modal se cerrará automáticamente desde handleGuardar
  };

  return (
    <PageContainer title="Puntos Mudras" description="Gestión de puntos de venta y depósitos">
      <Box>
        <Typography variant="h4" fontWeight={700} color={grisVerdoso.textStrong} sx={{ mb: 2 }}>
          Gestión de Puntos Mudras
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#424242', borderRadius: 2, overflow: 'hidden', bgcolor: '#e0e0e0' }}>
          {/* Toolbar superior con tabs */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 2, borderRadius: 0 }}>
            <Tabs
              value={tabActual}
              onChange={handleChangeTab}
              aria-label="puntos mudras tabs"
              TabIndicatorProps={{ sx: { display: 'none' } }}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTab-root': {
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: '#757575',
                  '&:hover': { bgcolor: '#9e9e9e' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: '#424242',
                  color: 'common.white'
                }
              }}
            >
              <Tab 
                icon={<Icon icon="mdi:store" />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Puntos de Venta
                    <Chip label={estadisticas?.obtenerEstadisticasPuntosMudras?.puntosVenta || 0} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'inherit' }} />
                  </Box>
                } 
                iconPosition="start" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<Icon icon="mdi:warehouse" />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Depósitos
                    <Chip label={estadisticas?.obtenerEstadisticasPuntosMudras?.depositos || 0} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'inherit' }} />
                  </Box>
                } 
                iconPosition="start" 
                {...a11yProps(1)} 
              />
            </Tabs>
          </Box>
          {/* Zona de contenido con mismo fondo y padding */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 2, borderRadius: 0 }}>
            <Box sx={{ pt: 2 }}>
              {/* Tab 0 - Puntos de Venta */}
              {tabActual === 0 && (
                <TablaPuntosMudras 
                  tipo="venta" 
                  onEditarPunto={abrirModalEditar}
                  onNuevoPunto={() => abrirModalCrear('venta')}
                  key={`venta-${refetchTrigger}`}
                />
              )}
              
              {/* Tab 1 - Depósitos */}
              {tabActual === 1 && (
                <TablaPuntosMudras 
                  tipo="deposito" 
                  onEditarPunto={abrirModalEditar}
                  onNuevoPunto={() => abrirModalCrear('deposito')}
                  key={`deposito-${refetchTrigger}`}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Modal para crear/editar puntos */}
      <ModalPuntoMudras
        abierto={modalAbierto}
        onCerrar={cerrarModal}
        onExito={manejarExito}
        punto={puntoEditar}
        tipo={tipoModal}
      />
    </PageContainer>
  );
}
