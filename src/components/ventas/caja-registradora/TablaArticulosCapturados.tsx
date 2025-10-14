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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconShoppingCart,
} from '@tabler/icons-react';
import { CrystalIconButton } from '@/components/ui/CrystalButton';

export interface ArticuloCapturado {
  id: number;
  Codigo: string;
  Descripcion: string;
  PrecioVenta: number;
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
  };
  proveedor: {
    IdProveedor: number;
    Nombre: string;
  };
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
  const subtotalSeleccionados = articulosSeleccionados.reduce((total, articulo) => total + articulo.subtotal, 0);
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
          borderRadius: 2,
          bgcolor: (t) => alpha(t.palette.background.paper, 0.3), // 70% transparente
          backdropFilter: 'saturate(110%) blur(2px)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
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
        borderRadius: 2,
        bgcolor: (t) => alpha(t.palette.background.paper, 0.3), // 70% transparente
        backdropFilter: 'saturate(110%) blur(2px)',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 420,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} gap={2}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Carrito de Venta ({articulos.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seleccionados: {totalSeleccionados} · Total artículos: {articulos.length}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="subtitle2" fontWeight={700}>
            Total
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            ${totalCarrito.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <TableContainer
        sx={{
          bgcolor: 'transparent',
          borderRadius: 1.5,
        }}
      >
        <Table size="small" stickyHeader
          sx={{
            '& .MuiTableCell-root': { bgcolor: 'transparent' },
            '& .MuiTableHead-root .MuiTableCell-head': {
              bgcolor: (t) => alpha(t.palette.background.default, 0.35),
              backdropFilter: 'saturate(110%) blur(2px)',
              fontWeight: 700,
            },
            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
              bgcolor: (t) => alpha(t.palette.common.white, 0.06),
            },
            '& .MuiTableBody-root .MuiTableRow-root.MuiTableRow-hover:hover .MuiTableCell-root': {
              bgcolor: (t) => alpha(t.palette.common.white, 0.12),
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={haySeleccionados && !todosMarcados}
                  checked={todosMarcados}
                  onChange={() => onToggleSeleccionTodos()}
                />
              </TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Descripción</TableCell>
              {/* Rubro eliminado */}
              <TableCell align="right">Precio</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="center">Cantidad</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="center">Acciones</TableCell>
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

                  {/* Columna de Rubro eliminada */}

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
                          inputProps={{ min: 0, step: '0.01', style: { width: 76, textAlign: 'center' } }}
                          autoFocus
                          onKeyUp={(event) => {
                            if (event.key === 'Enter') confirmarEdicion(articulo.id);
                            if (event.key === 'Escape') cancelarEdicion();
                          }}
                        />
                        <Tooltip title="Confirmar">
                          <CrystalIconButton
                            baseColor="#2e7d32"
                            onClick={() => confirmarEdicion(articulo.id)}
                            sx={{ width: 30, height: 30 }}
                          >
                            <IconCheck size={16} />
                          </CrystalIconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <CrystalIconButton
                            baseColor="#616161"
                            onClick={cancelarEdicion}
                            sx={{ width: 30, height: 30 }}
                          >
                            <IconX size={16} />
                          </CrystalIconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Typography variant="body2" fontWeight={600}>
                          {articulo.cantidad}
                        </Typography>
                        <Tooltip title="Editar cantidad">
                          <CrystalIconButton
                            baseColor="#2e7d32"
                            onClick={() => manejarEdicion(articulo)}
                            sx={{ width: 30, height: 30 }}
                          >
                            <IconEdit size={16} />
                          </CrystalIconButton>
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
                      <CrystalIconButton
                        baseColor="#c62828"
                        onClick={() => onEliminarArticulo(articulo.id)}
                        sx={{ width: 30, height: 30 }}
                      >
                        <IconTrash size={16} />
                      </CrystalIconButton>
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
        sx={{ mt: 'auto' }}
      />
    </Paper>
  );
};
