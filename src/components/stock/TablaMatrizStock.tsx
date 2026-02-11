'use client';

import React, { useState, useMemo } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    Chip,
    Tooltip,
    IconButton,
    TablePagination,
    TextField,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { IconArrowsLeftRight } from '@tabler/icons-react';
import { verdeMilitar } from '@/ui/colores';

export interface StockPunto {
    puntoId: number;
    puntoNombre: string;
    cantidad: number;
}

export interface ArticuloMatriz {
    id: number;
    codigo?: string;
    nombre: string;
    rubro?: string;
    stockTotal: number;
    stockPorPunto: StockPunto[];
}

export interface PuntoMudras {
    id: number;
    nombre: string;
    tipo: 'venta' | 'deposito';
    activo: boolean;
}

interface TablaMatrizStockProps {
    articulos: ArticuloMatriz[];
    puntos: PuntoMudras[];
    loading: boolean;
    onTransferir: (articulo: ArticuloMatriz, puntoOriginId?: number) => void;
}

const TablaMatrizStock: React.FC<TablaMatrizStockProps> = ({
    articulos,
    puntos,
    loading,
    onTransferir
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [localSearch, setLocalSearch] = useState('');

    // Client-side filtering for immediate feedback if the list is loaded,
    // though the page likely does server-side filtering too. 
    // We'll trust the passed 'articulos' are already filtered by server if needed,
    // but if we want strictly client side pagination on the result set:

    const filteredArticulos = useMemo(() => {
        if (!localSearch) return articulos;
        const lower = localSearch.toLowerCase();
        return articulos.filter(a =>
            (a.nombre?.toLowerCase().includes(lower)) ||
            (a.codigo?.toLowerCase().includes(lower))
        );
    }, [articulos, localSearch]);

    const displayedArticulos = useMemo(() => {
        return filteredArticulos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredArticulos, page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const COLORS = {
        header: verdeMilitar.primary, // Using the militar green from the theme
        headerText: '#FFFFFF',
        stripe: verdeMilitar.tableStriped,
        hover: alpha(verdeMilitar.primary, 0.12),
        textPrimary: '#2b4735', // Darker green for text
    };

    return (
        <Paper elevation={0} sx={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden' }}>

            {/* Optional internal toolbar if we move logic here, but Page handles main filters. 
          We can keep a local search here or rely on parent. 
          Let's assume parent handles main search, but client-side quick filter is nice for pagination.
      */}

            <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                        <CircularProgress sx={{ color: COLORS.header }} />
                    </Box>
                ) : (
                    <Table stickyHeader size="small" sx={{
                        '& .MuiTableRow-root': { minHeight: 56, transition: 'background-color 0.2s' },
                        '& .MuiTableCell-root': { fontSize: '0.85rem', px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0', color: '#37474f' },
                        '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': { bgcolor: COLORS.stripe },
                        '& .MuiTableBody-root .MuiTableRow-root:hover': { bgcolor: COLORS.hover },
                        '& .MuiTableCell-head': {
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            bgcolor: COLORS.header,
                            color: COLORS.headerText,
                            letterSpacing: '0.5px'
                        },
                    }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ minWidth: 120 }}>CÓDIGO</TableCell>
                                <TableCell sx={{ width: '25%', minWidth: 250 }}>ARTÍCULO</TableCell>
                                <TableCell align="center" sx={{ minWidth: 100, bgcolor: darken(COLORS.header, 0.1) }}>TOTAL</TableCell> {/* Highlight Total */}
                                {puntos.map((punto) => (
                                    <TableCell key={punto.id} align="center" sx={{ minWidth: 120 }}>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <span>{punto.nombre}</span>
                                            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 400, textTransform: 'none' }}>
                                                {punto.tipo === 'deposito' ? '(Depósito)' : '(Venta)'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                ))}
                                <TableCell align="center" sx={{ minWidth: 80 }}>ACCIONES</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedArticulos.map((articulo) => (
                                <TableRow key={articulo.id} hover>
                                    <TableCell>
                                        <Chip
                                            label={articulo.codigo || '—'}
                                            size="small"
                                            variant={articulo.codigo ? 'filled' : 'outlined'}
                                            sx={{
                                                borderRadius: 1,
                                                bgcolor: articulo.codigo ? '#eeeeee' : 'transparent',
                                                fontWeight: 600,
                                                color: '#424242',
                                                height: 24
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.textPrimary }}>
                                                {articulo.nombre}
                                            </Typography>
                                            {articulo.rubro && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {articulo.rubro}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" fontWeight={800} color="text.primary">
                                            {articulo.stockTotal}
                                        </Typography>
                                    </TableCell>
                                    {puntos.map((punto) => {
                                        const stockPunto = articulo.stockPorPunto.find((s) => s.puntoId === punto.id);
                                        const cantidad = stockPunto?.cantidad || 0;
                                        return (
                                            <TableCell key={punto.id} align="center">
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    <Typography
                                                        color={cantidad > 0 ? 'textPrimary' : 'textSecondary'}
                                                        fontWeight={cantidad > 0 ? 700 : 400}
                                                        sx={{ opacity: cantidad === 0 ? 0.5 : 1 }}
                                                    >
                                                        {cantidad}
                                                    </Typography>
                                                    {cantidad > 0 && (
                                                        <Tooltip title={`Transferir desde ${punto.nombre}`}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => onTransferir(articulo, punto.id)}
                                                                sx={{
                                                                    color: COLORS.header,
                                                                    width: 24,
                                                                    height: 24,
                                                                    padding: 0.5,
                                                                    opacity: 0,
                                                                    transition: 'opacity 0.2s',
                                                                    '.MuiTableRow-root:hover &': { opacity: 1 } // Only show on hover
                                                                }}
                                                            >
                                                                <IconArrowsLeftRight size={14} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell align="center">
                                        <Tooltip title="Transferir Stock">
                                            <IconButton
                                                onClick={() => onTransferir(articulo)}
                                                sx={{
                                                    color: COLORS.header,
                                                    transition: 'transform 0.2s',
                                                    '&:hover': { bgcolor: alpha(COLORS.header, 0.1), transform: 'scale(1.1)' }
                                                }}
                                            >
                                                <IconArrowsLeftRight size={20} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {displayedArticulos.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4 + puntos.length} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body1" color="text.secondary" fontStyle="italic">
                                            No se encontraron artículos con los filtros actuales.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[20, 50, 100, 200]}
                component="div"
                count={filteredArticulos.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
            />
        </Paper>
    );
};

export default TablaMatrizStock;
