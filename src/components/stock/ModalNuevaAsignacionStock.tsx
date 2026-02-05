'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Autocomplete,
  Alert,
  Snackbar,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { verde, azul } from '@/ui/colores'; // Using similar palette to ModalDetallesProveedor if appropriate, or keep verde since it is stock? User said "elegante". Let's stick to system colors but clean.
import { alpha, darken } from '@mui/material/styles';

// Components
import { TablaArticulos } from '@/components/articulos';

// Queries
import { OBTENER_PUNTOS_MUDRAS, type ObtenerPuntosMudrasResponse } from '@/components/puntos-mudras/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { ASIGNAR_STOCK_MASIVO } from '@/components/puntos-mudras/graphql/mutations';
import { OBTENER_ARTICULOS_DISPONIBLES, type ObtenerArticulosDisponiblesResponse } from '@/components/stock/graphql/queries';

import type { Articulo } from '@/app/interfaces/mudras.types';

interface ModalNuevaAsignacionStockProps {
  open: boolean;
  onClose: () => void;
  onStockAsignado?: () => void;
  // Optional for compat
  destinoId?: number;
  origen?: string;
  tipoDestinoPreferido?: string;
}

const VH_MAX = 90;

export default function ModalNuevaAsignacionStock({
  open,
  onClose,
  onStockAsignado
}: ModalNuevaAsignacionStockProps) {
  // Styles for "Elegante" look (similar to ModalDetallesProveedor)
  const COLORS = {
    primary: verde.primary,
    secondary: verde.headerBorder || '#2e7d32',
    textStrong: darken(verde.primary, 0.4),
    headerText: '#fff'
  };

  // --- States for Filters ---
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<{ IdProveedor: number; Nombre?: string } | null>(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<{ id: number; nombre: string } | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // --- States for Selection & Distribution ---
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
  // Points
  const { data: dataPuntos } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);
  // Providers & Rubros for filters
  const { data: dataProveedores } = useQuery(GET_PROVEEDORES);
  const { data: dataRubros } = useQuery(GET_RUBROS);

  const [asignarMasivoMutation] = useMutation(ASIGNAR_STOCK_MASIVO);
  const [obtenerStockDetalle, { loading: loadingStockDetalle }] = useLazyQuery<ObtenerArticulosDisponiblesResponse>(OBTENER_ARTICULOS_DISPONIBLES, {
    fetchPolicy: 'network-only'
  });

  const [stockActualPorPunto, setStockActualPorPunto] = useState<Record<number, number>>({});

  // --- Derived Data ---
  const puntosDisponibles = useMemo(() =>
    (dataPuntos?.obtenerPuntosMudras ?? []).filter(p => p.activo).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [dataPuntos]
  );

  const proveedores = useMemo(() => (dataProveedores as any)?.proveedores || [], [dataProveedores]);

  const rubros = useMemo(() => {
    const allRubros = (dataRubros as any)?.obtenerRubros || [];
    if (!proveedorSeleccionado) return allRubros;

    // Filter rubros based on provider if possible
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
      // Reset logic
      setProveedorSeleccionado(null);
      setRubroSeleccionado(null);
      setBusqueda('');
      setArticuloSeleccionado(null);
      setStockGlobal('0');
      setStockPorPunto({});
      setConfirmOpen(false);
    }
  }, [open]);

  // --- Columns for TablaArticulos ---
  const handleSelectClick = useCallback((art: Articulo) => {
    setArticuloSeleccionado(art);
    setStockGlobal('0'); // Reset stock when changing article
    setStockPorPunto({});
  }, []);

  const columns = useMemo(() => [
    { key: 'codigo', header: 'Código', width: '15%' },
    { key: 'descripcion', header: 'Descripción', width: '40%' },
    { key: 'rubro', header: 'Rubro', width: '20%' },
    { key: 'stock', header: 'Stock Total', width: '10%', align: 'center' },
    {
      key: 'acciones',
      header: 'Seleccionar',
      width: '15%',
      align: 'center',
      render: (art: any) => (
        <Button
          variant={articuloSeleccionado?.id === art.id ? "contained" : "outlined"}
          size="small"
          onClick={() => handleSelectClick(art)}
          startIcon={<Icon icon={articuloSeleccionado?.id === art.id ? "mdi:check" : "mdi:cursor-default-click"} />}
          color={articuloSeleccionado?.id === art.id ? "primary" : "inherit"}
          sx={{
            borderRadius: 20,
            textTransform: 'none',
            borderColor: '#e0e0e0',
            color: articuloSeleccionado?.id === art.id ? '#fff' : 'text.secondary'
          }}
        >
          {articuloSeleccionado?.id === art.id ? "Seleccionado" : "Elegir"}
        </Button>
      )
    }
  ], [articuloSeleccionado, handleSelectClick]);

  // --- Filters for TablaArticulos ---
  const controlledFilters = useMemo(() => {
    const filters: any = {};
    if (proveedorSeleccionado) filters.proveedorId = Number(proveedorSeleccionado.IdProveedor);
    if (rubroSeleccionado) filters.rubroId = Number(rubroSeleccionado.id);
    if (busqueda) filters.busqueda = busqueda;
    return filters;
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda]);


  // --- Submit Handler ---
  const confirmarAplicacion = async () => {
    if (!articuloSeleccionado) return;
    setAsignando(true);

    try {
      const promises = Object.entries(stockPorPunto).map(async ([puntoId, cantidadStr]) => {
        const cantidad = parseInt(cantidadStr, 10);
        if (cantidad > 0) {
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

  // --- Calculations ---
  const stockGlobalNum = parseFloat(stockGlobal) || 0;
  const asignadoTotal = Object.values(stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
  const restante = Math.max(0, stockGlobalNum - asignadoTotal);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseInternal}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 0, // Sharp aesthetic
            bgcolor: '#ffffff',
            height: `${VH_MAX}vh`, // Taller modal
            maxHeight: `${VH_MAX}vh`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          bgcolor: COLORS.primary,
          color: COLORS.headerText,
          px: 4,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `4px solid ${COLORS.secondary}`,
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon icon="mdi:package-variant-plus" width={28} height={28} />
            <Box>
              <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
                ASIGNACIÓN GLOBAL DE STOCK
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Distribuye stock a múltiples depósitos y puntos de venta en una sola operación.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseInternal} sx={{ color: 'white' }}>
            <Icon icon="mdi:close" width={28} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, display: 'flex', bgcolor: '#f5f5f5', overflow: 'hidden' }}>

          {/* LEFT: Selection Panel (70%) */}
          <Box sx={{ flex: 7, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0', bgcolor: '#fff' }}>

            {/* 1. Filters */}
            <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: COLORS.textStrong, letterSpacing: 1 }}>
                1. BUSCAR ARTÍCULO
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Autocomplete
                  options={proveedores}
                  getOptionLabel={(o: any) => o.Nombre || ''}
                  value={proveedorSeleccionado}
                  onChange={(_, v) => { setProveedorSeleccionado(v); setRubroSeleccionado(null); }}
                  renderInput={(params) => <TextField {...params} label="Proveedor" placeholder="Seleccione proveedor" />}
                  sx={{ flex: 1, minWidth: 220 }}
                />
                <Autocomplete
                  options={rubros}
                  getOptionLabel={(o: any) => o.nombre || ''}
                  value={rubroSeleccionado}
                  onChange={(_, v) => setRubroSeleccionado(v)}
                  renderInput={(params) => <TextField {...params} label="Rubro" placeholder="Seleccione rubro" />}
                  disabled={!proveedorSeleccionado}
                  sx={{ flex: 1, minWidth: 220 }}
                />
                <TextField
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por código o nombre..."
                  sx={{ flex: 1.5, minWidth: 250 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" /></InputAdornment>
                  }}
                />
              </Box>
            </Box>

            {/* 2. Results (Table) */}
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 0 }}>
              <TablaArticulos
                columns={columns as any}
                controlledFilters={controlledFilters}
                showToolbar={false}
                allowCreate={false}
                defaultPageSize={50}
                rowsPerPageOptions={[20, 50, 100]}
                dense
              />
            </Box>
          </Box>

          {/* RIGHT: Distribution Panel (30%) */}
          <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', bgcolor: '#f9fafb', borderLeft: '1px solid #e0e0e0' }}>
            <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: COLORS.textStrong, letterSpacing: 1 }}>
                2. DISTRIBUIR STOCK
              </Typography>

              {!articuloSeleccionado ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} color="text.secondary" sx={{ opacity: 0.6 }}>
                  <Icon icon="mdi:cursor-default-click-outline" width={64} style={{ marginBottom: 16 }} />
                  <Typography align="center" variant="body1">
                    Seleccione un artículo de la lista<br />para comenzar la distribución.
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Selected Info Card */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fff', borderColor: verde.primary }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      ARTÍCULO SELECCIONADO
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                      {articuloSeleccionado.Descripcion}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip label={articuloSeleccionado.Codigo} size="small" variant="outlined" />
                      <Typography variant="caption">
                        Stock actual: <strong>{articuloSeleccionado.totalStock || articuloSeleccionado.Stock || 0}</strong>
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Global Input */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      CANTIDAD TOTAL A DISTRIBUIR
                    </Typography>
                    <TextField
                      fullWidth
                      value={stockGlobal}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) setStockGlobal(e.target.value);
                      }}
                      placeholder="0"
                      InputProps={{
                        sx: { fontSize: '1.5rem', fontWeight: 700, color: verde.primary, bgcolor: '#fff' }
                      }}
                    />

                    {/* Metrics */}
                    <Box display="flex" justifyContent="space-between" mt={1} px={1}>
                      <Box>
                        <Typography variant="caption" display="block">ASIGNADO</Typography>
                        <Typography variant="body2" fontWeight={700} color={asignadoTotal > stockGlobalNum ? 'error.main' : 'text.primary'}>
                          {asignadoTotal}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" display="block">RESTANTE</Typography>
                        <Typography variant="body2" fontWeight={700} color={restante === 0 && stockGlobalNum > 0 ? 'success.main' : 'text.primary'}>
                          {restante}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Points List */}
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    ASIGNAR POR PUNTO
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {loadingStockDetalle ? <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2 }} /> : puntosDisponibles.map(punto => {
                      const valStr = stockPorPunto[punto.id] || '';
                      const val = parseFloat(valStr || '0');
                      const actual = stockActualPorPunto[punto.id] || 0;
                      const final = actual + val;

                      return (
                        <Paper key={punto.id} elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Icon icon={punto.tipo === 'deposito' ? 'mdi:warehouse' : 'mdi:store'} width={18} color={COLORS.secondary} />
                                <Typography variant="body2" fontWeight={600}>{punto.nombre}</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Stock Actual: <strong>{actual}</strong>
                              </Typography>
                            </Box>
                            <TextField
                              size="small"
                              value={valStr}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (/^\d*\.?\d*$/.test(v)) {
                                  const newVal = parseFloat(v || '0');
                                  const currentExcluding = asignadoTotal - (parseFloat(valStr || '0'));
                                  if (currentExcluding + newVal <= stockGlobalNum) {
                                    setStockPorPunto(prev => ({ ...prev, [punto.id]: v }));
                                  }
                                }
                              }}
                              placeholder="0"
                              disabled={stockGlobalNum <= 0}
                              sx={{ width: 90 }}
                              InputProps={{ sx: { textAlign: 'right', fontWeight: 600 } }}
                            />
                          </Box>

                          <Box display="flex" justifyContent="flex-end" alignItems="center" pt={1} borderTop="1px dashed #eee">
                            <Typography variant="caption" color="text.secondary" mr={1}>
                              Stock Final:
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="primary.main">
                              {final}
                            </Typography>
                          </Box>
                        </Paper>
                      )
                    })}
                  </Box>
                </>
              )}
            </Box>

            {/* Footer Actions */}
            <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: '#fff' }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setConfirmOpen(true)}
                disabled={!articuloSeleccionado || asignadoTotal === 0 || asignadoTotal > stockGlobalNum}
                sx={{
                  bgcolor: COLORS.primary,
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 1,
                  fontSize: '1rem'
                }}
              >
                CONFIRMAR ASIGNACIÓN
              </Button>
              <Button fullWidth onClick={handleCloseInternal} sx={{ mt: 1, color: 'text.secondary' }}>
                Cancelar Operación
              </Button>
            </Box>
          </Box>

        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogContent sx={{ pb: 1, pt: 3 }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} align="center" gutterBottom>
            Confirmar Asignación
          </Typography>
          <Typography align="center" color="text.secondary">
            Se asignarán <strong>{asignadoTotal}</strong> unidades de<br />
            <strong>{articuloSeleccionado?.Descripcion}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" color="inherit">Cancelar</Button>
          <Button onClick={confirmarAplicacion} autoFocus variant="contained" disabled={asignando} sx={{ bgcolor: COLORS.primary }}>
            {asignando ? 'Procesando...' : 'Confirmar'}
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
