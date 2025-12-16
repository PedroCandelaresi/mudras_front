import React, { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
    Typography,
    Alert,
    Autocomplete,
    CircularProgress
} from '@mui/material';

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

export default function TransferirStockModal({
    open,
    onClose,
    articuloPreseleccionado,
    origenPreseleccionado,
    puntos
}: TransferirStockModalProps) {
    const [puntoOrigen, setPuntoOrigen] = useState<number | ''>('');
    const [puntoDestino, setPuntoDestino] = useState<number | ''>('');
    const [cantidad, setCantidad] = useState<string>('');
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [transferirStock, { loading }] = useMutation(TRANSFERIR_STOCK);

    useEffect(() => {
        if (open) {
            setPuntoOrigen(origenPreseleccionado || '');
            setPuntoDestino('');
            setCantidad('');
            setMotivo('');
            setError(null);
        }
    }, [open, origenPreseleccionado]);

    const handleSubmit = async () => {
        if (!puntoOrigen || !puntoDestino || !cantidad || !articuloPreseleccionado) {
            setError('Por favor complete todos los campos requeridos');
            return;
        }

        if (puntoOrigen === puntoDestino) {
            setError('El punto de origen y destino no pueden ser el mismo');
            return;
        }

        try {
            await transferirStock({
                variables: {
                    input: {
                        puntoOrigenId: Number(puntoOrigen),
                        puntoDestinoId: Number(puntoDestino),
                        articuloId: Number(articuloPreseleccionado.id),
                        cantidad: Number(cantidad),
                        motivo: motivo || 'Transferencia manual desde panel global'
                    }
                }
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al realizar la transferencia');
        }
    };

    const stockEnOrigen = articuloPreseleccionado?.stockPorPunto?.find(
        (s: any) => s.puntoId === puntoOrigen
    )?.cantidad || 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Transferir Stock</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <Typography variant="subtitle1" fontWeight="bold">
                        Artículo: {articuloPreseleccionado?.nombre} ({articuloPreseleccionado?.codigo})
                    </Typography>

                    <TextField
                        select
                        label="Punto de Origen"
                        value={puntoOrigen}
                        onChange={(e) => setPuntoOrigen(Number(e.target.value))}
                        fullWidth
                        disabled={!!origenPreseleccionado}
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
                        value={puntoDestino}
                        onChange={(e) => setPuntoDestino(Number(e.target.value))}
                        fullWidth
                    >
                        {puntos
                            .filter(p => p.id !== puntoOrigen)
                            .map((punto) => (
                                <MenuItem key={punto.id} value={punto.id}>
                                    {punto.nombre}
                                </MenuItem>
                            ))}
                    </TextField>

                    <TextField
                        label="Cantidad"
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        fullWidth
                        helperText={`Stock disponible en origen: ${stockEnOrigen}`}
                        error={Number(cantidad) > stockEnOrigen}
                    />

                    <TextField
                        label="Motivo (Opcional)"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || !puntoOrigen || !puntoDestino || !cantidad || Number(cantidad) > stockEnOrigen}
                >
                    {loading ? <CircularProgress size={24} /> : 'Transferir'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
