
import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    Typography,
    Alert,
    Box,
    Divider
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { Icon } from '@iconify/react';

// UI Components
import { TexturedPanel } from '../ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '../ui/CrystalButton';
import { oroNegro } from '../../ui/colores';

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

// Configuración visual heredada de ModalNuevoArticulo pero con paleta OroNegro
const COLORS = oroNegro;
const VH_MAX = 85;
const HEADER_H = 60;
const FOOTER_H = 60;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    bgcolor: 'transparent !important',
                    backgroundColor: 'transparent !important',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
                    overflow: 'hidden',
                    maxHeight: `${VH_MAX} vh`,
                }
            }}
        >
            <TexturedPanel
                accent={COLORS.primary}
                radius={12}
                contentPadding={0}
                bgTintPercent={12}
                bgAlpha={1}
                textureBaseOpacity={0.22}
                textureBoostOpacity={0.19}
                textureBrightness={1.12}
                textureContrast={1.03}
                tintOpacity={0.38}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX} vh` }}>
                    {/* Header */}
                    <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', px: 3, gap: 2 }}>
                            <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear - gradient(135deg, ${COLORS.primary} 0 %, ${COLORS.primaryHover} 100 %)`,
                                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
                                color: COLORS.textStrong
                            }}>
                                <Icon icon="mdi:transfer" width={22} height={22} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                <Typography variant="h6" fontWeight={700} color={COLORS.headerText} sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                    Transferir Stock
                                </Typography>
                                <Typography variant="subtitle2" color={alpha(COLORS.headerText, 0.8)} fontWeight={600}>
                                    {articuloPreseleccionado?.nombre}
                                </Typography>
                            </Box>

                            <Box sx={{ ml: 'auto' }}>
                                <CrystalSoftButton
                                    baseColor={COLORS.primary}
                                    onClick={onClose}
                                    sx={{
                                        width: 40, height: 40, minWidth: 40, borderRadius: '50%', p: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <Icon icon="mdi:close" color={COLORS.headerText} width={20} height={20} />
                                </CrystalSoftButton>
                            </Box>
                        </Box>
                    </DialogTitle>

                    <Divider sx={{
                        height: DIV_H, border: 0,
                        backgroundImage: `linear - gradient(90deg, rgba(255, 255, 255, 0.05), ${COLORS.primary}, rgba(255, 255, 255, 0.05))`
                    }} />

                    {/* Content */}
                    <DialogContent sx={{ p: 0, overflow: 'auto', maxHeight: CONTENT_MAX, background: '#f8fafb' }}>
                        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField
                                    select
                                    label="Punto de Origen"
                                    value={origen}
                                    onChange={(e) => setOrigen(Number(e.target.value))}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            background: '#ffffff',
                                            '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                        },
                                    }}
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            background: '#ffffff',
                                            '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                        },
                                    }}
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
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                fullWidth
                                helperText={origen ? `Disponible en origen: ${stockEnOrigen} ` : ''}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        background: '#ffffff',
                                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                    },
                                }}
                            />

                            <TextField
                                label="Motivo (Opcional)"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        background: '#ffffff',
                                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                    },
                                }}
                            />
                        </Box>
                    </DialogContent>

                    <Divider sx={{ height: DIV_H, border: 0, backgroundImage: `linear - gradient(90deg, rgba(255, 255, 255, 0.05), ${COLORS.primary}, rgba(255, 255, 255, 0.05))` }} />

                    {/* Footer */}
                    <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H, bgcolor: '#f8fafb' }}>
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3, gap: 1.5 }}>
                            <CrystalSoftButton baseColor={COLORS.dark} onClick={onClose} disabled={loading}>
                                Cancelar
                            </CrystalSoftButton>
                            <CrystalButton baseColor={COLORS.primary} onClick={handleSubmit} disabled={loading || !origen || !destino || !cantidad}>
                                {loading ? 'Transfiriendo...' : 'Confirmar Transferencia'}
                            </CrystalButton>
                        </Box>
                    </DialogActions>
                </Box>
            </TexturedPanel>
        </Dialog>
    );
}

