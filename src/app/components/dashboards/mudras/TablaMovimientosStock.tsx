'use client';
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
  Skeleton,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Stack
} from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_MOVIMIENTOS_STOCK } from '@/app/queries/mudras.queries';
import { Stock } from '@/app/interfaces/mudras.types';
import { MovimientosStockResponse } from '@/app/interfaces/graphql.types';
import { IconSearch, IconTrendingUp, IconTrendingDown, IconRefresh, IconEdit, IconTrash, IconEye, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TablaMovimientosStock = () => {
  const { data, loading, error, refetch } = useQuery<MovimientosStockResponse>(GET_MOVIMIENTOS_STOCK);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');

  // Funciones para manejar acciones
  const handleViewMovimiento = (movimiento: Stock) => {
    console.log('Ver movimiento:', movimiento);
    // TODO: Implementar modal de vista detallada
  };

  const handleEditMovimiento = (movimiento: Stock) => {
    console.log('Editar movimiento:', movimiento);
    // TODO: Implementar modal de edición
  };

  const handleDeleteMovimiento = (movimiento: Stock) => {
    console.log('Eliminar movimiento:', movimiento);
    // TODO: Implementar confirmación y eliminación
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const movimientos: Stock[] = data?.movimientosStock || [];
  
  const movimientosFiltrados = movimientos.filter((movimiento) =>
    movimiento.Codigo?.toLowerCase().includes(filtro.toLowerCase())
  );

  const movimientosPaginados = movimientosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getTipoMovimiento = (stockActual: number, stockAnterior: number) => {
    if (stockActual > stockAnterior) return 'entrada';
    if (stockActual < stockAnterior) return 'salida';
    return 'ajuste';
  };

  const getDiferencia = (stockActual: number, stockAnterior: number) => {
    return stockActual - stockAnterior;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={3}>Movimientos de Stock</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Fecha', 'Código', 'Stock Anterior', 'Stock Actual', 'Diferencia', 'Tipo'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <TableCell key={cell}>
                      <Skeleton variant="text" width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" mb={2}>
          Error al cargar movimientos de stock
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {error.message}
        </Typography>
        <Button 
          variant="contained" 
          color="warning"
          startIcon={<IconRefresh />}
          onClick={() => refetch()}
        >
          Reintentar
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="info.main">
          <IconTrendingUp style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Movimientos de Stock
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por código..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <Button
            variant="outlined"
            color="info"
            startIcon={<IconRefresh />}
            onClick={() => refetch()}
          >
            Actualizar
          </Button>
        </Stack>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'info.light' }}>
              <TableCell sx={{ fontWeight: 600, color: 'info.dark' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'info.dark' }}>Código Artículo</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'info.dark' }}>Stock Anterior</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'info.dark' }}>Stock Actual</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'info.dark' }}>Diferencia</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'info.dark' }}>Tipo Movimiento</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'info.dark' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'info.dark', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientosPaginados.map((movimiento) => {
              const diferencia = getDiferencia(movimiento.Stock || 0, movimiento.StockAnterior || 0);
              const tipoMovimiento = getTipoMovimiento(movimiento.Stock || 0, movimiento.StockAnterior || 0);
              
              return (
                <TableRow 
                  key={movimiento.Id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'info.lighter',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {movimiento.Fecha 
                        ? (() => {
                            try {
                              const fecha = typeof movimiento.Fecha === 'string' 
                                ? new Date(movimiento.Fecha) 
                                : movimiento.Fecha;
                              return format(fecha, 'dd/MM/yyyy', { locale: es });
                            } catch (error) {
                              return 'Fecha inválida';
                            }
                          })()
                        : 'Sin fecha'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                      {movimiento.Codigo || 'Sin código'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {movimiento.StockAnterior || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {movimiento.Stock || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {diferencia > 0 ? (
                        <IconArrowUp size={16} color="#4CAF50" style={{ marginRight: 4 }} />
                      ) : diferencia < 0 ? (
                        <IconArrowDown size={16} color="#F44336" style={{ marginRight: 4 }} />
                      ) : null}
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={diferencia > 0 ? 'success.main' : diferencia < 0 ? 'error.main' : 'text.primary'}
                      >
                        {diferencia > 0 ? '+' : ''}{diferencia}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        tipoMovimiento === 'entrada' ? 'Entrada' :
                        tipoMovimiento === 'salida' ? 'Salida' : 'Ajuste'
                      }
                      color={
                        tipoMovimiento === 'entrada' ? 'success' :
                        tipoMovimiento === 'salida' ? 'error' : 'default'
                      }
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Usuario {movimiento.Usuario || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewMovimiento(movimiento)}
                        >
                          <IconEye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar movimiento">
                        <IconButton 
                          size="small" 
                          color="warning"
                          onClick={() => handleEditMovimiento(movimiento)}
                        >
                          <IconEdit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar movimiento">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteMovimiento(movimiento)}
                        >
                          <IconTrash size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={movimientosFiltrados.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Paper>
  );
};

export default TablaMovimientosStock;
