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

// Queries
import { OBTENER_PUNTOS_MUDRAS, type ObtenerPuntosMudrasResponse } from '@/components/puntos-mudras/graphql/queries';
import { BUSCAR_ARTICULOS } from '@/components/articulos/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { ASIGNAR_STOCK_MASIVO } from '@/components/puntos-mudras/graphql/mutations';

import type { Articulo } from '@/app/interfaces/mudras.types';

// Interface for type safety
interface BuscarArticulosResponse {
  buscarArticulos: {
    articulos: Articulo[];
    total: number;
  }
}

interface ModalNuevaAsignacionStockProps {
  open: boolean;
  onClose: () => void;
  onStockAsignado?: () => void;
}

export default function ModalNuevaAsignacionStock({
  open,
  onClose,
  onStockAsignado
}: ModalNuevaAsignacionStockProps) {
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
  const { data: dataPuntos } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);
  const { data: dataProveedores } = useQuery(GET_PROVEEDORES);
  const { data: dataRubros } = useQuery(GET_RUBROS);

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

  const rubros = useMemo(() => {
    const allRubros = (dataRubros as any)?.obtenerRubros || [];
    if (!proveedorSeleccionado) return allRubros;

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
      setProveedorSeleccionado(null);
      setRubroSeleccionado(null);
      setBusqueda('');
      setArticuloSeleccionado(null);
      setStockGlobal('0');
      setStockPorPunto({});
      setConfirmOpen(false);
    }
  }, [open]);

  // Search effect
  useEffect(() => {
    if (open) {
      const filtros: any = {};
      if (busqueda) filtros.busqueda = busqueda;
      if (rubroSeleccionado) filtros.rubroId = Number(rubroSeleccionado.id);
      if (proveedorSeleccionado) filtros.proveedorId = Number(proveedorSeleccionado.IdProveedor);
      filtros.limite = 50;
      filtros.pagina = 0;

      const timeoutId = setTimeout(() => {
        buscarArticulos({ variables: { filtros } });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [busqueda, rubroSeleccionado, proveedorSeleccionado, open, buscarArticulos]);


  // --- Handlers ---
  const handleSeleccionarArticulo = (articulo: Articulo) => {
    // If clicking same, deselect? or just prevent re-render?
    // Let's allow simple selection.
    setArticuloSeleccionado(articulo);
    setStockGlobal('0');
    setStockPorPunto({});

    // Scroll to bottom (optional, but good UX if list is long)
    setTimeout(() => {
      document.getElementById('distribution-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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
        maxWidth="md" // Slightly narrower than full width for better read
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            height: '90vh',
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

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* 1. FILTERS */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={1}>
              1. BUSCAR ARTÍCULO
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Autocomplete
                options={proveedores}
                getOptionLabel={(o: any) => o.Nombre || ''}
                value={proveedorSeleccionado}
                onChange={(_, v) => { setProveedorSeleccionado(v); setRubroSeleccionado(null); }}
                renderInput={(params) => <TextField {...params} label="Proveedor" size="small" />}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Autocomplete
                options={rubros}
                getOptionLabel={(o: any) => o.nombre || ''}
                value={rubroSeleccionado}
                onChange={(_, v) => setRubroSeleccionado(v)}
                renderInput={(params) => <TextField {...params} label="Rubro" size="small" />}
                disabled={!proveedorSeleccionado}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label="Buscar por nombre o código"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                size="small"
                sx={{ flex: 2, minWidth: 300 }}
                InputProps={{
                  endAdornment: <Icon icon="mdi:magnify" color="action" />
                }}
              />
            </Box>
          </Box>

          {/* 2. RESULTS TABLE */}
          <Box flex={1} minHeight={200} border="1px solid #e0e0e0" display="flex" flexDirection="column">
            <TableContainer sx={{ flex: 1, maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: alpha(verde.primary, 0.05), fontWeight: 700 }}>CÓDIGO</TableCell>
                    <TableCell sx={{ bgcolor: alpha(verde.primary, 0.05), fontWeight: 700 }}>DESCRIPCIÓN</TableCell>
                    <TableCell sx={{ bgcolor: alpha(verde.primary, 0.05), fontWeight: 700 }}>RUBRO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingArticulos ? (
                    <TableRow><TableCell colSpan={3} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                  ) : (dataArticulos?.buscarArticulos?.articulos || []).length === 0 ? (
                    <TableRow><TableCell colSpan={3} align="center">No hay resultados</TableCell></TableRow>
                  ) : (
                    (dataArticulos?.buscarArticulos?.articulos || []).map((art: any) => {
                      const isSelected = articuloSeleccionado?.id === art.id;
                      return (
                        <TableRow
                          key={art.id}
                          hover
                          onClick={() => handleSeleccionarArticulo(art)}
                          selected={isSelected}
                          sx={{ cursor: 'pointer', '&.Mui-selected': { bgcolor: alpha(verde.primary, 0.15) } }}
                        >
                          <TableCell size="small">{art.Codigo}</TableCell>
                          <TableCell size="small">
                            <Typography variant="body2" fontWeight={600}>{art.Descripcion}</Typography>
                          </TableCell>
                          <TableCell size="small">{art.Rubro}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 3. DISTRIBUTION (Visible if selected) */}
          {articuloSeleccionado && (
            <Box id="distribution-section" borderTop="1px solid #e0e0e0" pt={3}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={2}>
                2. DISTRIBUIR STOCK
              </Typography>

              <Box sx={{ bgcolor: '#f9f9f9', p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">ARTÍCULO SELECCIONADO</Typography>
                    <Typography variant="h6" color={verde.primary} fontWeight={700}>
                      {articuloSeleccionado.Descripcion} <span style={{ fontSize: '0.8em', color: '#666' }}>({articuloSeleccionado.Codigo})</span>
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary">STOCK DISPONIBLE ACTUAL</Typography>
                    <Typography variant="h6" fontWeight={700}>{articuloSeleccionado.totalStock || 0}</Typography>
                  </Box>
                </Box>

                {/* GLOBAL STOCK INPUT + METRICS */}
                <Box display="flex" gap={2} alignItems="center">
                  <TextField
                    label="Stock Global a Distribuir"
                    value={stockGlobal}
                    onChange={(e) => {
                      if (/^\d*\.?\d*$/.test(e.target.value)) setStockGlobal(e.target.value);
                    }}
                    size="small"
                    sx={{ width: 200 }}
                  />
                  <Divider orientation="vertical" flexItem />
                  <Box>
                    <Typography variant="caption">ASIGNADO: <strong>{asignadoTotal}</strong></Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color={restante < 0 ? 'error' : 'success'}>
                      RESTANTE: <strong>{restante}</strong>
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* POINTS TABLE */}
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>PUNTO / DEPÓSITO</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f5f5f5', width: 150 }}>CANTIDAD</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {puntosDisponibles.map(punto => (
                      <TableRow key={punto.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Icon icon={punto.tipo === 'deposito' ? 'mdi:warehouse' : 'mdi:store'} width={18} color="action" />
                            <Typography variant="body2">{punto.nombre}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            placeholder="0"
                            value={stockPorPunto[punto.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^\d*\.?\d*$/.test(val)) {
                                const newVal = parseFloat(val || '0');
                                // Prevent exceeding global? Or just show negative?
                                // User logic in ModalNuevoArticulo: "Validación: No permitir ingresar más de lo restante"
                                // Let's prevent it.
                                const currentTotal = asignadoTotal - (parseFloat(stockPorPunto[punto.id] || '0'));
                                if (currentTotal + newVal <= stockGlobalNum) {
                                  setStockPorPunto(prev => ({ ...prev, [punto.id]: val }));
                                }
                              }
                            }}
                            disabled={stockGlobalNum <= 0}
                            InputProps={{ sx: { textAlign: 'right', fontSize: '0.875rem', py: 0 } }}
                            sx={{ '& input': { textAlign: 'right' } }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={handleCloseInternal} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => setConfirmOpen(true)}
            disabled={!articuloSeleccionado || asignadoTotal === 0 || asignadoTotal > stockGlobalNum}
            sx={{ bgcolor: verde.primary, fontWeight: 700 }}
          >
            Confirmar Asignación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que desea asignar <strong>{asignadoTotal}</strong> unidades del artículo <strong>{articuloSeleccionado?.Descripcion}</strong>?
          </Typography>
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
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
