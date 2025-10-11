import { useState } from 'react';
import { Box, Button } from '@mui/material';
import PedidosTable from './PedidosTable';
import ModalPedido from './ModalPedido';

export default function PedidosPanel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoEdit, setPedidoEdit] = useState(null);

  const handleNewPedido = () => {
    setPedidoEdit(null);
    setModalOpen(true);
  };

  const handleEditPedido = (pedido) => {
    setPedidoEdit(pedido);
    setModalOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={handleNewPedido}>
          Nuevo Pedido
        </Button>
      </Box>
      <PedidosTable onEdit={handleEditPedido} />
      <ModalPedido open={modalOpen} onClose={() => setModalOpen(false)} pedido={pedidoEdit} />
    </Box>
  );
}
