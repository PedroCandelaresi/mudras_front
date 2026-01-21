'use client';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, MenuItem, Box, Typography, Button, IconButton } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CATEGORIAS_GASTO, GET_GASTOS, type CategoriasGastoResponse, type CategoriaGasto } from '@/components/gastos/graphql/queries';
import { GET_PROVEEDORES, type GetProveedoresResponse, type ProveedorBasico } from '@/components/proveedores/graphql/queries';
import { CREAR_GASTO } from '@/components/gastos/graphql/mutations';
import { Icon } from '@iconify/react';

type Props = { open: boolean; onClose: () => void; onSuccess: () => void };

const ModalNuevoGasto: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const { data: catsData } = useQuery<CategoriasGastoResponse>(GET_CATEGORIAS_GASTO, { fetchPolicy: 'cache-and-network' });
  const categorias: CategoriaGasto[] = catsData?.categoriasGasto ?? [];
  const { data: provData } = useQuery<GetProveedoresResponse>(GET_PROVEEDORES, { fetchPolicy: 'cache-and-network' });
  const proveedores: ProveedorBasico[] = provData?.proveedores ?? [];
  const [crear, { loading }] = useMutation(CREAR_GASTO, {
    refetchQueries: [{ query: GET_GASTOS }],
  });

  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [iva, setIva] = useState<'21' | '10.5' | ''>('');
  const [categoriaId, setCategoriaId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (!open) return;
    const hoy = new Date();
    setFecha(hoy.toISOString().slice(0, 10));
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
    await crear({
      variables: {
        input: {
          fecha,
          montoNeto: Number(monto),
          alicuotaIva: iva ? Number(iva) : null,
          descripcion: descripcion || null,
          categoriaId: categoriaId ? Number(categoriaId) : null,
          proveedorId: proveedorId ? Number(proveedorId) : null,
        }
      }
    });
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
          <Icon icon="mdi:cash-minus" width={24} height={24} color="#546e7a" />
          <Typography variant="h6" fontWeight={700}>
            Registrar Gasto
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Box display="grid" gap={2}>
          <TextField
            type="date"
            label="Fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            fullWidth
            size="small"
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
            <TextField
              label="Monto neto"
              value={monto}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*[.,]?\d*$/.test(val)) setMonto(val);
              }}
              fullWidth
              size="small"
              InputProps={{ sx: { borderRadius: 0 }, startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>$</Typography> }}
              inputMode="decimal"
            />
            <TextField
              select
              label="IVA"
              value={iva}
              onChange={(e) => setIva(e.target.value as any)}
              fullWidth
              size="small"
              InputProps={{ sx: { borderRadius: 0 } }}
            >
              <MenuItem value={''}>Sin IVA</MenuItem>
              <MenuItem value={'21'}>21%</MenuItem>
              <MenuItem value={'10.5'}>10.5%</MenuItem>
            </TextField>
          </Box>
          <Box bgcolor="#f5f5f5" p={1} border="1px solid #e0e0e0" display="flex" justifyContent="space-between">
            <Typography variant="body2">IVA: <strong>${ivaMonto.toLocaleString('es-AR')}</strong></Typography>
            <Typography variant="body2">TOTAL: <strong>${total.toLocaleString('es-AR')}</strong></Typography>
          </Box>

          <TextField
            select
            label="Categoría"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            fullWidth
            size="small"
            InputProps={{ sx: { borderRadius: 0 } }}
          >
            <MenuItem value=""><em>Seleccionar...</em></MenuItem>
            {categorias.map(c => (<MenuItem key={c.id} value={String(c.id)}>{c.nombre}</MenuItem>))}
          </TextField>
          <TextField
            select
            label="Proveedor"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            fullWidth
            size="small"
            InputProps={{ sx: { borderRadius: 0 } }}
          >
            <MenuItem value=""><em>Seleccionar...</em></MenuItem>
            {proveedores.map(p => (<MenuItem key={p.IdProveedor} value={String(p.IdProveedor)}>{p.Nombre || `Proveedor #${p.IdProveedor}`}</MenuItem>))}
          </TextField>
          <TextField
            label="Descripción"
            multiline
            minRows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            size="small"
            InputProps={{ sx: { borderRadius: 0 } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} disabled={loading} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSave}
          disabled={loading || !fecha || !monto}
          sx={{ bgcolor: '#5d4037', borderRadius: 0, px: 3, fontWeight: 700, '&:hover': { bgcolor: '#4e342e' } }}
        >
          Guardar Gasto
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalNuevoGasto;
