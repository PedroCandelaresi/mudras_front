'use client';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { AGREGAR_DETALLE_OC } from '@/components/compras/graphql/mutations';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';
import ModalSeleccionarArticulo from './ModalSeleccionarArticulo';

type Props = { open: boolean; onClose: () => void; onSuccess: () => void; ordenId: number | null };

const ModalAgregarDetalleOC: React.FC<Props> = ({ open, onClose, onSuccess, ordenId }) => {
  const [articuloId, setArticuloId] = useState('');
  const [articuloSel, setArticuloSel] = useState<any | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [agregar, { loading }] = useMutation(AGREGAR_DETALLE_OC);

  const handleSave = async () => {
    const aId = Number(articuloId); const cant = Number(cantidad);
    if (!ordenId || !aId || !cant) return;
    await agregar({ variables: { input: { ordenId, articuloId: aId, cantidad: cant, precioUnitario: precio !== '' ? Number(precio) : null } } });
    onSuccess();
    setArticuloId(''); setCantidad(''); setPrecio('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <TexturedPanel accent={verde.primary} radius={12} contentPadding={0}>
        <DialogTitle>Agregar detalle a OC #{ordenId ?? ''}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label="Artículo (ID)" value={articuloId} onChange={(e) => setArticuloId(e.target.value)} fullWidth />
              <CrystalButton baseColor={verde.primary} onClick={() => setSelectorOpen(true)}>Buscar…</CrystalButton>
            </Box>
            <Typography variant="caption" color="text.secondary">{articuloSel ? `${articuloSel.Codigo ?? ''} — ${articuloSel.Descripcion ?? ''}` : 'Sin selección'}</Typography>
          </Box>
          <TextField label="Cantidad" type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} fullWidth sx={{ mt: 1.5 }} />
          <TextField label="Precio unitario (opcional)" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} fullWidth sx={{ mt: 1.5 }} />
        </DialogContent>
        <DialogActions>
          <CrystalSoftButton baseColor={verde.primary} onClick={onClose} disabled={loading}>Cancelar</CrystalSoftButton>
          <CrystalButton baseColor={verde.primary} onClick={handleSave} disabled={loading || !articuloId || !cantidad}>Agregar</CrystalButton>
        </DialogActions>
      </TexturedPanel>
      <ModalSeleccionarArticulo
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(a) => { setArticuloSel(a); setArticuloId(String(a.id)); setSelectorOpen(false); }}
      />
    </Dialog>
  );
};

export default ModalAgregarDetalleOC;
