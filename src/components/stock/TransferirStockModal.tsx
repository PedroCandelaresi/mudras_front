
import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Typography,
    Alert,
    Box,
    Divider,
    IconButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { verde } from '../../ui/colores';

const TRANSFERIR_STOCK = gql`
  mutation TransferirStock($input: TransferirStockInput!) {
    transferirStock(input: $input)
}
`;

interface TransferirStockModalProps {
    open: boolean;
    onClose: () => void;
    articuloPreseleccionado?: any;
    origenPreseleccionado?: number | null;
    puntos: any[];
}

const COLORS = verde;

export default function TransferirStockModal({
    open,
    onClose,
    articuloPreseleccionado,
    origenPreseleccionado,
    puntos
}: TransferirStockModalProps) {
    const [origen, setOrigen] = useState<number | ''>('');
    const [destino, setDestino] = useState<number | ''>('');
    const [cantidad, setCantidad] = useState<string>('');
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [transferirStock, { loading }] = useMutation(TRANSFERIR_STOCK);

    useEffect(() => {
        if (open) {
            setOrigen(origenPreseleccionado || '');
            setDestino('');
            setCantidad('');
            setMotivo('');
            setError(null);
        }
    }, [open, origenPreseleccionado]);

    const handleSubmit = async () => {
        if (!origen || !destino || !cantidad) {
            setError('Por favor complete todos los campos requeridos');
            return;
        }

        if (origen === destino) {
            setError('El punto de origen y destino no pueden ser el mismo');
            return;
        }

        const stockDisponible = articuloPreseleccionado?.stockPorPunto?.find((s: any) => s.puntoId === origen)?.cantidad || 0;
        if (Number(cantidad) > stockDisponible) {
            setError(`Stock insuficiente en origen.Disponible: ${stockDisponible} `);
            return;
        }

        try {
            await transferirStock({
                variables: {
                    input: {
                        puntoOrigenId: Number(origen),
                        puntoDestinoId: Number(destino),
                        articuloId: Number(articuloPreseleccionado.id),
                        cantidad: Number(cantidad),
                        motivo: motivo || 'Transferencia desde panel global'
                    }
                }
            });
            onClose();
            window.dispatchEvent(new CustomEvent('stockGlobalActualizado'));
        } catch (err: any) {
            setError(err.message || 'Error al realizar la transferencia');
        }
    };

    const stockEnOrigen = useMemo(() => {
        if (!origen || !articuloPreseleccionado) return 0;
        return articuloPreseleccionado.stockPorPunto?.find((s: any) => s.puntoId === origen)?.cantidad || 0;
    }, [origen, articuloPreseleccionado]);

    /* ======================== Render ======================== */
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 4,
                sx: {
                    borderRadius: 0,
                    bgcolor: '#ffffff',
                    maxHeight: '90vh',
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                {/* Header */}
                <Box sx={{
                    bgcolor: COLORS.primary,
                    color: '#ffffff',
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `4px solid ${COLORS.headerBorder}`,
                    borderRadius: 0,
                }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Icon icon="mdi:transfer" width={24} height={24} />
                        <Box>
                            <Typography variant="h6" fontWeight={600} letterSpacing={0.5}>
                                TRANSFERIR STOCK
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
                                {articuloPreseleccionado?.nombre}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                        <Icon icon="mdi:close" width={24} />
                    </IconButton>
                </Box>

                {/* Content */}
                <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {error && <Alert severity="error" sx={{ borderRadius: 0 }}>{error}</Alert>}

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                select
                                label="Punto de Origen"
                                value={origen}
                                onChange={(e) => setOrigen(Number(e.target.value))}
                                fullWidth
                                InputProps={{ sx: { borderRadius: 0 } }}
                            >
                                {puntos.map((punto) => (
                                    <MenuItem key={punto.id} value={punto.id}>
                                        {punto.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Punto de Destino"
                                value={destino}
                                onChange={(e) => setDestino(Number(e.target.value))}
                                fullWidth
                                InputProps={{ sx: { borderRadius: 0 } }}
                            >
                                {puntos.map((punto) => (
                                    <MenuItem key={punto.id} value={punto.id} disabled={punto.id === origen}>
                                        {punto.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TextField
                            label="Cantidad a Transferir"
                            value={cantidad}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*[.,]?\d*$/.test(value)) {
                                    setCantidad(value);
                                }
                            }}
                            fullWidth
                            helperText={origen ? `Disponible en origen: ${stockEnOrigen}` : ''}
                            InputProps={{ sx: { borderRadius: 0 } }}
                            inputMode="decimal"
                        />

                        <TextField
                            label="Motivo (Opcional)"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            InputProps={{ sx: { borderRadius: 0 } }}
                        />
                    </Box>
                </DialogContent>

                <Divider />

                {/* Footer */}
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit" sx={{ borderRadius: 0, textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || !origen || !destino || !cantidad}
                        disableElevation
                        sx={{ bgcolor: COLORS.primary, borderRadius: 0, fontWeight: 700, px: 3, '&:hover': { bgcolor: COLORS.primary } }}
                    >
                        {loading ? 'Transfiriendo...' : 'Confirmar Transferencia'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

