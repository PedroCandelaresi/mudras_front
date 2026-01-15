"use client";

import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Checkbox,
  Stack,
  Tooltip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconShoppingCart,
} from '@tabler/icons-react';

export interface ArticuloCapturado {
  id: number;
  Codigo: string;
  Descripcion: string;
  PrecioVenta: number;
  PrecioCompra?: number;
  Deposito: number;
  StockMinimo: number;
  EnPromocion: boolean;
  stockDisponible: number;
  stockDespuesVenta: number;
  alertaStock: boolean;
  Unidad: string;
  Rubro: string;
  rubro: {
    id?: number;
    Descripcion?: string;
    Id?: number;
    Rubro?: string;
    PorcentajeRecargo?: number | null;
    PorcentajeDescuento?: number | null;
  };
  proveedor: {
    IdProveedor: number;
    Nombre: string;
    PorcentajeRecargoProveedor?: number | null;
    PorcentajeDescuentoProveedor?: number | null;
  };
  puntoOrigenId?: number | null;
  cantidad: number;
  subtotal: number;
  seleccionado: boolean;
}

interface TablaArticulosCapturadosProps {
  articulos: ArticuloCapturado[];
  onActualizarCantidad: (articuloId: number, nuevaCantidad: number) => void;
  onEliminarArticulo: (articuloId: number) => void;
  onToggleSeleccion: (articuloId: number) => void;
  onToggleSeleccionTodos: () => void;
  onNuevaVenta: () => void;
}

export const TablaArticulosCapturados: React.FC<TablaArticulosCapturadosProps> = ({
  articulos,
  onActualizarCantidad,
  onEliminarArticulo,
  onToggleSeleccion,
  onToggleSeleccionTodos,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [editando, setEditando] = useState<number | null>(null);
  const [cantidadTemporal, setCantidadTemporal] = useState<string>('');

  const totalCarrito = useMemo(
    () => articulos.reduce((total, articulo) => total + articulo.subtotal, 0),
    [articulos]
  );

  const articulosSeleccionados = useMemo(
    () => articulos.filter((articulo) => articulo.seleccionado),
    [articulos]
  );

  const totalSeleccionados = articulosSeleccionados.length;
  // const subtotalSeleccionados = articulosSeleccionados.reduce((total, articulo) => total + articulo.subtotal, 0);
  const haySeleccionados = totalSeleccionados > 0;
  const todosMarcados = haySeleccionados && totalSeleccionados === articulos.length;

  const articulosPaginados = useMemo(
    () =>
      articulos.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [articulos, page, rowsPerPage]
  );

  const manejarEdicion = (articulo: ArticuloCapturado) => {
    setEditando(articulo.id);
    setCantidadTemporal(articulo.cantidad.toString());
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setCantidadTemporal('');
  };

  const confirmarEdicion = (articuloId: number) => {
    const nuevaCantidad = parseFloat(cantidadTemporal);
    if (!Number.isNaN(nuevaCantidad) && nuevaCantidad > 0) {
      onActualizarCantidad(articuloId, nuevaCantidad);
    }
    cancelarEdicion();
  };

  const manejarCambioCantidad = (valor: string) => {
    setCantidadTemporal(valor);
  };

  const handleChangePage = (_: unknown, nuevaPagina: number) => {
    setPage(nuevaPagina);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaCantidad = parseInt(event.target.value, 10);
    setRowsPerPage(nuevaCantidad);
    setPage(0);
  };

  if (articulos.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 0,
          bgcolor: '#fff',
          border: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Carrito de Venta
        </Typography>
        <Box textAlign="center" py={6}>
          <IconShoppingCart size={48} color="#bdbdbd" />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Aún no hay artículos añadidos al carrito
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busca artículos y agrégalos para comenzar la venta
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 0,
        bgcolor: '#fff',
        border: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 420,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} gap={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Carrito de Venta ({articulos.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seleccionados: {totalSeleccionados} · Total artículos: {articulos.length}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
            TOTAL
          </Typography>
          <Typography variant="h5" fontWeight={800} color="#5d4037">
            ${totalCarrito.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <TableContainer sx={{ bgcolor: '#fff', borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: '#f5f5f5' }}>
                <Checkbox
                  indeterminate={haySeleccionados && !todosMarcados}
                  checked={todosMarcados}
                  onChange={() => onToggleSeleccionTodos()}
                  color="default"
                />
              </TableCell>
              <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>CÓDIGO</TableCell>
              <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>DESCRIPCIÓN</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>PRECIO</TableCell>
              <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>STOCK</TableCell>
              <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>CANTIDAD</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>SUBTOTAL</TableCell>
              <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {articulosPaginados.map((articulo) => {
              const alertaStock = articulo.alertaStock || articulo.stockDisponible <= 0;

              return (
                <TableRow key={articulo.id} hover selected={articulo.seleccionado}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={articulo.seleccionado}
                      onChange={() => onToggleSeleccion(articulo.id)}
                      color="default"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {articulo.Codigo}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {articulo.Descripcion}
                    </Typography>
                    {alertaStock && (
                      <Typography variant="caption" color="error">
                        Stock crítico: disponible {articulo.stockDisponible}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    ${articulo.PrecioVenta.toLocaleString()}
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body2" color={alertaStock ? 'error' : 'text.secondary'}>
                      {articulo.stockDisponible}
                    </Typography>
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 140 }}>
                    {editando === articulo.id ? (
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <TextField
                          value={cantidadTemporal}
                          onChange={(e) => manejarCambioCantidad(e.target.value)}
                          size="small"
                          type="number"
                          InputProps={{ sx: { borderRadius: 0, textAlign: 'center' } }}
                          inputProps={{ min: 0, step: '0.01', style: { width: 60, textAlign: 'center' } }}
                          autoFocus
                          onKeyUp={(event) => {
                            if (event.key === 'Enter') confirmarEdicion(articulo.id);
                            if (event.key === 'Escape') cancelarEdicion();
                          }}
                        />
                        <Tooltip title="Confirmar">
                          <IconButton
                            onClick={() => confirmarEdicion(articulo.id)}
                            size="small"
                            sx={{ color: '#2e7d32', bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' } }}
                          >
                            <IconCheck size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton
                            onClick={cancelarEdicion}
                            size="small"
                            sx={{ color: '#616161', '&:hover': { bgcolor: '#f5f5f5' } }}
                          >
                            <IconX size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Typography variant="body2" fontWeight={600}>
                          {articulo.cantidad}
                        </Typography>
                        <Tooltip title="Editar cantidad">
                          <IconButton
                            onClick={() => manejarEdicion(articulo)}
                            size="small"
                            sx={{ color: '#5d4037' }}
                          >
                            <IconEdit size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      ${articulo.subtotal.toLocaleString()}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Eliminar del carrito">
                      <IconButton
                        onClick={() => onEliminarArticulo(articulo.id)}
                        size="small"
                        sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={articulos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Filas por página"
        sx={{ mt: 'auto', borderTop: '1px solid #e0e0e0' }}
      />
    </Paper>
  );
};
