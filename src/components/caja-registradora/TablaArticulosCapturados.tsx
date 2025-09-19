'use client';

import React, { useState } from 'react';
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
  IconButton,
  TextField,
  Checkbox,
  Button,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconShoppingCart,
} from '@tabler/icons-react';
import { ArticuloCaja } from '../../queries/caja-registradora';

interface ArticuloCapturado {
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
    id: number;
    Descripcion: string;
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
  todosSeleccionados: boolean;
  algunoSeleccionado: boolean;
}

export const TablaArticulosCapturados: React.FC<TablaArticulosCapturadosProps> = ({
  articulos,
  onActualizarCantidad,
  onEliminarArticulo,
  onToggleSeleccion,
  onToggleSeleccionTodos,
  onNuevaVenta,
  todosSeleccionados,
  algunoSeleccionado,
}) => {
  const [editando, setEditando] = useState<number | null>(null);
  const [cantidadTemporal, setCantidadTemporal] = useState<string>('');

  const iniciarEdicion = (articulo: ArticuloCapturado) => {
    setEditando(articulo.id);
    setCantidadTemporal(articulo.cantidad.toString());
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setCantidadTemporal('');
  };

  const confirmarEdicion = (articuloId: number) => {
    const nuevaCantidad = parseFloat(cantidadTemporal);
    if (nuevaCantidad > 0) {
      onActualizarCantidad(articuloId, nuevaCantidad);
    }
    setEditando(null);
    setCantidadTemporal('');
  };

  const handleKeyPress = (event: React.KeyboardEvent, articuloId: number) => {
    if (event.key === 'Enter') {
      confirmarEdicion(articuloId);
    } else if (event.key === 'Escape') {
      cancelarEdicion();
    }
  };

  // Calcular totales
  const articulosSeleccionados = articulos.filter(a => a.seleccionado);
  const subtotalSeleccionados = articulosSeleccionados.reduce((sum, a) => sum + a.subtotal, 0);
  const cantidadArticulosSeleccionados = articulosSeleccionados.length;

  if (articulos.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Artículos Capturados
        </Typography>
        <Box textAlign="center" py={4}>
          <IconShoppingCart size={48} color="#ccc" />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No hay artículos capturados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busca y agrega artículos para comenzar una venta
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Artículos Capturados ({articulos.length})
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IconShoppingCart size={16} />}
          onClick={onNuevaVenta}
          disabled={!algunoSeleccionado}
          size="large"
        >
          Nueva Venta ({cantidadArticulosSeleccionados})
        </Button>
      </Box>

      {/* Resumen de selección */}
      {algunoSeleccionado && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              {cantidadArticulosSeleccionados} artículo(s) seleccionado(s)
            </Typography>
            <Typography variant="h6" color="primary">
              Total: ${subtotalSeleccionados.toFixed(2)}
            </Typography>
          </Box>
        </Alert>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={todosSeleccionados}
                  indeterminate={algunoSeleccionado && !todosSeleccionados}
                  onChange={onToggleSeleccionTodos}
                />
              </TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Precio Unit.</TableCell>
              <TableCell align="center">Cantidad</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articulos.map((articulo) => {
              const stockActual = parseFloat(String(articulo.Deposito || 0));
              const stockDespues = stockActual - articulo.cantidad;
              const alertaStock = stockDespues < articulo.StockMinimo;

              return (
                <TableRow
                  key={articulo.id}
                  selected={articulo.seleccionado}
                  hover
                  sx={{
                    backgroundColor: articulo.seleccionado ? 'action.selected' : 'inherit',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={articulo.seleccionado}
                      onChange={() => onToggleSeleccion(articulo.id)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {articulo.Codigo}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {articulo.Descripcion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {articulo.Rubro}
                      </Typography>
                      {articulo.EnPromocion && (
                        <Chip
                          label="Promoción"
                          color="secondary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${articulo.PrecioVenta.toFixed(2)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    {editando === articulo.id ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          size="small"
                          type="number"
                          value={cantidadTemporal}
                          onChange={(e) => setCantidadTemporal(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, articulo.id)}
                          inputProps={{
                            min: 0.1,
                            step: 0.1,
                            style: { textAlign: 'center', width: 60 },
                          }}
                          autoFocus
                        />
                        <IconButton
                          size="small"
                          onClick={() => confirmarEdicion(articulo.id)}
                          color="primary"
                        >
                          <IconCheck size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={cancelarEdicion}
                          color="error"
                        >
                          <IconX size={16} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {articulo.cantidad}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => iniciarEdicion(articulo)}
                        >
                          <IconEdit size={14} />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      ${articulo.subtotal.toFixed(2)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box>
                      <Typography
                        variant="body2"
                        color={alertaStock ? 'error.main' : 'text.primary'}
                      >
                        {stockDespues}
                      </Typography>
                      {alertaStock && (
                        <Chip
                          label="Bajo"
                          color="warning"
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 16 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => onEliminarArticulo(articulo.id)}
                      color="error"
                    >
                      <IconTrash size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totales */}
      <Divider sx={{ my: 2 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Total de artículos: {articulos.length}
        </Typography>
        <Box textAlign="right">
          <Typography variant="h6">
            Total General: ${articulos.reduce((sum, a) => sum + a.subtotal, 0).toFixed(2)}
          </Typography>
          {algunoSeleccionado && (
            <Typography variant="body2" color="primary">
              Seleccionados: ${subtotalSeleccionados.toFixed(2)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
