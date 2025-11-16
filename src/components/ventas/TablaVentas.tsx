"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Button, Stack, Chip, Tooltip, IconButton } from "@mui/material";
import { IconSearch, IconCurrencyDollar, IconCalendar, IconUser, IconEye } from "@tabler/icons-react";
import { ModalBase } from "@/ui/ModalBase";
import SearchToolbar from "@/components/ui/SearchToolbar";

export interface VentaItem {
  id: number | string;
  fecha: string; // ISO
  cliente?: string | null;
  total: number;
  estado: "PENDIENTE" | "CONFIRMADA" | "CANCELADA";
}

interface Props {
  items?: VentaItem[];
  puedeCrear?: boolean;
}

export function TablaVentas({ items = [], puedeCrear = true }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaItem | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let arr = items;
    if (q) {
      arr = items.filter(v => `${v.id}`.includes(q) || v.cliente?.toLowerCase().includes(q) || v.estado.toLowerCase().includes(q));
    }
    return arr;
  }, [items, busqueda]);

  const totalPaginas = Math.ceil(filtrados.length / rowsPerPage);
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

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return filtrados.slice(start, start + rowsPerPage);
  }, [filtrados, page, rowsPerPage]);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <SearchToolbar
        title="Ventas"
        icon={<IconCurrencyDollar style={{ marginRight: 8, verticalAlign: 'middle' }} />}
        baseColor="#2e7d32"
        placeholder="Buscar ventas (ID, cliente, estado)"
        searchValue={busqueda}
        onSearchValueChange={setBusqueda}
        onSubmitSearch={() => setPage(0)}
        onClear={() => { setBusqueda(""); setPage(0); }}
      />

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200', bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: '#2f3e2e', color: '#eef5ee' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', textAlign: 'right' }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginados.map((v) => (
              <TableRow key={v.id} hover>
                <TableCell>{v.id}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconCalendar size={16} />
                    <Typography variant="body2">{new Date(v.fecha).toLocaleString()}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconUser size={16} />
                    <Typography variant="body2">{v.cliente || '—'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={v.estado} size="small" color={v.estado === 'CONFIRMADA' ? 'success' : v.estado === 'PENDIENTE' ? 'warning' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>${v.total.toLocaleString()}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalle">
                    <IconButton size="small" color="info" onClick={() => setVentaSeleccionada(v)}>
                      <IconEye size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography align="center" color="text.secondary">Sin datos</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Filas por página:
          </Typography>
          <TextField
            select
            size="small"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
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
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filtrados.length)} de ${filtrados.length}`}
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
                    onClick={() => setPage((numeroPagina as number) - 1)}
                    sx={{
                      minWidth: 32,
                      height: 32,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      ...(paginaActual === numeroPagina ? {
                        bgcolor: 'success.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'success.dark' }
                      } : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'success.light', color: 'success.dark' }
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
              onClick={() => setPage(0)}
              disabled={page === 0}
              sx={{ color: 'text.secondary' }}
              title="Primera página"
            >
              ⏮
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              sx={{ color: 'text.secondary' }}
              title="Página anterior"
            >
              ◀
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ color: 'text.secondary' }}
              title="Página siguiente"
            >
              ▶
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage(totalPaginas - 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ color: 'text.secondary' }}
              title="Última página"
            >
              ⏭
            </IconButton>
          </Box>
        </Box>
      </Box>

      <ModalBase
        abierto={Boolean(ventaSeleccionada)}
        titulo={`Venta #${ventaSeleccionada?.id ?? ''}`}
        onCerrar={() => setVentaSeleccionada(null)}
        cancelarTexto="Cerrar"
      >
        <Typography variant="body2" color="text.secondary">Detalle a implementar (productos, cantidades, totales, etc.).</Typography>
      </ModalBase>
    </Paper>
  );
}
