"use client";

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    CircularProgress,
    Alert,
    IconButton,
    Chip,
    Paper,
    TextField,
    Button,
    InputAdornment
} from '@mui/material';
import { Icon } from '@iconify/react';
import { IconArrowsLeftRight } from '@tabler/icons-react';

import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/app/panel/layout/shared/breadcrumb/Breadcrumb';
import TransferirStockModal from '@/components/stock/TransferirStockModal';
import IngresoStockModal from '@/components/stock/IngresoStockModal';
import ModalNuevaAsignacionStockOptimizado from '@/components/stock/ModalNuevaAsignacionStockOptimizado';

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
    const [busqueda, setBusqueda] = useState('');
    const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false);
    const [modalIngresoOpen, setModalIngresoOpen] = useState(false);
    const [modalOptimizadoOpen, setModalOptimizadoOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [selectedPuntoOrigen, setSelectedPuntoOrigen] = useState<number | null>(null);

    const { data: dataPuntos, loading: loadingPuntos } = useQuery(GET_PUNTOS_MUDRAS);
    const { data: dataMatriz, loading: loadingMatriz, error, refetch } = useQuery(GET_MATRIZ_STOCK, {
        variables: { busqueda: busqueda || undefined },
        fetchPolicy: 'network-only'
    });

    const puntos = (dataPuntos as any)?.obtenerPuntosMudras?.filter((p: any) => p.activo) || [];
    const articulos = (dataMatriz as any)?.obtenerMatrizStock || [];

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

    return (
        <PageContainer title="Asignación Global de Stock" description="Gestiona el stock de todos los puntos">
            <Breadcrumb title="Asignación Global" items={[{ to: '/panel', title: 'Inicio' }, { title: 'Stock' }]} />

            <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 40, height: 40, bgcolor: '#5d4037', color: '#fff', display: 'grid', placeItems: 'center' }}>
                            <Icon icon="mdi:clipboard-list" width={24} />
                        </Box>
                        <Typography variant="h5" fontWeight={700}>
                            Matriz de Stock
                        </Typography>
                    </Box>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
                        <TextField
                            placeholder="Buscar artículo..."
                            size="small"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && refetch()}
                            sx={{ minWidth: 300 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" /></InputAdornment>,
                                endAdornment: busqueda && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => { setBusqueda(''); setTimeout(refetch, 0); }}>
                                            <Icon icon="mdi:close" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 0 }
                            }}
                        />
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Icon icon="mdi:refresh" />}
                            onClick={() => refetch()}
                            sx={{ borderRadius: 0, textTransform: 'none', fontWeight: 600 }}
                        >
                            Actualizar
                        </Button>
                        <Button
                            variant="contained"
                            disableElevation
                            startIcon={<Icon icon="mdi:plus" />}
                            onClick={() => setModalOptimizadoOpen(true)}
                            sx={{ bgcolor: '#5d4037', borderRadius: 0, fontWeight: 700, '&:hover': { bgcolor: '#4e342e' } }}
                        >
                            Asignación Masiva
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>Error al cargar datos: {error.message}</Alert>}

                {loadingMatriz || loadingPuntos ? (
                    <Box display="flex" justifyContent="center" p={5}>
                        <CircularProgress sx={{ color: '#5d4037' }} />
                    </Box>
                ) : (
                    <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 0 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>CÓDIGO</TableCell>
                                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>ARTÍCULO</TableCell>
                                    <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>TOTAL GLOBAL</TableCell>
                                    {puntos.map((punto: any) => (
                                        <TableCell key={punto.id} align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                <span>{punto.nombre}</span>
                                                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 400, textTransform: 'none' }}>
                                                    {punto.tipo === 'deposito' ? '(Depósito)' : '(Venta)'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    ))}
                                    <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>ACCIONES</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {articulos.map((articulo: any) => (
                                    <TableRow key={articulo.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={articulo.codigo ?? 'Sin código'}
                                                size="small"
                                                sx={{ borderRadius: 0, bgcolor: '#e0e0e0', fontWeight: 600, color: 'text.primary' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                {articulo.nombre}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" fontWeight={800} color="text.primary">
                                                {articulo.stockTotal}
                                            </Typography>
                                        </TableCell>
                                        {puntos.map((punto: any) => {
                                            const stockPunto = articulo.stockPorPunto.find((s: any) => s.puntoId === punto.id);
                                            const cantidad = stockPunto?.cantidad || 0;
                                            return (
                                                <TableCell key={punto.id} align="center">
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 1
                                                        }}
                                                    >
                                                        <Typography
                                                            color={cantidad > 0 ? 'textPrimary' : 'textSecondary'}
                                                            fontWeight={cantidad > 0 ? 700 : 400}
                                                        >
                                                            {cantidad}
                                                        </Typography>
                                                        {cantidad > 0 && (
                                                            <Tooltip title={`Transferir desde ${punto.nombre}`}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenTransferencia(articulo, punto.id)}
                                                                    sx={{ color: '#5d4037', padding: 0.5 }}
                                                                >
                                                                    <IconArrowsLeftRight size={16} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell align="center">
                                            <Tooltip title="Transferir Stock (Origen a elección)">
                                                <IconButton
                                                    onClick={() => handleOpenTransferencia(articulo)}
                                                    sx={{ color: '#2e7d32' }}
                                                >
                                                    <IconArrowsLeftRight size={20} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {articulos.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4 + puntos.length} align="center" sx={{ py: 6 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No se encontraron artículos.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Modales */}
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

            <ModalNuevaAsignacionStockOptimizado
                open={modalOptimizadoOpen}
                onClose={handleCloseModals}
                puntoVenta={null} // Se selecciona adentro
                onStockAsignado={() => {
                    handleCloseModals();
                    refetch();
                }}
            />
        </PageContainer>
    );
}
