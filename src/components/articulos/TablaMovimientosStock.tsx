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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  IconSearch,
  IconTrendingUp,
  IconTrendingDown,
  IconRefresh,
  IconEye,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';

import { GET_MOVIMIENTOS_STOCK, GET_ARTICULOS } from '@/components/articulos/graphql/queries';
import { Stock } from '@/app/interfaces/mudras.types';
import { MovimientosStockResponse } from '@/app/interfaces/graphql.types';
import { marron, verde, azul } from '@/ui/colores';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';

const accentExterior = marron.primary;
const accentInterior = marron.borderInner ?? '#4a3b35';
const panelBg = 'rgba(250, 240, 232, 0.82)';
const tableBodyBg = 'rgba(253, 246, 236, 0.68)';
const tableBodyAlt = 'rgba(214, 177, 142, 0.22)';
const woodTintExterior = '#dfc3a7';
const colorAccionEliminar = '#b71c1c';

const biselExteriorConfig = crearConfiguracionBisel(accentExterior, 1.4);
const estilosBiselExterior = crearEstilosBisel(biselExteriorConfig, { zContenido: 2 });

const WoodSection: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
      background: 'transparent',
      ...estilosBiselExterior,
    }}
  >
    <WoodBackdrop accent={woodTintExterior} radius={3} inset={0} strength={0.16} texture="tabla" />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundColor: alpha('#fff5ec', 0.86),
        zIndex: 0,
      }}
    />
    <Box sx={{ position: 'relative', zIndex: 2, p: 3 }}>{children}</Box>
  </Box>
);

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
  const [filtrosColumna, setFiltrosColumna] = useState<{ descripcion?: string; usuario?: string }>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  const reintentoHecho = useRef(false);
  useEffect(() => {
    if (error && !reintentoHecho.current) {
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('toisostring')) {
        reintentoHecho.current = true;
        setTimeout(() => { try { void refetch(); } catch {} }, 200);
      }
    }
  }, [error, refetch]);

  const movimientos: Stock[] = Array.isArray(data?.movimientosStock) ? (data!.movimientosStock as Stock[]) : [];
  const articulos = useMemo(() => {
    const list = dataArticulos?.articulos;
    return Array.isArray(list) ? (list as any[]) : [];
  }, [dataArticulos?.articulos]);

  const mapaDescripcionPorCodigo = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const articulo of articulos) {
      if (articulo?.Codigo) mapa.set(String(articulo.Codigo), articulo?.Descripcion ?? '');
    }
    return mapa;
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
    const paginas: (number | '...')[] = [];
    const maxVisible = 7;
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else if (paginaActual <= 4) {
      for (let i = 1; i <= 5; i++) paginas.push(i);
      paginas.push('...', totalPaginas);
    } else if (paginaActual >= totalPaginas - 3) {
      paginas.push(1, '...');
      for (let i = totalPaginas - 4; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
    }
    return paginas;
  };

  const movimientosPaginados = movimientosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getTipoMovimiento = (stockActual: number, stockAnterior: number) => {
    if (stockActual > stockAnterior) return 'entrada';
    if (stockActual < stockAnterior) return 'salida';
    return 'ajuste';
  };

  const getDiferencia = (stockActual: number, stockAnterior: number) => stockActual - stockAnterior;

  const handleViewMovimiento = (movimiento: Stock) => {
    console.log('Ver movimiento:', movimiento);
  };

  const handleEditMovimiento = (movimiento: Stock) => {
    console.log('Editar movimiento:', movimiento);
  };

  const handleDeleteMovimiento = (movimiento: Stock) => {
    console.log('Eliminar movimiento:', movimiento);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const limpiarFiltros = () => {
    setFiltro('');
    setFiltrosColumna({});
    setPage(0);
    void refetch();
  };

  const toolbar = (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        px: 2,
        py: 1.5,
        mb: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: accentInterior,
        bgcolor: panelBg,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Chip
          icon={<IconTrendingUp size={16} />}
          label="Movimientos de Stock"
          sx={{
            bgcolor: accentExterior,
            color: '#fff',
            fontWeight: 700,
            height: 36,
            '& .MuiChip-label': { px: 1.2 },
          }}
        />
        <Typography variant="body2" color={marron.textStrong}>
          Seguimiento de ingresos, salidas y ajustes inventariales
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <TextField
          size="small"
          placeholder="Buscar por descripción o usuario…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 240,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#fff',
              '& fieldset': { borderColor: alpha(accentExterior, 0.32) },
              '&:hover fieldset': { borderColor: alpha(accentExterior, 0.48) },
              '&.Mui-focused fieldset': { borderColor: accentExterior },
            },
          }}
        />
        <CrystalSoftButton
          baseColor={accentExterior}
          startIcon={<IconRefresh size={18} />}
          onClick={limpiarFiltros}
          sx={{ minHeight: 36, px: 2 }}
        >
          Limpiar
        </CrystalSoftButton>
        <CrystalButton
          baseColor={accentExterior}
          startIcon={<IconSearch size={18} />}
          onClick={() => refetch()}
          disabled={loading}
          sx={{ minHeight: 36, px: 2.4 }}
        >
          Buscar
        </CrystalButton>
      </Stack>
    </Box>
  );

  const tabla = (
    <TableContainer
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(accentExterior, 0.6),
        bgcolor: tableBodyBg,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          '& .MuiTableCell-root': { fontSize: '0.78rem', px: 1.25, py: 0.9 },
          '& .MuiTableCell-head': {
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor: accentExterior,
            color: '#fff',
            borderBottom: 'none',
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Código</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell align="right">Stock anterior</TableCell>
            <TableCell align="right">Stock actual</TableCell>
            <TableCell align="right">Diferencia</TableCell>
            <TableCell align="center">Tipo</TableCell>
            <TableCell align="center">Usuario</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movimientosPaginados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9}>
                <Box textAlign="center" py={4}>
                  <Typography variant="subtitle1" color={marron.textStrong} fontWeight={600}>
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
              const descripcion = mapaDescripcionPorCodigo.get(String(mov.Codigo ?? '')) || '—';
              const tipo = getTipoMovimiento(mov.Stock ?? 0, mov.StockAnterior ?? 0);
              const diferencia = getDiferencia(mov.Stock ?? 0, mov.StockAnterior ?? 0);
              const esEntrada = tipo === 'entrada';
              const esSalida = tipo === 'salida';

              return (
                <TableRow
                  key={`${mov.Id}-${mov.Fecha}`}
                  sx={{
                    bgcolor: esEntrada ? alpha(verde.primary, 0.12) : esSalida ? alpha('#ff7043', 0.12) : tableBodyAlt,
                    '&:hover': { bgcolor: alpha(accentExterior, 0.1) },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {mov.Fecha ? format(new Date(mov.Fecha), "dd 'de' MMMM yyyy", { locale: es }) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={mov.Codigo ?? '—'}
                      size="small"
                      sx={{
                        bgcolor: alpha(accentExterior, 0.2),
                        color: marron.textStrong,
                        height: 20,
                        '& .MuiChip-label': { px: 0.8, fontWeight: 600 },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{descripcion}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">{mov.StockAnterior ?? 0}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>{mov.Stock ?? 0}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-end">
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
                      color={esEntrada ? 'success' : esSalida ? 'error' : 'warning'}
                      sx={{ height: 20, '& .MuiChip-label': { px: 0.8, fontWeight: 600 } }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">{mov.Usuario ?? '—'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.75} justifyContent="center">
                      <Tooltip title="Ver detalle">
                        <CrystalIconButton baseColor={azul.primary} onClick={() => handleViewMovimiento(mov)}>
                          <IconEye size={16} />
                        </CrystalIconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <CrystalIconButton baseColor={verde.primary} onClick={() => handleEditMovimiento(mov)}>
                          <IconEdit size={16} />
                        </CrystalIconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <CrystalIconButton baseColor={colorAccionEliminar} onClick={() => handleDeleteMovimiento(mov)}>
                          <IconTrash size={16} />
                        </CrystalIconButton>
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

  const paginador = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
      <Typography variant="caption" color="text.secondary">
        Mostrando {Math.min(movimientosPaginados.length, rowsPerPage)} de {movimientosFiltrados.length} movimientos
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField select size="small" value={String(rowsPerPage)} onChange={handleChangeRowsPerPage} sx={{ minWidth: 90 }}>
          {[50, 100, 150].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          Página {paginaActual} de {Math.max(1, totalPaginas)}
        </Typography>
        {generarNumerosPaginas().map((num, idx) =>
          num === '...' ? (
            <CrystalSoftButton
              key={`ellipsis-${idx}`}
              baseColor={accentExterior}
              disabled
              sx={{ minWidth: 32, minHeight: 30, px: 1, py: 0.25, borderRadius: 2, color: marron.textStrong }}
            >
              …
            </CrystalSoftButton>
          ) : (
            <CrystalButton
              key={`page-${num}`}
              baseColor={accentExterior}
              onClick={() => handleChangePage(null, (num as number) - 1)}
              disabled={num === paginaActual}
              sx={{
                minWidth: 32,
                minHeight: 30,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                fontWeight: num === paginaActual ? 800 : 600,
                boxShadow: 'none',
              }}
            >
              {num}
            </CrystalButton>
          )
        )}
      </Stack>
    </Box>
  );

  if (loading) {
    return (
      <WoodSection>
        <Skeleton variant="rounded" height={48} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
      </WoodSection>
    );
  }

  if (error) {
    return (
      <WoodSection>
        <Typography color="error" variant="h6" mb={1}>
          Error al cargar movimientos de stock
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {error.message}
        </Typography>
        <CrystalButton baseColor={accentExterior} startIcon={<IconRefresh />} onClick={() => refetch()}>
          Reintentar
        </CrystalButton>
      </WoodSection>
    );
  }

  return (
    <>
      <WoodSection>
        {toolbar}
        {tabla}
        {paginador}
      </WoodSection>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); setFiltroColInput(''); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260, borderRadius: 2 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'descripcion' && 'Filtrar por Descripción'}
          {columnaActiva === 'usuario' && 'Filtrar por Usuario'}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <TextField
          size="small"
          fullWidth
          autoFocus
          placeholder="Escribe para filtrar…"
          value={filtroColInput}
          onChange={(e) => setFiltroColInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && columnaActiva) {
              setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: filtroColInput }));
              setPage(0);
              setMenuAnchor(null);
            }
          }}
        />
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
          <Button
            size="small"
            onClick={() => {
              setFiltroColInput('');
              if (columnaActiva) {
                setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: undefined }));
                setPage(0);
              }
            }}
          >
            Limpiar
          </Button>
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={() => {
              if (columnaActiva) {
                setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: filtroColInput }));
                setPage(0);
              }
              setMenuAnchor(null);
            }}
          >
            Aplicar
          </Button>
        </Stack>
      </Menu>
    </>
  );
};

export default TablaMovimientosStock;
