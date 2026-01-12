"use client";
import { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell,
  Snackbar, Alert
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import {
  OBTENER_STOCK_PUNTO_MUDRAS,
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerStockPuntoMudrasResponse,
  type ObtenerPuntosMudrasResponse,
  type ArticuloConStockPuntoMudras,
} from '@/components/puntos-mudras/graphql/queries';
import Tooltip from '@mui/material/Tooltip';
import { MODIFICAR_STOCK_PUNTO, TRANSFERIR_STOCK_PUNTO } from '@/components/puntos-mudras/graphql/mutations';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <TexturedPanel accent={verde.primary} radius={12} contentPadding={0}>
        <DialogTitle>Inventario — {punto?.nombre ?? ''}</DialogTitle>
        <DialogContent>
          {loading ? (
            <Typography variant="body2">Cargando…</Typography>
          ) : error ? (
            <Typography color="error">{error.message}</Typography>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Img</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="center">Ajuste</TableCell>
                  <TableCell align="center">Transferir</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Box sx={{ width: 36, height: 36, borderRadius: 1, overflow: 'hidden', border: '1px solid #eee', bgcolor: '#fff' }}>
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
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTIxIDE5VjVjMC0xLjEtOS0yLTItMkg1Yy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yem0tOS01LjU1bC0yLjgzIDIuODJMMTYgMjFoLTRsLTUtN2w1LTd6bS05IDMuNTVMMTAuMTcgMTNsLTItMmwtMyAzdi00bC0yIDJ6Ii8+PC9zdmc+" alt="" style={{ width: 20, opacity: 0.5 }} />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{a.codigo}</TableCell>
                    <TableCell>{a.nombre}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={<Box sx={{ p: .5 }}>
                        <Typography variant="caption">Disponible en punto: {a.stockAsignado}</Typography><br />
                        <Typography variant="caption">Total artículo: {a.stockTotal ?? '—'}</Typography><br />
                        <Typography variant="caption">Stock mínimo punto: {a.stockMinimo ?? '—'}</Typography>
                      </Box>}>
                        <span>{a.stockAsignado}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <TextField size="small" type="number" value={ajustes[a.id] ?? ''} onChange={(e) => setAjustes((p) => ({ ...p, [a.id]: e.target.value }))} sx={{ width: 100 }} placeholder="Nueva" />
                        <CrystalSoftButton baseColor={verde.primary} onClick={() => handleAjustar(a.id, a.stockAsignado)} disabled={!(ajustes[a.id] ?? '').toString().length}>Aplicar</CrystalSoftButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <TextField size="small" type="number" value={transferencias[a.id] ?? ''} onChange={(e) => setTransferencias((p) => ({ ...p, [a.id]: e.target.value }))} sx={{ width: 100 }} placeholder="Cant." />
                        <CrystalButton baseColor={verde.primary} onClick={() => handleTransferir(a.id)} disabled={!destinoId || !(transferencias[a.id] ?? '').toString().length}>→</CrystalButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <TextField
            select size="small" label="Destino"
            value={destinoId}
            onChange={(e) => setDestinoId(e.target.value)}
            sx={{ mr: 'auto', minWidth: 260 }}
          >
            <MenuItem value="">Seleccione destino…</MenuItem>
            {puntos.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>{p.tipo === 'deposito' ? 'Depósito: ' : 'Punto: '}{p.nombre}</MenuItem>
            ))}
          </TextField>
          <CrystalSoftButton baseColor={verde.primary} onClick={onClose}>Cerrar</CrystalSoftButton>
        </DialogActions>
      </TexturedPanel>
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ModalInventarioPunto;
