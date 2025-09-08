"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Button, Stack, Chip, Tooltip, IconButton } from "@mui/material";
import { IconSearch, IconCurrencyDollar, IconCalendar, IconUser, IconEye } from "@tabler/icons-react";
import { ModalBase } from "@/ui/ModalBase";

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
  const [rowsPerPage, setRowsPerPage] = useState(25);
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

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return filtrados.slice(start, start + rowsPerPage);
  }, [filtrados, page, rowsPerPage]);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="success.dark">
          <IconCurrencyDollar style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Ventas
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar ventas (ID, cliente, estado)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{ startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            )}}
            sx={{ minWidth: 280 }}
          />
        </Stack>
      </Box>

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

      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={filtrados.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        labelRowsPerPage="Filas por página:"
      />

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

