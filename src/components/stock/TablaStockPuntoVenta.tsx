'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, Tooltip,
  TextField, Skeleton, MenuItem, IconButton, Button, InputAdornment
} from '@mui/material';
import { Icon } from '@iconify/react';

import { PuntoMudras } from '@/interfaces/puntos-mudras';

interface ArticuloStock {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stockAsignado: number;
  stockTotal: number;
  rubro?: { id: number; nombre: string } | null;
}

interface Props {
  puntoVenta: PuntoMudras;
  onModificarStock: (articulo: any) => void;
  onNuevaAsignacion: () => void;
  refetchTrigger: number;
}

export default function TablaStockPuntoVenta({
  puntoVenta,
  onModificarStock,
  onNuevaAsignacion,
  refetchTrigger,
}: Props) {
  const [articulos, setArticulos] = useState<ArticuloStock[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroInput, setFiltroInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    const cargarStock = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query ObtenerStockPuntoMudras($puntoMudrasId: Int!) {
                obtenerStockPuntoMudras(puntoMudrasId: $puntoMudrasId) {
                  id
                  nombre
                  codigo
                  precio
                  stockAsignado
                  stockTotal
                  rubro { id nombre }
                }
              }
            `,
            variables: { puntoMudrasId: puntoVenta.id },
          }),
        });

        const result = await response.json();
        setArticulos(Array.isArray(result.data?.obtenerStockPuntoMudras) ? result.data.obtenerStockPuntoMudras : []);
      } catch {
        setArticulos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarStock();
  }, [puntoVenta.id, refetchTrigger]);

  const handleModificar = (art: ArticuloStock) => {
    onModificarStock({ ...art, puntoVentaId: puntoVenta.id, puntoVentaNombre: puntoVenta.nombre });
  };

  const articulosFiltrados = useMemo(() => {
    if (!filtroInput) return articulos;
    const term = filtroInput.toLowerCase();
    return articulos.filter((a) =>
      a.nombre.toLowerCase().includes(term) ||
      a.codigo.toLowerCase().includes(term) ||
      (a.rubro?.nombre?.toLowerCase() ?? '').includes(term)
    );
  }, [articulos, filtroInput]);

  const totalPaginas = Math.ceil(articulosFiltrados.length / rowsPerPage);
  const articulosPaginados = useMemo(
    () => articulosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [articulosFiltrados, page, rowsPerPage]
  );

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Toolbar */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        bgcolor: '#fff',
        border: '1px solid #e0e0e0',
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon icon="mdi:store" width={24} height={24} color="#546e7a" />
          <Typography variant="h6" fontWeight={700}>
            Stock en {puntoVenta.nombre}
          </Typography>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Buscar por código, nombre..."
            value={filtroInput}
            onChange={(e) => {
              setFiltroInput(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                bgcolor: '#f5f5f5'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="mdi:magnify" color="#757575" />
                </InputAdornment>
              ),
              endAdornment: filtroInput && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setFiltroInput('')} size="small">
                    <Icon icon="mdi:close" width={18} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            onClick={onNuevaAsignacion}
            startIcon={<Icon icon="mdi:plus" />}
            disableElevation
            sx={{
              bgcolor: '#5d4037',
              color: '#fff',
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#4e342e' }
            }}
          >
            Nueva Asignación
          </Button>
        </Box>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>CÓDIGO</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ARTÍCULO</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>RUBRO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>PRECIO</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>ASIGNADO</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>TOTAL</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>ESTADO</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articulosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {articulos.length === 0
                      ? 'No hay artículos asignados a este punto de venta'
                      : 'No se encontraron artículos con los filtros aplicados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              articulosPaginados.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell><Typography variant="body2" fontFamily="monospace">{a.codigo}</Typography></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600}>{a.nombre}</Typography></TableCell>
                  <TableCell>
                    {a.rubro ? (
                      <Chip label={a.rubro.nombre} size="small" sx={{ borderRadius: 0, bgcolor: '#e0e0e0', color: '#424242', fontWeight: 500 }} />
                    ) : (
                      <Chip label="Sin rubro" size="small" variant="outlined" sx={{ borderRadius: 0 }} />
                    )}
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2" fontWeight={600}>${a.precio.toLocaleString('es-AR')}</Typography></TableCell>
                  <TableCell align="center"><Typography variant="body2" fontWeight={700}>{a.stockAsignado}</Typography></TableCell>
                  <TableCell align="center"><Typography variant="body2">{a.stockTotal}</Typography></TableCell>
                  <TableCell align="center">
                    {a.stockAsignado === 0 ? (
                      <Chip label="Sin stock" size="small" color="error" variant="outlined" sx={{ borderRadius: 0 }} />
                    ) : a.stockAsignado <= 5 ? (
                      <Chip label="Stock bajo" size="small" color="warning" sx={{ borderRadius: 0 }} />
                    ) : (
                      <Chip label="Disponible" size="small" color="success" variant="outlined" sx={{ borderRadius: 0 }} />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modificar stock">
                      <IconButton onClick={() => handleModificar(a)} size="small" sx={{ color: '#5d4037' }}>
                        <Icon icon="mdi:pencil" width={20} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="#fff" border="1px solid #e0e0e0">
        <Typography variant="caption" color="text.secondary">
          Mostrando {Math.min(rowsPerPage, articulosPaginados.length)} de {articulosFiltrados.length} artículos
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            select
            size="small"
            value={String(rowsPerPage)}
            onChange={handleChangeRowsPerPage}
            sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          >
            {[50, 100, 150].map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              sx={{ borderRadius: 0, minWidth: 40, p: 1 }}
            >
              <Icon icon="mdi:chevron-left" />
            </Button>
            <Typography variant="body2" alignSelf="center">
              Página {page + 1} de {Math.max(1, totalPaginas)}
            </Typography>
            <Button
              variant="outlined"
              disabled={page >= totalPaginas - 1}
              onClick={() => setPage(p => p + 1)}
              sx={{ borderRadius: 0, minWidth: 40, p: 1 }}
            >
              <Icon icon="mdi:chevron-right" />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
