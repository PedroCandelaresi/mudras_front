import React, { useState, useMemo } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Chip, Tooltip, IconButton, TableContainer, Paper, Box } from '@mui/material';
import PaginacionMudras from '@/components/ui/PaginacionMudras';
import { Icon } from '@iconify/react';
import { verdeMilitar } from '@/ui/colores';

export type TablaGasto = {
  id: number;
  fecha?: string | null;
  montoNeto?: number | null;
  alicuotaIva?: number | null;
  montoIva?: number | null;
  total?: number | null;
  descripcion?: string | null;
  proveedor?: { IdProveedor: number; Nombre?: string | null } | null;
  categoria?: { id: number; nombre?: string | null } | null;
};

type Props = { gastos: TablaGasto[]; onDelete?: (id: number) => void };

type TablaGastosUiState = {
  page: number;
  rowsPerPage: number;
};

const tablaGastosUiStateCache = new Map<string, TablaGastosUiState>();

const TablaGastos: React.FC<Props> = ({ gastos, onDelete }) => {
  const cacheKey = 'tabla-gastos';
  const cachedState = tablaGastosUiStateCache.get(cacheKey);
  const [page, setPage] = useState(cachedState?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(cachedState?.rowsPerPage ?? 50);
  const tableTopRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    tablaGastosUiStateCache.set(cacheKey, { page, rowsPerPage });
  }, [cacheKey, page, rowsPerPage]);

  const paginados = useMemo(() => {
    return gastos.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [gastos, page, rowsPerPage]);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box>
      <Box ref={tableTopRef} />
      <PaginacionMudras
        page={page}
        rowsPerPage={rowsPerPage}
        total={gastos.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        itemLabel="gastos"
        accentColor={verdeMilitar.primary}
        rowsPerPageOptions={[50, 100, 150, 300, 500]}
      />
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>FECHA</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>PROVEEDOR</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>CATEGORÍA</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>NETO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>IVA</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>TOTAL</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>DESCRIPCIÓN</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gastos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  No hay gastos registrados.
                </TableCell>
              </TableRow>
            ) : (
              paginados.map((g) => (
                <TableRow key={g.id} hover>
                  <TableCell>{g.fecha ? new Date(g.fecha).toLocaleDateString('es-AR') : '—'}</TableCell>
                  <TableCell>{g.proveedor?.Nombre || (g.proveedor ? `Prov #${g.proveedor.IdProveedor}` : '—')}</TableCell>
                  <TableCell>
                    {g.categoria ? (
                      <Chip size="small" label={g.categoria.nombre} sx={{ borderRadius: 0, bgcolor: '#e0e0e0' }} />
                    ) : '—'}
                  </TableCell>
                  <TableCell align="right">${(g.montoNeto || 0).toLocaleString('es-AR')}</TableCell>
                  <TableCell align="right">{g.alicuotaIva ? `${g.alicuotaIva}%` : '—'} (${(g.montoIva || 0).toLocaleString('es-AR')})</TableCell>
                  <TableCell align="right"><strong>${(g.total || 0).toLocaleString('es-AR')}</strong></TableCell>
                  <TableCell>{g.descripcion || '—'}</TableCell>
                  <TableCell align="center">
                    {onDelete && (
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(g.id)}
                          sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}
                        >
                          <Icon icon="mdi:trash-can" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <PaginacionMudras
        page={page}
        rowsPerPage={rowsPerPage}
        total={gastos.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        itemLabel="gastos"
        accentColor={verdeMilitar.primary}
        rowsPerPageOptions={[50, 100, 150, 300, 500]}
      />
    </Box>
  );
};

export default TablaGastos;
