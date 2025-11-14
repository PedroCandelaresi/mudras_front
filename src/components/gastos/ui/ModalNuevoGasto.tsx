'use client';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Box, Typography } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CATEGORIAS_GASTO, type CategoriasGastoResponse, type CategoriaGasto } from '@/components/gastos/graphql/queries';
import { GET_PROVEEDORES, type GetProveedoresResponse, type ProveedorBasico } from '@/components/proveedores/graphql/queries';
import { CREAR_GASTO } from '@/components/gastos/graphql/mutations';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';

type Props = { open: boolean; onClose: () => void; onSuccess: () => void };

const ModalNuevoGasto: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const { data: catsData } = useQuery<CategoriasGastoResponse>(GET_CATEGORIAS_GASTO, { fetchPolicy: 'cache-and-network' });
  const categorias: CategoriaGasto[] = catsData?.categoriasGasto ?? [];
  const { data: provData } = useQuery<GetProveedoresResponse>(GET_PROVEEDORES, { fetchPolicy: 'cache-and-network' });
  const proveedores: ProveedorBasico[] = provData?.proveedores ?? [];
  const [crear, { loading }] = useMutation(CREAR_GASTO);

  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [iva, setIva] = useState<'21'|'10.5'|''>('');
  const [categoriaId, setCategoriaId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (!open) return;
    const hoy = new Date();
    setFecha(hoy.toISOString().slice(0,10));
    setMonto(''); setIva(''); setCategoriaId(''); setProveedorId(''); setDescripcion('');
  }, [open]);

  const ivaMonto = useMemo(() => {
    const base = Number(monto || 0);
    const pct = iva ? Number(iva) : 0;
    return Number(((base * pct) / 100).toFixed(2));
  }, [monto, iva]);

  const total = useMemo(() => Number((Number(monto || 0) + ivaMonto).toFixed(2)), [monto, ivaMonto]);

  const handleSave = async () => {
    if (!fecha || !monto) return;
    await crear({ variables: { input: {
      fecha,
      montoNeto: Number(monto),
      alicuotaIva: iva ? Number(iva) : null,
      descripcion: descripcion || null,
      categoriaId: categoriaId ? Number(categoriaId) : null,
      proveedorId: proveedorId ? Number(proveedorId) : null,
    } } });
    onSuccess();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <TexturedPanel accent={verde.primary} radius={12} contentPadding={0}>
        <DialogTitle>Registrar gasto</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={1.5}>
            <TextField type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} fullWidth />
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5}>
              <TextField label="Monto neto" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} fullWidth />
              <TextField select label="IVA" value={iva} onChange={(e) => setIva(e.target.value as any)} fullWidth>
                <MenuItem value={''}>Sin IVA</MenuItem>
                <MenuItem value={'21'}>21%</MenuItem>
                <MenuItem value={'10.5'}>10.5%</MenuItem>
              </TextField>
            </Box>
            <Typography variant="body2">IVA: ${ivaMonto.toLocaleString('es-AR')} | Total: ${total.toLocaleString('es-AR')}</Typography>
            <TextField select label="Categoría" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} fullWidth>
              <MenuItem value="">—</MenuItem>
              {categorias.map(c => (<MenuItem key={c.id} value={String(c.id)}>{c.nombre}</MenuItem>))}
            </TextField>
            <TextField select label="Proveedor" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} fullWidth>
              <MenuItem value="">—</MenuItem>
              {proveedores.map(p => (<MenuItem key={p.IdProveedor} value={String(p.IdProveedor)}>{p.Nombre || `Proveedor #${p.IdProveedor}`}</MenuItem>))}
            </TextField>
            <TextField label="Descripción" multiline minRows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <CrystalSoftButton baseColor={verde.primary} onClick={onClose} disabled={loading}>Cancelar</CrystalSoftButton>
          <CrystalButton baseColor={verde.primary} onClick={handleSave} disabled={loading || !fecha || !monto}>Guardar</CrystalButton>
        </DialogActions>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalNuevoGasto;
