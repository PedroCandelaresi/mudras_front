'use client';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PROVEEDORES, type GetProveedoresResponse, type ProveedorBasico } from '@/components/proveedores/graphql/queries';
import { CREAR_ORDEN_COMPRA } from '@/components/compras/graphql/mutations';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';

type Props = { open: boolean; onClose: () => void; onSuccess: () => void };

const ModalNuevaOrdenCompra: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const { data: provData, loading } = useQuery<GetProveedoresResponse>(GET_PROVEEDORES, { fetchPolicy: 'cache-and-network' });
  const proveedores: ProveedorBasico[] = provData?.proveedores ?? [];
  const [proveedorId, setProveedorId] = useState('');
  const [obs, setObs] = useState('');
  const [crearOrden, { loading: saving }] = useMutation(CREAR_ORDEN_COMPRA);

  const handleSave = async () => {
    const id = Number(proveedorId);
    if (!id) return;
    await crearOrden({ variables: { input: { proveedorId: id, observaciones: obs || null } } });
    onSuccess();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <TexturedPanel accent={verde.primary} radius={12} contentPadding={0}>
        <DialogTitle>Nueva Orden de Compra</DialogTitle>
        <DialogContent>
          <TextField select label="Proveedor" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} fullWidth sx={{ mt: 1.5 }} disabled={loading || saving}>
            {proveedores.map((p) => (
              <MenuItem key={p.IdProveedor} value={String(p.IdProveedor)}>
                {p.Nombre || `Proveedor #${p.IdProveedor}`}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Observaciones" fullWidth multiline minRows={3} sx={{ mt: 1.5 }} value={obs} onChange={(e) => setObs(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <CrystalSoftButton baseColor={verde.primary} onClick={onClose} disabled={saving}>Cancelar</CrystalSoftButton>
          <CrystalButton baseColor={verde.primary} onClick={handleSave} disabled={!proveedorId || saving}>Crear</CrystalButton>
        </DialogActions>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalNuevaOrdenCompra;
