'use client';

import React from 'react';
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
    alpha
} from '@mui/material';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PaginacionMudrasProps {
    page: number;
    rowsPerPage: number;
    total: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
    rowsPerPageOptions?: number[];
    itemLabel?: string;
    accentColor?: string;
    showArrows?: boolean;
}

const PaginacionMudras: React.FC<PaginacionMudrasProps> = ({
    page,
    rowsPerPage,
    total,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [25, 50, 100, 150, 200],
    itemLabel = 'artículos',
    accentColor = '#1565c0', // Default Blue
    showArrows = true,
}) => {
    const totalPaginas = Math.ceil(total / rowsPerPage);
    const paginaActual = page + 1;

    const generarNumerosPaginas = () => {
        const paginas: (number | '...')[] = [];
        const maxVisible = 7;
        if (totalPaginas <= maxVisible) {
            for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
        } else if (paginaActual <= 4) {
            for (let i = 1; i <= 5; i++) paginas.push(i);
            paginas.push('...', totalPaginas);
        } else if (paginaActual >= totalPaginas - 3) {
            paginas.push(1, '...');
            for (let i = totalPaginas - 4; i <= totalPaginas; i++) paginas.push(i);
        } else {
            paginas.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
        }
        return paginas;
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
            }}
        >
            <Typography variant="caption" color="text.secondary">
                Mostrando {Math.min(rowsPerPage, total - (page * rowsPerPage))} de {total} {itemLabel}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                    select
                    size="small"
                    value={String(rowsPerPage)}
                    onChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
                    sx={{ minWidth: 80 }}
                >
                    {rowsPerPageOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>

                <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                    Página {paginaActual} de {Math.max(1, totalPaginas)}
                </Typography>

                {showArrows && (
                    <IconButton
                        size="small"
                        disabled={page === 0}
                        onClick={() => onPageChange(page - 1)}
                        sx={{
                            borderRadius: 0,
                            border: '1px solid #e0e0e0',
                            '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.05) }
                        }}
                    >
                        <IconChevronLeft size={18} />
                    </IconButton>
                )}

                {generarNumerosPaginas().map((num, idx) =>
                    num === '...' ? (
                        <Box key={`ellipsis-${idx}`} sx={{ px: 1, color: 'text.secondary' }}>...</Box>
                    ) : (
                        <Button
                            key={num}
                            variant={num === paginaActual ? 'contained' : 'outlined'}
                            size="small"
                            sx={{
                                minWidth: 32,
                                px: 1,
                                borderRadius: 0,
                                borderColor: num === paginaActual ? 'transparent' : '#e0e0e0',
                                bgcolor: num === paginaActual ? accentColor : 'transparent',
                                color: num === paginaActual ? '#fff' : 'text.primary',
                                '&:hover': {
                                    borderColor: accentColor,
                                    bgcolor: num === paginaActual ? accentColor : alpha(accentColor, 0.05)
                                }
                            }}
                            onClick={() => onPageChange(num - 1)}
                            disabled={num === paginaActual}
                        >
                            {num}
                        </Button>
                    )
                )}

                {showArrows && (
                    <IconButton
                        size="small"
                        disabled={page >= totalPaginas - 1}
                        onClick={() => onPageChange(page + 1)}
                        sx={{
                            borderRadius: 0,
                            border: '1px solid #e0e0e0',
                            '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.05) }
                        }}
                    >
                        <IconChevronRight size={18} />
                    </IconButton>
                )}
            </Stack>
        </Box>
    );
};

export default PaginacionMudras;
