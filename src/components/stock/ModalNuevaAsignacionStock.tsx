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
  Chip,
  Tooltip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { verde, azul } from '@/ui/colores';
import { alpha, darken } from '@mui/material/styles';

// Components
import { TablaArticulos } from '@/components/articulos';

// Queries
import { OBTENER_PUNTOS_MUDRAS, type ObtenerPuntosMudrasResponse } from '@/components/puntos-mudras/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { ASIGNAR_STOCK_MASIVO } from '@/components/puntos-mudras/graphql/mutations';
import {
  OBTENER_STOCK_PUNTO_MUDRAS,
  BUSCAR_ARTICULOS_PARA_ASIGNACION,
  type ObtenerStockPuntoMudrasResponse,
  type BuscarArticulosParaAsignacionResponse
} from '@/components/puntos-mudras/graphql/queries';

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
  // Styles for "Elegante" look
  const COLORS = {
    primary: verde.primary,
    secondary: verde.headerBorder || '#2e7d32',
    textStrong: darken(verde.primary, 0.4),
    headerText: '#fff',
    bgLight: '#f8f9fa',
    border: '#e0e0e0',
    selectionBg: alpha(verde.primary, 0.08)
  };

  // --- States for Filters ---
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<{ IdProveedor: number; Nombre?: string } | null>(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<{ id: number; nombre: string } | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // --- States for Selection & Distribution ---
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (!open) {
      // Reset logic
      setProveedorSeleccionado(null);
      setRubroSeleccionado(null);
      setBusqueda('');
      setPage(0);
      setRowsPerPage(50);
      setArticuloSeleccionado(null);
      // ...
    }
  }, [open]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda]);


  // --- Columns for TablaArticulos ---
  // ... (keeping columns definition) ...

  // --- Filters for TablaArticulos ---


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
  const [buscarArticuloEnPunto] = useLazyQuery<BuscarArticulosParaAsignacionResponse>(BUSCAR_ARTICULOS_PARA_ASIGNACION, {
    fetchPolicy: 'network-only' // Ensure we get fresh stock data
  });


  const [stockActualPorPunto, setStockActualPorPunto] = useState<Record<string, number>>({});

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

  // --- Clear Handlers ---
  const handleClearFilters = () => {
    setProveedorSeleccionado(null);
    setRubroSeleccionado(null);
    setBusqueda('');
    setPage(0);
  };

  const handleClearSelection = () => {
    setArticuloSeleccionado(null);
    setStockGlobal('0');
    setStockPorPunto({});
    setStockActualPorPunto({});
  };

  // --- Effects ---
  useEffect(() => {
    if (!open) {
      // Reset logic
      setProveedorSeleccionado(null);
      setRubroSeleccionado(null);
      setBusqueda('');
      setPage(0);
      setRowsPerPage(50);
      setArticuloSeleccionado(null);
      setStockGlobal('0');
      setStockPorPunto({});
      setConfirmOpen(false);
      setStockActualPorPunto({});
    }
  }, [open]);

  // --- Columns for TablaArticulos ---
  const handleSelectClick = useCallback(async (art: Articulo) => {
    // Toggle logic: if already selected, deselect
    if (String(articuloSeleccionado?.id) === String(art.id)) {
      handleClearSelection();
      return;
    }

    setArticuloSeleccionado(art);
    setStockGlobal('0');
    setStockPorPunto({});
    setStockActualPorPunto({}); // Clear previous stock data

    // Fetch stock for this article in each point
    if (art.Codigo) {
      const newStockMap: Record<string, number> = {};

      // We process points in parallel to speed up
      const promises = puntosDisponibles.map(async (punto) => {
        try {
          const { data } = await buscarArticuloEnPunto({
            variables: {
              busqueda: art.Codigo,
              destinoId: punto.id
            }
          });

          const found = data?.buscarArticulosParaAsignacion?.[0];
          if (found) {
            // stockEnDestino is usually what we want: stock IN that point
            // fallback to stockDisponible if stockEnDestino is missing (though backend should provide it)
            const stockEnPunto = found.stockEnDestino ?? 0;
            newStockMap[String(punto.id)] = stockEnPunto;
          } else {
            newStockMap[String(punto.id)] = 0;
          }
        } catch (err) {
          console.error(`Error fetching stock for point ${punto.id}:`, err);
          newStockMap[String(punto.id)] = 0;
        }
      });

      await Promise.all(promises);
      setStockActualPorPunto(newStockMap);
    }

  }, [articuloSeleccionado, puntosDisponibles, buscarArticuloEnPunto]);

  const columns = useMemo(() => [
    { key: 'codigo', header: 'Código', width: '20%' },
    { key: 'descripcion', header: 'Descripción', width: '55%' },
    // RUBRO COLUMN REMOVED
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
            borderColor: COLORS.border,
            color: articuloSeleccionado?.id === art.id ? '#fff' : 'text.secondary'
          }}
        >
          {articuloSeleccionado?.id === art.id ? "Deseleccionar" : "Elegir"}
        </Button>
      )
    }
  ], [articuloSeleccionado, handleSelectClick, COLORS.border]);

  // --- Filters for TablaArticulos ---
  const controlledFilters = useMemo(() => {
    const filters: any = {
      pagina: page,
      limite: rowsPerPage
    };
    if (proveedorSeleccionado) filters.proveedorId = Number(proveedorSeleccionado.IdProveedor);
    if (rubroSeleccionado) filters.rubroId = Number(rubroSeleccionado.id);
    if (busqueda) filters.busqueda = busqueda;
    return filters;
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda, page, rowsPerPage]);


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
            borderRadius: 0,
            bgcolor: '#ffffff',
            height: `${VH_MAX}vh`,
            maxHeight: `${VH_MAX}vh`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          borderRadius: 0,
          bgcolor: COLORS.primary,
          color: COLORS.headerText,
          px: 5, // Increased padding
          py: 3, // Increased padding
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `4px solid ${COLORS.secondary}`,
        }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Icon icon="mdi:package-variant-plus" width={32} height={32} />
            <Box>
              <Typography variant="h5" fontWeight={700} letterSpacing={1}>
                ASIGNACIÓN GLOBAL DE STOCK
              </Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 400, mt: 0.5 }}>
                Distribuye stock a múltiples depósitos y puntos de venta en una sola operación.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseInternal} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <Icon icon="mdi:close" width={32} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, display: 'flex', bgcolor: COLORS.bgLight, overflow: 'hidden' }}>

          {/* LEFT: Selection Panel (70%) */}
          <Box sx={{ flex: 7, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${COLORS.border}`, bgcolor: '#fff' }}>

            <Box sx={{ p: 4, borderBottom: `1px solid ${COLORS.border}` }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textStrong, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:magnify" />
                  1. BUSCAR ARTÍCULO
                </Typography>
                {(proveedorSeleccionado || rubroSeleccionado || busqueda) && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearFilters}
                    startIcon={<Icon icon="mdi:refresh" />}
                    sx={{
                      textTransform: 'none',
                      color: 'text.secondary',
                      borderColor: COLORS.border,
                      borderRadius: 1,
                      height: 32
                    }}
                  >
                    Limpiar
                  </Button>
                )}
              </Box>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Autocomplete
                  options={proveedores}
                  getOptionLabel={(o: any) => o.Nombre || ''}
                  value={proveedorSeleccionado}
                  onChange={(_, v) => { setProveedorSeleccionado(v); setRubroSeleccionado(null); }}
                  renderInput={(params) => <TextField {...params} label="Proveedor" placeholder="Filtrar por proveedor" />}
                  sx={{ flex: 1, minWidth: 240 }}
                />
                <Autocomplete
                  options={rubros}
                  getOptionLabel={(o: any) => o.nombre || ''}
                  value={rubroSeleccionado}
                  onChange={(_, v) => setRubroSeleccionado(v)}
                  renderInput={(params) => <TextField {...params} label="Rubro" placeholder="Filtrar por rubro" />}
                  disabled={!proveedorSeleccionado}
                  sx={{ flex: 1, minWidth: 240 }}
                />
                <TextField
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ingrese código o descripción..."
                  sx={{ flex: 1.5, minWidth: 280 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Icon icon="mdi:barcode-scan" /></InputAdornment>
                  }}
                />
              </Box>
            </Box>

            {/* 2. Results (Table) */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              p: 4,
              minHeight: 0 // Crucial for nested flex scrolling
            }}>
              <Box sx={{ flex: 1, overflow: 'hidden', borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <TablaArticulos
                    columns={columns as any}
                    controlledFilters={controlledFilters}
                    onFiltersChange={(newFilters) => {
                      if (newFilters.pagina !== undefined) setPage(newFilters.pagina);
                      if (newFilters.limite !== undefined) setRowsPerPage(newFilters.limite);
                    }}
                    showToolbar={false}
                    allowCreate={false}
                    defaultPageSize={50}
                    rowsPerPageOptions={[20, 50, 100]}
                    dense
                    rootSx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    tableContainerSx={{
                      flex: 1,
                      minHeight: 0,
                      border: 'none', // Remove default border from TableContainer
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* RIGHT: Distribution Panel (30%) */}
          <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', bgcolor: '#f9fafb', borderLeft: `1px solid ${COLORS.border}`, minHeight: 0 }}>
            <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: COLORS.textStrong, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="mdi:dolly" />
                2. DISTRIBUIR STOCK
              </Typography>

              {!articuloSeleccionado ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} color="text.secondary" sx={{ opacity: 0.6 }}>
                  <Icon icon="mdi:cursor-default-click-outline" width={80} style={{ marginBottom: 24, opacity: 0.5 }} />
                  <Typography align="center" variant="h6" fontWeight={500}>
                    Seleccione un artículo
                  </Typography>
                  <Typography align="center" variant="body2">
                    para visualizar stock y asignar cantidades.
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Selected Info Card */}
                  <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, bgcolor: '#fff', borderColor: COLORS.secondary, borderRadius: 2, position: 'relative' }}>
                    <IconButton
                      size="small"
                      onClick={handleClearSelection}
                      sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
                    >
                      <Icon icon="mdi:close" />
                    </IconButton>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>
                      ARTÍCULO SELECCIONADO
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} sx={{ lineHeight: 1.3, mb: 2 }}>
                      {articuloSeleccionado.Descripcion}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip label={articuloSeleccionado.Codigo} sx={{ fontWeight: 600 }} variant="outlined" />
                      <Typography variant="body2">
                        Stock Global Actual: <strong>{articuloSeleccionado.totalStock || articuloSeleccionado.Stock || 0}</strong>
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Global Input */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase' }}>
                      Paso 1: Definir Total a Distribuir
                    </Typography>
                    <TextField
                      fullWidth
                      value={stockGlobal}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) setStockGlobal(e.target.value);
                      }}
                      placeholder="0"
                      InputProps={{
                        sx: { fontSize: '2rem', fontWeight: 700, color: COLORS.primary, bgcolor: '#fff', textAlign: 'center' }
                      }}
                      sx={{ mb: 1 }}
                    />

                    {/* Metrics */}
                    <Box display="flex" justifyContent="space-between" mt={1} px={1}>
                      <Box>
                        <Typography variant="caption" display="block" fontWeight={600} color="text.secondary">ASIGNADO</Typography>
                        <Typography variant="h6" fontWeight={700} color={asignadoTotal > stockGlobalNum ? 'error.main' : 'text.primary'}>
                          {asignadoTotal}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" display="block" fontWeight={600} color="text.secondary">RESTANTE</Typography>
                        <Typography variant="h6" fontWeight={700} color={restante === 0 && stockGlobalNum > 0 ? 'success.main' : 'text.primary'}>
                          {restante}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 4 }} />

                  {/* Points List */}
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: 'block', textTransform: 'uppercase' }}>
                    Paso 2: Distribuir por Punto
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {puntosDisponibles.map(punto => {
                      const valStr = stockPorPunto[punto.id] || '';

                      const actual = stockActualPorPunto[String(punto.id)] || 0;
                      const aAsignar = parseFloat(valStr || '0');
                      const final = actual + aAsignar;

                      return (
                        <Paper key={punto.id} elevation={0} sx={{ p: 2.5, border: `1px solid ${COLORS.border}`, bgcolor: '#fff', borderRadius: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Icon icon={punto.tipo === 'deposito' ? 'mdi:warehouse' : 'mdi:store'} width={20} color={COLORS.secondary} />
                                <Typography variant="subtitle1" fontWeight={700}>{punto.nombre}</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Stock Actual: <strong>{actual}</strong>
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {restante > 0 && (
                                  <Tooltip title="Asignar todo el restante">
                                    <IconButton
                                      size="small"
                                      sx={{
                                        color: COLORS.primary,
                                        bgcolor: alpha(COLORS.primary, 0.1),
                                        '&:hover': { bgcolor: alpha(COLORS.primary, 0.2) },
                                        width: 28,
                                        height: 28
                                      }}
                                      onClick={() => {
                                        const nuevoValor = aAsignar + restante;
                                        setStockPorPunto(prev => ({ ...prev, [punto.id]: String(nuevoValor) }));
                                      }}
                                    >
                                      <Icon icon="mdi:arrow-up-bold" width={18} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', textAlign: 'right' }}>Asignar</Typography>
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
                                    sx={{ width: 100 }}
                                    InputProps={{ sx: { textAlign: 'right', fontWeight: 700 } }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </Box>

                          <Box display="flex" justifyContent="space-between" alignItems="center" pt={1.5} borderTop={`1px dashed ${COLORS.border}`}>
                            <Typography variant="body2" color="text.secondary">
                              Stock Final Estimado
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Icon icon="mdi:arrow-right" width={16} color="#bdbdbd" />
                              <Typography variant="h6" fontWeight={700} color="primary.main">
                                {final}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      )
                    })}
                  </Box>
                </>
              )}
            </Box>

            {/* Footer Actions */}
            <Box sx={{ p: 4, borderTop: `1px solid ${COLORS.border}`, bgcolor: '#fff' }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setConfirmOpen(true)}
                disabled={!articuloSeleccionado || stockGlobalNum <= 0 || asignadoTotal !== stockGlobalNum}
                startIcon={<Icon icon="mdi:check-circle" />}
                sx={{
                  bgcolor: COLORS.primary,
                  fontWeight: 700,
                  py: 1.5,
                  mb: 1.5,
                  borderRadius: 1,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: 2
                }}
              >
                Confirmar Operación
              </Button>
              <Button
                fullWidth
                onClick={handleCloseInternal}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Cancelar y cerrar
              </Button>
            </Box>
          </Box>

        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogContent sx={{ pb: 1, pt: 3, px: 4 }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} align="center" gutterBottom>
            Confirmar Asignación
          </Typography>
          <Typography align="center" color="text.secondary">
            Está a punto de asignar <strong>{asignadoTotal}</strong> unidades en total.<br />
            Esta acción actualizará el stock en los puntos seleccionados.
          </Typography>
          <Paper variant="outlined" sx={{ mt: 3, p: 2, bgcolor: COLORS.bgLight, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="subtitle2" fontWeight={700} align="center">
              {articuloSeleccionado?.Descripcion}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Cod: {articuloSeleccionado?.Codigo}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" color="inherit">Revisar</Button>
          <Button onClick={confirmarAplicacion} autoFocus variant="contained" disabled={asignando} sx={{ bgcolor: COLORS.primary, px: 4 }}>
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
