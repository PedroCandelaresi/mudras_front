'use client';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, Tooltip } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { verde } from '@/ui/colores';
import CrystalButton, { CrystalIconButton } from '@/components/ui/CrystalButton';
import { Icon } from '@iconify/react';

type Gasto = {
  id: number; fecha: string; montoNeto: number; alicuotaIva?: number; montoIva: number; total: number; descripcion?: string;
  proveedor?: { IdProveedor: number; Nombre?: string } | null; categoria?: { id: number; nombre: string } | null;
};

type Props = { gastos: Gasto[]; onDelete?: (id: number) => void };

const TablaGastos: React.FC<Props> = ({ gastos, onDelete }) => {
  const headerBg = darken(verde.primary, 0.25);
  return (
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell>Fecha</TableCell>
          <TableCell>Proveedor</TableCell>
          <TableCell>Categoría</TableCell>
          <TableCell align="right">Neto</TableCell>
          <TableCell align="right">IVA</TableCell>
          <TableCell align="right">Total</TableCell>
          <TableCell>Descripción</TableCell>
          <TableCell align="center">Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {gastos.map((g) => (
          <TableRow key={g.id} hover>
            <TableCell>{new Date(g.fecha).toLocaleDateString('es-AR')}</TableCell>
            <TableCell>{g.proveedor?.Nombre || (g.proveedor ? `Prov #${g.proveedor.IdProveedor}` : '—')}</TableCell>
            <TableCell>
              {g.categoria ? (
                <Chip size="small" label={g.categoria.nombre} sx={{ bgcolor: alpha(headerBg, 0.2) }} />
              ) : '—'}
            </TableCell>
            <TableCell align="right">${(g.montoNeto || 0).toLocaleString('es-AR')}</TableCell>
            <TableCell align="right">{g.alicuotaIva ? `${g.alicuotaIva}%` : '—'} (${(g.montoIva || 0).toLocaleString('es-AR')})</TableCell>
            <TableCell align="right">${(g.total || 0).toLocaleString('es-AR')}</TableCell>
            <TableCell>{g.descripcion || '—'}</TableCell>
            <TableCell align="center">
              {onDelete && (
                <Tooltip title="Eliminar">
                  <CrystalIconButton baseColor="#b71c1c" onClick={() => onDelete(g.id)}>
                    <Icon icon="mdi:trash-can" />
                  </CrystalIconButton>
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TablaGastos;

