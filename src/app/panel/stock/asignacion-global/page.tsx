"use client";

import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    InputAdornment,
    Button,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert
} from '@mui/material';
import { IconSearch, IconArrowsLeftRight, IconPlus, IconRefresh } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/app/panel/layout/shared/breadcrumb/Breadcrumb';
import TransferirStockModal from '@/app/components/stock/TransferirStockModal';
import IngresoStockModal from '@/app/components/stock/IngresoStockModal';

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
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [selectedPuntoOrigen, setSelectedPuntoOrigen] = useState<number | null>(null);

    const { data: dataPuntos, loading: loadingPuntos } = useQuery(GET_PUNTOS_MUDRAS);
    const { data: dataMatriz, loading: loadingMatriz, error, refetch } = useQuery(GET_MATRIZ_STOCK, {
        variables: { busqueda: busqueda || undefined },
        fetchPolicy: 'network-only'
    });

    const puntos = dataPuntos?.obtenerPuntosMudras?.filter((p: any) => p.activo) || [];
    const articulos = dataMatriz?.obtenerMatrizStock || [];

    const handleOpenTransferencia = (articulo: any, puntoOrigenId?: number) => {
        setSelectedArticle(articulo);
        setSelectedPuntoOrigen(puntoOrigenId || null);
        setModalTransferenciaOpen(true);
    };

    const handleOpenIngreso = (articulo?: any) => {
        setSelectedArticle(articulo || null);
        setModalIngresoOpen(true);
    };

    const handleCloseModals = () => {
        setModalTransferenciaOpen(false);
        setModalIngresoOpen(false);
        setSelectedArticle(null);
        setSelectedPuntoOrigen(null);
        refetch();
    };

    return (
        <PageContainer title="Asignación Global de Stock" description="Gestiona el stock de todos los puntos">
            <Breadcrumb title="Asignación Global" items={[{ to: '/panel', title: 'Inicio' }, { title: 'Stock' }]} />

            <Card>
                <CardContent>
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mb={3}>
                        <TextField
                            placeholder="Buscar artículo por nombre o código..."
                            size="small"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch size={20} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: 300 }}
                        />
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<IconRefresh />}
                                onClick={() => refetch()}
                            >
                                Actualizar
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<IconPlus />}
                                onClick={() => handleOpenIngreso()}
                            >
                                Ingreso Rápido
                            </Button>
                        </Stack>
                    </Stack>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>Error al cargar datos: {error.message}</Alert>}

                    {loadingMatriz || loadingPuntos ? (
                        <Box display="flex" justifyContent="center" p={5}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Código</TableCell>
                                        <TableCell>Artículo</TableCell>
                                        <TableCell>Rubro</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                                            Total
                                        </TableCell>
                                        {puntos.map((punto: any) => (
                                            <TableCell key={punto.id} align="center">
                                                {punto.nombre}
                                                <Typography variant="caption" display="block" color="textSecondary">
                                                    {punto.tipo === 'deposito' ? '(Depósito)' : '(Venta)'}
                                                </Typography>
                                            </TableCell>
                                        ))}
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {articulos.map((articulo: any) => (
                                        <TableRow key={articulo.id} hover>
                                            <TableCell>{articulo.codigo}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{articulo.nombre}</TableCell>
                                            <TableCell>
                                                <Chip label={articulo.rubro || 'Sin Rubro'} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                                                {articulo.stockTotal}
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
                                                                cursor: 'pointer',
                                                                '&:hover .transfer-icon': { opacity: 1 }
                                                            }}
                                                        >
                                                            <Typography
                                                                color={cantidad > 0 ? 'textPrimary' : 'textSecondary'}
                                                                fontWeight={cantidad > 0 ? 600 : 400}
                                                            >
                                                                {cantidad}
                                                            </Typography>
                                                            {cantidad > 0 && (
                                                                <Tooltip title="Transferir desde aquí">
                                                                    <IconButton
                                                                        size="small"
                                                                        className="transfer-icon"
                                                                        sx={{ opacity: 0, ml: 0.5, p: 0.5 }}
                                                                        onClick={() => handleOpenTransferencia(articulo, punto.id)}
                                                                    >
                                                                        <IconArrowsLeftRight size={14} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell align="center">
                                                <Tooltip title="Transferir Stock">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenTransferencia(articulo)}>
                                                        <IconArrowsLeftRight size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {articulos.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4 + puntos.length + 1} align="center" sx={{ py: 3 }}>
                                                <Typography color="textSecondary">No se encontraron artículos</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

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
        </PageContainer>
    );
}
