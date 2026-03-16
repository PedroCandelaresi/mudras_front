import React from 'react';
import { Box, Button, TextField, MenuItem, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { alpha } from '@mui/material/styles';
import { grisRojizo } from '@/ui/colores';

export interface VentasFilterBarProps {
    fechaDesde: Date | null;
    fechaHasta: Date | null;
    usuarioId: string;
    medioPago: string;
    busquedaArticulo: string;
    usuarios: Array<{ id: string; label: string }>;
    onFechaDesdeChange: (date: Date | null) => void;
    onFechaHastaChange: (date: Date | null) => void;
    onUsuarioChange: (userId: string) => void;
    onMedioPagoChange: (medio: string) => void;
    onBusquedaArticuloChange: (value: string) => void;
    onQuickDateChange: (range: 'hoy' | 'semana' | 'mes' | null) => void;
    onClear: () => void;
    onFilter: () => void;
}

const METODOS_PAGO_CAJA = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito' },
    { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'QR_MODO', label: 'QR MODO' },
    { value: 'QR_MERCADOPAGO', label: 'QR MercadoPago' },
    { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente' },
] as const;

export function VentasFilterBar({
    fechaDesde,
    fechaHasta,
    usuarioId,
    medioPago,
    busquedaArticulo,
    usuarios,
    onFechaDesdeChange,
    onFechaHastaChange,
    onUsuarioChange,
    onMedioPagoChange,
    onBusquedaArticuloChange,
    onQuickDateChange,
    onClear,
    onFilter,
}: VentasFilterBarProps) {
    const [quickDate, setQuickDate] = React.useState<'hoy' | 'semana' | 'mes' | null>(null);

    const handleQuickDate = (event: React.MouseEvent<HTMLElement>, newAlignment: 'hoy' | 'semana' | 'mes' | null) => {
        setQuickDate(newAlignment);
        onQuickDateChange(newAlignment);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                p: 2,
                bgcolor: '#f9f9f9',
                borderRadius: 0,
                border: `1px solid ${grisRojizo.borderInner}`
            }}>
                <Box display="flex" gap={1} alignItems="center">
                    <DatePicker
                        label="Desde"
                        value={fechaDesde}
                        onChange={onFechaDesdeChange}
                        slotProps={{ textField: { size: 'small', sx: { width: 150, bgcolor: '#fff' } } }}
                    />
                    <DatePicker
                        label="Hasta"
                        value={fechaHasta}
                        onChange={onFechaHastaChange}
                        slotProps={{ textField: { size: 'small', sx: { width: 150, bgcolor: '#fff' } } }}
                    />
                </Box>

                <ToggleButtonGroup
                    value={quickDate}
                    exclusive
                    onChange={handleQuickDate}
                    size="small"
                    sx={{
                        '& .MuiToggleButton-root': {
                            color: grisRojizo.primary,
                            borderRadius: 0,
                            borderColor: alpha(grisRojizo.primary, 0.2),
                            bgcolor: '#fff',
                            '&.Mui-selected': {
                                bgcolor: alpha(grisRojizo.primary, 0.12),
                                color: grisRojizo.textStrong
                            }
                        }
                    }}
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
                    sx={{ minWidth: 170, bgcolor: '#fff' }}
                >
                    <MenuItem value="">Todos los usuarios</MenuItem>
                    {usuarios.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                            {u.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Medio de Pago"
                    size="small"
                    value={medioPago}
                    onChange={(e) => onMedioPagoChange(e.target.value)}
                    sx={{ minWidth: 170, bgcolor: '#fff' }}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {METODOS_PAGO_CAJA.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                            {m.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Artículo: código o descripción"
                    size="small"
                    value={busquedaArticulo}
                    onChange={(e) => onBusquedaArticuloChange(e.target.value)}
                    sx={{ minWidth: 260, bgcolor: '#fff' }}
                />

                <Box display="flex" gap={1} ml="auto">
                    <Button
                        variant="outlined"
                        onClick={() => { setQuickDate(null); onClear(); }}
                        sx={{ color: grisRojizo.primary, borderColor: grisRojizo.borderOuter, borderRadius: 0, textTransform: 'none' }}
                    >
                        Limpiar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onFilter}
                        sx={{ bgcolor: grisRojizo.primary, borderRadius: 0, textTransform: 'none', '&:hover': { bgcolor: grisRojizo.primaryHover } }}
                    >
                        Filtrar
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
}
