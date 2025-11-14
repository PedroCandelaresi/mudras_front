'use client';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import CrystalButton, { CrystalIconButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';
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
  const headerBg = darken(verde.primary, 0.25);
  return (
    <TableContainer sx={{ border: `1px solid ${alpha(verde.borderInner, 0.5)}`, borderRadius: 2, bgcolor: 'rgba(255, 250, 242, 0.94)' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Orden</TableCell>
            <TableCell>Proveedor</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Emisión</TableCell>
            <TableCell>Recepción</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ordenes.map((oc) => (
            <TableRow key={oc.id} hover>
              <TableCell>#{oc.id}</TableCell>
              <TableCell>{oc.proveedor?.Nombre || `Proveedor #${oc.proveedorId}`}</TableCell>
              <TableCell>
                <Chip
                  label={oc.estado ?? '—'}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: alpha(headerBg, 0.2) }}
                />
              </TableCell>
              <TableCell>{oc.fechaEmision ? new Date(oc.fechaEmision).toLocaleString('es-AR') : '—'}</TableCell>
              <TableCell>{oc.fechaRecepcion ? new Date(oc.fechaRecepcion).toLocaleString('es-AR') : '—'}</TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  {oc.estado === 'BORRADOR' && onAgregarDetalle && (
                    <Tooltip title="Agregar detalle">
                      <CrystalIconButton baseColor={verde.primary} onClick={() => onAgregarDetalle(oc.id)}>
                        <Icon icon="mdi:plus-box" />
                      </CrystalIconButton>
                    </Tooltip>
                  )}
                  {oc.estado === 'BORRADOR' && (
                    <Tooltip title="Emitir">
                      <CrystalIconButton baseColor={verde.primary} onClick={() => onEmitir(oc.id)}>
                        <Icon icon="mdi:send-check" />
                      </CrystalIconButton>
                    </Tooltip>
                  )}
                  {(oc.estado === 'EMITIDA' || oc.estado === 'BORRADOR') && (
                    <Tooltip title="Recepcionar">
                      <CrystalIconButton baseColor={verde.primary} onClick={() => onRecepcionar(oc.id)}>
                        <Icon icon="mdi:truck-delivery-outline" />
                      </CrystalIconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TablaOrdenesCompra;
