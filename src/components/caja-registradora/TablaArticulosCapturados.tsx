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
  // todosSeleccionados,
  // algunoSeleccionado,
}) => {
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
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

  const algunoSeleccionado = seleccionados.size > 0;
  const todosSeleccionados = articulos.length > 0 && seleccionados.size === articulos.length;
  const subtotalSeleccionados = articulos
    .filter(a => seleccionados.has(a.id))
    .reduce((sum, a) => sum + a.subtotal, 0);

  const totalPaginas = Math.ceil(articulos.length / rowsPerPage);
  const paginaActual = page + 1;

  const generarNumerosPaginas = () => {
    const paginas = [];
    const maxVisible = 7; // Máximo de páginas visibles
    
    if (totalPaginas <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para truncar páginas
      if (paginaActual <= 4) {
        // Inicio: 1, 2, 3, 4, 5, ..., última
        for (let i = 1; i <= 5; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        // Final: 1, ..., n-4, n-3, n-2, n-1, n
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        // Medio: 1, ..., actual-1, actual, actual+1, ..., última
        paginas.push(1);
        paginas.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

  const articulosPaginados = articulos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const cantidadArticulosSeleccionados = articulos.filter(a => seleccionados.has(a.id)).length;

  if (articulos.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
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
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
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
            {articulosPaginados.map((articulo) => {
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

      {/* Paginación personalizada */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Filas por página:
          </Typography>
          <TextField
            select
            size="small"
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            sx={{ minWidth: 80 }}
          >
            {[50, 100, 150].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, articulos.length)} de ${articulos.length}`}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {generarNumerosPaginas().map((numeroPagina, index) => (
              <Box key={index}>
                {numeroPagina === '...' ? (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                    ...
                  </Typography>
                ) : (
                  <Button
                    size="small"
                    variant={paginaActual === numeroPagina ? 'contained' : 'text'}
                    onClick={() => handleChangePage(null, (numeroPagina as number) - 1)}
                    sx={{
                      minWidth: 32,
                      height: 32,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      ...(paginaActual === numeroPagina ? {
                        bgcolor: 'info.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'info.dark' }
                      } : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'info.light', color: 'info.dark' }
                      })
                    }}
                  >
                    {numeroPagina}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={() => handleChangePage(null, 0)}
              disabled={page === 0}
              sx={{ color: 'text.secondary' }}
              title="Primera página"
            >
              ⏮
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
              sx={{ color: 'text.secondary' }}
              title="Página anterior"
            >
              ◀
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ color: 'text.secondary' }}
              title="Página siguiente"
            >
              ▶
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleChangePage(null, totalPaginas - 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ color: 'text.secondary' }}
              title="Última página"
            >
              ⏭
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Totales */}
      <Divider sx={{ my: 2 }} />
      <Box display="flex" justifyContent="flex-end" alignItems="center">
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
