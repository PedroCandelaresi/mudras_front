'use client';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Box, Typography, Divider } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ORDEN_COMPRA } from '@/components/compras/graphql/queries';
import { RECEPCIONAR_ORDEN_COMPRA } from '@/components/compras/graphql/mutations';
import { OBTENER_PUNTOS_MUDRAS } from '@/components/puntos-mudras/graphql/queries';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';

type Props = { open: boolean; onClose: () => void; ordenId: number | null; onSuccess: () => void };

const ModalRecepcionarOC: React.FC<Props> = ({ open, onClose, ordenId, onSuccess }) => {
  const { data, loading, refetch } = useQuery(GET_ORDEN_COMPRA, { skip: !open || !ordenId, variables: { id: ordenId ?? 0 }, fetchPolicy: 'cache-and-network' });
  const orden = data?.ordenCompra;
  const detalles = orden?.detalles ?? [];
  const { data: puntosData } = useQuery(OBTENER_PUNTOS_MUDRAS, { fetchPolicy: 'cache-and-network' });
  const puntos: Array<{ id: number; nombre: string }> = puntosData?.obtenerPuntosMudras ?? [];
  const [puntoId, setPuntoId] = useState('');
  const [cantidades, setCantidades] = useState<Record<number, { cantidad: string; costo: string }>>({});
  const [recepcionar, { loading: saving }] = useMutation(RECEPCIONAR_ORDEN_COMPRA);

  useEffect(() => {
    if (!open) return;
    setPuntoId('');
    setCantidades({});
  }, [open, ordenId]);

  const handleChange = (id: number, field: 'cantidad'|'costo', value: string) => {
    setCantidades(prev => ({ ...prev, [id]: { cantidad: prev[id]?.cantidad ?? '', costo: prev[id]?.costo ?? '', [field]: value } }));
  };

  const handleConfirm = async () => {
    const payload = Object.entries(cantidades)
      .map(([detalleId, vals]) => ({ detalleId: Number(detalleId), cantidadRecibida: Number(vals.cantidad || 0), costoUnitario: vals.costo !== '' ? Number(vals.costo) : undefined }))
      .filter(x => x.cantidadRecibida > 0);
    if (payload.length === 0) return;
    await recepcionar({ variables: { input: { ordenId: ordenId, detalles: payload, puntoMudrasId: puntoId ? Number(puntoId) : null } } });
    onSuccess();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <TexturedPanel accent={verde.primary} radius={12} contentPadding={0}>
        <DialogTitle>Recepcionar Orden #{ordenId ?? ''}</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={1.5}>
            <TextField select label="Destino" value={puntoId} onChange={(e) => setPuntoId(e.target.value)} fullWidth>
              <MenuItem value="">Depósito (central)</MenuItem>
              {puntos.map(p => (<MenuItem key={p.id} value={String(p.id)}>{p.nombre}</MenuItem>))}
            </TextField>
            <Divider />
            {loading ? (
              <Typography variant="body2">Cargando detalles…</Typography>
            ) : (
              detalles.map((d: any) => (
                <Box key={d.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2">Detalle #{d.id} · Artículo {d.articuloId}</Typography>
                  <Typography variant="body2">Cant. OC: {d.cantidad}</Typography>
                  <TextField size="small" label="Cantidad recibida" value={cantidades[d.id]?.cantidad ?? ''} onChange={(e) => handleChange(d.id, 'cantidad', e.target.value)} />
                  <TextField size="small" label="Costo unit." value={cantidades[d.id]?.costo ?? ''} onChange={(e) => handleChange(d.id, 'costo', e.target.value)} />
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <CrystalSoftButton baseColor={verde.primary} onClick={onClose} disabled={saving}>Cancelar</CrystalSoftButton>
          <CrystalButton baseColor={verde.primary} onClick={handleConfirm} disabled={saving}>Confirmar recepción</CrystalButton>
        </DialogActions>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalRecepcionarOC;

