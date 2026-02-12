import React, { useState, useMemo } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip, Paper, IconButton } from '@mui/material';
import PaginacionMudras from '@/components/ui/PaginacionMudras';
import { Icon } from '@iconify/react';

export interface OrdenCompraRow {
  id: number;
  proveedorId?: number | null;
  estado?: string | null;
  observaciones?: string | null;
  creadoEn?: string | null;
  fechaEmision?: string | null;
  fechaRecepcion?: string | null;
  proveedor?: { IdProveedor: number; Nombre?: string | null } | null;
}

type Props = {
  ordenes: OrdenCompraRow[];
  onEmitir: (id: number) => void;
  onRecepcionar: (id: number) => void;
  onAgregarDetalle?: (id: number) => void;
};

const TablaOrdenesCompra: React.FC<Props> = ({ ordenes, onEmitir, onRecepcionar, onAgregarDetalle }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const tableTopRef = React.useRef<HTMLDivElement>(null);

  const paginados = useMemo(() => {
    return ordenes.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [ordenes, page, rowsPerPage]);

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
        total={ordenes.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        itemLabel="órdenes"
        accentColor="#546e7a"
        rowsPerPageOptions={[50, 100, 150, 300, 500]}
      />
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ORDEN</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>PROVEEDOR</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ESTADO</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>EMISIÓN</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>RECEPCIÓN</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  No hay órdenes de compra registradas.
                </TableCell>
              </TableRow>
            ) : (
              paginados.map((oc) => (
                <TableRow key={oc.id} hover>
                  <TableCell><Box fontFamily="monospace">#{oc.id}</Box></TableCell>
                  <TableCell>{oc.proveedor?.Nombre || `Proveedor #${oc.proveedorId}`}</TableCell>
                  <TableCell>
                    <Chip
                      label={oc.estado ?? '—'}
                      size="small"
                      sx={{ borderRadius: 0 }}
                      color={
                        oc.estado === 'RECEPCIONADA' ? 'success' :
                          oc.estado === 'EMITIDA' ? 'info' :
                            'default'
                      }
                      variant={oc.estado === 'BORRADOR' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell>{oc.fechaEmision ? new Date(oc.fechaEmision).toLocaleString('es-AR') : '—'}</TableCell>
                  <TableCell>{oc.fechaRecepcion ? new Date(oc.fechaRecepcion).toLocaleString('es-AR') : '—'}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {oc.estado === 'BORRADOR' && onAgregarDetalle && (
                        <Tooltip title="Agregar detalle">
                          <IconButton size="small" onClick={() => onAgregarDetalle(oc.id)} sx={{ color: '#546e7a' }}>
                            <Icon icon="mdi:plus-box" width={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {oc.estado === 'BORRADOR' && (
                        <Tooltip title="Emitir">
                          <IconButton size="small" onClick={() => onEmitir(oc.id)} sx={{ color: '#2e7d32' }}>
                            <Icon icon="mdi:send-check" width={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(oc.estado === 'EMITIDA' || oc.estado === 'BORRADOR') && (
                        <Tooltip title="Recepcionar">
                          <IconButton size="small" onClick={() => onRecepcionar(oc.id)} sx={{ color: '#e65100' }}>
                            <Icon icon="mdi:truck-delivery-outline" width={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
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
        total={ordenes.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        itemLabel="órdenes"
        accentColor="#546e7a"
        rowsPerPageOptions={[50, 100, 150, 300, 500]}
      />
    </Box>
  );
};

export default TablaOrdenesCompra;
