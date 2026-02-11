"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Stack, Chip, Tooltip, IconButton, Button } from "@mui/material";
import PaginacionMudras from "@/components/ui/PaginacionMudras";
import { IconSearch, IconCalendar, IconFileText, IconEye } from "@tabler/icons-react";
import { ModalBase } from "@/ui/ModalBase";
import SearchToolbar from "@/components/ui/SearchToolbar";

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
  const tableTopRef = React.useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState("");
  const [sel, setSel] = useState<AsientoItem | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter(a => `${a.id}`.includes(q) || a.descripcion.toLowerCase().includes(q) || (a.comprobante || '').toLowerCase().includes(q));
  }, [items, busqueda]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return filtrados.slice(start, start + rowsPerPage);
  }, [filtrados, page, rowsPerPage]);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <SearchToolbar
        title="Asientos Contables"
        icon={<IconFileText style={{ marginRight: 8, verticalAlign: 'middle' }} />}
        baseColor="#2e7d32"
        placeholder="Buscar asientos (ID, descripción, comprobante)"
        searchValue={busqueda}
        onSearchValueChange={setBusqueda}
        onSubmitSearch={() => setPage(0)}
        onClear={() => { setBusqueda(""); setPage(0); }}
      />

      <Box ref={tableTopRef} />
      <PaginacionMudras
        page={page}
        rowsPerPage={rowsPerPage}
        total={filtrados.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        itemLabel="asientos"
        accentColor="#2e7d32"
        rowsPerPageOptions={[20, 50, 100, 150]}
      />

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

      <PaginacionMudras
        page={page}
        rowsPerPage={rowsPerPage}
        total={filtrados.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        itemLabel="asientos"
        accentColor="#2e7d32"
        rowsPerPageOptions={[20, 50, 100, 150]}
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
