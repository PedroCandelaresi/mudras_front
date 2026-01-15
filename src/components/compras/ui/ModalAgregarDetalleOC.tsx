'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, Box, Typography, Button, IconButton, InputAdornment } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { AGREGAR_DETALLE_OC } from '@/components/compras/graphql/mutations';
import ModalSeleccionarArticulo from './ModalSeleccionarArticulo';
import { Icon } from '@iconify/react';

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
    setArticuloId(''); setArticulationSel(null); setCantidad(''); setPrecio('');
  };

  const setArticulationSel = (a: any | null) => {
    setArticuloSel(a);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
        }
      }}
    >
      <Box sx={{
        bgcolor: '#f5f5f5',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon icon="mdi:playlist-plus" width={24} height={24} color="#546e7a" />
          <Typography variant="h6" fontWeight={700}>
            Agregar Detalle a OC #{ordenId ?? ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Box display="grid" gap={3}>
          <Box>
            <Box display="flex" gap={1}>
              <TextField
                label="Artículo ID"
                value={articuloId}
                onChange={(e) => setArticuloId(e.target.value)}
                fullWidth
                size="small"
                InputProps={{ sx: { borderRadius: 0 } }}
              />
              <Button
                variant="outlined"
                onClick={() => setSelectorOpen(true)}
                sx={{ borderRadius: 0, textTransform: 'none', fontWeight: 600, borderColor: '#bdbdbd', color: 'text.primary' }}
              >
                Buscar...
              </Button>
            </Box>
            <Box mt={1} p={1.5} bgcolor="#f5f5f5" border="1px solid #e0e0e0">
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>
                ARTÍCULO SELECCIONADO
              </Typography>
              <Typography variant="body2">
                {articuloSel ? `${articuloSel.Codigo ?? ''} — ${articuloSel.Descripcion ?? ''}` : 'Ninguno. Ingrese ID o busque en la lista.'}
              </Typography>
            </Box>
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              label="Cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              fullWidth
              size="small"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
            <TextField
              label="Precio Unit. (Opcional)"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              fullWidth
              size="small"
              InputProps={{ sx: { borderRadius: 0 }, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} disabled={loading} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSave}
          disabled={loading || !articuloId || !cantidad}
          sx={{ bgcolor: '#5d4037', borderRadius: 0, px: 3, fontWeight: 700, '&:hover': { bgcolor: '#4e342e' } }}
        >
          Agregar Detalle
        </Button>
      </DialogActions>

      <ModalSeleccionarArticulo
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(a) => { setArticuloSel(a); setArticuloId(String(a.id)); setSelectorOpen(false); }}
      />
    </Dialog>
  );
};

export default ModalAgregarDetalleOC;
