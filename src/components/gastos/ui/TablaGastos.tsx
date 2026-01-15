'use client';
import { Table, TableHead, TableBody, TableRow, TableCell, Chip, Tooltip, IconButton, TableContainer, Paper } from '@mui/material';
import { Icon } from '@iconify/react';

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

const TablaGastos: React.FC<Props> = ({ gastos, onDelete }) => {
  return (
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
            gastos.map((g) => (
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
  );
};

export default TablaGastos;
