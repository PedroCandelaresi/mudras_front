'use client';

import React, { useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    IconButton,
    Divider,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Chip
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useQuery } from '@apollo/client/react';
import { grisRojizo } from '@/ui/colores';
import { OBTENER_DETALLE_VENTA, DetalleVentaResponse } from './caja-registradora/graphql/queries';

interface ModalDetalleVentaProps {
    open: boolean;
    onClose: () => void;
    ventaId: string | null;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

const formatDateTime = (val: string) => {
    if (!val) return '-';
    return new Date(val).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const ModalDetalleVenta: React.FC<ModalDetalleVentaProps> = ({ open, onClose, ventaId }) => {
    const { data, loading, error } = useQuery<DetalleVentaResponse>(OBTENER_DETALLE_VENTA, {
        variables: { id: Number(ventaId) },
        skip: !ventaId,
        fetchPolicy: 'network-only'
    });

    const venta = data?.obtenerDetalleVenta;

    const HEADER_H = 60;
    const VH_MAX = 85;

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    boxShadow: 24,
                    overflow: 'hidden',
                    maxHeight: `${VH_MAX}vh`,
                }
            }}
        >
            <DialogTitle
                sx={{
                    p: 2,
                    m: 0,
                    minHeight: HEADER_H,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: grisRojizo.primary,
                    color: '#fff'
                }}
            >
                <Box display="flex" flexDirection="column">
                    <Typography variant="h6" fontWeight={700}>
                        {venta ? `Venta #${venta.numeroVenta}` : 'Detalle de Venta'}
                    </Typography>
                    {venta && (
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {formatDateTime(venta.fecha)}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#fff' }}>
                    <IconX size={24} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                        <CircularProgress sx={{ color: grisRojizo.primary }} />
                    </Box>
                )}

                {error && (
                    <Box p={4} textAlign="center">
                        <Typography color="error">Error al cargar la venta.</Typography>
                    </Box>
                )}

                {venta && !loading && (
                    <Box p={3} display="flex" flexDirection="column" gap={3}>
                        {/* Header info card */}
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Cliente</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {venta.cliente
                                            ? `${venta.cliente.Nombre || ''} ${venta.cliente.Apellido || ''}`.trim() || '-'
                                            : 'Consumidor Final'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Vendedor</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {venta.usuarioAuth?.displayName || '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Estado</Typography>
                                    <Chip
                                        size="small"
                                        label={venta.estado}
                                        sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            bgcolor: venta.estado === 'PAGADA' || venta.estado === 'CONFIRMADA' ? '#e8f5e9' : '#fff3e0',
                                            color: venta.estado === 'PAGADA' || venta.estado === 'CONFIRMADA' ? '#2e7d32' : '#ef6c00'
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Punto de Venta</Typography>
                                    <Typography variant="body2">{venta.puntoMudras?.nombre || '-'}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Artículos */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: grisRojizo.headerText }}>
                                Artículos ({venta.detalles?.length || 0})
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#eee' }}>
                                        <TableRow>
                                            <TableCell>Código</TableCell>
                                            <TableCell>Descripción</TableCell>
                                            <TableCell align="right">Cant.</TableCell>
                                            <TableCell align="right">Precio Unit.</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {venta.detalles?.map((det: any) => (
                                            <TableRow key={det.id} hover>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>{det.articulo?.Codigo || '-'}</TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>{det.articulo?.Descripcion || '-'}</TableCell>
                                                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{det.cantidad}</TableCell>
                                                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{formatCurrency(det.precioUnitario)}</TableCell>
                                                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatCurrency(det.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        {/* Totales y Pagos */}
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: grisRojizo.headerText }}>
                                    Pagos
                                </Typography>
                                {venta.pagos && venta.pagos.length > 0 ? (
                                    <Paper variant="outlined" sx={{ borderRadius: 1 }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: '#eee' }}>
                                                <TableRow>
                                                    <TableCell>Medio</TableCell>
                                                    <TableCell>Detalle</TableCell>
                                                    <TableCell align="right">Monto</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {venta.pagos.map((pago: any) => (
                                                    <TableRow key={pago.id}>
                                                        <TableCell sx={{ fontSize: '0.85rem' }}>{pago.medioPago}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.85rem' }}>
                                                            {pago.marcaTarjeta ? `${pago.marcaTarjeta} ` : ''}
                                                            {pago.cuotas ? `(${pago.cuotas} cuotas)` : ''}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                                            {formatCurrency(pago.monto)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Sin registros de pago.</Typography>
                                )}

                                {venta.comprobantesAfip && venta.comprobantesAfip.length > 0 && (
                                    <Box mt={2}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: grisRojizo.headerText }}>
                                            Comprobantes
                                        </Typography>
                                        <Box display="flex" gap={1} flexWrap="wrap">
                                            {venta.comprobantesAfip.map((comp: any) => (
                                                <Chip
                                                    key={comp.id}
                                                    label={`${comp.tipoComprobante} ${String(comp.puntoVenta).padStart(4, '0')}-${String(comp.numeroComprobante).padStart(8, '0')}`}
                                                    component="a"
                                                    href={comp.urlPdf || '#'}
                                                    target="_blank"
                                                    clickable={!!comp.urlPdf}
                                                    color={comp.estado === 'APROBADO' ? 'success' : 'default'}
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 5 }}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff', borderRadius: 1 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2">Subtotal</Typography>
                                        <Typography variant="body2">{formatCurrency(venta.subtotal)}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2">Descuentos</Typography>
                                        <Typography variant="body2" color="error">
                                            -{formatCurrency(venta.descontado ? venta.descontado : (venta.descuentoMonto || 0))}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                                        <Typography variant="subtitle1" fontWeight={700} color={grisRojizo.primary}>
                                            {formatCurrency(venta.total)}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={onClose} variant="outlined" color="inherit">
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDetalleVenta;
