"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Stack, Chip, Button, IconButton } from "@mui/material";
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
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c => c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q) || c.tipo.toLowerCase().includes(q));
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
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      } : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'primary.light', color: 'primary.dark' }
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
    </Paper>
  );
};

export default TablaCuentasContables;
