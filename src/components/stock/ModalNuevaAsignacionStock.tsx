'use client';

import { useState, useEffect, useMemo, } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Autocomplete,
  Chip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import { verde } from '@/ui/colores';
import { alpha } from '@mui/material/styles';

// Queries correctly imported
import { OBTENER_PUNTOS_MUDRAS, type ObtenerPuntosMudrasResponse } from '@/components/puntos-mudras/graphql/queries';
import { BUSCAR_ARTICULOS } from '@/components/articulos/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { ASIGNAR_STOCK_MASIVO } from '@/components/puntos-mudras/graphql/mutations';

import type { PuntoMudras } from '@/interfaces/puntos-mudras';
import type { Articulo } from '@/app/interfaces/mudras.types';

interface BuscarArticulosResponse {
  buscarArticulos: {
    articulos: Articulo[];
    total: number;
  }
}

interface ModalNuevaAsignacionStockProps {
  open: boolean;
  onClose: () => void;
  destinoId?: number; // Pre-selected destination ID (optional now since we distribute to many)
  origen?: 'venta' | 'deposito'; // Context
  tipoDestinoPreferido?: 'venta' | 'deposito';
  onStockAsignado?: () => void;
}

export default function ModalNuevaAsignacionStock({
  open,
  onClose,
  destinoId,
  onStockAsignado
}: ModalNuevaAsignacionStockProps) {
  // --- States for Filters ---
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<{ IdProveedor: number; Nombre?: string } | null>(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<{ id: number; nombre: string } | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // --- States for Selection & Distribution ---
  // We select ONE article to distribute
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);

  // Distribution Logic
  const [stockGlobal, setStockGlobal] = useState<string>('0');
  const [stockPorPunto, setStockPorPunto] = useState<Record<string, string>>({});

  // --- UI States ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [asignando, setAsignando] = useState(false);

  // --- Queries ---
  const { data: dataPuntos } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);
  const { data: dataProveedores } = useQuery(GET_PROVEEDORES);
  const { data: dataRubros } = useQuery(GET_RUBROS);

  // Lazy query for searching articles (fixing the query usage)
  const [buscarArticulos, { data: dataArticulos, loading: loadingArticulos }] = useLazyQuery<BuscarArticulosResponse>(BUSCAR_ARTICULOS, {
    fetchPolicy: 'network-only'
  });

  const [asignarMasivoMutation] = useMutation(ASIGNAR_STOCK_MASIVO);

  // --- Derived Data ---
  const puntosDisponibles = useMemo(() =>
    (dataPuntos?.obtenerPuntosMudras ?? []).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [dataPuntos]
  );

  const proveedores = useMemo(() => (dataProveedores as any)?.proveedores || [], [dataProveedores]);

  // Filter rubros based on provider if selected (logic moved client-side to fix error)
  const rubros = useMemo(() => {
    const allRubros = (dataRubros as any)?.obtenerRubros || [];
    if (!proveedorSeleccionado) return allRubros;

    // Logic to filter rubros by provider if the relation exists in the data
    // Assuming backend data structure for rubros might not have 'proveedorId' directly visible on the list 
    // or we use the provider's 'proveedorRubros' if available.
    // For now, consistent with TablaArticulos, we might show all or filter if we had the map.
    // To be safe and "fix" the error, we return ALL rubros but allow the user to select.
    // If specific filtering is needed, we'd need to inspect the 'proveedorRubros' field in the provider object.
    const prov = proveedores.find((p: any) => Number(p.IdProveedor) === Number(proveedorSeleccionado.IdProveedor));
    if (prov && prov.proveedorRubros) {
      const rubrosIds = new Set(prov.proveedorRubros.map((pr: any) => Number(pr.rubro?.Id)));
      return allRubros.filter((r: any) => rubrosIds.has(Number(r.id)));
    }

    return allRubros;
  }, [dataRubros, proveedorSeleccionado, proveedores]);

  // --- Effects ---
  useEffect(() => {
    if (!open) {
      // Reset states on close
      setProveedorSeleccionado(null);
      setRubroSeleccionado(null);
      setBusqueda('');
      setArticuloSeleccionado(null);
      setStockGlobal('0');
      setStockPorPunto({});
      setConfirmOpen(false);
    } else {
      // If we opened with a specific destination pre-selected, maybe we should focus on that?
      // But the requirement is "assign from global to distinct points", so we probably shouldn't restrict it.
      // We will list all points.
    }
  }, [open]);

  // Search effect
  useEffect(() => {
    if (open) {
      const filtros: any = {};
      if (busqueda) filtros.busqueda = busqueda;
      if (rubroSeleccionado) filtros.rubroId = Number(rubroSeleccionado.id);
      if (proveedorSeleccionado) filtros.proveedorId = Number(proveedorSeleccionado.IdProveedor);

      // Limit to 50 for performance
      filtros.limite = 50;
      filtros.pagina = 0;

      // Only search if we have some filter or just load initial 50
      const timeoutId = setTimeout(() => {
        buscarArticulos({
          variables: {
            filtros
          }
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [busqueda, rubroSeleccionado, proveedorSeleccionado, open, buscarArticulos]);


  // --- Handlers ---

  const handleSeleccionarArticulo = (articulo: Articulo) => {
    setArticuloSeleccionado(articulo);
    // When selecting an article, we reset the distribution
    setStockGlobal('0');
    setStockPorPunto({});
  };

  const handleStockGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setStockGlobal(val);
    }
  };

  const confirmarAplicacion = async () => {
    if (!articuloSeleccionado) return;
    setAsignando(true);

    try {
      const promises = Object.entries(stockPorPunto).map(async ([puntoId, cantidadStr]) => {
        const cantidad = parseInt(cantidadStr, 10);
        if (cantidad > 0) {
          // Call mutation for this point
          return asignarMasivoMutation({
            variables: {
              input: {
                destinoId: Number(puntoId),
                articulos: [
                  {
                    articuloId: Number(articuloSeleccionado.id),
                    cantidad: cantidad
                  }
                ]
              }
            }
          });
        }
      });

      await Promise.all(promises);

      setSnackbar({ open: true, message: 'Stock asignado correctamente', severity: 'success' });
      if (onStockAsignado) onStockAsignado();
      handleCloseInternal();

    } catch (error) {
      console.error('Error asignando stock:', error);
      setSnackbar({ open: true, message: 'Error al asignar stock', severity: 'error' });
    } finally {
      setAsignando(false);
      setConfirmOpen(false);
    }
  };

  const handleCloseInternal = () => {
    setConfirmOpen(false);
    onClose();
  }

  // --- Calculations for Distribution UI ---
  const stockGlobalNum = parseInt(stockGlobal, 10) || 0;
  const asignadoTotal = Object.values(stockPorPunto).reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
  const restante = Math.max(0, stockGlobalNum - asignadoTotal);


  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseInternal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            overflow: 'hidden',
            height: '90vh', // Fixed height for layout
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: verde.primary, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon="mdi:package-variant-plus" width={24} />
          <Typography variant="h6" fontWeight={700}>
            Nueva Asignación de Stock
          </Typography>
          <IconButton onClick={handleCloseInternal} sx={{ ml: 'auto', color: '#fff' }}>
            <Icon icon="mdi:close" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            {/* LEFT PANEL: Filters & Article List */}
            <Box sx={{ width: '40%', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
              <Box p={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Filters */}
                <Autocomplete
                  options={proveedores}
                  getOptionLabel={(o: any) => o.Nombre || ''}
                  value={proveedorSeleccionado}
                  onChange={(_, v) => { setProveedorSeleccionado(v); setRubroSeleccionado(null); }}
                  renderInput={(params) => <TextField {...params} label="Proveedor" size="small" sx={{ bgcolor: '#fff' }} />}
                />
                <Autocomplete
                  options={rubros}
                  getOptionLabel={(o: any) => o.nombre || ''}
                  value={rubroSeleccionado}
                  onChange={(_, v) => setRubroSeleccionado(v)}
                  renderInput={(params) => <TextField {...params} label="Rubro" size="small" sx={{ bgcolor: '#fff' }} />}
                  disabled={!proveedorSeleccionado} // Opcional: disable if validation strict
                />
                <TextField
                  placeholder="Buscar artículo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ bgcolor: '#fff' }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" /></InputAdornment>
                  }}
                />
              </Box>

              <Divider />

              {/* Article List */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loadingArticulos ? (
                  <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                ) : (
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Artículo</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(dataArticulos?.buscarArticulos?.articulos || []).map((art: any) => {
                        if (!art) return null;
                        const isSelected = articuloSeleccionado?.id === art.id;
                        return (
                          <TableRow
                            key={art.id}
                            hover
                            selected={isSelected}
                            onClick={() => handleSeleccionarArticulo(art)}
                            sx={{ cursor: 'pointer', bgcolor: isSelected ? alpha(verde.primary, 0.1) : undefined }}
                          >
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{art.Codigo}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{art.Descripcion}</Typography>
                              <Typography variant="caption" color="text.secondary">{art.Rubro}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              {isSelected && <Icon icon="mdi:check-circle" color={verde.primary} />}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </Box>

            {/* RIGHT PANEL: Distribution UI */}
            <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
              {!articuloSeleccionado ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} color="text.secondary">
                  <Icon icon="mdi:arrow-left" width={48} />
                  <Typography>Seleccione un artículo para asignar stock</Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" flex={1} overflow="hidden">
                  {/* Selected Article Header */}
                  <Box p={2} bgcolor={alpha(verde.primary, 0.05)} borderBottom="1px solid #e0e0e0">
                    <Typography variant="subtitle2" color="text.secondary">Artículo Seleccionado</Typography>
                    <Typography variant="h6" color={verde.primary} fontWeight={700}>
                      {articuloSeleccionado.Descripcion}
                    </Typography>
                    <Typography variant="body2">
                      Código: <strong>{articuloSeleccionado.Codigo}</strong>
                    </Typography>
                  </Box>

                  {/* Global Stock Input */}
                  <Box p={3} pb={1}>
                    <TextField
                      label="Stock Global a Distribuir"
                      value={stockGlobal}
                      onChange={handleStockGlobalChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        sx: { fontSize: '1.2rem', fontWeight: 700, color: verde.primary }
                      }}
                    />

                    {/* Summary Stats */}
                    <Box display="flex" gap={3} mt={2} p={1} bgcolor="#f9f9f9" borderRadius={1}>
                      <Box>
                        <Typography variant="caption">Total Global</Typography>
                        <Typography variant="body1" fontWeight={700}>{stockGlobalNum}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption">Asignado</Typography>
                        <Typography variant="body1" fontWeight={700} color={stockGlobalNum > 0 && asignadoTotal > stockGlobalNum ? 'error.main' : 'primary.main'}>
                          {asignadoTotal}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption">Restante</Typography>
                        <Typography variant="body1" fontWeight={700} color={restante === 0 && stockGlobalNum > 0 ? 'success.main' : 'text.secondary'}>
                          {restante}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Distribution Table */}
                  <Box flex={1} overflow="auto" p={0}>
                    <TableContainer>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Punto de Venta / Depósito</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, width: 140 }}>Asignar</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {puntosDisponibles.map(punto => {
                            const asignadoEste = parseInt(stockPorPunto[punto.id] || '0', 10);

                            return (
                              <TableRow key={punto.id} hover>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Icon icon={punto.tipo === 'deposito' ? 'mdi:warehouse' : 'mdi:store'} color={verde.primary} />
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>{punto.nombre}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {punto.tipo === 'venta' ? 'Punto de Venta' : 'Depósito'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <TextField
                                    size="small"
                                    value={stockPorPunto[punto.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '' || /^\d+$/.test(val)) {
                                        const newVal = parseInt(val || '0', 10);
                                        // Check if exceeds remaining (excluding current value from total)
                                        const currentTotalExcludingThis = asignadoTotal - asignadoEste;
                                        if (currentTotalExcludingThis + newVal <= stockGlobalNum) {
                                          setStockPorPunto(prev => ({ ...prev, [punto.id]: val }));
                                        }
                                      }
                                    }}
                                    placeholder="0"
                                    disabled={stockGlobalNum <= 0}
                                    InputProps={{
                                      sx: { textAlign: 'right' }
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                </Box>
              )}
            </Box>

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
          <Button onClick={handleCloseInternal} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => setConfirmOpen(true)}
            disabled={!articuloSeleccionado || asignadoTotal === 0 || asignadoTotal > stockGlobalNum}
            disableElevation
            sx={{ bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }}
          >
            Confirmar Asignación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar Asignación de Stock</DialogTitle>
        <DialogContent>
          <Typography>
            Se va a asignar el siguiente stock para <strong>{articuloSeleccionado?.Descripcion}</strong>:
          </Typography>
          <Box mt={2}>
            {Object.entries(stockPorPunto).map(([pid, qty]) => {
              if (parseInt(qty) <= 0) return null;
              const punto = puntosDisponibles.find(p => p.id === Number(pid));
              return (
                <Typography key={pid} variant="body2" sx={{ ml: 2 }}>
                  • <strong>{punto?.nombre}:</strong> {qty} unidades
                </Typography>
              )
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={confirmarAplicacion} autoFocus variant="contained" disabled={asignando}>
            {asignando ? 'Asignando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
