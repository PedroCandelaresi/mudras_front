'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Paper,
  Stack,
  Skeleton,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@apollo/client/react';
import {
  IconEye,
  IconArrowRight,
  IconBuildingWarehouse,
  IconBuildingStore,
  IconUser,
  IconCalendar,
  IconPackage,
  IconNotes
} from '@tabler/icons-react';
import { Icon } from '@iconify/react';

import { GET_MOVIMIENTOS_STOCK_FULL } from '@/components/articulos/graphql/queries';
import { borgoña } from '@/ui/colores';
import SearchToolbar from '@/components/ui/SearchToolbar';

// -- Interfaces locales para la respuesta de la query nueva --
interface PuntoResumen {
  id: number;
  nombre: string;
  tipo: string;
}

interface MovimientoFull {
  id: number;
  fechaMovimiento: string;
  tipoMovimiento: string;
  cantidad: number;
  cantidadAnterior?: number;
  cantidadNueva?: number;
  motivo?: string;
  puntoOrigen?: PuntoResumen;
  puntoDestino?: PuntoResumen;
  articulo?: {
    id: number;
    Codigo: string;
    Descripcion: string;
    ImagenUrl?: string;
    Rubro?: string;
  };
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    username: string;
  };
}

interface MovimientosFullData {
  movimientosStockFull: {
    total: number;
    movimientos: MovimientoFull[];
  };
}

// -- Configuración de Tema --
const theme = borgoña; // Usamos borgoña para Logs/Stock Movimientos

// -- Helpers de Formateo --
const formatearFecha = (fechaISO: string) => {
  if (!fechaISO) return '—';
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fechaISO));
  } catch {
    return '—';
  }
};

const getTipoLabel = (tipo: string) => {
  switch (tipo) {
    case 'venta': return 'VENTA';
    case 'entrada': return 'ENTRADA';
    case 'salida': return 'SALIDA';
    case 'transferencia': return 'TRANSFERENCIA';
    case 'ajuste': return 'AJUSTE';
    case 'devolucion': return 'DEVOLUCIÓN';
    default: return tipo.toUpperCase();
  }
};

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'venta': return { bg: '#e8f5e9', text: '#2e7d32' }; // Verde éxito
    case 'entrada': return { bg: '#e3f2fd', text: '#1565c0' }; // Azul entrada
    case 'salida': return { bg: '#ffebee', text: '#c62828' }; // Rojo salida
    case 'transferencia': return { bg: '#e0f7fa', text: '#006064' }; // Cyan transf
    case 'ajuste': return { bg: '#fff3e0', text: '#e65100' }; // Naranja ajuste
    case 'devolucion': return { bg: '#f3e5f5', text: '#7b1fa2' }; // Violeta devol
    default: return { bg: '#f5f5f5', text: '#616161' };
  }
};

