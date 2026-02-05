'use client';
/* eslint-disable @next/next/no-img-element */
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Autocomplete,
  Checkbox,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ArticuloConStockPuntoMudras } from '@/components/puntos-mudras/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';

import { Icon } from '@iconify/react';
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from '@mui/icons-material';
import { grisVerdoso } from '@/ui/colores';
import { IconFileSpreadsheet, IconFileTypePdf, IconRefresh, IconSearch, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';
import MudrasLoader from '@/components/ui/MudrasLoader';
import { Divider } from '@mui/material';

const numberFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

type Props = {
  articulos: ArticuloConStockPuntoMudras[];
  loading?: boolean;
  error?: Error;
  puntoNombre?: string | null;
  onEditStock?: (articulo: ArticuloConStockPuntoMudras) => void;
  onViewDetails?: (articulo: ArticuloConStockPuntoMudras) => void;
  onNewAssignment?: () => void;
  theme?: any; // Optional theme prop
};

const TablaStockPuntoVenta: React.FC<Props> = ({
  articulos,
  loading = false,
  error,
  puntoNombre,
  onEditStock,
  onViewDetails,
  onNewAssignment,
  theme = grisVerdoso, // Default to grisVerdoso
}) => {
  const [busquedaDraft, setBusquedaDraft] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [filtrosRubros, setFiltrosRubros] = useState<any[]>([]);
  const [filtrosProveedores, setFiltrosProveedores] = useState<any[]>([]);

  // Bidirectional Filtering Logic
  const { rubrosDisponibles, proveedoresDisponibles } = useMemo(() => {
    const allRubrosMap = new Map();
    const allProvsMap = new Map();

    const provToRubros = new Map<number, Set<number>>();
    const rubroToProvs = new Map<number, Set<number>>();

    // 1. Build Maps and Lists from Articulos
    articulos.forEach(item => {
      const rubro = item.rubro;
      const prov = item.articulo?.proveedor;

      if (rubro?.id) {
        if (!allRubrosMap.has(rubro.id)) allRubrosMap.set(rubro.id, rubro);
      }
      if (prov?.IdProveedor) {
        if (!allProvsMap.has(prov.IdProveedor)) allProvsMap.set(prov.IdProveedor, prov);
      }

      if (rubro?.id && prov?.IdProveedor) {
        // Map Prov -> Rubros
        if (!provToRubros.has(prov.IdProveedor)) provToRubros.set(prov.IdProveedor, new Set());
        provToRubros.get(prov.IdProveedor)?.add(rubro.id);

        // Map Rubro -> Provs
        if (!rubroToProvs.has(rubro.id)) rubroToProvs.set(rubro.id, new Set());
        rubroToProvs.get(rubro.id)?.add(prov.IdProveedor);
      }
    });

    const allRubrosList = Array.from(allRubrosMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    const allProvsList = Array.from(allProvsMap.values()).sort((a, b) => (a.Nombre || '').localeCompare(b.Nombre || ''));

    // 2. Filter Available Options based on Selection
    const activeProvIds = filtrosProveedores.map(p => p.IdProveedor);
    const activeRubroIds = filtrosRubros.map(r => r.id);

    // Calculate Available Providers
    let filteredProvs = allProvsList;
    if (activeRubroIds.length > 0) {
      const allowedProvs = new Set<number>();
      activeRubroIds.forEach(rId => {
        const provs = rubroToProvs.get(rId);
        if (provs) provs.forEach(pId => allowedProvs.add(pId));
      });
      // Logic: Show providers that have AT LEAST ONE of the selected rubrics
      filteredProvs = allProvsList.filter(p => allowedProvs.has(Number(p.IdProveedor)));
    }

    // Calculate Available Rubros
    let filteredRubros = allRubrosList;
    if (activeProvIds.length > 0) {
      const allowedRubros = new Set<number>();
      activeProvIds.forEach(pId => {
        const rubros = provToRubros.get(pId);
        if (rubros) rubros.forEach(rId => allowedRubros.add(rId));
      });
      // Logic: Show rubrics offered by AT LEAST ONE of the selected providers
      filteredRubros = allRubrosList.filter(r => allowedRubros.has(Number(r.id)));
    }

    return { rubrosDisponibles: filteredRubros, proveedoresDisponibles: filteredProvs };
  }, [articulos, filtrosProveedores, filtrosRubros]);

  // Alias for compatibility
  const opcionesRubros = rubrosDisponibles;
  const opcionesProveedores = proveedoresDisponibles;

  const articulosFiltrados = useMemo(() => {
    let res = articulos;

    if (busquedaAplicada) {
      const term = busquedaAplicada.toLowerCase();
      res = res.filter((item) =>
        [item.codigo, item.nombre, item.rubro?.nombre]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term))
      );
    }

    if (filtrosRubros.length > 0) {
      const ids = filtrosRubros.map(r => r.id);
      res = res.filter(item => item.rubro?.id && ids.includes(item.rubro.id));
    }

    if (filtrosProveedores.length > 0) {
      const ids = filtrosProveedores.map(p => p.IdProveedor);
      res = res.filter(item => item.articulo?.proveedor?.IdProveedor && ids.includes(item.articulo.proveedor.IdProveedor));
    }

    return res;
  }, [articulos, busquedaAplicada, filtrosRubros, filtrosProveedores]);

  const ejecutarBusqueda = useCallback(() => {
    setBusquedaAplicada((busquedaDraft || '').trim());
    setPage(0);
  }, [busquedaDraft]);

  const limpiarFiltros = useCallback(() => {
    setBusquedaDraft('');
    setBusquedaAplicada('');
    setFiltrosRubros([]);
    setFiltrosProveedores([]);
    setPage(0);
  }, []);

  const handleExportar = async (formato: 'excel' | 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Stock_${puntoNombre || 'Punto'}_${timestamp}`;
    const titulo = `Stock en ${puntoNombre || 'Punto de Venta'}`;

    const columns: ExportColumn<any>[] = [
      { header: 'Código', key: 'codigo', width: 25 },
      { header: 'Descripción', key: 'nombre', width: 90 }, // Increased width since Rubro is gone
      { header: 'Stock', key: 'stockAsignado', width: 20 },
      {
        header: 'Precio', key: (item: any) => {
          const p = obtenerPrecioUnitario(item);
          return Number.isFinite(p) ? currencyFormatter.format(p) : '-';
        }, width: 25
      },
    ];

    if (formato === 'excel') {
      exportToExcel(articulosFiltrados, columns, filename, busquedaAplicada ? `Filtro: ${busquedaAplicada}` : '');
    } else {
      await exportToPdf(articulosFiltrados, columns, filename, titulo, busquedaAplicada ? `Filtro: ${busquedaAplicada}` : '');
    }
  };

  const obtenerPrecioUnitario = useCallback((item: ArticuloConStockPuntoMudras) => {
    if (item.articulo) {
      const calculado = calcularPrecioDesdeArticulo(item.articulo as Articulo);
      if (calculado && calculado > 0) {
        return calculado;
      }
    }
    return Number(item.precio ?? 0);
  }, []);

  const totalUnidades = useMemo(
    () => articulosFiltrados.reduce((acc, item) => acc + (Number(item.stockAsignado) || 0), 0),
    [articulosFiltrados]
  );

  const valorEstimado = useMemo(
    () =>
      articulosFiltrados.reduce(
        (acc, item) => acc + obtenerPrecioUnitario(item) * (Number(item.stockAsignado) || 0),
        0
      ),
    [articulosFiltrados, obtenerPrecioUnitario]
  );

  const showActions = Boolean(onEditStock || onViewDetails);
  const totalPaginas = Math.ceil(articulosFiltrados.length / rowsPerPage) || 1;
  const articulosPaginados = useMemo(
    () => articulosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [articulosFiltrados, page, rowsPerPage]
  );

  return (
    <Box>
      <Box
        mb={3}
        p={2}
        bgcolor="#ffffff"
        borderBottom="1px solid #f0f0f0"
      >
        {/* Row 1: New Assignment (Left) - Search (Right) */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            {onNewAssignment && (
              <Button
                variant="contained"
                disableElevation
                startIcon={<Icon icon="mdi:plus" />}
                onClick={onNewAssignment}
                sx={{
                  borderRadius: 0,
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: theme.primary,
                  '&:hover': { bgcolor: theme.primaryHover }
                }}
              >
                Nueva Asignación
              </Button>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={2} flex={1} maxWidth={600} justifyContent="flex-end">
            <TextField
              placeholder="Buscar por código, descripción o rubro..."
              size="small"
              fullWidth
              value={busquedaDraft}
              onChange={(e) => setBusquedaDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ejecutarBusqueda()}
              InputProps={{
                startAdornment: <InputAdornment position="start"><IconSearch size={18} color="#757575" /></InputAdornment>,
                sx: {
                  borderRadius: 1, // Match TablaArticulos
                  bgcolor: '#f9f9f9',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bdbdbd' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              startIcon={<IconRefresh size={18} />}
              sx={{
                borderRadius: 0,
                textTransform: 'none',
                color: '#757575',
                borderColor: '#e0e0e0',
                height: 40,
                px: 2,
                '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
              }}
            >
              Limpiar
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Row 2: Exports (Left) - Filters (Right) */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="nowrap" gap={2}>
          {/* Left: Export Buttons */}
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<IconFileSpreadsheet size={18} />}
              onClick={() => handleExportar('excel')}
              sx={{ borderRadius: 0, textTransform: 'none', color: '#1D6F42', borderColor: '#1D6F42', height: 40 }}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<IconFileTypePdf size={18} />}
              onClick={() => handleExportar('pdf')}
              sx={{ borderRadius: 0, textTransform: 'none', color: '#B71C1C', borderColor: '#B71C1C', height: 40 }}
            >
              PDF
            </Button>
          </Box>

          {/* Right: Filters */}
          <Box display="flex" alignItems="flex-start" gap={2} flexWrap="nowrap" sx={{ flexGrow: 1 }}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={opcionesProveedores}
              getOptionLabel={(option) => option.Nombre || ''}
              value={filtrosProveedores}
              isOptionEqualToValue={(option, value) => option.IdProveedor === value.IdProveedor}
              onChange={(_, newValue) => { setFiltrosProveedores(newValue); setPage(0); }}
              fullWidth
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.Nombre}
                </li>
              )}
              sx={{
                flexBasis: '50%',
                flexGrow: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 1 }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option: any, index: number) => (
                  <Chip
                    key={option.IdProveedor}
                    variant="outlined"
                    label={option.Nombre}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{
                      borderColor: alpha('#1565c0', 0.3),
                      color: '#1565c0',
                      bgcolor: alpha('#1565c0', 0.05),
                      borderRadius: 1,
                    }}
                  />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Proveedores" size="small" />}
            />
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={opcionesRubros}
              getOptionLabel={(option) => option.nombre || ''}
              value={filtrosRubros}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValue) => { setFiltrosRubros(newValue); setPage(0); }}
              fullWidth
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.nombre}
                </li>
              )}
              sx={{
                flexBasis: '50%',
                flexGrow: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 1 }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option: any, index: number) => (
                  <Chip
                    key={option.id}
                    variant="outlined"
                    label={option.nombre}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{
                      borderColor: alpha(theme.primary, 0.3),
                      color: theme.primary,
                      bgcolor: alpha(theme.primary, 0.05),
                      borderRadius: 1,
                    }}
                  />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Rubros" size="small" />}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {error.message || 'No se pudo cargar el stock del punto seleccionado.'}
          </Alert>
        ) : (
          <>
            <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', mb: 2 }}>
              <Box px={2} py={1.5} bgcolor={theme.headerBg} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" fontWeight={700} color={theme.headerText}>
                  {puntoNombre ? `STOCK EN: ${puntoNombre.toUpperCase()}` : 'STOCK DEL PUNTO DE VENTA'}
                </Typography>
                <Typography variant="caption" color={theme.headerText} sx={{ opacity: 0.9 }}>
                  {articulosFiltrados.length} artículos • {numberFormatter.format(totalUnidades)} unidades • {currencyFormatter.format(valorEstimado)} val. est.
                </Typography>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden' }}>
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['IMAGEN', 'CÓDIGO', 'DESCRIPCIÓN', 'PRECIO', 'STOCK', 'RUBRO', ...(showActions ? ['ACCIONES'] : [])].map((head, idx) => (
                        <TableCell
                          key={idx}
                          align={['PRECIO', 'STOCK'].includes(head) ? 'right' : head === 'ACCIONES' ? 'center' : 'left'}
                          sx={{
                            bgcolor: theme.headerBg,
                            fontWeight: 700,
                            color: theme.headerText,
                            borderBottom: `2px solid ${theme.headerBorder}`, // Usar headerBorder para consistencia
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            py: 1.5
                          }}
                        >
                          {head}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                          <MudrasLoader size={80} text="Cargando stock..." />
                        </TableCell>
                      </TableRow>
                    ) : articulosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          {busquedaAplicada
                            ? 'No hay resultados que coincidan con la búsqueda.'
                            : 'Este punto aún no tiene stock cargado.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      articulosPaginados.map((item, idx) => (
                        <TableRow
                          key={item.id}
                          hover
                          sx={{
                            bgcolor: idx % 2 === 0 ? '#ffffff' : theme.alternateRow,
                            '&:hover': { bgcolor: alpha(theme.primary, 0.08) }
                          }}
                        >
                          <TableCell>
                            {item.articulo?.ImagenUrl ? (
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 0,
                                  overflow: 'hidden',
                                  border: '1px solid #e0e0e0',
                                }}
                              >
                                <img
                                  src={
                                    item.articulo.ImagenUrl.startsWith('http') || item.articulo.ImagenUrl.startsWith('data:')
                                      ? item.articulo.ImagenUrl
                                      : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${item.articulo.ImagenUrl.startsWith('/') ? '' : '/'}${item.articulo.ImagenUrl}`
                                  }
                                  alt={item.nombre}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </Box>
                            ) : (
                              <Box width={40} height={40} bgcolor="#f5f5f5" border="1px solid #e0e0e0" display="grid" sx={{ placeItems: 'center', borderRadius: 0 }}>
                                <Icon icon="mdi:image-off-outline" color="#bdbdbd" width={20} />
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.codigo ?? 'Sin código'}
                              size="small"
                              sx={{ borderRadius: 0, bgcolor: '#e0e0e0', fontWeight: 600, color: 'text.primary', fontFamily: 'monospace' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" flexDirection="column">
                              <Typography variant="body2" fontWeight={500}>{item.nombre}</Typography>
                              {(item.rubro?.nombre || item.articulo?.proveedor?.Nombre) && (
                                <Stack direction="row" spacing={0.5} mt={0.5}>
                                  {item.rubro?.nombre && (
                                    <Chip
                                      label={item.rubro.nombre}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        color: grisVerdoso.primary,
                                        borderColor: alpha(grisVerdoso.primary, 0.3),
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  )}
                                  {item.articulo?.proveedor?.Nombre && (
                                    <Chip
                                      label={item.articulo.proveedor.Nombre}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        color: '#1565c0', // Blue distinct from Rubro
                                        borderColor: alpha('#1565c0', 0.3),
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  )}
                                </Stack>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {Number.isFinite(obtenerPrecioUnitario(item))
                              ? currencyFormatter.format(obtenerPrecioUnitario(item))
                              : '—'}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color={theme.textStrong}>
                              {numberFormatter.format(Number(item.stockAsignado) || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {item.rubro?.nombre ? (
                              <Chip
                                label={item.rubro.nombre}
                                size="small"
                                sx={{ borderRadius: 0, bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          {showActions && (
                            <TableCell align="center">
                              <Box display="flex" justifyContent="center" gap={0.5}>
                                {onViewDetails && (
                                  <Tooltip title="Ver detalles">
                                    <IconButton
                                      size="small"
                                      onClick={() => onViewDetails(item)}
                                      sx={{
                                        color: '#1565c0', // Blue
                                        '&:hover': { bgcolor: alpha('#1565c0', 0.1) }
                                      }}
                                    >
                                      <IconEye size={20} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {onEditStock && (
                                  <Tooltip title="Editar stock">
                                    <IconButton
                                      size="small"
                                      onClick={() => onEditStock(item)}
                                      sx={{
                                        color: '#2e7d32', // Green
                                        '&:hover': { bgcolor: alpha('#2e7d32', 0.1) }
                                      }}
                                    >
                                      <IconEdit size={20} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {totalPaginas > 1 && (
                <Box p={2} borderTop="1px solid #e0e0e0" display="flex" justifyContent="center" gap={1}>
                  <Button
                    size="small"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    sx={{ borderRadius: 0, textTransform: 'none', color: '#757575' }}
                  >
                    Anterior
                  </Button>
                  <Typography variant="caption" sx={{ alignSelf: 'center' }}>Página {page + 1} de {totalPaginas}</Typography>
                  <Button
                    size="small"
                    disabled={page >= totalPaginas - 1}
                    onClick={() => setPage(p => p + 1)}
                    sx={{ borderRadius: 0, textTransform: 'none', color: '#757575' }}
                  >
                    Siguiente
                  </Button>
                </Box>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TablaStockPuntoVenta;
