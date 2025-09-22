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
  TextField,
  InputAdornment,
  Button,
  Stack
} from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_MOVIMIENTOS_STOCK, GET_ARTICULOS } from '@/app/queries/mudras.queries';
import { Stock } from '@/app/interfaces/mudras.types';
import { MovimientosStockResponse } from '@/app/interfaces/graphql.types';
import { IconSearch, IconTrendingUp, IconTrendingDown, IconRefresh, IconEdit, IconTrash, IconEye, IconArrowUp, IconArrowDown, IconDotsVertical } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, Tooltip, Menu, Divider } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { verde } from '@/ui/colores';

const TablaMovimientosStock = () => {
  const { data, loading, error, refetch } = useQuery<MovimientosStockResponse>(GET_MOVIMIENTOS_STOCK, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });
  const { data: dataArticulos } = useQuery<any>(GET_ARTICULOS, { fetchPolicy: 'cache-first' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtro, setFiltro] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'descripcion' | 'usuario'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{ descripcion?: string; usuario?: string; }>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  // Reintento controlado si aparece el error de toISOString en la primera ráfaga
  const reintentoHecho = useRef(false);
  useEffect(() => {
    if (error && !reintentoHecho.current) {
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('toisostring')) {
        reintentoHecho.current = true;
        setTimeout(() => {
          try { void refetch(); } catch {}
        }, 200);
      }
    }
  }, [error, refetch]);

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

  const movimientos: Stock[] = Array.isArray(data?.movimientosStock) ? (data!.movimientosStock as Stock[]) : [];
  const articulos = Array.isArray(dataArticulos?.articulos) ? dataArticulos!.articulos as any[] : [];
  const mapaDescripcionPorCodigo = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of articulos) {
      if (a?.Codigo) m.set(String(a.Codigo), a?.Descripcion ?? '');
    }
    return m;
  }, [articulos]);
  
  const movimientosFiltrados = movimientos.filter((movimiento) => {
    const desc = mapaDescripcionPorCodigo.get(String(movimiento?.Codigo ?? ''))?.toLowerCase() ?? '';
    const usuarioTxt = String(movimiento?.Usuario ?? '').toLowerCase();
    const q = filtro.toLowerCase();
    const pasaTexto = !q || desc.includes(q) || usuarioTxt.includes(q);
    const pasaDesc = filtrosColumna.descripcion ? desc.includes(filtrosColumna.descripcion.toLowerCase()) : true;
    const pasaUsuario = filtrosColumna.usuario ? usuarioTxt.includes(filtrosColumna.usuario.toLowerCase()) : true;
    return pasaTexto && pasaDesc && pasaUsuario;
  });

  const totalPaginas = Math.ceil(movimientosFiltrados.length / rowsPerPage);
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
      <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
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

      {/* Menú de filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
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
              placeholder="Escribe para filtrar..."
              value={filtroColInput}
              onChange={(e) => setFiltroColInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                  setPage(0);
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => { setFiltroColInput(''); setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: '' })); }}>Limpiar</Button>
              <Button size="small" variant="contained" sx={{ bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }} onClick={() => {
                setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                setPage(0);
                setMenuAnchor(null);
                setColumnaActiva(null);
              }}>Aplicar</Button>
            </Stack>
          </Box>
        )}
      </Menu>
      </Paper>
    );
  }

  const noHayDatos = !Array.isArray(data?.movimientosStock) || (data?.movimientosStock?.length || 0) === 0;
  if (error && noHayDatos) {
    return (
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
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
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
      {/* Toolbar superior estilo Artículos */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: verde.toolbarBg, border: '1px solid', borderColor: verde.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={verde.textStrong}>
          <IconTrendingUp style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Movimientos de Stock
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          <TextField
            size="small"
            placeholder="Buscar por código..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
            sx={{ minWidth: 250 }}
          />
          <Button variant="contained" sx={{ textTransform: 'none', bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }} onClick={() => setPage(0)}>Buscar</Button>
          <Button variant="outlined" color="inherit" onClick={() => { setFiltro(''); setPage(0); }} sx={{ textTransform: 'none', borderColor: verde.headerBorder, color: verde.textStrong, '&:hover': { borderColor: verde.textStrong, bgcolor: verde.toolbarBg } }}>Limpiar filtros</Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: verde.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size={'small'} sx={{ '& .MuiTableCell-head': { bgcolor: verde.headerBg, color: verde.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: verde.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 } }}>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Descripción
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('descripcion'); setFiltroColInput(filtrosColumna.descripcion || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>Stock Anterior</TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>Stock Actual</TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>Diferencia</TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>Tipo Movimiento</TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Usuario
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('usuario'); setFiltroColInput(filtrosColumna.usuario || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder, textAlign: 'center' }}>Acciones</TableCell>
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
                    '&:hover': { bgcolor: verde.toolbarBg },
                    cursor: 'pointer'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {movimiento?.Fecha 
                        ? (() => {
                            try {
                              const raw = movimiento.Fecha as any;
                              const fecha = typeof raw === 'string' || typeof raw === 'number'
                                ? new Date(raw)
                                : (raw instanceof Date ? raw : new Date());
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
                    <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal' }}>
                      {mapaDescripcionPorCodigo.get(String(movimiento?.Codigo ?? '')) || '-'}
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
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, movimientosFiltrados.length)} de ${movimientosFiltrados.length}`}
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
                        bgcolor: verde.primary,
                        color: 'white',
                        '&:hover': { bgcolor: verde.primaryHover }
                      } : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: verde.rowHover }
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
    </Paper>
  );
};

export default TablaMovimientosStock;
