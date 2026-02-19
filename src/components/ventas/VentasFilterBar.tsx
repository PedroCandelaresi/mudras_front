import React from 'react';
import { Box, Button, TextField, MenuItem, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useQuery } from '@apollo/client/react';
import { OBTENER_USUARIOS_AUTH, UsuariosAuthResponse } from './caja-registradora/graphql/queries';
import { grisRojizo } from '@/ui/colores';

export interface VentasFilterBarProps {
    fechaDesde: Date | null;
    fechaHasta: Date | null;
    usuarioId: string;
    medioPago: string;
    onFechaDesdeChange: (date: Date | null) => void;
    onFechaHastaChange: (date: Date | null) => void;
    onUsuarioChange: (userId: string) => void;
    onMedioPagoChange: (medio: string) => void;
    onQuickDateChange: (range: 'hoy' | 'semana' | 'mes' | null) => void;
    onClear: () => void;
    onFilter: () => void;
}

export function VentasFilterBar({
    fechaDesde,
    fechaHasta,
    usuarioId,
    medioPago,
    onFechaDesdeChange,
    onFechaHastaChange,
    onUsuarioChange,
    onMedioPagoChange,
    onQuickDateChange,
    onClear,
    onFilter,
}: VentasFilterBarProps) {
    const [quickDate, setQuickDate] = React.useState<'hoy' | 'semana' | 'mes' | null>(null);

    const { data: userData } = useQuery<UsuariosAuthResponse>(OBTENER_USUARIOS_AUTH, {
        variables: { 
            filtros: { 
                limite: 100,
                offset: 0
            } 
        },
        fetchPolicy: 'cache-and-network'
    });

    const handleQuickDate = (event: React.MouseEvent<HTMLElement>, newAlignment: 'hoy' | 'semana' | 'mes' | null) => {
        setQuickDate(newAlignment);
        onQuickDateChange(newAlignment);
    };

    const mediosPago = [
        { value: 'EFECTIVO', label: 'Efectivo' },
        { value: 'TARJETA_CREDITO', label: 'Tarjeta Crédito' },
        { value: 'TARJETA_DEBITO', label: 'Tarjeta Débito' },
        { value: 'TRANSFERENCIA', label: 'Transferencia' },
        { value: 'MERCADO_PAGO', label: 'Mercado Pago' },
        { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente' },
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: `1px solid ${grisRojizo.borderInner}`
            }}>
                <Box display="flex" gap={1} alignItems="center">
                    <DatePicker
                        label="Desde"
                        value={fechaDesde}
                        onChange={onFechaDesdeChange}
                        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
                    />
                    <DatePicker
                        label="Hasta"
                        value={fechaHasta}
                        onChange={onFechaHastaChange}
                        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
                    />
                </Box>

                <ToggleButtonGroup
                    value={quickDate}
                    exclusive
                    onChange={handleQuickDate}
                    size="small"
                    sx={{ '& .MuiToggleButton-root': { color: grisRojizo.primary, '&.Mui-selected': { bgcolor: grisRojizo.chipBg, color: grisRojizo.textStrong } } }}
                >
                    <ToggleButton value="hoy">Hoy</ToggleButton>
                    <ToggleButton value="semana">Semana</ToggleButton>
                    <ToggleButton value="mes">Mes</ToggleButton>
                </ToggleButtonGroup>

                <TextField
                    select
                    label="Vendedor"
                    size="small"
                    value={usuarioId}
                    onChange={(e) => onUsuarioChange(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="">Todos los usuarios</MenuItem>
                    {userData?.usuariosAuth?.items.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                            {u.displayName || u.email}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Medio de Pago"
                    size="small"
                    value={medioPago}
                    onChange={(e) => onMedioPagoChange(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {mediosPago.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                            {m.label}
                        </MenuItem>
                    ))}
                </TextField>

                <Box display="flex" gap={1} ml="auto">
                    <Button
                        variant="outlined"
                        onClick={() => { setQuickDate(null); onClear(); }}
                        sx={{ color: grisRojizo.primary, borderColor: grisRojizo.borderOuter }}
                    >
                        Limpiar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onFilter}
                        sx={{ bgcolor: grisRojizo.primary, '&:hover': { bgcolor: grisRojizo.primaryHover } }}
                    >
                        Filtrar
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
}
