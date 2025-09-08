"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Stack, Chip, Tooltip, IconButton } from "@mui/material";
import { IconSearch, IconCalendar, IconFileText, IconEye } from "@tabler/icons-react";
import { ModalBase } from "@/ui/ModalBase";

export interface AsientoItem {
  id: number | string;
  fecha: string; // ISO
  descripcion: string;
  comprobante?: string | null;
  totalDebe: number;
  totalHaber: number;
}

interface Props {
  items?: AsientoItem[];
}

const TablaAsientos: React.FC<Props> = ({ items = [] }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [busqueda, setBusqueda] = useState("");
  const [sel, setSel] = useState<AsientoItem | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter(a => `${a.id}`.includes(q) || a.descripcion.toLowerCase().includes(q) || (a.comprobante || '').toLowerCase().includes(q));
  }, [items, busqueda]);

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return filtrados.slice(start, start + rowsPerPage);
  }, [filtrados, page, rowsPerPage]);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="success.dark">
          <IconFileText style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Asientos Contables
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar asientos (ID, descripción, comprobante)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{ startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            )}}
            sx={{ minWidth: 320 }}
          />
        </Stack>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200', bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: '#2f3e2e', color: '#eef5ee' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Comprobante</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', textAlign: 'right' }}>Debe</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', textAlign: 'right' }}>Haber</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginados.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.id}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconCalendar size={16} />
                    <Typography variant="body2">{new Date(a.fecha).toLocaleDateString()}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{a.descripcion}</Typography>
                </TableCell>
                <TableCell>
                  {a.comprobante ? <Chip size="small" label={a.comprobante} /> : <Typography variant="caption" color="text.secondary">—</Typography>}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>${a.totalDebe.toLocaleString()}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>${a.totalHaber.toLocaleString()}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalle">
                    <IconButton size="small" color="info" onClick={() => setSel(a)}>
                      <IconEye size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography align="center" color="text.secondary">Sin asientos</Typography>
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
        abierto={Boolean(sel)}
        titulo={`Asiento #${sel?.id ?? ''}`}
        onCerrar={() => setSel(null)}
        cancelarTexto="Cerrar"
      >
        <Typography variant="body2" color="text.secondary">Detalle del asiento (líneas debe/haber) a implementar.</Typography>
      </ModalBase>
    </Paper>
  );
};

export default TablaAsientos;
