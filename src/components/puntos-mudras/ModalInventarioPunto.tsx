"use client";
import { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell,
  Snackbar, Alert, Button
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  OBTENER_STOCK_PUNTO_MUDRAS,
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerStockPuntoMudrasResponse,
  type ObtenerPuntosMudrasResponse,
  type ArticuloConStockPuntoMudras,
} from '@/components/puntos-mudras/graphql/queries';
import Tooltip from '@mui/material/Tooltip';
import { MODIFICAR_STOCK_PUNTO, TRANSFERIR_STOCK_PUNTO } from '@/components/puntos-mudras/graphql/mutations';
import { verde } from '@/ui/colores';

type Props = { open: boolean; onClose: () => void; punto: { id: number; nombre: string; tipo: 'venta' | 'deposito' } | null };

type ArticuloInventario = ArticuloConStockPuntoMudras & { stockMinimo?: number | null };

const ModalInventarioPunto: React.FC<Props> = ({ open, onClose, punto }) => {
  const puntoId = punto?.id ?? 0;
  const { data, loading, error, refetch } = useQuery<ObtenerStockPuntoMudrasResponse>(OBTENER_STOCK_PUNTO_MUDRAS, { skip: !open || !puntoId, variables: { puntoMudrasId: puntoId }, fetchPolicy: 'cache-and-network' });
  const items: ArticuloInventario[] = data?.obtenerStockPuntoMudras ?? [];
  const [modificar] = useMutation(MODIFICAR_STOCK_PUNTO);
  const [transferir] = useMutation(TRANSFERIR_STOCK_PUNTO);
  const [destinoId, setDestinoId] = useState('');
  const { data: puntosData } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS, { fetchPolicy: 'cache-and-network' });
  const puntos = (puntosData?.obtenerPuntosMudras ?? []).filter((p) => p.id !== puntoId);

  const [ajustes, setAjustes] = useState<Record<number, string>>({});
  const [transferencias, setTransferencias] = useState<Record<number, string>>({});
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>(() => ({ open: false, msg: '', sev: 'success' }));

  useEffect(() => {
    if (!open) { setAjustes({}); setTransferencias({}); setDestinoId(''); }
  }, [open]);

  const handleAjustar = async (articuloId: number, actual: number) => {
    const nuevaCantidad = Number(ajustes[articuloId] ?? '');
    if (!Number.isFinite(nuevaCantidad)) return;
    if (nuevaCantidad === actual) return;
    try {
      await modificar({ variables: { puntoMudrasId: puntoId, articuloId, nuevaCantidad } });
      setAjustes((prev) => ({ ...prev, [articuloId]: '' }));
      setSnack({ open: true, msg: 'Stock actualizado', sev: 'success' });
      refetch();
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || 'Error al actualizar stock', sev: 'error' });
    }
  };

  const handleTransferir = async (articuloId: number) => {
    const cantidad = Number(transferencias[articuloId] ?? '');
    const destino = Number(destinoId);
    if (!Number.isFinite(cantidad) || cantidad <= 0) return;
    if (!Number.isFinite(destino)) return;
    try {
      await transferir({ variables: { input: { puntoOrigenId: puntoId, puntoDestinoId: destino, articuloId, cantidad, motivo: 'Transferencia manual' } } });
      setTransferencias((prev) => ({ ...prev, [articuloId]: '' }));
      setSnack({ open: true, msg: 'Transferencia realizada', sev: 'success' });
      refetch();
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || 'Error al transferir stock', sev: 'error' });
    }
  };

  /* ======================== Render ======================== */
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight={700}>Inventario — {punto?.nombre ?? ''}</Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#ffffff' }}>
        {loading ? (
          <Box p={3}><Typography variant="body2">Cargando...</Typography></Box>
        ) : error ? (
          <Box p={3}><Typography color="error">{error.message}</Typography></Box>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Img</TableCell>
                <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Código</TableCell>
                <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Descripción</TableCell>
                <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Stock</TableCell>
                <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Ajuste</TableCell>
                <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Transferir</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Box sx={{ width: 36, height: 36, borderRadius: 0, overflow: 'hidden', border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                      {a.articulo?.ImagenUrl ? (
                        <img
                          src={
                            a.articulo.ImagenUrl.startsWith('http') || a.articulo.ImagenUrl.startsWith('data:')
                              ? a.articulo.ImagenUrl
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${a.articulo.ImagenUrl.startsWith('/') ? '' : '/'}${a.articulo.ImagenUrl}`
                          }
                          alt={a.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{a.codigo}</TableCell>
                  <TableCell>{a.nombre}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="caption" display="block">Disponible en punto: {a.stockAsignado}</Typography>
                        <Typography variant="caption" display="block">Total artículo: {a.stockTotal ?? '—'}</Typography>
                        <Typography variant="caption" display="block">Stock mínimo punto: {a.stockMinimo ?? '—'}</Typography>
                      </Box>
                    }>
                      <Box sx={{ cursor: 'help' }}>{a.stockAsignado}</Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={ajustes[a.id] ?? ''}
                        onChange={(e) => setAjustes((p) => ({ ...p, [a.id]: e.target.value }))}
                        sx={{ width: 100 }}
                        placeholder="Nueva"
                        InputProps={{ sx: { borderRadius: 0 } }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAjustar(a.id, a.stockAsignado)}
                        disabled={!(ajustes[a.id] ?? '').toString().length}
                        sx={{ borderRadius: 0, fontWeight: 600 }}
                      >
                        Aplicar
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={transferencias[a.id] ?? ''}
                        onChange={(e) => setTransferencias((p) => ({ ...p, [a.id]: e.target.value }))}
                        sx={{ width: 100 }}
                        placeholder="Cant."
                        InputProps={{ sx: { borderRadius: 0 } }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleTransferir(a.id)}
                        disabled={!destinoId || !(transferencias[a.id] ?? '').toString().length}
                        sx={{ borderRadius: 0, fontWeight: 600 }}
                      >
                        →
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
        <TextField
          select size="small" label="Destino"
          value={destinoId}
          onChange={(e) => setDestinoId(e.target.value)}
          sx={{ minWidth: 260 }}
          InputProps={{ sx: { borderRadius: 0, bgcolor: '#fff' } }}
        >
          <MenuItem value="">Seleccione destino...</MenuItem>
          {puntos.map((p) => (
            <MenuItem key={p.id} value={String(p.id)}>{p.tipo === 'deposito' ? 'Depósito: ' : 'Punto: '}{p.nombre}</MenuItem>
          ))}
        </TextField>
        <Button onClick={onClose} variant="contained" disableElevation sx={{ borderRadius: 0, bgcolor: verde.primary }}>
          Cerrar
        </Button>
      </DialogActions>

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%', borderRadius: 0 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ModalInventarioPunto;
