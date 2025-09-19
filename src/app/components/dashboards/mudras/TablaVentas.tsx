'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  Divider,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
} from '@mui/material';
import { IconDotsVertical, IconEye, IconRefresh, IconSearch, IconReceipt, IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import { verde } from '@/ui/colores';

export interface VentaListado {
  id: string;
  fecha: string; // ISO
  nro: string;
  cliente: string;
  total: number;
  estado: 'PAGADA' | 'PENDIENTE' | 'CANCELADA';
}

const datosFicticios: VentaListado[] = [
  { id: 'v1', fecha: '2025-09-01T10:15:00Z', nro: 'A-0001-00000001', cliente: 'María López', total: 45200, estado: 'PAGADA' },
  { id: 'v2', fecha: '2025-09-01T12:20:00Z', nro: 'A-0001-00000002', cliente: 'Carlos Gómez', total: 31800, estado: 'PENDIENTE' },
  { id: 'v3', fecha: '2025-09-02T09:05:00Z', nro: 'A-0001-00000003', cliente: 'Lucía Pérez', total: 27650, estado: 'PAGADA' },
  { id: 'v4', fecha: '2025-09-02T11:42:00Z', nro: 'A-0001-00000004', cliente: 'Diego Fernández', total: 15800, estado: 'CANCELADA' },
  { id: 'v5', fecha: '2025-09-03T16:10:00Z', nro: 'A-0001-00000005', cliente: 'Ana Torres', total: 50400, estado: 'PAGADA' },
  { id: 'v6', fecha: '2025-09-04T14:30:00Z', nro: 'A-0001-00000006', cliente: 'Roberto Silva', total: 22100, estado: 'PAGADA' },
  { id: 'v7', fecha: '2025-09-04T16:45:00Z', nro: 'A-0001-00000007', cliente: 'Carmen Ruiz', total: 38900, estado: 'PENDIENTE' },
  { id: 'v8', fecha: '2025-09-05T11:20:00Z', nro: 'A-0001-00000008', cliente: 'José Martínez', total: 19500, estado: 'PAGADA' },
  { id: 'v9', fecha: '2025-09-05T15:10:00Z', nro: 'A-0001-00000009', cliente: 'Laura González', total: 41200, estado: 'CANCELADA' },
  { id: 'v10', fecha: '2025-09-06T09:30:00Z', nro: 'A-0001-00000010', cliente: 'Miguel Herrera', total: 33750, estado: 'PAGADA' },
];

export function TablaVentas() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'cliente' | 'estado' | 'nro'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{ cliente?: string; estado?: string; nro?: string }>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  const abrirMenu = (col: 'cliente' | 'estado' | 'nro') => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
    setFiltroColInput((filtrosColumna as any)[col] || '');
    setMenuAnchor(e.currentTarget);
  };
  const cerrarMenu = () => { setMenuAnchor(null); setColumnaActiva(null); };

  const ventasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return datosFicticios.filter((v) => {
      const pasaTexto = !q || v.nro.toLowerCase().includes(q) || v.cliente.toLowerCase().includes(q) || v.estado.toLowerCase().includes(q);
      const pasaCliente = filtrosColumna.cliente ? v.cliente.toLowerCase().includes(filtrosColumna.cliente.toLowerCase()) : true;
      const pasaEstado = filtrosColumna.estado ? v.estado.toLowerCase().includes(filtrosColumna.estado.toLowerCase()) : true;
      const pasaNro = filtrosColumna.nro ? v.nro.toLowerCase().includes(filtrosColumna.nro.toLowerCase()) : true;
      return pasaTexto && pasaCliente && pasaEstado && pasaNro;
    });
  }, [busqueda, filtrosColumna]);

  const ventasPaginadas = ventasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderColor: verde.headerBorder, borderRadius: 2, bgcolor: 'background.paper' }}>
      {/* Toolbar superior */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: verde.toolbarBg, border: '1px solid', borderColor: verde.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={verde.textStrong}>
          <IconReceipt style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Historial de Ventas
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          <TextField
            size="small"
            placeholder="Buscar ventas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
            sx={{ minWidth: 240 }}
          />
          <Tooltip title="Buscar (Enter)">
            <span>
              <Button
                variant="contained"
                sx={{ textTransform: 'none', bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }}
                startIcon={<IconSearch size={18} />}
                onClick={() => setPage(0)}
              >
                Buscar
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<IconTrash />}
            onClick={() => { setBusqueda(''); setFiltrosColumna({}); setPage(0); }}
            sx={{ textTransform: 'none', borderColor: verde.headerBorder, color: verde.textStrong, '&:hover': { borderColor: verde.textStrong, bgcolor: verde.toolbarBg } }}
          >
            Limpiar filtros
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: verde.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size={'small'} sx={{ '& .MuiTableCell-head': { bgcolor: verde.headerBg, color: verde.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: verde.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 }, '& th:first-of-type': { borderTopLeftRadius: 8 }, '& th:last-of-type': { borderTopRightRadius: 8 } }}>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">Nº Comprobante
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenu('nro')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">Cliente
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenu('cliente')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">Estado
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenu('estado')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventasPaginadas.map((v, idx) => (
              <TableRow key={v.id} sx={{ bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit', '&:hover': { bgcolor: verde.toolbarBg } }}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {new Date(v.fecha).toLocaleDateString('es-AR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(v.fecha).toLocaleTimeString('es-AR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                    {v.nro}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{v.cliente}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>${v.total.toLocaleString('es-AR')}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={v.estado}
                    color={v.estado === 'PAGADA' ? 'success' : v.estado === 'PENDIENTE' ? 'warning' : 'error'}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Ver detalles">
                      <IconButton 
                        size="small" 
                        color="info"
                        sx={{ p: 0.75 }}
                      >
                        <IconEye size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar venta">
                      <IconButton 
                        size="small" 
                        color="success"
                        sx={{ p: 0.75 }}
                      >
                        <IconEdit size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Anular venta">
                      <IconButton 
                        size="small" 
                        color="error"
                        sx={{ p: 0.75 }}
                      >
                        <IconTrash size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={1} mb={1} display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Mostrando {ventasPaginadas.length} ventas de {ventasFiltradas.length} filtradas.
        </Typography>
      </Box>

      <TablePagination
        rowsPerPageOptions={[50, 100, 150]}
        component="div"
        count={ventasFiltradas.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />

      {/* Menú de filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'cliente' && 'Filtrar por Cliente'}
          {columnaActiva === 'estado' && 'Filtrar por Estado'}
          {columnaActiva === 'nro' && 'Filtrar por Nº Comprobante'}
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
                if (e.key === 'Enter' && columnaActiva) {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: filtroColInput }));
                  setPage(0);
                  cerrarMenu();
                }
              }}
            />
            <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
              <Button size="small" onClick={() => { setFiltroColInput(''); if (columnaActiva) setFiltrosColumna((p) => ({ ...p, [columnaActiva]: '' })); }}>Limpiar</Button>
              <Button size="small" variant="contained" color="success" onClick={() => { if (columnaActiva) { setFiltrosColumna((p) => ({ ...p, [columnaActiva]: filtroColInput })); setPage(0); cerrarMenu(); } }}>Aplicar</Button>
            </Box>
          </Box>
        )}
      </Menu>
    </Paper>
  );
}

export default TablaVentas;
