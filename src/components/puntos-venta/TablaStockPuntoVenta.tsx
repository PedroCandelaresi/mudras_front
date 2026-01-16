'use client';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import type { ArticuloConStockPuntoMudras } from '@/components/puntos-mudras/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';
import { Icon } from '@iconify/react';

const numberFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

type Props = {
  articulos: ArticuloConStockPuntoMudras[];
  loading?: boolean;
  error?: Error;
  puntoNombre?: string | null;
  onEditStock?: (articulo: ArticuloConStockPuntoMudras) => void;
  onViewDetails?: (articulo: ArticuloConStockPuntoMudras) => void;
  onNewAssignment?: () => void;
  themeOverride?: any; // Ignored in flat design
};

const TablaStockPuntoVenta: React.FC<Props> = ({
  articulos,
  loading = false,
  error,
  puntoNombre,
  onEditStock,
  onViewDetails,
  onNewAssignment,
}) => {
  const [busquedaDraft, setBusquedaDraft] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);

  const articulosFiltrados = useMemo(() => {
    if (!busquedaAplicada) return articulos;
    const term = busquedaAplicada.toLowerCase();
    return articulos.filter((item) =>
      [item.codigo, item.nombre, item.rubro?.nombre]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [articulos, busquedaAplicada]);

  const ejecutarBusqueda = useCallback(() => {
    setBusquedaAplicada((busquedaDraft || '').trim());
    setPage(0);
  }, [busquedaDraft]);

  const limpiarFiltros = useCallback(() => {
    setBusquedaDraft('');
    setBusquedaAplicada('');
    setPage(0);
  }, []);

  const obtenerPrecioUnitario = useCallback((item: ArticuloConStockPuntoMudras) => {
    if (item.articulo) {
      const calculado = calcularPrecioDesdeArticulo(item.articulo as Articulo);
      if (calculado && calculado > 0) {
        return calculado;
      }
    }
    return Number(item.precio ?? 0);
  }, []);

  const totalUnidades = useMemo(
    () => articulosFiltrados.reduce((acc, item) => acc + (Number(item.stockAsignado) || 0), 0),
    [articulosFiltrados]
  );

  const valorEstimado = useMemo(
    () =>
      articulosFiltrados.reduce(
        (acc, item) => acc + obtenerPrecioUnitario(item) * (Number(item.stockAsignado) || 0),
        0
      ),
    [articulosFiltrados, obtenerPrecioUnitario]
  );

  const showActions = Boolean(onEditStock || onViewDetails);
  const totalPaginas = Math.ceil(articulosFiltrados.length / rowsPerPage) || 1;
  const articulosPaginados = useMemo(
    () => articulosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [articulosFiltrados, page, rowsPerPage]
  );

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} mb={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
        <Box flex={1} display="flex" gap={1}>
          <TextField
            placeholder="Buscar por código, descripción o rubro..."
            size="small"
            fullWidth
            value={busquedaDraft}
            onChange={(e) => setBusquedaDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ejecutarBusqueda()}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" /></InputAdornment>,
              endAdornment: busquedaDraft && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={limpiarFiltros}><Icon icon="mdi:close" /></IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 0, bgcolor: '#fff' }
            }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={ejecutarBusqueda}
            sx={{ borderRadius: 0, bgcolor: '#5d4037', fontWeight: 700, '&:hover': { bgcolor: '#4e342e' } }}
          >
            Buscar
          </Button>
        </Box>
        {onNewAssignment && (
          <Button
            variant="contained"
            disableElevation
            color="primary"
            startIcon={<Icon icon="mdi:plus" />}
            onClick={onNewAssignment}
            sx={{ borderRadius: 0, fontWeight: 700 }}
          >
            Nueva Asignación
          </Button>
        )}
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
          {error.message || 'No se pudo cargar el stock del punto seleccionado.'}
        </Alert>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden' }}>
          <Box px={2} py={1.5} bgcolor="#f5f5f5" borderBottom="1px solid #e0e0e0" display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
              {puntoNombre ? `STOCK EN: ${puntoNombre.toUpperCase()}` : 'STOCK DEL PUNTO DE VENTA'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {articulosFiltrados.length} artículos • {numberFormatter.format(totalUnidades)} unidades • {currencyFormatter.format(valorEstimado)} val. est.
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>IMAGEN</TableCell>
                  <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>CÓDIGO</TableCell>
                  <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>DESCRIPCIÓN</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>PRECIO</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>STOCK</TableCell>
                  <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>RUBRO</TableCell>
                  {showActions && <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, color: 'text.secondary' }}>ACCIONES</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`}>
                      {Array.from({ length: 6 + (showActions ? 1 : 0) }).map((__, cellIdx) => (
                        <TableCell key={cellIdx}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : articulosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6 + (showActions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                      {busquedaAplicada
                        ? 'No hay resultados que coincidan con la búsqueda.'
                        : 'Este punto aún no tiene stock cargado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  articulosPaginados.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        {item.articulo?.ImagenUrl ? (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 0,
                              overflow: 'hidden',
                              border: '1px solid #e0e0e0',
                            }}
                          >
                            <img
                              src={
                                item.articulo.ImagenUrl.startsWith('http') || item.articulo.ImagenUrl.startsWith('data:')
                                  ? item.articulo.ImagenUrl
                                  : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${item.articulo.ImagenUrl.startsWith('/') ? '' : '/'}${item.articulo.ImagenUrl}`
                              }
                              alt={item.nombre}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                        ) : (
                          <Box width={40} height={40} bgcolor="#f5f5f5" border="1px solid #e0e0e0" display="grid" sx={{ placeItems: 'center' }}>
                            <Icon icon="mdi:image-off-outline" color="#bdbdbd" />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.codigo ?? 'Sin código'}
                          size="small"
                          sx={{ borderRadius: 0, bgcolor: '#e0e0e0', fontWeight: 600, color: 'text.primary' }}
                        />
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{item.nombre}</Typography></TableCell>
                      <TableCell align="right">
                        {Number.isFinite(obtenerPrecioUnitario(item))
                          ? currencyFormatter.format(obtenerPrecioUnitario(item))
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>{numberFormatter.format(Number(item.stockAsignado) || 0)}</Typography>
                      </TableCell>
                      <TableCell>
                        {item.rubro?.nombre ? (
                          <Chip
                            label={item.rubro.nombre}
                            size="small"
                            sx={{ borderRadius: 0, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}
                          />
                        ) : (
                          <Chip label="Sin rubro" size="small" variant="outlined" sx={{ borderRadius: 0 }} />
                        )}
                      </TableCell>
                      {showActions && (
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" gap={1}>
                            {onViewDetails && (
                              <Tooltip title="Ver detalles">
                                <IconButton size="small" onClick={() => onViewDetails(item)} sx={{ color: '#1976d2' }}>
                                  <Icon icon="mdi:eye" width={20} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onEditStock && (
                              <Tooltip title="Editar stock">
                                <IconButton size="small" onClick={() => onEditStock(item)} sx={{ color: '#2e7d32' }}>
                                  <Icon icon="mdi:pencil" width={20} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPaginas > 1 && (
            <Box p={2} borderTop="1px solid #e0e0e0" display="flex" justifyContent="center" gap={1}>
              <Button
                size="small"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                sx={{ borderRadius: 0 }}
              >
                Anterior
              </Button>
              <Typography variant="caption" sx={{ alignSelf: 'center' }}>Página {page + 1} de {totalPaginas}</Typography>
              <Button
                size="small"
                disabled={page >= totalPaginas - 1}
                onClick={() => setPage(p => p + 1)}
                sx={{ borderRadius: 0 }}
              >
                Siguiente
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default TablaStockPuntoVenta;
