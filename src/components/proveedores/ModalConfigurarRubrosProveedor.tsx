'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    Paper,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Divider,
    InputAdornment
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { useQuery, useMutation } from '@apollo/client/react'; // Ensure hooks are imported from react package if @apollo/client doesn't expose them directly in this setup
import { gql } from '@apollo/client';
import { azul } from '@/ui/colores';

// GraphQL Queries & Mutations
const GET_RUBROS_PROVEEDOR = gql`
  query ObtenerRubrosPorProveedor($proveedorId: ID!) {
    rubrosPorProveedor(proveedorId: $proveedorId) {
      rubroId
      rubroNombre
      porcentajeRecargo
      porcentajeDescuento
    }
  }
`;

const CONFIGURAR_RUBRO_PROVEEDOR = gql`
  mutation ConfigurarRubroProveedor($proveedorId: Int!, $rubroId: Int!, $recargo: Float!, $descuento: Float!) {
    configurarRubroProveedor(proveedorId: $proveedorId, rubroId: $rubroId, recargo: $recargo, descuento: $descuento)
  }
`;

interface RubroConfig {
    rubroId: number;
    rubroNombre: string;
    porcentajeRecargo: number;
    porcentajeDescuento: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
    proveedorId: number;
    proveedorNombre: string;
}

export default function ModalConfigurarRubrosProveedor({ open, onClose, proveedorId, proveedorNombre }: Props) {
    const [rubros, setRubros] = useState<RubroConfig[]>([]);
    const [loadingIds, setLoadingIds] = useState<number[]>([]); // Track which items are saving
    const [globalError, setGlobalError] = useState<string>('');

    const { data, loading, error, refetch } = useQuery<{ rubrosPorProveedor: any[] }>(GET_RUBROS_PROVEEDOR, {
        variables: { proveedorId },
        skip: !open || !proveedorId,
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        if (data?.rubrosPorProveedor) {
            setRubros(data.rubrosPorProveedor.map((r: any) => ({
                ...r,
                porcentajeRecargo: r.porcentajeRecargo || 0,
                porcentajeDescuento: r.porcentajeDescuento || 0
            })));
        }
    }, [data]);

    const [configurarRubro] = useMutation(CONFIGURAR_RUBRO_PROVEEDOR);

    const handleUpdateValue = (id: number, field: 'porcentajeRecargo' | 'porcentajeDescuento', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) && value !== '') return;

        setRubros(prev => prev.map(r =>
            r.rubroId === id ? { ...r, [field]: value === '' ? 0 : numValue } : r
        ));
    };

    const handleSaveLine = async (rubro: RubroConfig) => {
        setLoadingIds(prev => [...prev, rubro.rubroId]);
        setGlobalError('');

        try {
            await configurarRubro({
                variables: {
                    proveedorId: Number(proveedorId),
                    rubroId: rubro.rubroId,
                    recargo: rubro.porcentajeRecargo,
                    descuento: rubro.porcentajeDescuento
                }
            });
        } catch (err: any) {
            console.error(err);
            setGlobalError(`Error al guardar ${rubro.rubroNombre}: ${err.message}`);
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== rubro.rubroId));
        }
    };

    // Re-fetch on open
    useEffect(() => {
        if (open) {
            refetch().catch(console.error);
        }
    }, [open, refetch]);

    // Match styles from ModalEditarProveedor
    const COLORS = {
        primary: '#2e7d32', // Green
        secondary: '#546e7a',
        header: '#2e7d32',
        bg: '#f8f9fa'
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                elevation: 4,
                square: true,
                sx: {
                    borderRadius: 0,
                    bgcolor: '#ffffff',
                    // Removed the 1px solid #e0e0e0 border as requested
                }
            }}
        >
            <Box sx={{
                bgcolor: COLORS.primary,
                color: '#ffffff',
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `4px solid ${COLORS.secondary}`,
                borderRadius: 0,
            }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Icon icon="mdi:tune-vertical" width={24} height={24} />
                    <Box>
                        <Typography variant="h6" fontWeight={600} letterSpacing={0.5}>
                            CONFIGURAR RUBROS
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
                            {proveedorNombre}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <Icon icon="mdi:close" width={24} />
                </IconButton>
            </Box>

            <DialogContent sx={{ bgcolor: COLORS.bg, p: 3 }}>
                {loading && <Box p={4} textAlign="center"><CircularProgress /></Box>}

                {globalError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setGlobalError('')}>
                        {globalError}
                    </Alert>
                )}

                {!loading && rubros.length === 0 && (
                    <Alert severity="info" sx={{ borderRadius: 0 }}>
                        Este proveedor no tiene rubros asignados. Asignales rubros en la edición principal primero.
                    </Alert>
                )}

                {!loading && rubros.length > 0 && (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                            Ajustes por Rubro
                        </Typography>

                        {rubros.map((rubro) => {
                            const isSaving = loadingIds.includes(rubro.rubroId);
                            return (
                                <Paper
                                    key={rubro.rubroId}
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        flexWrap: 'wrap',
                                        borderColor: loadingIds.includes(rubro.rubroId) ? COLORS.primary : '#e0e0e0',
                                        transition: 'border-color 0.3s',
                                        bgcolor: '#ffffff'
                                    }}
                                >
                                    <Box flex={1} minWidth={200}>
                                        <Typography variant="subtitle1" fontWeight={600} color="#37474f">
                                            {rubro.rubroNombre}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={2} alignItems="center">
                                        <TextField
                                            label="Recargo (%)"
                                            type="number"
                                            size="small"
                                            value={rubro.porcentajeRecargo}
                                            onChange={(e) => handleUpdateValue(rubro.rubroId, 'porcentajeRecargo', e.target.value)}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                            }}
                                            sx={{
                                                width: 130,
                                                '& .MuiOutlinedInput-root': { borderRadius: 0 },
                                                '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary },
                                                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: COLORS.primary }
                                            }}
                                        />

                                        <TextField
                                            label="Descuento (%)"
                                            type="number"
                                            size="small"
                                            value={rubro.porcentajeDescuento}
                                            onChange={(e) => handleUpdateValue(rubro.rubroId, 'porcentajeDescuento', e.target.value)}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                            }}
                                            sx={{
                                                width: 130,
                                                '& .MuiOutlinedInput-root': { borderRadius: 0 },
                                                '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary },
                                                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: COLORS.primary }
                                            }}
                                        />

                                        <Tooltip title="Guardar cambios para este rubro">
                                            <IconButton
                                                onClick={() => handleSaveLine(rubro)}
                                                disabled={isSaving}
                                                sx={{
                                                    color: COLORS.primary,
                                                    bgcolor: isSaving ? 'transparent' : alpha(COLORS.primary, 0.1),
                                                    '&:hover': { bgcolor: alpha(COLORS.primary, 0.2) },
                                                    borderRadius: 0,
                                                    width: 40,
                                                    height: 40
                                                }}
                                            >
                                                {isSaving ? <CircularProgress size={20} /> : <Icon icon="mdi:content-save" />}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 0,
                        textTransform: 'none',
                        color: COLORS.secondary,
                        borderColor: COLORS.secondary,
                        '&:hover': {
                            borderColor: COLORS.secondary,
                            bgcolor: alpha(COLORS.secondary, 0.1)
                        }
                    }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
