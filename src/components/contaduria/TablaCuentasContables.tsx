"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Stack, Chip, Button, IconButton } from "@mui/material";
import PaginacionMudras from "@/components/ui/PaginacionMudras";
import { IconSearch, IconReportMoney } from "@tabler/icons-react";
import SearchToolbar from "@/components/ui/SearchToolbar";
import { verdeMilitar } from "@/ui/colores";

export interface CuentaContableItem {
  codigo: string;
  nombre: string;
  tipo: "ACTIVO" | "PASIVO" | "PATRIMONIO" | "INGRESO" | "EGRESO";
  saldo: number;
}

interface Props {
  items?: CuentaContableItem[];
}

type TablaCuentasUiState = {
  page: number;
  rowsPerPage: number;
  busqueda: string;
};

const tablaCuentasUiStateCache = new Map<string, TablaCuentasUiState>();

const TablaCuentasContables: React.FC<Props> = ({ items = [] }) => {
  const tableTopRef = React.useRef<HTMLDivElement>(null);
  const cacheKey = "tabla-cuentas-contables";
  const cachedState = tablaCuentasUiStateCache.get(cacheKey);
  const [page, setPage] = useState(cachedState?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(cachedState?.rowsPerPage ?? 50);
  const [busqueda, setBusqueda] = useState(cachedState?.busqueda ?? "");

  React.useEffect(() => {
    tablaCuentasUiStateCache.set(cacheKey, { page, rowsPerPage, busqueda });
  }, [cacheKey, page, rowsPerPage, busqueda]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c => c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q) || c.tipo.toLowerCase().includes(q));
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
      <SearchToolbar
        title="Plan de Cuentas"
        icon={<IconReportMoney style={{ marginRight: 8, verticalAlign: 'middle' }} />}
        baseColor={verdeMilitar.primary}
        placeholder="Buscar cuentas (código, nombre, tipo)"
        searchValue={busqueda}
        onSearchValueChange={(v) => { setBusqueda(v); setPage(0); }}
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
        itemLabel="cuentas"
        accentColor={verdeMilitar.primary}
        rowsPerPageOptions={[20, 50, 100, 150]}
      />

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200', bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: verdeMilitar.primary, color: '#eef5ee' } }}>
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

      <PaginacionMudras
        page={page}
        rowsPerPage={rowsPerPage}
        total={filtrados.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        itemLabel="cuentas"
        accentColor={verdeMilitar.primary}
        rowsPerPageOptions={[20, 50, 100, 150]}
      />
    </Paper>
  );
};

export default TablaCuentasContables;
