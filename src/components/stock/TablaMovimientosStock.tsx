'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  IconButton,
  Menu,
  Button,
  Divider,
  Stack,
  Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@apollo/client/react';
import {
  IconSearch,
  IconTrendingUp,
  IconRefresh,
  IconEye,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';
import { Icon } from '@iconify/react';

import { GET_MOVIMIENTOS_STOCK, GET_ARTICULOS } from '@/components/articulos/graphql/queries';
import { Stock } from '@/app/interfaces/mudras.types';
import { MovimientosStockResponse } from '@/app/interfaces/graphql.types';
import { verde, azul } from '@/ui/colores';
import SearchToolbar from '@/components/ui/SearchToolbar';

/* ======================== Estética (verde oliva, como Artículos) ======================== */
const accentExterior = verde.primary;
const accentInterior = verde.borderInner ?? '#2b4735';
const colorAccionEliminar = '#b71c1c';

const ARG_TIMEZONE = 'America/Argentina/Buenos_Aires';
const formatearFechaHora = (valor?: string | Date | null, opciones?: Intl.DateTimeFormatOptions) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  const formatter = new Intl.DateTimeFormat('es-AR', {
    timeZone: ARG_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...opciones,
  });
  return formatter.format(fecha);
};

/* ======================== Componente ======================== */
const TablaMovimientosStock = () => {
  const { data, loading, error, refetch } = useQuery<MovimientosStockResponse>(GET_MOVIMIENTOS_STOCK, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });
  const { data: dataArticulos } = useQuery<any>(GET_ARTICULOS, { fetchPolicy: 'cache-first' });

  // Estado general
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtro, setFiltro] = useState('');

  // Filtros por columna (mismo patrón de Proveedores)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'descripcion' | 'usuario'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{ descripcion?: string; usuario?: string }>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  // Reintento si hay error de fecha
  const reintentoHecho = useRef(false);
  useEffect(() => {
    if (error && !reintentoHecho.current) {
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('toisostring')) {
        reintentoHecho.current = true;
        setTimeout(() => {
          try { void refetch(); } catch { }
        }, 200);
      }
    }
  }, [error, refetch]);

  // Datos
  const movimientos: Stock[] = Array.isArray(data?.movimientosStock) ? (data!.movimientosStock as Stock[]) : [];
  const articulos = useMemo(() => {
    const list = dataArticulos?.articulos;
    return Array.isArray(list) ? (list as any[]) : [];
  }, [dataArticulos?.articulos]);

  const mapaDescripcionPorCodigo = useMemo(() => {
    const mapa = new Map<string, { descripcion: string, imagen: string | null }>();
    for (const articulo of articulos) {
      if (articulo?.Codigo) {
        mapa.set(String(articulo.Codigo), {
          descripcion: articulo?.Descripcion ?? '',
          imagen: articulo?.ImagenUrl ?? null
        });
      }
    }
    return mapa;
  }, [articulos]);

  // Filtrado (general + por columna)
  const movimientosFiltrados = movimientos.filter((movimiento) => {
    const info = mapaDescripcionPorCodigo.get(String(movimiento?.Codigo ?? ''));
    const desc = (info?.descripcion ?? '').toLowerCase();
    const usuarioTxt = String(movimiento?.Usuario ?? '').toLowerCase();
    const q = filtro.toLowerCase();

    const pasaTexto = !q || desc.includes(q) || usuarioTxt.includes(q);
    const pasaDesc = filtrosColumna.descripcion ? desc.includes(filtrosColumna.descripcion.toLowerCase()) : true;
    const pasaUsuario = filtrosColumna.usuario ? usuarioTxt.includes(filtrosColumna.usuario.toLowerCase()) : true;
    return pasaTexto && pasaDesc && pasaUsuario;
  });

  const totalPaginas = Math.ceil(movimientosFiltrados.length / rowsPerPage);
  const paginaActual = page + 1;
  const movimientosPaginados = movimientosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helpers
  const getTipoMovimiento = (stockActual: number, stockAnterior: number) => {
    if (stockActual > stockAnterior) return 'entrada';
    if (stockActual < stockAnterior) return 'salida';
    return 'ajuste';
  };
  const getDiferencia = (stockActual: number, stockAnterior: number) => stockActual - stockAnterior;

  // Acciones placeholder
  const handleViewMovimiento = (movimiento: Stock) => { console.log('Ver movimiento:', movimiento); };
  const handleEditMovimiento = (movimiento: Stock) => { console.log('Editar movimiento:', movimiento); };
  const handleDeleteMovimiento = (movimiento: Stock) => { console.log('Eliminar movimiento:', movimiento); };

  // Paginación
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toolbar unificada con SearchToolbar
  const toolbar = (
    <SearchToolbar
      title="Movimientos de Stock"
      icon={<IconTrendingUp style={{ marginRight: 8, verticalAlign: 'middle' }} />}
      baseColor={accentExterior}
      placeholder="Buscar por descripción o usuario…"
      searchValue={filtro}
      onSearchValueChange={setFiltro}
      onSubmitSearch={() => { setPage(0); void refetch(); }}
      onClear={() => { setFiltro(''); setFiltrosColumna({}); setPage(0); void refetch(); }}
      searchDisabled={loading}
    />
  );

  // Header filters (UX igual que Proveedores)
  const abrirMenuColumna = (col: 'descripcion' | 'usuario') => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
    setFiltroColInput(filtrosColumna[col] || '');
    setMenuAnchor(e.currentTarget);
  };
  const cerrarMenuColumna = () => {
    setMenuAnchor(null);
    setColumnaActiva(null);
    setFiltroColInput('');
  };
  const aplicarFiltroColumna = () => {
    if (!columnaActiva) return;
    setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: filtroColInput }));
    setPage(0);
    cerrarMenuColumna();
  };
  const limpiarFiltroColActual = () => {
    if (!columnaActiva) return;
    setFiltroColInput('');
    setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: '' }));
  };

  // Paginador: números
  const generarNumerosPaginas = () => {
    const paginas: (number | '...')[] = [];
    const maxVisible = 7;
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else if (page + 1 <= 4) {
      for (let i = 1; i <= 5; i++) paginas.push(i);
      paginas.push('...', totalPaginas);
    } else if (page + 1 >= totalPaginas - 3) {
      paginas.push(1, '...');
      for (let i = totalPaginas - 4; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1, '...', page, page + 1, page + 2, '...', totalPaginas);
    }
    return paginas;
  };

  /* ======================== Tabla ======================== */
  const tabla = (
    <TableContainer
      component={Box} // Usamos Box para mayor control
      sx={{
        borderRadius: 0,
        border: '1px solid #e0e0e0',
        bgcolor: '#ffffff',
        overflow: 'auto',
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          minWidth: 700,
          '& .MuiTableRow-root': { minHeight: 56 }, // Compact
          '& .MuiTableCell-root': {
            fontSize: '0.85rem',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #f0f0f0',
            color: '#37474f',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
            bgcolor: alpha(verde.primary, 0.03), // Zebra
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover': {
            bgcolor: alpha(verde.primary, 0.12),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: '#f5f7fa',
            color: verde.primary,
            textTransform: 'uppercase',
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Img</TableCell>
            <TableCell>Código</TableCell>

            {/* Descripción con filtro en header */}
            <TableCell>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                Descripción
                <Tooltip title="Filtrar columna">
                  <IconButton size="small" color="inherit" onClick={abrirMenuColumna('descripcion')}>
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            {/* Labels acortados para no romper en dos renglones */}
            <TableCell align="right">Anterior</TableCell>
            <TableCell align="right">Actual</TableCell>

            <TableCell align="right">Diferencia</TableCell>
            <TableCell align="center">Tipo</TableCell>

            {/* Usuario con filtro en header */}
            <TableCell align="center">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                Usuario
                <Tooltip title="Filtrar columna">
                  <IconButton size="small" color="inherit" onClick={abrirMenuColumna('usuario')}>
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {movimientosPaginados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9}>
                <Box textAlign="center" py={4}>
                  <Typography variant="subtitle1" color={verde.textStrong} fontWeight={600}>
                    No se encontraron movimientos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajustá los filtros de búsqueda para ver otros registros.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            movimientosPaginados.map((mov) => {
              const info = mapaDescripcionPorCodigo.get(String(mov.Codigo ?? ''));
              const desc = info?.descripcion || '—';
              const imagenUrl = info?.imagen;
              const tipo = getTipoMovimiento(mov.Stock ?? 0, mov.StockAnterior ?? 0);
              const diferencia = getDiferencia(mov.Stock ?? 0, mov.StockAnterior ?? 0);
              const esEntrada = tipo === 'entrada';
              const esSalida = tipo === 'salida';

              return (
                <TableRow
                  key={`${mov.Id}-${mov.Fecha}`}
                  hover
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatearFechaHora(mov.Fecha)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ width: 36, height: 36, borderRadius: 0, overflow: 'hidden', border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                      {imagenUrl ? (
                        <img src={imagenUrl.startsWith('http') ? imagenUrl : `http://localhost:4000${imagenUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon icon="mdi:image-off-outline" color="#ccc" width={20} style={{ opacity: 0.5 }} />
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={mov.Codigo ?? '—'}
                      size="small"
                      sx={{
                        bgcolor: alpha(accentExterior, 0.1),
                        color: verde.textStrong,
                        height: 24,
                        borderRadius: 0,
                        '& .MuiChip-label': { px: 1, fontWeight: 600 },
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{desc}</Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">{mov.StockAnterior ?? 0}</Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>{mov.Stock ?? 0}</Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                      {diferencia >= 0 ? <IconArrowUp size={16} color={verde.primary} /> : <IconArrowDown size={16} color="#ff7043" />}
                      <Typography variant="body2" fontWeight={600} color={diferencia >= 0 ? verde.textStrong : '#ff7043'}>
                        {diferencia > 0 ? `+${diferencia}` : diferencia}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={tipo.toUpperCase()}
                      size="small"
                      sx={{
                        height: 24,
                        borderRadius: 0,
                        fontWeight: 600,
                        bgcolor: esEntrada ? alpha('#2e7d32', 0.1) : esSalida ? alpha('#d32f2f', 0.1) : alpha('#ed6c02', 0.1),
                        color: esEntrada ? '#1b5e20' : esSalida ? '#c62828' : '#e65100',
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">{mov.Usuario ?? '—'}</Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => handleViewMovimiento(mov)} sx={{ color: azul.primary, '&:hover': { bgcolor: alpha(azul.primary, 0.1) } }}>
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEditMovimiento(mov)} sx={{ color: verde.primary, '&:hover': { bgcolor: alpha(verde.primary, 0.1) } }}>
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleDeleteMovimiento(mov)} sx={{ color: colorAccionEliminar, '&:hover': { bgcolor: alpha(colorAccionEliminar, 0.1) } }}>
                          <IconTrash size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  /* ======================== Menú de filtros por columna ======================== */
  const menuFiltros = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={cerrarMenuColumna}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { p: 1.5, minWidth: 260, borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } as any }}
    >
      <Typography variant="subtitle2" sx={{ px: 1, pb: 1, fontWeight: 600 }}>
        {columnaActiva === 'descripcion' && 'Filtrar por Descripción'}
        {columnaActiva === 'usuario' && 'Filtrar por Usuario'}
      </Typography>
      <Divider sx={{ mb: 1 }} />

      {columnaActiva && (
        <Box px={1} pb={1}>
          <TextField
            size="small"
            fullWidth
            autoFocus
            placeholder="Escribe para filtrar…"
            value={filtroColInput}
            onChange={(e) => setFiltroColInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltroColumna(); }}
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
            <Button size="small" onClick={limpiarFiltroColActual} sx={{ color: 'text.secondary', textTransform: 'none' }}>
              Limpiar
            </Button>
            <Button
              size="small"
              onClick={aplicarFiltroColumna}
              sx={{ bgcolor: accentExterior, color: '#fff', '&:hover': { bgcolor: alpha(accentExterior, 0.9) }, borderRadius: 0, textTransform: 'none' }}
            >
              Aplicar
            </Button>
          </Stack>
        </Box>
      )}
    </Menu>
  );

  /* ======================== Paginador ======================== */
  const paginador = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, px: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Mostrando {Math.min(movimientosPaginados.length, rowsPerPage)} de {movimientosFiltrados.length} movimientos
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" color="text.secondary">Filas por pág:</Typography>
        <TextField
          select
          size="small"
          value={String(rowsPerPage)}
          onChange={handleChangeRowsPerPage}
          sx={{ minWidth: 70, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
        >
          {[50, 100, 150].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </TextField>

        <Box display="flex" gap={0.5}>
          {generarNumerosPaginas().map((num, idx) =>
            num === '...' ? (
              <Box key={`ellipsis-${idx}`} px={1} display="flex" alignItems="center">...</Box>
            ) : (
              <Button
                key={`page-${num}`}
                onClick={() => handleChangePage(null as unknown as Event, (num as number) - 1)}
                disabled={num === paginaActual}
                sx={{
                  minWidth: 32,
                  height: 32,
                  p: 0,
                  borderRadius: 0,
                  fontWeight: num === paginaActual ? 700 : 500,
                  bgcolor: num === paginaActual ? accentExterior : 'transparent',
                  color: num === paginaActual ? '#fff' : 'text.primary',
                  border: num === paginaActual ? 'none' : '1px solid #e0e0e0',
                  '&:hover': {
                    bgcolor: num === paginaActual ? accentExterior : '#f5f5f5',
                  }
                }}
              >
                {num}
              </Button>
            )
          )}
        </Box>
      </Stack>
    </Box>
  );

  /* ======================== Loading / Error ======================== */
  if (loading) {
    return (
      <Box p={3} bgcolor="#fff" border="1px solid #e0e0e0">
        <Skeleton variant="rectangular" height={48} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={320} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} bgcolor="#fff" border="1px solid #e0e0e0">
        {toolbar}
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6" mb={1}>
            Error al cargar movimientos de stock
          </Typography>
          <Typography color="text.secondary" mb={2}>
            {error.message}
          </Typography>
          <Button
            variant="contained"
            startIcon={<IconRefresh />}
            onClick={() => refetch()}
            sx={{ bgcolor: accentExterior, color: '#fff', borderRadius: 0, boxShadow: 'none' }}
          >
            Reintentar
          </Button>
        </Box>
      </Box>
    );
  }

  /* ======================== Render ======================== */
  return (
    <Box sx={{ p: 3, bgcolor: '#f9f9fab', minHeight: '100vh' }}>
      {toolbar}
      <Box mt={3}>
        {tabla}
      </Box>
      {paginador}
      {menuFiltros}
    </Box>
  );
};

export default TablaMovimientosStock;
