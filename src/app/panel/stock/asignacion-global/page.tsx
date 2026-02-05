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
import { alpha } from '@mui/material/styles';
import { IconArrowsLeftRight } from '@tabler/icons-react';
import { verdeMilitar } from '@/ui/colores';

import PageContainer from '@/components/container/PageContainer';
import TransferirStockModal from '@/components/stock/TransferirStockModal';
import IngresoStockModal from '@/components/stock/IngresoStockModal';
import ModalNuevaAsignacionStock from '@/components/stock/ModalNuevaAsignacionStock';

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
            {/* Toolbar */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    p: 2,
                    bgcolor: '#ffffff', // White background strictly matching Proveedores/Articulos
                }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    {/* Icon disabled/removed or simplified to text only as per Articulos? 
                        Articulos toolbar is: Left [Actions], Right [Search]. It does NOT have a Title inside the toolbar Paper. 
                        Wait, TablaArticulos receives `title` prop but doesn't render it in the toolbar shown in the snippet.
                        However, the PageContainer has the title. 
                        
                        Looking at `TablaProveedores.tsx` (lines 213-282):
                        Toolbar has: Left [New Button], Right [Search, Clear]. No Title inside.
                        
                        The `GlobalStockAssignmentPage` has a `PageContainer` title "Asignación Global de Stock".
                        So I should REMOVE the "Matriz de Stock" title from the toolbar to match strictly.
                        BUT, if I need actions on the left, I should put "Actualizar" or "New" there.
                        
                        Current `AsignacionGlobal` has "Matriz de Stock" + Icon.
                        If I follow `TablaProveedores`:
                        Left: [New Button]
                        Right: [Search] [Clear]
                        
                        Let's adapt:
                        Left: [Asignación Masiva]
                        Right: [Search] [Actualizar]
                    */}
                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<Icon icon="mdi:plus" />}
                        onClick={() => setModalOptimizadoOpen(true)}
                        sx={{
                            bgcolor: verdeMilitar.primary,
                            borderRadius: 0,
                            fontWeight: 600,
                            textTransform: 'none',
                            height: 40,
                            px: 3,
                            '&:hover': { bgcolor: verdeMilitar.primaryHover }
                        }}
                    >
                        Asignación Masiva
                    </Button>
                </Box>

                <Box display="flex" gap={2} alignItems="center">
                    <TextField
                        placeholder="Buscar artículo..."
                        size="small"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && refetch()}
                        sx={{
                            minWidth: 350,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 0,
                                bgcolor: '#f5f5f5',
                                '& fieldset': { borderColor: '#e0e0e0' },
                                '&:hover fieldset': { borderColor: '#bdbdbd' },
                                '&.Mui-focused fieldset': { borderColor: verdeMilitar.primary },
                            }
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" color="#757575" /></InputAdornment>,
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
                        startIcon={<Icon icon="mdi:refresh" />}
                        onClick={() => refetch()}
                        sx={{
                            borderRadius: 0,
                            textTransform: 'none',
                            color: '#757575',
                            borderColor: '#e0e0e0',
                            height: 40,
                            bgcolor: '#ffffff',
                            '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
                        }}
                    >
                        Actualizar
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>Error al cargar datos: {error.message}</Alert>}

            {/* Table */}
            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden', bgcolor: '#ffffff' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
                    {loadingMatriz || loadingPuntos ? (
                        <Box display="flex" justifyContent="center" p={8}>
                            <CircularProgress sx={{ color: verdeMilitar.primary }} />
                        </Box>
                    ) : (
                        <Table stickyHeader size="small" sx={{
                            '& .MuiTableRow-root': { minHeight: 56, transition: 'background-color 0.2s' },
                            '& .MuiTableCell-root': { fontSize: '0.85rem', px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0', color: '#37474f' },
                            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': { bgcolor: verdeMilitar.tableStriped },
                            '& .MuiTableBody-root .MuiTableRow-root:hover': { bgcolor: alpha(verdeMilitar.primary, 0.12) },
                            '& .MuiTableCell-head': { fontSize: '0.8rem', fontWeight: 700, bgcolor: verdeMilitar.tableHeader, color: '#ffffff', letterSpacing: '0.5px' },
                        }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>CÓDIGO</TableCell>
                                    <TableCell>ARTÍCULO</TableCell>
                                    <TableCell align="center">TOTAL GLOBAL</TableCell>
                                    {puntos.map((punto: any) => (
                                        <TableCell key={punto.id} align="center">
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                <span>{punto.nombre}</span>
                                                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 400, textTransform: 'none', color: '#e8f5e9' }}>
                                                    {punto.tipo === 'deposito' ? '(Depósito)' : '(Venta)'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    ))}
                                    <TableCell align="center">ACCIONES</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {articulos.map((articulo: any) => (
                                    <TableRow key={articulo.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={articulo.codigo ?? 'Sin código'}
                                                size="small"
                                                sx={{ borderRadius: 0, bgcolor: '#eeeeee', fontWeight: 600, color: '#424242' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: '#2b4735' }}>
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
                                                                    sx={{ color: verdeMilitar.primary, padding: 0.5, '&:hover': { bgcolor: alpha(verdeMilitar.primary, 0.1) } }}
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
                                                    sx={{ color: verdeMilitar.primary, '&:hover': { bgcolor: alpha(verdeMilitar.primary, 0.1) } }}
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
                    )}
                </TableContainer>
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
