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
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';
import SearchToolbar from '@/components/ui/SearchToolbar';

/* ======================== Estética (verde oliva, como Artículos) ======================== */
const accentExterior = verde.primary;
const accentInterior = verde.borderInner ?? '#2b4735';

// Paneles/wood consistente con Artículos
const woodTintExterior = '#c7d8cb';
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
    {/* Capa de tinte muy leve */}
    <Box sx={{ position: 'absolute', inset: 0, backgroundColor: alpha('#f2f7f4', 0.86), zIndex: 0 }} />
    <Box sx={{ position: 'relative', zIndex: 2, p: 3 }}>{children}</Box>
  </Box>
);

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
      sx={{
        position: 'relative',
        borderRadius: 0,                 // ✅ esquinas más redondeadas
        overflow: 'hidden',              // ✅ recorta header redondeado
        border: '1px solid',
        borderColor: alpha(accentExterior, 0.6),
        bgcolor: alpha(verde.alternateRow, 0.72),
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }}
    >
      {/* Capa sutil para separar del fondo */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
          zIndex: 0,
        }}
      />
      <Table
        stickyHeader
        size="small"
        sx={{
          borderRadius: 0,
          position: 'relative',
          zIndex: 2,
          bgcolor: alpha(verde.alternateRow, 0.75),
          '& .MuiTableRow-root': { minHeight: 62 },
          '& .MuiTableCell-root': {
            fontSize: '0.75rem',
            px: 1,
            py: 1.1,
            borderBottomColor: alpha(accentInterior, 0.35),
            bgcolor: 'transparent',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
            bgcolor: alpha(verde.alternateRow, 0.75),
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
            bgcolor: alpha(verde.rowHover, 0.55),
          },
          '& .MuiTableBody-root .MuiTableRow-root.MuiTableRow-hover:hover .MuiTableCell-root': {
            bgcolor: alpha(verde.actionHover, 0.7),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: verde.headerBg,
            color: alpha('#FFFFFF', 0.94),
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.12)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            whiteSpace: 'nowrap', // ✅ evita 2 líneas
          },
          // ✅ divisores sutiles entre columnas del header
          '& .MuiTableHead-root .MuiTableCell-head:not(:last-of-type)': {
            borderRight: `3px solid ${alpha(verde.headerBorder, 0.5)}`,
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
                  sx={{
                    '& .MuiTableCell-root': {
                      bgcolor: 'inherit',
                    },
                    bgcolor: esEntrada
                      ? alpha(verde.primary, 0.12)
                      : esSalida
                        ? alpha('#ff7043', 0.12)
                        : alpha(verde.rowHover, 0.42),
                    '&:hover': { bgcolor: alpha(accentExterior, 0.1) },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatearFechaHora(mov.Fecha)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1, overflow: 'hidden', border: '1px solid #eee', bgcolor: '#fff' }}>
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
                        bgcolor: alpha(accentExterior, 0.2),
                        color: verde.textStrong,
                        height: 20,
                        '& .MuiChip-label': { px: 0.8, fontWeight: 600 },
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

  /* ======================== Menú de filtros por columna ======================== */
  const menuFiltros = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={cerrarMenuColumna}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { p: 1.5, minWidth: 260, borderRadius: 2 } } } as any}
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
            placeholder="Escribe para filtrar…"
            value={filtroColInput}
            onChange={(e) => setFiltroColInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltroColumna(); }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
            <Button size="small" onClick={limpiarFiltroColActual}>
              Limpiar
            </Button>
            <CrystalButton
              size="small"
              baseColor={accentExterior}
              onClick={aplicarFiltroColumna}
            >
              Aplicar
            </CrystalButton>
          </Stack>
        </Box>
      )}
    </Menu>
  );

  /* ======================== Paginador ======================== */
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
        {(() => {
          const nums = generarNumerosPaginas();
          return nums.map((num, idx) =>
            num === '...' ? (
              <CrystalSoftButton
                key={`ellipsis-${idx}`}
                baseColor={accentExterior}
                disabled
                sx={{ minWidth: 32, minHeight: 30, px: 1, py: 0.25, borderRadius: 2, color: verde.textStrong }}
              >
                …
              </CrystalSoftButton>
            ) : (
              <CrystalButton
                key={`page-${num}`}
                baseColor={accentExterior}
                onClick={() => handleChangePage(null as unknown as Event, (num as number) - 1)}
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
          );
        })()}
      </Stack>
    </Box>
  );

  /* ======================== Loading / Error ======================== */
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
        {toolbar}
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6" mb={1}>
            Error al cargar movimientos de stock
          </Typography>
          <Typography color="text.secondary" mb={2}>
            {error.message}
          </Typography>
          <CrystalButton baseColor={accentExterior} startIcon={<IconRefresh />} onClick={() => refetch()}>
            Reintentar
          </CrystalButton>
        </Box>
      </WoodSection>
    );
  }

  /* ======================== Render ======================== */
  return (
    <>
      <WoodSection>
        {toolbar}
        {tabla}
        {paginador}
      </WoodSection>
      {menuFiltros}
    </>
  );
};

export default TablaMovimientosStock;
