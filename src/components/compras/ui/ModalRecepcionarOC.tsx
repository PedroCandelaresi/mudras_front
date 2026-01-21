'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, MenuItem, Box, Typography, Divider, Button, IconButton } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ORDEN_COMPRA, type OrdenCompraResponse, type OrdenCompraDetalle } from '@/components/compras/graphql/queries';
import { RECEPCIONAR_ORDEN_COMPRA } from '@/components/compras/graphql/mutations';
import { OBTENER_PUNTOS_MUDRAS, type ObtenerPuntosMudrasResponse } from '@/components/puntos-mudras/graphql/queries';
import { Icon } from '@iconify/react';

type Props = { open: boolean; onClose: () => void; ordenId: number | null; onSuccess: () => void };

const ModalRecepcionarOC: React.FC<Props> = ({ open, onClose, ordenId, onSuccess }) => {
  const { data, loading, refetch } = useQuery<OrdenCompraResponse>(GET_ORDEN_COMPRA, { skip: !open || !ordenId, variables: { id: ordenId ?? 0 }, fetchPolicy: 'cache-and-network' });
  const orden = data?.ordenCompra;
  const detalles: OrdenCompraDetalle[] = orden?.detalles ?? [];
  const { data: puntosData } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS, { fetchPolicy: 'cache-and-network' });
  const puntos: Array<{ id: number; nombre: string }> = puntosData?.obtenerPuntosMudras?.map((p) => ({ id: p.id, nombre: p.nombre })) ?? [];
  const [puntoId, setPuntoId] = useState('');
  const [cantidades, setCantidades] = useState<Record<number, { cantidad: string; costo: string }>>({});
  const [recepcionar, { loading: saving }] = useMutation(RECEPCIONAR_ORDEN_COMPRA);

  useEffect(() => {
    if (!open) return;
    setPuntoId('');
    setCantidades({});
  }, [open, ordenId]);

  const handleChange = (id: number, field: 'cantidad' | 'costo', value: string) => {
    if (value !== '' && !/^\d*[.,]?\d*$/.test(value)) return;
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
          <Icon icon="mdi:package-variant-closed" width={24} height={24} color="#546e7a" />
          <Typography variant="h6" fontWeight={700}>
            Recepcionar Orden #{ordenId ?? ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Box display="grid" gap={3}>
          <TextField
            select
            label="Destino"
            value={puntoId}
            onChange={(e) => setPuntoId(e.target.value)}
            fullWidth
            size="small"
            InputProps={{ sx: { borderRadius: 0 } }}
          >
            <MenuItem value="">Depósito (central)</MenuItem>
            {puntos.map(p => (<MenuItem key={p.id} value={String(p.id)}>{p.nombre}</MenuItem>))}
          </TextField>
          <Divider />
          {loading ? (
            <Typography variant="body2" color="text.secondary">Cargando detalles…</Typography>
          ) : (
            <Box display="grid" gap={2}>
              {detalles.map((d) => (
                <Box key={d.id} sx={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto 120px 120px', gap: 2, alignItems: 'center', p: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Artículo {d.articuloId}</Typography>
                    <Typography variant="caption" color="text.secondary">Detalle #{d.id}</Typography>
                  </Box>
                  <Typography variant="body2">Cant. Solicitada: <strong>{d.cantidad}</strong></Typography>
                  <TextField
                    size="small"
                    label="Recibido"
                    value={cantidades[d.id]?.cantidad ?? ''}
                    onChange={(e) => handleChange(d.id, 'cantidad', e.target.value)}
                    InputProps={{ sx: { borderRadius: 0 } }}
                    inputMode="decimal"
                  />
                  <TextField
                    size="small"
                    label="Costo Unit."
                    value={cantidades[d.id]?.costo ?? ''}
                    onChange={(e) => handleChange(d.id, 'costo', e.target.value)}
                    InputProps={{ sx: { borderRadius: 0 }, startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>$</Typography> }}
                    inputMode="decimal"
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} disabled={saving} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleConfirm}
          disabled={saving || loading || Object.keys(cantidades).length === 0}
          sx={{ bgcolor: '#5d4037', borderRadius: 0, px: 3, fontWeight: 700, '&:hover': { bgcolor: '#4e342e' } }}
        >
          Confirmar recepción
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalRecepcionarOC;
