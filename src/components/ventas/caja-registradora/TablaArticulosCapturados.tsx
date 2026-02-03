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
import { alpha } from '@mui/material/styles';
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconShoppingCart,
} from '@tabler/icons-react';
import { grisRojizo } from "@/ui/colores";

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
  const [rowsPerPage, setRowsPerPage] = useState(150);
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
    let nuevaCantidad = parseFloat(cantidadTemporal);
    const articulo = articulos.find((a) => a.id === articuloId);

    if (articulo) {
      const u = (articulo.Unidad || '').toLowerCase();
      // Unidades que permiten decimales (peso, volumen, longitud)
      const permiteDecimales = ['gramo', 'kilogramo', 'litro', 'mililitro', 'metro', 'centimentro', 'g', 'kg', 'ml', 'l', 'm', 'cm'].some((x) => u.includes(x));
      if (!permiteDecimales) {
        nuevaCantidad = Math.round(nuevaCantidad);
      } else {
        // Enforce max 1 decimal place as requested ("solo un decimal")
        nuevaCantidad = parseFloat(nuevaCantidad.toFixed(1));
      }
    }

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
          border: `1px solid ${grisRojizo.borderInner}`,
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: grisRojizo.textStrong }}>
          Carrito de Venta
        </Typography>
        <Box textAlign="center" py={6}>
          <IconShoppingCart size={48} color={grisRojizo.borderInner} />
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
        border: `1px solid ${grisRojizo.borderInner}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 420,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} gap={2}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: grisRojizo.textStrong }}>
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
          <Typography variant="h5" fontWeight={800} color={grisRojizo.primary}>
            ${totalCarrito.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <TableContainer sx={{ bgcolor: '#fff', borderRadius: 0, border: `1px solid ${grisRojizo.borderInner}` }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: grisRojizo.headerBg }}>
                <Checkbox
                  indeterminate={haySeleccionados && !todosMarcados}
                  checked={todosMarcados}
                  onChange={() => onToggleSeleccionTodos()}
                  sx={{ color: grisRojizo.headerText, '&.Mui-checked': { color: grisRojizo.headerText }, '&.MuiCheckbox-indeterminate': { color: grisRojizo.headerText } }}
                />
              </TableCell>
              <TableCell sx={{ bgcolor: grisRojizo.headerBg, fontWeight: 700, color: grisRojizo.headerText }}>CÓDIGO</TableCell>
              <TableCell sx={{ bgcolor: grisRojizo.headerBg, fontWeight: 700, color: grisRojizo.headerText }}>DESCRIPCIÓN</TableCell>
              <TableCell align="right" sx={{ bgcolor: grisRojizo.headerBg, fontWeight: 700, color: grisRojizo.headerText }}>PRECIO</TableCell>
              <TableCell align="center" sx={{ bgcolor: grisRojizo.headerBg, fontWeight: 700, color: grisRojizo.headerText }}>STOCK</TableCell>
              <TableCell align="center" sx={{ bgcolor: grisRojizo.headerBg, fontWeight: 700, color: grisRojizo.headerText }}>CANTIDAD</TableCell>
              <TableCell align="right" sx={{ bgcolor: grisRojizo.headerBg, fontWeight: 700, color: grisRojizo.headerText }}>SUBTOTAL</TableCell>
              <TableCell align="center" sx={{ bgcolor: grisRojizo.headerBg, fontWeight: 700, color: grisRojizo.headerText }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {articulosPaginados.map((articulo, index) => {
              const alertaStock = articulo.alertaStock || articulo.stockDisponible <= 0;
              const bgColor = index % 2 === 1 ? grisRojizo.alternateRow : 'inherit';

              return (
                <TableRow
                  key={articulo.id}
                  hover
                  selected={articulo.seleccionado}
                  sx={{
                    bgcolor: bgColor,
                    '&:hover': { bgcolor: grisRojizo.rowHover },
                    '&.Mui-selected': { bgcolor: alpha(grisRojizo.primary, 0.1), '&:hover': { bgcolor: alpha(grisRojizo.primary, 0.2) } }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={articulo.seleccionado}
                      onChange={() => onToggleSeleccion(articulo.id)}
                      color="primary"
                      sx={{ '&.Mui-checked': { color: grisRojizo.primary } }}
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
                          inputProps={{
                            min: 0,
                            step: (() => {
                              const u = (articulo.Unidad || '').toLowerCase();
                              const permiteDecimales = ['gramo', 'kilogramo', 'litro', 'mililitro', 'metro', 'centimetro', 'g', 'kg', 'ml', 'l', 'm', 'cm'].some((x) => u.includes(x));
                              return permiteDecimales ? '0.1' : '1';
                            })(),
                            style: { width: 60, textAlign: 'center' }
                          }}
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
                            sx={{ color: '#2e7d32', bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' }, borderRadius: 0 }}
                          >
                            <IconCheck size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton
                            onClick={cancelarEdicion}
                            size="small"
                            sx={{ color: '#616161', '&:hover': { bgcolor: '#f5f5f5' }, borderRadius: 0 }}
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
                            sx={{ color: grisRojizo.primary }}
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
                        sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee', borderRadius: 0 } }}
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
        rowsPerPageOptions={[50, 100, 150, 300, 500]}
        labelRowsPerPage="Filas por página"
        sx={{ mt: 'auto', borderTop: `1px solid ${grisRojizo.borderInner}` }}
      />
    </Paper>
  );
};