const TablaMovimientosStock = () => {
  // Estado de filtros y paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>(''); // '' = todos

  // Query Apollo
  const { data, loading, error, refetch } = useQuery<MovimientosFullData>(GET_MOVIMIENTOS_STOCK_FULL, {
    variables: {
      input: {
        offset: page * rowsPerPage,
        limite: rowsPerPage,
        // No enviamos 'busqueda' porque el input FiltrosMovimientosInput no tiene busqueda texto general,
        // suele filtrar por articuloId o fechas.
        // Si queremos filtrar por texto, idealmente el backend debe soportarlo.
        // Por ahora, asumimos filtro en cliente o que 'busqueda' no está implementada en backend para movimientos.
        // Re-check FiltrosMovimientosInput: tiene tipoMovimiento, fechaDesde, fechaHasta, articuloId. NO TIENE busqueda texto.
        // TODO: Implementar búsqueda por texto en backend si es crítico. Por ahora filtramos en cliente lo que llega (limitado a página actual no es ideal).
        // Sin embargo, mostraremos los datos tal cual vienen paginados.
        tipoMovimiento: filtroTipo || undefined,
      }
    },
    fetchPolicy: 'cache-and-network',
  });

  const movimientos = data?.movimientosStockFull?.movimientos || [];
  const totalPaginas = Math.ceil((data?.movimientosStockFull?.total || 0) / rowsPerPage);

  // Manejadores
  const handleChangePage = (newPage: number) => setPage(newPage);

  const handleRefresh = () => {
    void refetch();
  };

  if (loading && !data) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error" gutterBottom>Ocurrió un error al cargar los movimientos.</Typography>
        <Button onClick={handleRefresh} variant="outlined">Reintentar</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header / Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: `1px solid ${theme.borderInner}`,
          borderRadius: 0,
          bgcolor: theme.toolbarBg,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box display="flex" alignItems="center" gap={1} flexGrow={1}>
          <IconNotes size={24} color={theme.primary} />
          <Typography variant="h6" color={theme.textStrong} fontWeight={700}>
            MOVIMIENTOS DE STOCK
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          {/* Filtro Tipo */}
          <TextField
            select
            size="small"
            label="Tipo de Movimiento"
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value); setPage(0); }}
            sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 0, bgcolor: '#fff' } }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="venta">Venta</MenuItem>
            <MenuItem value="entrada">Entrada</MenuItem>
            <MenuItem value="salida">Salida</MenuItem>
            <MenuItem value="transferencia">Transferencia</MenuItem>
            <MenuItem value="ajuste">Ajuste</MenuItem>
            <MenuItem value="devolucion">Devolución</MenuItem>
          </TextField>

          <Button
            variant="contained"
            startIcon={<IconNotes size={18} />}
            onClick={handleRefresh}
            sx={{
              bgcolor: theme.primary,
              color: '#fff',
              borderRadius: 0,
              textTransform: 'none',
              boxShadow: 'none',
              height: 40,
              '&:hover': { bgcolor: theme.primaryHover }
            }}
          >
            Actualizar
          </Button>
        </Box>
      </Paper>

      {/* Tabla */}
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['FECHA', 'TIPO', 'ARTÍCULO', 'ORIGEN', '', 'DESTINO', 'CANTIDAD', 'USUARIO', 'ACCIONES'].map((head, idx) => (
                  <TableCell
                    key={idx}
                    align={head === 'CANTIDAD' ? 'right' : head === '' ? 'center' : 'left'}
                    sx={{
                      bgcolor: theme.headerBg,
                      color: theme.headerText,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      py: 1.5,
                      borderBottom: `2px solid ${theme.headerBorder}`,
                      letterSpacing: '0.5px'
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No hay movimientos registrados.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                movimientos.map((mov) => {
                  const tipoStyle = getTipoColor(mov.tipoMovimiento);

                  return (
                    <TableRow key={mov.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: theme.alternateRow } }}>
                      {/* Fecha */}
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: theme.textStrong }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconCalendar size={16} style={{ opacity: 0.6 }} />
                          <span>{formatearFecha(mov.fechaMovimiento)}</span>
                        </Stack>
                      </TableCell>

                      {/* Tipo */}
                      <TableCell>
                        <Chip
                          label={getTipoLabel(mov.tipoMovimiento)}
                          size="small"
                          sx={{
                            bgcolor: tipoStyle.bg,
                            color: tipoStyle.text,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderRadius: 1,
                            height: 22
                          }}
                        />
                      </TableCell>

                      {/* Artículo */}
                      <TableCell sx={{ minWidth: 200 }}>
                        {mov.articulo ? (
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 0.5,
                                overflow: 'hidden',
                                border: '1px solid #eee',
                                flexShrink: 0
                              }}
                            >
                              {mov.articulo.ImagenUrl ? (
                                <img src={mov.articulo.ImagenUrl.startsWith('http') ? mov.articulo.ImagenUrl : `http://localhost:4000${mov.articulo.ImagenUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%" bgcolor="#f5f5f5">
                                  <IconPackage size={16} color="#bbb" />
                                </Box>
                              )}
                            </Box>
                            <Box>
                              <Typography variant="caption" display="block" color="text.secondary" fontWeight={600} fontFamily="monospace">
                                {mov.articulo.Codigo}
                              </Typography>
                              <Typography variant="body2" sx={{ lineHeight: 1.1, fontSize: '0.8rem' }}>
                                {mov.articulo.Descripcion}
                              </Typography>
                            </Box>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.disabled">Artículo eliminado</Typography>
                        )}
                      </TableCell>

                      {/* Origen */}
                      <TableCell>
                        {mov.puntoOrigen ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            {mov.puntoOrigen.tipo === 'deposito' ? <IconBuildingWarehouse size={16} color="#795548" /> : <IconBuildingStore size={16} color="#2e7d32" />}
                            <Typography variant="body2" fontSize="0.8rem">{mov.puntoOrigen.nombre}</Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>

                      {/* Flecha */}
                      <TableCell align="center">
                        <IconArrowRight size={14} color="#bdbdbd" />
                      </TableCell>

                      {/* Destino */}
                      <TableCell>
                        {mov.puntoDestino ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            {mov.puntoDestino.tipo === 'deposito' ? <IconBuildingWarehouse size={16} color="#795548" /> : <IconBuildingStore size={16} color="#2e7d32" />}
                            <Typography variant="body2" fontSize="0.8rem">{mov.puntoDestino.nombre}</Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>

                      {/* Cantidad */}
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color={mov.articulo ? '#000' : 'text.disabled'}>
                          {mov.cantidad}
                        </Typography>
                      </TableCell>

                      {/* Usuario */}
                      <TableCell>
                        {mov.usuario ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: theme.primary }}>
                              {mov.usuario.nombre[0]}{mov.usuario.apellido[0]}
                            </Avatar>
                            <Typography variant="body2" fontSize="0.8rem">
                              {mov.usuario.username || mov.usuario.nombre}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell align="center">
                        <Tooltip title="Ver detalles y motivo">
                          <IconButton size="small" sx={{ color: theme.primary, '&:hover': { bgcolor: theme.actionHover } }}>
                            <IconEye size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Paginación custom para mantener estética */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" p={2} gap={2} bgcolor="#fcfcfc" borderTop="1px solid #eee">
          <Typography variant="caption" color="text.secondary">
            Página {page + 1} de {totalPaginas > 0 ? totalPaginas : 1} ({data?.movimientosStockFull?.total || 0} registros)
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              disabled={page === 0}
              onClick={() => handleChangePage(page - 1)}
              variant="outlined"
              sx={{ borderRadius: 0, textTransform: 'none' }}
            >
              Anterior
            </Button>
            <Button
              size="small"
              disabled={page >= totalPaginas - 1}
              onClick={() => handleChangePage(page + 1)}
              variant="outlined"
              sx={{ borderRadius: 0, textTransform: 'none' }}
            >
              Siguiente
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default TablaMovimientosStock;
