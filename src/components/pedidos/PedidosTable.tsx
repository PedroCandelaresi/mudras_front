import { Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';

const pedidos = [
  // ...mock data...
];

export default function PedidosTable({ onEdit }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Proveedor</TableCell>
          <TableCell>Fecha</TableCell>
          <TableCell>Cantidad</TableCell>
          <TableCell>Costo Total</TableCell>
          <TableCell>Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pedidos.map((pedido) => (
          <TableRow key={pedido.id}>
            <TableCell>{pedido.proveedor}</TableCell>
            <TableCell>{pedido.fecha}</TableCell>
            <TableCell>{pedido.cantidad}</TableCell>
            <TableCell>{pedido.costo}</TableCell>
            <TableCell>
              <IconButton onClick={() => onEdit(pedido)}>
                <Edit />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
