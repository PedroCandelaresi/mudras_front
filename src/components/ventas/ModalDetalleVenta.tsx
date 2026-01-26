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
            maxWidth="lg"
            PaperProps={{
                sx: {
                    borderRadius: 0,
                    bgcolor: '#ffffff',
                    boxShadow: 'none',
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

            <Divider />

            <DialogContent sx={{ p: 0, bgcolor: '#f8fafb', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
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
                    <Box sx={{ p: { xs: 3, md: 4 }, display: 'grid', gap: 3 }}>
                        {/* Header info card */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600} fontSize="0.7rem">Cliente</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                        {venta.cliente
                                            ? `${venta.cliente.nombre || ''} ${venta.cliente.apellido || ''}`.trim() || '-'
                                            : 'Consumidor Final'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600} fontSize="0.7rem">Vendedor</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                        {venta.usuarioAuth?.displayName || '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600} fontSize="0.7rem">Estado</Typography>
                                    <Box mt={0.5}>
                                        <Chip
                                            size="small"
                                            label={venta.estado}
                                            sx={{
                                                borderRadius: 1,
                                                height: 24,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                bgcolor: venta.estado === 'PAGADA' || venta.estado === 'CONFIRMADA' ? '#e8f5e9' : '#fff3e0',
                                                color: venta.estado === 'PAGADA' || venta.estado === 'CONFIRMADA' ? '#2e7d32' : '#ef6c00',
                                                border: '1px solid',
                                                borderColor: venta.estado === 'PAGADA' || venta.estado === 'CONFIRMADA' ? 'transparent' : '#ffcc80'
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600} fontSize="0.7rem">Punto de Venta</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{venta.puntoMudras?.nombre || '-'}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Grid container spacing={3}>
                            {/* Artículos */}
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Box sx={{ border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                                    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                                        <Typography variant="subtitle2" fontWeight={700} color={grisRojizo.textStrong}>
                                            Artículos ({venta.detalles?.length || 0})
                                        </Typography>
                                    </Box>
                                    <TableContainer sx={{ background: 'transparent', boxShadow: 'none' }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: '#fafafa' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>CÓDIGO</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>DESCRIPCIÓN</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>CANT.</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>PRECIO U.</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>SUBTOTAL</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {venta.detalles?.map((det: any, idx: number) => (
                                                    <TableRow key={det.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
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
                            </Grid>

                            {/* Totales y Pagos */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box display="flex" flexDirection="column" gap={3}>
                                    {/* Summary Box */}
                                    <Paper elevation={0} sx={{ p: 0, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden' }}>
                                        <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" fontWeight={700} color={grisRojizo.textStrong}>Resumen</Typography>
                                        </Box>
                                        <Box p={2}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                                <Typography variant="body2">{formatCurrency(venta.subtotal)}</Typography>
                                            </Box>
                                            {venta.descuentoMonto > 0 && (
                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography variant="body2" color="text.secondary">Descuentos</Typography>
                                                    <Typography variant="body2" color="error">
                                                        -{formatCurrency(venta.descontado ? venta.descontado : (venta.descuentoMonto || 0))}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                                                <Typography variant="h6" fontWeight={700} color={grisRojizo.primary}>
                                                    {formatCurrency(venta.total)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>

                                    {/* Pagos */}
                                    <Paper elevation={0} sx={{ p: 0, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 0 }}>
                                        <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" fontWeight={700} color={grisRojizo.textStrong}>Pagos</Typography>
                                        </Box>
                                        {venta.pagos && venta.pagos.length > 0 ? (
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableBody>
                                                        {venta.pagos.map((pago: any) => (
                                                            <TableRow key={pago.id}>
                                                                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                                                    {pago.medioPago}
                                                                    {pago.cuotas ? ` (${pago.cuotas} ctas)` : ''}
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                                                    {formatCurrency(pago.monto)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Box p={2}>
                                                <Typography variant="body2" color="text.secondary">Sin registros.</Typography>
                                            </Box>
                                        )}
                                    </Paper>

                                    {/* Comprobantes */}
                                    {venta.comprobantesAfip && venta.comprobantesAfip.length > 0 && (
                                        <Paper elevation={0} sx={{ p: 0, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 0 }}>
                                            <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
                                                <Typography variant="subtitle2" fontWeight={700} color={grisRojizo.textStrong}>Comprobantes</Typography>
                                            </Box>
                                            <Box p={2} display="flex" gap={1} flexWrap="wrap">
                                                {venta.comprobantesAfip.map((comp: any) => (
                                                    <Chip
                                                        key={comp.id}
                                                        label={`${comp.tipoComprobante} ${String(comp.puntoVenta).padStart(4, '0')}-${String(comp.numeroComprobante).padStart(8, '0')}`}
                                                        component="a"
                                                        href={comp.urlPdf || '#'}
                                                        target="_blank"
                                                        clickable={!!comp.urlPdf}
                                                        size="small"
                                                        sx={{ borderRadius: 1, fontWeight: 600 }}
                                                        color={comp.estado === 'APROBADO' ? 'success' : 'default'}
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Paper>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 0, textTransform: 'none' }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDetalleVenta;
