'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, MenuItem, Box, Typography, Button, IconButton } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PROVEEDORES, type GetProveedoresResponse, type ProveedorBasico } from '@/components/proveedores/graphql/queries';
import { GET_ORDENES_COMPRA } from '@/components/compras/graphql/queries';
import { CREAR_ORDEN_COMPRA } from '@/components/compras/graphql/mutations';
import { Icon } from '@iconify/react';

type Props = { open: boolean; onClose: () => void; onSuccess: () => void };

const ModalNuevaOrdenCompra: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const { data: provData, loading } = useQuery<GetProveedoresResponse>(GET_PROVEEDORES, { fetchPolicy: 'cache-and-network' });
  const proveedores: ProveedorBasico[] = provData?.proveedores ?? [];
  const [proveedorId, setProveedorId] = useState('');
  const [obs, setObs] = useState('');
  const [crearOrden, { loading: saving }] = useMutation(CREAR_ORDEN_COMPRA, {
    refetchQueries: [{ query: GET_ORDENES_COMPRA }],
  });

  const handleSave = async () => {
    const id = Number(proveedorId);
    if (!id) return;
    await crearOrden({ variables: { input: { proveedorId: id, observaciones: obs || null } } });
    onSuccess();
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
          <Icon icon="mdi:cart-plus" width={24} height={24} color="#546e7a" />
          <Typography variant="h6" fontWeight={700}>
            Nueva Orden de Compra
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Box display="grid" gap={3} pt={1}>
          <TextField
            select
            label="Proveedor"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            fullWidth
            size="small"
            disabled={loading || saving}
            InputProps={{ sx: { borderRadius: 0 } }}
          >
            <MenuItem value=""><em>Seleccionar...</em></MenuItem>
            {proveedores.map((p) => (
              <MenuItem key={p.IdProveedor} value={String(p.IdProveedor)}>
                {p.Nombre || `Proveedor #${p.IdProveedor}`}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Observaciones"
            fullWidth
            multiline
            minRows={3}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            InputProps={{ sx: { borderRadius: 0 } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} disabled={saving} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSave}
          disabled={!proveedorId || saving}
          sx={{ bgcolor: '#5d4037', borderRadius: 0, px: 3, fontWeight: 700, '&:hover': { bgcolor: '#4e342e' } }}
        >
          Crear Orden
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalNuevaOrdenCompra;
