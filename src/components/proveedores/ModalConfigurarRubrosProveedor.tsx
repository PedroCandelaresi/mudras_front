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
      id
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
    id: number; // ID of the relation (optional usage)
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
            // Show ephemeral success or just stop loading? 
            // We'll rely on the loading state clearing to indicate success.
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

    const COLORS = {
        header: azul.primary,
        bg: '#f8f9fa'
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: 0,
                    border: '1px solid #e0e0e0'
                }
            }}
        >
            <DialogTitle sx={{ bgcolor: COLORS.header, color: 'white', py: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Icon icon="mdi:tune-vertical" width={24} height={24} />
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            Configurar Rubros
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {proveedorNombre}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Ajustá los porcentajes de recargo o descuento para cada rubro específico de este proveedor.
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
                                        borderColor: loadingIds.includes(rubro.rubroId) ? azul.primary : '#e0e0e0',
                                        transition: 'border-color 0.3s'
                                    }}
                                >
                                    <Box flex={1} minWidth={200}>
                                        <Typography variant="subtitle1" fontWeight={600}>
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
                                            sx={{ width: 130, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
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
                                            sx={{ width: 130, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                                        />

                                        <Tooltip title="Guardar cambios para este rubro">
                                            <IconButton
                                                onClick={() => handleSaveLine(rubro)}
                                                disabled={isSaving}
                                                color="primary"
                                                sx={{
                                                    bgcolor: isSaving ? 'transparent' : alpha(azul.primary, 0.1),
                                                    '&:hover': { bgcolor: alpha(azul.primary, 0.2) },
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

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 0 }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
