"use client";
import React, { useMemo, useState } from "react";
import {
  Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, TextField, InputAdornment, Stack, Chip, Tooltip, IconButton, Paper, Button, MenuItem
} from "@mui/material";
import {
  IconReceipt, IconCalendar, IconUser, IconEye, IconSearch, IconX, IconPlus
} from "@tabler/icons-react";
import { ModalBase } from "@/ui/ModalBase";

export interface PedidoItem {
  id: number | string;
  fecha: string; // ISO
  cliente?: string | null;
  estado: "PENDIENTE" | "PREPARANDO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";
  total?: number | null;
}

interface Props {
  items?: PedidoItem[];
  puedeCrear?: boolean;
  onNuevoPedido?: () => void;
}

export function TablaPedidos({ items = [], puedeCrear = false, onNuevoPedido }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState("");
  const [pedidoSel, setPedidoSel] = useState<PedidoItem | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      `${p.id}`.toLowerCase().includes(q) ||
      p.cliente?.toLowerCase().includes(q) ||
      p.estado.toLowerCase().includes(q)
    );
  }, [items, busqueda]);

  const totalPaginas = Math.ceil(filtrados.length / rowsPerPage) || 1;
  const start = page * rowsPerPage;
  const paginados = useMemo(() => filtrados.slice(start, start + rowsPerPage), [filtrados, start, rowsPerPage]);

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
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconReceipt size={24} color="#546e7a" />
          <Typography variant="h6" fontWeight={700}>
            Pedidos
          </Typography>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Buscar (ID, cliente, estado)..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                bgcolor: '#f5f5f5',
                minWidth: 250
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} color="#757575" />
                </InputAdornment>
              ),
              endAdornment: busqueda && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setBusqueda('')} size="small">
                    <IconX size={18} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {puedeCrear && (
            <Button
              variant="contained"
              onClick={onNuevoPedido}
              startIcon={<IconPlus />}
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
              Nuevo Pedido
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>FECHA</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>PROVEEDOR</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ESTADO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>TOTAL</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">Sin datos</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginados.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell><Typography variant="body2" fontFamily="monospace">#{p.id}</Typography></TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCalendar size={16} color="#757575" />
                      <Typography variant="body2">
                        {new Date(p.fecha).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconUser size={16} color="#757575" />
                      <Typography variant="body2">{p.cliente || "—"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.estado}
                      size="small"
                      sx={{ borderRadius: 0 }}
                      color={
                        p.estado === "ENTREGADO"
                          ? "success"
                          : p.estado === "PENDIENTE"
                            ? "warning"
                            : p.estado === "CANCELADO"
                              ? "error"
                              : "default"
                      }
                      variant={p.estado === "CANCELADO" ? "outlined" : "filled"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700}>
                      ${(p.total ?? 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() => setPedidoSel(p)}
                        sx={{
                          color: '#546e7a',
                          '&:hover': { bgcolor: '#eceff1' }
                        }}
                      >
                        <IconEye size={18} />
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
          Mostrando {Math.min(rowsPerPage, paginados.length)} de {filtrados.length} pedidos
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            select
            size="small"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(parseInt(e.target.value as string, 10)); setPage(0); }}
            sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          >
            {[50, 100, 150].map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          <Box display="flex" gap={1}>
            <Button variant="outlined" disabled={page === 0} onClick={() => setPage(p => p - 1)} sx={{ borderRadius: 0, minWidth: 40, p: 1 }}>
              {'<'}
            </Button>
            <Typography variant="body2" alignSelf="center">
              Página {page + 1} de {Math.max(1, totalPaginas)}
            </Typography>
            <Button variant="outlined" disabled={page >= totalPaginas - 1} onClick={() => setPage(p => p + 1)} sx={{ borderRadius: 0, minWidth: 40, p: 1 }}>
              {'>'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Basic modal for details (placeholder logic from original file) */}
      <ModalBase
        abierto={Boolean(pedidoSel)}
        titulo={`Pedido #${pedidoSel?.id ?? ""}`}
        onCerrar={() => setPedidoSel(null)}
        cancelarTexto="Cerrar"
      >
        <Typography variant="body2" color="text.secondary">
          Detalle a implementar (líneas, envíos, pagos, etc.).
        </Typography>
      </ModalBase>
    </Box>
  );
}

export default TablaPedidos;
