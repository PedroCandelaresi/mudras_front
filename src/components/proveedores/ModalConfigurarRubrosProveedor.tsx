'use client';

import { useState, useEffect } from 'react';
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
    CircularProgress,
    Alert,
    InputAdornment
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { LoadingButton } from '@mui/lab';

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
    isModified?: boolean;
}

interface Props {
    open: boolean;
    onClose: () => void;
    proveedorId: number;
    proveedorNombre: string;
}

export default function ModalConfigurarRubrosProveedor({ open, onClose, proveedorId, proveedorNombre }: Props) {
    const [rubros, setRubros] = useState<RubroConfig[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [globalError, setGlobalError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const { data, loading, refetch } = useQuery<{ rubrosPorProveedor: any[] }>(GET_RUBROS_PROVEEDOR, {
        variables: { proveedorId },
        skip: !open || !proveedorId,
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        if (data?.rubrosPorProveedor) {
            setRubros(data.rubrosPorProveedor.map((r: any) => ({
                ...r,
                porcentajeRecargo: r.porcentajeRecargo || 0,
                porcentajeDescuento: r.porcentajeDescuento || 0,
                isModified: false
            })));
        }
    }, [data]);

    const [configurarRubro] = useMutation(CONFIGURAR_RUBRO_PROVEEDOR);

    const handleUpdateValue = (id: number, field: 'porcentajeRecargo' | 'porcentajeDescuento', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) && value !== '') return;

        setRubros(prev => prev.map(r =>
            r.rubroId === id ? { ...r, [field]: value === '' ? 0 : numValue, isModified: true } : r
        ));
    };

    const handleSaveAll = async () => {
        const modifiedRubros = rubros.filter(r => r.isModified);
        if (modifiedRubros.length === 0) {
            onClose();
            return;
        }

        setIsSaving(true);
        setGlobalError('');
        setSuccessMessage('');

        try {
            // Save sequentially to avoid overwhelming the server if logic is heavy (recalculation)
            for (const rubro of modifiedRubros) {
                await configurarRubro({
                    variables: {
                        proveedorId: Number(proveedorId),
                        rubroId: rubro.rubroId,
                        recargo: rubro.porcentajeRecargo,
                        descuento: rubro.porcentajeDescuento
                    }
                });
            }

            setSuccessMessage('Rubros configurados correctamente y precios actualizados.');
            // Update modified flags
            setRubros(prev => prev.map(r => ({ ...r, isModified: false })));

            // Optionally close after short delay or let user close
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setGlobalError(`Error al guardar: ${err.message}`);
            setIsSaving(false);
        }
    };

    // Re-fetch on open
    useEffect(() => {
        if (open) {
            refetch().catch(console.error);
            setGlobalError('');
            setSuccessMessage('');
        }
    }, [open, refetch]);

    const COLORS = {
        primary: '#2e7d32',
        secondary: '#546e7a',
        header: '#2e7d32',
        bg: '#f8f9fa'
    };

    const hasChanges = rubros.some(r => r.isModified);

    return (
        <Dialog
            open={open}
            onClose={!isSaving ? onClose : undefined}
            maxWidth="md"
            fullWidth
            PaperProps={{
                elevation: 4,
                square: true,
                sx: { borderRadius: 0, bgcolor: '#ffffff' }
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
                <IconButton onClick={onClose} disabled={isSaving} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
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

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 0 }}>
                        {successMessage}
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

                        {rubros.map((rubro) => (
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
                                    borderColor: rubro.isModified ? COLORS.primary : '#e0e0e0',
                                    borderLeft: rubro.isModified ? `4px solid ${COLORS.primary}` : '1px solid #e0e0e0',
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
                                        disabled={isSaving}
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
                                        disabled={isSaving}
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
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={isSaving}
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
                    Cancelar
                </Button>
                <LoadingButton
                    onClick={handleSaveAll}
                    loading={isSaving}
                    variant="contained"
                    disabled={!hasChanges && !isSaving}
                    sx={{
                        borderRadius: 0,
                        bgcolor: COLORS.primary,
                        color: '#fff',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: alpha(COLORS.primary, 0.9)
                        }
                    }}
                >
                    Guardar Cambios
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
