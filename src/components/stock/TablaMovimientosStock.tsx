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
import { useQuery, useApolloClient } from '@apollo/client/react';
import {
  IconEye,
  IconArrowRight,
  IconBuildingWarehouse,
  IconBuildingStore,
  IconCalendar,
  IconPackage,
  IconNotes,
  IconRefresh,
  IconFileTypePdf,
  IconFileSpreadsheet
} from '@tabler/icons-react';
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';

import { GET_MOVIMIENTOS_STOCK_FULL } from '@/components/articulos/graphql/queries';
import { borgoña } from '@/ui/colores';

// -- Interfaces locales --
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
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const client = useApolloClient();

  // Query Apollo
  const { data, loading, error, refetch } = useQuery<MovimientosFullData>(GET_MOVIMIENTOS_STOCK_FULL, {
    variables: {
      input: {
        offset: page * rowsPerPage,
        limite: rowsPerPage,
        tipoMovimiento: filtroTipo || undefined,
      }
    },
    fetchPolicy: 'cache-and-network',
  });

  const movimientos = data?.movimientosStockFull?.movimientos || [];
  const totalRegistros = data?.movimientosStockFull?.total || 0;
  const totalPaginas = Math.ceil(totalRegistros / rowsPerPage);
  const paginaActual = page + 1;

  const handleChangePage = (newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    void refetch();
  };

  // Paginación helper
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
  const handleExportar = async (type: 'pdf' | 'excel') => {
    try {
      setExporting(true);
      const { data: exportData } = await client.query({
        query: GET_MOVIMIENTOS_STOCK_FULL,
        variables: {
          input: {
            offset: 0,
            limite: 100000,
            tipoMovimiento: filtroTipo || undefined,
          }
        },
        fetchPolicy: 'network-only',
      });

      const movimientosExport = (exportData as any)?.movimientosStockFull?.movimientos || [];

      const columns: ExportColumn<any>[] = [
        { header: 'Fecha', key: (item) => formatearFecha(item.fechaMovimiento), width: 22 },
        { header: 'Tipo', key: (item) => getTipoLabel(item.tipoMovimiento), width: 15 },
        { header: 'Artículo', key: (item) => item.articulo ? `${item.articulo.Descripcion} (${item.articulo.Codigo})` : 'Eliminado', width: 40 },
        { header: 'Origen', key: (item) => item.puntoOrigen?.nombre || '-', width: 20 },
        { header: 'Destino', key: (item) => item.puntoDestino?.nombre || '-', width: 20 },
        { header: 'Cant.', key: 'cantidad', width: 10 },
        { header: 'Usuario', key: (item) => item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido}` : '-', width: 20 },
      ];

      const timestamp = new Date().toISOString().split('T')[0];

      const filterParts: string[] = [];
      if (filtroTipo) filterParts.push(`Tipo: ${getTipoLabel(filtroTipo)}`);
      const filterSummary = filterParts.join(' | ');

      if (type === 'excel') {
        exportToExcel(movimientosExport, columns, `Movimientos_Mudras_${timestamp}`, filterSummary);
      } else {
        exportToPdf(movimientosExport, columns, `Movimientos_Mudras_${timestamp}`, 'Movimientos de Stock', filterSummary);
      }

    } catch (error) {
      console.error('Error exportando:', error);
    } finally {
      setExporting(false);
    }
  };

  /* ======================== Toolbar ======================== */
  const toolbar = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        p: 2,
        bgcolor: '#ffffff',
      }}
    >
      {/* IZQUIERDA: Título */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconNotes size={24} color={borgoña.primary} />
        <Typography variant="h6" color={borgoña.textStrong} fontWeight={700}>
          MOVIMIENTOS DE STOCK
        </Typography>
      </Box>

      {/* DERECHA: Filtros y Actualizar */}
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          select
          size="small"
          label="Tipo de Movimiento"
          value={filtroTipo}
          onChange={(e) => { setFiltroTipo(e.target.value); setPage(0); }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              bgcolor: '#f5f5f5',
              '& fieldset': { borderColor: '#e0e0e0' },
              '&:hover fieldset': { borderColor: '#bdbdbd' },
              '&.Mui-focused fieldset': { borderColor: borgoña.primary },
            }
          }}
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
          variant="outlined"
          startIcon={<IconRefresh size={18} />}
          onClick={handleRefresh}
          sx={{
            borderRadius: 0,
            textTransform: 'none',
            color: '#757575',
            borderColor: '#e0e0e0',
            height: 40,
            '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
          }}
        >
          Actualizar
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconFileSpreadsheet size={18} />}
          onClick={() => handleExportar('excel')}
          disabled={exporting}
          sx={{ borderRadius: 0, textTransform: 'none', color: '#1D6F42', borderColor: '#1D6F42', '&:hover': { bgcolor: alpha('#1D6F42', 0.1), borderColor: '#1D6F42' }, height: 40 }}
        >
          Excel
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconFileTypePdf size={18} />}
          onClick={() => handleExportar('pdf')}
          disabled={exporting}
          sx={{ borderRadius: 0, textTransform: 'none', color: '#D32F2F', borderColor: '#D32F2F', '&:hover': { bgcolor: alpha('#D32F2F', 0.1), borderColor: '#D32F2F' }, height: 40 }}
        >
          PDF
        </Button>
      </Box>
    </Box>
  );

  /* ======================== Tabla ======================== */
  const tabla = (
    <TableContainer
      component={Paper}
      elevation={0}
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
          minWidth: 800,
          '& .MuiTableRow-root': {
            minHeight: 56,
            transition: 'background-color 0.2s',
          },
          '& .MuiTableCell-root': {
            fontSize: '0.85rem',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #FFFFFF',
            color: '#37474f',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
            bgcolor: borgoña.tableStriped || borgoña.alternateRow,
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover': {
            bgcolor: alpha(borgoña.primary, 0.12),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: borgoña.tableHeader || borgoña.headerBg,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ '& th': { borderBottom: 'none' } }}>
            <TableCell>Fecha</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Artículo</TableCell>
            <TableCell>Origen</TableCell>
            <TableCell align="center"></TableCell>
            <TableCell>Destino</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell>Usuario</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && !data ? (
            // Loading State inside table
            [1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell colSpan={9}><Skeleton animation="wave" /></TableCell>
              </TableRow>
            ))
          ) : movimientos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">No hay movimientos registrados.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            movimientos.map((mov) => {
              const tipoStyle = getTipoColor(mov.tipoMovimiento);

              return (
                <TableRow key={mov.id}>
                  {/* Fecha */}
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: borgoña.textStrong }}>
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
                        <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: borgoña.primary }}>
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
                      <IconButton size="small" sx={{ color: borgoña.primary, '&:hover': { bgcolor: alpha(borgoña.primary, 0.1) } }}>
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
  );

  /* ======================== Paginador ======================== */
  const paginador = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
      <Typography variant="caption" color="text.secondary">
        Mostrando {Math.min(rowsPerPage, movimientos.length)} de {totalRegistros} movimientos
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField select size="small" value={String(rowsPerPage)} onChange={handleChangeRowsPerPage} sx={{ minWidth: 80 }}>
          {[50, 100, 150].map((option) => (<option key={option} value={option}>{option}</option>))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          Página {paginaActual} de {Math.max(1, totalPaginas)}
        </Typography>
        {generarNumerosPaginas().map((num, idx) =>
          num === '...' ? (
            <Box key={idx} sx={{ px: 1, color: 'text.secondary' }}>...</Box>
          ) : (
            <Button
              key={num}
              variant={Number(num) === paginaActual ? 'contained' : 'outlined'}
              size="small"
              sx={{
                minWidth: 32,
                px: 1,
                borderRadius: 0,
                borderColor: Number(num) === paginaActual ? 'transparent' : '#e0e0e0',
                bgcolor: Number(num) === paginaActual ? borgoña.primary : 'transparent',
                color: Number(num) === paginaActual ? '#fff' : 'text.primary',
                '&:hover': {
                  borderColor: borgoña.primary,
                  bgcolor: Number(num) === paginaActual ? borgoña.primaryHover : alpha(borgoña.primary, 0.05)
                }
              }}
              onClick={() => setPage(Number(num) - 1)}
              disabled={num === paginaActual}
            >
              {num}
            </Button>
          )
        )}
      </Stack>
    </Box>
  );

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Typography color="error" variant="h6" mb={2} fontWeight={700}>
          Error al cargar los movimientos
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconRefresh />}
          onClick={handleRefresh}
          sx={{ borderRadius: 0, textTransform: 'none', bgcolor: borgoña.primary }}
        >
          Reintentar
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {toolbar}
      {tabla}
      {paginador}
    </Box>
  );
};

export default TablaMovimientosStock;
