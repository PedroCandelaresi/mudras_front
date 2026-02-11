"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
    Box,
    Alert,
    Button,
    TextField,
    InputAdornment,
    Autocomplete,
    IconButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { verdeMilitar } from '@/ui/colores';

import PageContainer from '@/components/container/PageContainer';
import TransferirStockModal from '@/components/stock/TransferirStockModal';
import IngresoStockModal from '@/components/stock/IngresoStockModal';
import ModalNuevaAsignacionStock from '@/components/stock/ModalNuevaAsignacionStock';
import TablaMatrizStock, { ArticuloMatriz, PuntoMudras } from '@/components/stock/TablaMatrizStock';

// Queries
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';

// GraphQL
const GET_MATRIZ_STOCK = gql`
  query ObtenerMatrizStock($busqueda: String, $rubro: String, $proveedorId: Int) {
    obtenerMatrizStock(busqueda: $busqueda, rubro: $rubro, proveedorId: $proveedorId) {
      id
      codigo
      nombre
      rubro
      stockTotal
      stockPorPunto {
        puntoId
        puntoNombre
        cantidad
      }
    }
  }
`;

const GET_PUNTOS_MUDRAS = gql`
  query ObtenerPuntosMudras {
    obtenerPuntosMudras {
      id
      nombre
      tipo
      activo
    }
  }
`;

export default function GlobalStockAssignmentPage() {
    // UI State
    const [busqueda, setBusqueda] = useState('');
    const [rubroSeleccionado, setRubroSeleccionado] = useState<{ id: number; nombre: string } | null>(null);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState<{ IdProveedor: number; Nombre: string } | null>(null);

    // Modals
    const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false);
    const [modalIngresoOpen, setModalIngresoOpen] = useState(false);
    const [modalOptimizadoOpen, setModalOptimizadoOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [selectedPuntoOrigen, setSelectedPuntoOrigen] = useState<number | null>(null);

    // Data - Filters
    const { data: dataRubros } = useQuery(GET_RUBROS);
    const { data: dataProveedores } = useQuery(GET_PROVEEDORES);

    // Data - Main
    const { data: dataPuntos, loading: loadingPuntos } = useQuery(GET_PUNTOS_MUDRAS);
    const { data: dataMatriz, loading: loadingMatriz, error, refetch } = useQuery(GET_MATRIZ_STOCK, {
        variables: {
            busqueda: busqueda || undefined,
            rubro: rubroSeleccionado?.nombre || undefined,
            proveedorId: proveedorSeleccionado ? Number(proveedorSeleccionado.IdProveedor) : undefined
        },
        fetchPolicy: 'network-only'
    });

    const puntos = (dataPuntos as any)?.obtenerPuntosMudras?.filter((p: any) => p.activo) || [];
    const articulos = (dataMatriz as any)?.obtenerMatrizStock || [];

    // Filters Lists
    const rubros = (dataRubros as any)?.obtenerRubros || [];
    const proveedores = (dataProveedores as any)?.proveedores || [];

    const handleOpenTransferencia = (articulo: any, puntoOrigenId?: number) => {
        setSelectedArticle(articulo);
        setSelectedPuntoOrigen(puntoOrigenId || null);
        setModalTransferenciaOpen(true);
    };

    const handleCloseModals = () => {
        setModalTransferenciaOpen(false);
        setModalIngresoOpen(false);
        setModalOptimizadoOpen(false);
        setSelectedArticle(null);
        setSelectedPuntoOrigen(null);
        refetch();
    };

    const handleClearFilters = () => {
        setBusqueda('');
        setRubroSeleccionado(null);
        setProveedorSeleccionado(null);
        setTimeout(refetch, 0);
    };

    return (
        <PageContainer title="Asignación Global de Stock" description="Gestiona el stock de todos los puntos">

            {/* Toolbar */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                    mb: 3,
                    p: 2.5,
                    bgcolor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderLeft: `4px solid ${verdeMilitar.primary}`
                }}
            >
                {/* Left: Actions */}
                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<Icon icon="mdi:package-variant-plus" />}
                        onClick={() => setModalOptimizadoOpen(true)}
                        sx={{
                            bgcolor: verdeMilitar.primary,
                            borderRadius: 1,
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 3,
                            '&:hover': { bgcolor: verdeMilitar.primaryHover }
                        }}
                    >
                        Nueva Asignación
                    </Button>
                </Box>

                {/* Right: Filters */}
                <Box display="flex" gap={2} flexWrap="wrap" flex={1} justifyContent="flex-end">

                    <Autocomplete
                        options={proveedores}
                        getOptionLabel={(o: any) => o.Nombre || ''}
                        value={proveedorSeleccionado}
                        onChange={(_, v) => setProveedorSeleccionado(v)}
                        renderInput={(params) => <TextField {...params} label="Proveedor" size="small" />}
                        sx={{ minWidth: 200, bgcolor: '#fff' }}
                    />

                    <Autocomplete
                        options={rubros}
                        getOptionLabel={(o: any) => o.nombre || ''}
                        value={rubroSeleccionado}
                        onChange={(_, v) => setRubroSeleccionado(v)}
                        renderInput={(params) => <TextField {...params} label="Rubro" size="small" />}
                        sx={{ minWidth: 180, bgcolor: '#fff' }}
                    />

                    <TextField
                        placeholder="Buscar por código o nombre..."
                        size="small"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && refetch()}
                        sx={{
                            minWidth: 250,
                            bgcolor: '#f8f9fa'
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" color="action" /></InputAdornment>,
                            endAdornment: busqueda && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => { setBusqueda(''); setTimeout(refetch, 0); }}>
                                        <Icon icon="mdi:close" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        variant="outlined"
                        onClick={handleClearFilters}
                        title="Limpiar filtros"
                        sx={{ minWidth: 40, px: 0, borderColor: '#e0e0e0', color: 'text.secondary' }}
                    >
                        <Icon icon="mdi:filter-off" width={20} />
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Icon icon="mdi:refresh" />}
                        onClick={() => refetch()}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            color: 'text.secondary',
                            borderColor: '#e0e0e0',
                            bgcolor: '#ffffff',
                            '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
                        }}
                    >
                        Actualizar
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>Error al cargar datos: {error.message}</Alert>}

            {/* Table Component */}
            <TablaMatrizStock
                articulos={articulos}
                puntos={puntos}
                loading={loadingMatriz || loadingPuntos}
                onTransferir={handleOpenTransferencia}
            />

            {/* Modals */}
            <TransferirStockModal
                open={modalTransferenciaOpen}
                onClose={handleCloseModals}
                articuloPreseleccionado={selectedArticle}
                origenPreseleccionado={selectedPuntoOrigen}
                puntos={puntos}
            />

            <IngresoStockModal
                open={modalIngresoOpen}
                onClose={handleCloseModals}
                articuloPreseleccionado={selectedArticle}
                puntos={puntos}
            />

            <ModalNuevaAsignacionStock
                open={modalOptimizadoOpen}
                onClose={handleCloseModals}
                onStockAsignado={() => {
                    handleCloseModals();
                    refetch();
                }}
            />
        </PageContainer>
    );
}
