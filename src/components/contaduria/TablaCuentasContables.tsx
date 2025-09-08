"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Stack, Chip } from "@mui/material";
import { IconSearch, IconReportMoney } from "@tabler/icons-react";

export interface CuentaContableItem {
  codigo: string;
  nombre: string;
  tipo: "ACTIVO" | "PASIVO" | "PATRIMONIO" | "INGRESO" | "EGRESO";
  saldo: number;
}

interface Props {
  items?: CuentaContableItem[];
}

const TablaCuentasContables: React.FC<Props> = ({ items = [] }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c => c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q) || c.tipo.toLowerCase().includes(q));
  }, [items, busqueda]);

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return filtrados.slice(start, start + rowsPerPage);
  }, [filtrados, page, rowsPerPage]);

  const colorTipo = (tipo: CuentaContableItem["tipo"]) => {
    switch (tipo) {
      case "ACTIVO": return "success" as const;
      case "PASIVO": return "warning" as const;
      case "PATRIMONIO": return "info" as const;
      case "INGRESO": return "success" as const;
      case "EGRESO": return "error" as const;
    }
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="success.dark">
          <IconReportMoney style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Plan de Cuentas
        </Typography>
        <TextField
          size="small"
          placeholder="Buscar cuentas (código, nombre, tipo)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{ startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={18} />
            </InputAdornment>
          )}}
          sx={{ minWidth: 320 }}
        />
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200', bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: '#2f3e2e', color: '#eef5ee' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', textAlign: 'right' }}>Saldo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginados.map((c) => (
              <TableRow key={c.codigo} hover>
                <TableCell><Typography variant="body2" fontFamily="monospace">{c.codigo}</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={600}>{c.nombre}</Typography></TableCell>
                <TableCell><Chip size="small" label={c.tipo} color={colorTipo(c.tipo)} /></TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={700}>${c.saldo.toLocaleString()}</Typography></TableCell>
              </TableRow>
            ))}
            {paginados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography align="center" color="text.secondary">Sin cuentas</Typography>
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
    </Paper>
  );
};

export default TablaCuentasContables;
