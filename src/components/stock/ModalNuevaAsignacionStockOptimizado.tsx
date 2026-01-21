'use client';
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { verde } from '@/ui/colores';

interface ProveedorBasico {
  id: number;
  nombre: string;
  codigo?: number;
}

interface RubroBasico {
  rubro: string;
}

interface ArticuloFiltrado {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stockTotal: number;
  stockAsignado: number;
  stockDisponible: number;
  rubro: string;
  proveedor: string;
}

interface AsignacionStock {
  articuloId: number;
  cantidad: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  puntoVenta: any;
  onStockAsignado: () => void;
}

const GET_PUNTOS_OPTIMIZADO = gql`
  query ObtenerPuntosOptimizado {
    obtenerPuntosMudras {
      id
      nombre
      tipo
      activo
    }
  }
`;

const ASIGNAR_STOCK_MASIVO = gql`
  mutation AsignarStockMasivo($input: AsignarStockMasivoInput!) {
    asignarStockMasivo(input: $input)
  }
`;

export default function ModalNuevaAsignacionStockOptimizado({ open, onClose, puntoVenta: puntoVentaProp, onStockAsignado }: Props) {
  // Estados para filtros
  const [puntoDestinoId, setPuntoDestinoId] = useState<number | ''>('');
  const [proveedores, setProveedores] = useState<ProveedorBasico[]>([]);
  const [rubros, setRubros] = useState<RubroBasico[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ProveedorBasico | null>(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  // Estados para artículos y asignaciones
  const [articulos, setArticulos] = useState<ArticuloFiltrado[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [loadingRubros, setLoadingRubros] = useState(false);
  const [error, setError] = useState<string>('');

  // Mutation para crear asignación masiva
  const [asignarStockMasivo] = useMutation(ASIGNAR_STOCK_MASIVO);

  // Query para buscar puntos (optimizado para el selector)
  const { data: dataPuntos } = useQuery(GET_PUNTOS_OPTIMIZADO, {
    skip: !open
  });

  const puntos = (dataPuntos as any)?.obtenerPuntosMudras || [];

  // Cargar proveedores al abrir el modal
  useEffect(() => {
    if (open) {
      cargarProveedores();
    }
  }, [open]);

  // Cargar rubros cuando se selecciona un proveedor
  useEffect(() => {
    if (proveedorSeleccionado) {
      cargarRubrosPorProveedor(proveedorSeleccionado.id);
    } else {
      setRubros([]);
      setRubroSeleccionado('');
    }
  }, [proveedorSeleccionado]);

  // Efecto para setear punto destino si se pasa por props
  useEffect(() => {
    if (puntoVentaProp?.id) {
      setPuntoDestinoId(puntoVentaProp.id);
    }
  }, [puntoVentaProp]);

  const buscarArticulos = useCallback(async () => {
    if (!proveedorSeleccionado || busqueda.length < 3) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query BuscarArticulosParaAsignacion($proveedorId: Int, $rubro: String, $busqueda: String) {
              buscarArticulosParaAsignacion(proveedorId: $proveedorId, rubro: $rubro, busqueda: $busqueda) {
                id
                nombre
                codigo
                precio
                stockTotal
                stockAsignado
                stockDisponible
                rubro
                proveedor
              }
            }
          `,
          variables: {
            proveedorId: proveedorSeleccionado.id,
            rubro: rubroSeleccionado || null,
            busqueda,
          },
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setArticulos(result.data.buscarArticulosParaAsignacion || []);
      console.log(`🔍 Encontrados ${result.data.buscarArticulosParaAsignacion?.length || 0} artículos`);
    } catch (error) {
      console.error('Error al buscar artículos:', error);
      setError('Error al buscar artículos');
    } finally {
      setLoading(false);
    }
  }, [proveedorSeleccionado, rubroSeleccionado, busqueda]);

  // Buscar artículos cuando se aplican filtros
  useEffect(() => {
    if (proveedorSeleccionado && busqueda.length >= 3) {
      buscarArticulos();
    } else {
      setArticulos([]);
    }
  }, [proveedorSeleccionado, busqueda, buscarArticulos]);

  const cargarProveedores = async () => {
    setLoadingProveedores(true);
    setError('');

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ObtenerProveedoresConStock {
              obtenerProveedoresConStock {
                id
                nombre
                codigo
              }
            }
          `
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setProveedores(result.data.obtenerProveedoresConStock || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError('Error al cargar la lista de proveedores');
    } finally {
      setLoadingProveedores(false);
    }
  };

  const cargarRubrosPorProveedor = async (proveedorId: number) => {
    setLoadingRubros(true);
    setError('');

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ObtenerRubrosPorProveedor($proveedorId: ID!) {
              obtenerRubrosPorProveedor(proveedorId: $proveedorId) {
                rubro
              }
            }
          `,
          variables: { proveedorId: String(proveedorId) }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const rubrosData = result.data.obtenerRubrosPorProveedor || [];
      setRubros(rubrosData);

      // Si solo hay un rubro, seleccionarlo automáticamente
      if (rubrosData.length === 1) {
        setRubroSeleccionado(rubrosData[0].rubro);
      } else {
        setRubroSeleccionado('');
      }
    } catch (error) {
      console.error('Error al cargar rubros:', error);
      setError('Error al cargar los rubros del proveedor');
    } finally {
      setLoadingRubros(false);
    }
  };

  const handleBusquedaKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && busqueda.length >= 3 && proveedorSeleccionado) {
      buscarArticulos();
    }
  };

  const handleAsignarStock = (articuloId: number, cantidad: string) => {
    if (cantidad !== '' && !/^\d*[.,]?\d*$/.test(cantidad)) return;

    const asignacionExistente = asignaciones.find(a => a.articuloId === articuloId);

    if (asignacionExistente) {
      setAsignaciones(prev =>
        prev.map(a =>
          a.articuloId === articuloId
            ? { ...a, cantidad }
            : a
        )
      );
    } else {
      setAsignaciones(prev => [...prev, { articuloId, cantidad }]);
    }
  };

  const handleRemoverAsignacion = (articuloId: number) => {
    setAsignaciones(prev => prev.filter(a => a.articuloId !== articuloId));
  };

  const handleConfirmarAsignaciones = async () => {
    if (asignaciones.length === 0) {
      setError('Debe asignar stock a al menos un artículo');
      return;
    }

    if (!puntoDestinoId) {
      setError('Debe seleccionar un punto de venta o depósito de destino');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const input = {
        puntoMudrasId: Number(puntoDestinoId),
        asignaciones: asignaciones.map(a => ({
          articuloId: a.articuloId,
          cantidad: parseFloat(a.cantidad) || 0
        })),
        motivo: 'Asignación Masiva desde Panel Global'
      };

      await asignarStockMasivo({ variables: { input } });

      onStockAsignado();
      handleCerrar();
    } catch (error: any) {
      console.error('Error al asignar stock:', error);
      setError(error.message || 'Error al asignar el stock');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setProveedorSeleccionado(null);
    setRubroSeleccionado('');
    setBusqueda('');
    setArticulos([]);
    setAsignaciones([]);
    setError('');
    onClose();
  };

  const getCantidadAsignada = (articuloId: number): string => {
    const asignacion = asignaciones.find(a => a.articuloId === articuloId);
    return asignacion?.cantidad || '0';
  };

  const totalAsignaciones = asignaciones.reduce((total, a) => total + (parseFloat(a.cantidad) || 0), 0);


  /* ======================== Render ======================== */
  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 4,
        sx: {
          borderRadius: 0,
          bgcolor: '#ffffff',
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      {/* HEADER */}
      <Box sx={{
        bgcolor: verde.primary,
        color: '#ffffff',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `4px solid ${verde.headerBorder}`,
        borderRadius: 0,
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon icon="mdi:package-variant-plus" width={24} height={24} />
          <Box>
            <Typography variant="h6" fontWeight={600} letterSpacing={0.5}>
              ASIGNACIÓN DE STOCK
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
              {puntoVentaProp ? puntoVentaProp.nombre : 'Masiva'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleCerrar} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>
        <Box display="flex" flexDirection="column" gap={3}>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 0 }}>
              {error}
            </Alert>
          )}

          {/* SECCIÓN DESTINO */}
          <Box p={2} bgcolor="#fff" border="1px solid #e0e0e0">
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2} textTransform="uppercase">
              Destino
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Punto de Venta / Depósito</InputLabel>
              <Select
                value={puntoDestinoId}
                onChange={(e) => setPuntoDestinoId(Number(e.target.value))}
                label="Punto de Venta / Depósito"
                sx={{ borderRadius: 0 }}
              >
                {puntos.map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre} ({p.tipo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* SECCIÓN FILTROS */}
          <Box p={2} bgcolor="#fff" border="1px solid #e0e0e0">
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2} textTransform="uppercase">
              Búsqueda de Artículos
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={2}>
              <Autocomplete
                options={proveedores}
                getOptionLabel={(option) => option.nombre}
                value={proveedorSeleccionado}
                onChange={(_, newValue) => setProveedorSeleccionado(newValue)}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="Proveedor" placeholder="Seleccione..." required InputProps={{ ...params.InputProps, sx: { borderRadius: 0 } }} />
                )}
              />
              <FormControl fullWidth size="small" disabled={!proveedorSeleccionado || loadingRubros}>
                <InputLabel>Rubro</InputLabel>
                <Select
                  value={rubroSeleccionado}
                  onChange={(e) => setRubroSeleccionado(e.target.value)}
                  label="Rubro"
                  sx={{ borderRadius: 0 }}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {rubros.map((r) => (<MenuItem key={r.rubro} value={r.rubro}>{r.rubro}</MenuItem>))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                label="Buscar Artículo"
                placeholder="Mín. 3 caracteres..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={handleBusquedaKeyPress}
                disabled={!proveedorSeleccionado}
                InputProps={{ sx: { borderRadius: 0 }, endAdornment: <Icon icon="mdi:magnify" color="#9e9e9e" /> }}
              />
            </Box>
          </Box>

          {/* RESULTADOS TABLE */}
          {loading && <Typography align="center" py={2}>Buscando...</Typography>}

          {articulos.length > 0 && (
            <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 0, bgcolor: '#fff', maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>CÓDIGO</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>DESCRIPCIÓN</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>RUBRO</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>PRECIO</TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>STOCK DISP.</TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, width: 120 }}>ASIGNAR</TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>ACCIÓN</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {articulos.map((articulo) => {
                    const cantidadAsignada = getCantidadAsignada(articulo.id);
                    return (
                      <TableRow key={articulo.id} hover>
                        <TableCell>{articulo.codigo}</TableCell>
                        <TableCell>{articulo.nombre}</TableCell>
                        <TableCell>{articulo.rubro}</TableCell>
                        <TableCell align="right">${articulo.precio.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={articulo.stockDisponible} sx={{ borderRadius: 0, height: 20 }} color={articulo.stockDisponible > 0 ? 'success' : 'error'} />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            value={cantidadAsignada}
                            onChange={(e) => handleAsignarStock(articulo.id, e.target.value)}
                            InputProps={{ sx: { borderRadius: 0, textAlign: 'center' } }}
                            inputMode="decimal"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {(parseFloat(String(cantidadAsignada)) || 0) > 0 && (
                            <IconButton size="small" color="error" onClick={() => handleRemoverAsignacion(articulo.id)}>
                              <Icon icon="mdi:delete" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* RESUMEN FOOTER */}
          {asignaciones.length > 0 && (
            <Box p={2} bgcolor={alpha(verde.primary, 0.08)} border={`1px solid ${verde.primary}`} display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color={verde.textStrong}>Resumen</Typography>
                <Typography variant="body2">Artículos: <b>{asignaciones.length}</b> | Unidades Total: <b>{totalAsignaciones}</b></Typography>
              </Box>
            </Box>
          )}

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={handleCerrar} variant="outlined" color="inherit" sx={{ borderRadius: 0, textTransform: 'none' }}>Cancelar</Button>
        <Button
          onClick={handleConfirmarAsignaciones}
          disabled={loading || asignaciones.length === 0}
          variant="contained"
          disableElevation
          sx={{ bgcolor: verde.primary, borderRadius: 0, px: 3, fontWeight: 700, '&:hover': { bgcolor: verde.primaryHover } }}
        >
          {loading ? 'Procesando...' : 'CONFIRMAR ASIGNACIÓN'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
