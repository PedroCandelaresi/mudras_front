'use client';
/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useMemo, useState } from 'react';
import PaginacionMudras from '@/components/ui/PaginacionMudras';
import {
  Alert,
  Box,
  Chip,
  Dialog,
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

type TablaStockPuntoVentaUiState = {
  busquedaDraft: string;
  busquedaAplicada: string;
  filtrosAutores: string[];
  filtrosMarcas: string[];
  page: number;
  rowsPerPage: number;
  filtrosRubros: any[];
  filtrosProveedores: any[];
};

const tablaStockUiStateCache = new Map<string, TablaStockPuntoVentaUiState>();

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
  const cacheKey = puntoNombre || '__punto_sin_nombre__';
  const cachedState = tablaStockUiStateCache.get(cacheKey);

  const [busquedaDraft, setBusquedaDraft] = useState(cachedState?.busquedaDraft ?? '');
  const [busquedaAplicada, setBusquedaAplicada] = useState(cachedState?.busquedaAplicada ?? '');
  const [filtrosAutores, setFiltrosAutores] = useState<string[]>(cachedState?.filtrosAutores ?? []);
  const [filtrosMarcas, setFiltrosMarcas] = useState<string[]>(cachedState?.filtrosMarcas ?? []);

  const [page, setPage] = useState(cachedState?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(cachedState?.rowsPerPage ?? 50);
  const tableTopRef = React.useRef<HTMLDivElement>(null);
  const [filtrosRubros, setFiltrosRubros] = useState<any[]>(cachedState?.filtrosRubros ?? []);
  const [filtrosProveedores, setFiltrosProveedores] = useState<any[]>(cachedState?.filtrosProveedores ?? []);
  const [imagenAmpliada, setImagenAmpliada] = useState(false);
  const [urlImagenAmpliada, setUrlImagenAmpliada] = useState<string | null>(null);

  React.useEffect(() => {
    tablaStockUiStateCache.set(cacheKey, {
      busquedaDraft,
      busquedaAplicada,
      filtrosAutores,
      filtrosMarcas,
      page,
      rowsPerPage,
      filtrosRubros,
      filtrosProveedores,
    });
  }, [cacheKey, busquedaDraft, busquedaAplicada, filtrosAutores, filtrosMarcas, page, rowsPerPage, filtrosRubros, filtrosProveedores]);

  const mostrarFiltroAutor = useMemo(() => {
    if (!filtrosRubros.length) return false;
    return filtrosRubros.some((r) => String(r?.nombre || '').trim().toLowerCase() === 'libros');
  }, [filtrosRubros]);
  const autoresDisponibles = useMemo(() => {
    const autoresSet = new Set<string>();
    articulos.forEach((item) => {
      const rubroNombre = String(item.rubro?.nombre || item.articulo?.Rubro || '').trim().toLowerCase();
      if (rubroNombre !== 'libros') return;
      const autor = String(item.articulo?.Autor || '').trim();
      if (autor) autoresSet.add(autor);
    });
    filtrosAutores.forEach((autor) => {
      if (autor?.trim()) autoresSet.add(autor.trim());
    });
    return Array.from(autoresSet).sort((a, b) => a.localeCompare(b, 'es'));
  }, [articulos, filtrosAutores]);
  const marcasDisponibles = useMemo(() => {
    const marcasSet = new Set<string>();
    articulos.forEach((item) => {
      const marca = String(item.articulo?.Marca || '').trim();
      if (marca) marcasSet.add(marca);
    });
    filtrosMarcas.forEach((marca) => {
      if (marca?.trim()) marcasSet.add(marca.trim());
    });
    return Array.from(marcasSet).sort((a, b) => a.localeCompare(b, 'es'));
  }, [articulos, filtrosMarcas]);

  React.useEffect(() => {
    if (mostrarFiltroAutor) return;
    if (filtrosAutores.length === 0) return;
    setFiltrosAutores([]);
  }, [mostrarFiltroAutor, filtrosAutores]);

  // Bidirectional Filtering Logic
  const { rubrosDisponibles, proveedoresDisponibles } = useMemo(() => {
    const allRubrosMap = new Map();
    const allProvsMap = new Map();

    const provToRubros = new Map<string, Set<string>>();
    const rubroToProvs = new Map<string, Set<string>>();

    // 1. Build Maps and Lists from Articulos
    articulos.forEach(item => {
      const rubro = item.rubro;
      const prov = item.articulo?.proveedor;

      if (rubro?.id != null) {
        const rId = String(rubro.id);
        if (!allRubrosMap.has(rId)) allRubrosMap.set(rId, rubro);
      }
      if (prov?.IdProveedor != null) {
        const pId = String(prov.IdProveedor);
        if (!allProvsMap.has(pId)) allProvsMap.set(pId, prov);
      }

      if (rubro?.id != null && prov?.IdProveedor != null) {
        const rId = String(rubro.id);
        const pId = String(prov.IdProveedor);

        // Map Prov -> Rubros
        if (!provToRubros.has(pId)) provToRubros.set(pId, new Set());
        provToRubros.get(pId)?.add(rId);

        // Map Rubro -> Provs
        if (!rubroToProvs.has(rId)) rubroToProvs.set(rId, new Set());
        rubroToProvs.get(rId)?.add(pId);
      }
    });

    const allRubrosList = Array.from(allRubrosMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    const allProvsList = Array.from(allProvsMap.values()).sort((a, b) => (a.Nombre || '').localeCompare(b.Nombre || ''));

    // 2. Filter Available Options based on Selection
    const activeProvIds = filtrosProveedores.map(p => String(p.IdProveedor));
    const activeRubroIds = filtrosRubros.map(r => String(r.id));

    // Calculate Available Providers
    let filteredProvs = allProvsList;
    if (activeRubroIds.length > 0) {
      const allowedProvs = new Set<string>();
      activeRubroIds.forEach(rId => {
        const provs = rubroToProvs.get(rId);
        if (provs) provs.forEach(pId => allowedProvs.add(pId));
      });
      // Logic: Show providers that have AT LEAST ONE of the selected rubrics
      filteredProvs = allProvsList.filter(p => allowedProvs.has(String(p.IdProveedor)));
    }

    // Calculate Available Rubros
    let filteredRubros = allRubrosList;
    if (activeProvIds.length > 0) {
      const allowedRubros = new Set<string>();
      activeProvIds.forEach(pId => {
        const rubros = provToRubros.get(pId);
        if (rubros) rubros.forEach(rId => allowedRubros.add(rId));
      });
      // Logic: Show rubrics offered by AT LEAST ONE of the selected providers
      filteredRubros = allRubrosList.filter(r => allowedRubros.has(String(r.id)));
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

    if (filtrosAutores.length > 0) {
      const autoresSet = new Set(filtrosAutores.map((a) => a.trim().toLowerCase()));
      res = res.filter((item) => autoresSet.has(String(item.articulo?.Autor || '').trim().toLowerCase()));
    }
    if (filtrosMarcas.length > 0) {
      const marcasSet = new Set(filtrosMarcas.map((m) => m.trim().toLowerCase()));
      res = res.filter((item) => marcasSet.has(String(item.articulo?.Marca || '').trim().toLowerCase()));
    }

    return res;
  }, [articulos, busquedaAplicada, filtrosRubros, filtrosProveedores, filtrosAutores, filtrosMarcas]);

  const ejecutarBusqueda = useCallback(() => {
    setBusquedaAplicada((busquedaDraft || '').trim());
    setPage(0);
  }, [busquedaDraft]);

  const limpiarFiltros = useCallback(() => {
    setBusquedaDraft('');
    setBusquedaAplicada('');
    setFiltrosAutores([]);
    setFiltrosMarcas([]);
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
      { header: 'Autor', key: (item: any) => item.articulo?.Autor || '', width: 45 },
      { header: 'Stock', key: 'stockAsignado', width: 20 },
      {
        header: 'Precio', key: (item: any) => {
          const p = obtenerPrecioUnitario(item);
          return Number.isFinite(p) ? currencyFormatter.format(p) : '-';
        }, width: 25
      },
    ];

    if (formato === 'excel') {
      const filtroAutorTexto = filtrosAutores.length > 0 ? `Autores: ${filtrosAutores.join(', ')}` : '';
      const filtroMarcaTexto = filtrosMarcas.length > 0 ? `Marcas: ${filtrosMarcas.join(', ')}` : '';
      const summary = [busquedaAplicada ? `Filtro: ${busquedaAplicada}` : '', filtroAutorTexto, filtroMarcaTexto].filter(Boolean).join(' | ');
      exportToExcel(articulosFiltrados, columns, filename, summary);
    } else {
      const filtroAutorTexto = filtrosAutores.length > 0 ? `Autores: ${filtrosAutores.join(', ')}` : '';
      const filtroMarcaTexto = filtrosMarcas.length > 0 ? `Marcas: ${filtrosMarcas.join(', ')}` : '';
      const summary = [busquedaAplicada ? `Filtro: ${busquedaAplicada}` : '', filtroAutorTexto, filtroMarcaTexto].filter(Boolean).join(' | ');
      await exportToPdf(articulosFiltrados, columns, filename, titulo, summary);
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
  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
          <Box display="flex" flexDirection="column" gap={2} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="flex-start" gap={2} flexWrap="nowrap" sx={{ minWidth: 0 }}>
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
                sx={{ flex: '1 1 0', minWidth: 0, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
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
                sx={{ flex: '1 1 0', minWidth: 0, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
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

            <Box display="flex" alignItems="flex-start" gap={2} flexWrap="nowrap" sx={{ minWidth: 0 }}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={marcasDisponibles}
                value={filtrosMarcas}
                onChange={(_, newValue) => { setFiltrosMarcas(newValue); setPage(0); }}
                fullWidth
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option}
                  </li>
                )}
                sx={{ flex: '1 1 0', minWidth: 0, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option}
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      sx={{
                        borderColor: alpha('#455a64', 0.3),
                        color: '#455a64',
                        bgcolor: alpha('#455a64', 0.05),
                        borderRadius: 1,
                      }}
                    />
                  ))
                }
                renderInput={(params) => <TextField {...params} label="Marcas" size="small" />}
              />
              {mostrarFiltroAutor ? (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={autoresDisponibles}
                  value={filtrosAutores}
                  onChange={(_, newValue) => {
                    setFiltrosAutores(newValue);
                    setPage(0);
                  }}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option}
                    </li>
                  )}
                  sx={{ flex: '1 1 0', minWidth: 0, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option}
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        sx={{
                          borderColor: alpha('#6a1b9a', 0.3),
                          color: '#6a1b9a',
                          bgcolor: alpha('#6a1b9a', 0.05),
                          borderRadius: 1,
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} label="Autores (Libros)" size="small" />}
                />
              ) : (
                <Box sx={{ flex: '1 1 0', minWidth: 0 }} />
              )}
            </Box>
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
              <Box ref={tableTopRef} />
              <PaginacionMudras
                page={page}
                rowsPerPage={rowsPerPage}
                total={articulosFiltrados.length}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                itemLabel="artículos"
                accentColor={theme.primary}
                rowsPerPageOptions={[50, 100, 150, 300, 500]}
              />

              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, overflow: 'hidden' }}>
                <TableContainer>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['IMAGEN', 'CÓDIGO', 'DESCRIPCIÓN', 'PRECIO', 'STOCK', ...(showActions ? ['ACCIONES'] : [])].map((head, idx) => (
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
                        articulosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, idx) => (
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
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    '&:hover': { transform: 'scale(1.08)' },
                                  }}
                                  onClick={() => {
                                    const imagenUrl = item.articulo.ImagenUrl.startsWith('http') || item.articulo.ImagenUrl.startsWith('data:')
                                      ? item.articulo.ImagenUrl
                                      : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${item.articulo.ImagenUrl.startsWith('/') ? '' : '/'}${item.articulo.ImagenUrl}`;
                                    setUrlImagenAmpliada(imagenUrl);
                                    setImagenAmpliada(true);
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
                                {(item.rubro?.nombre || item.articulo?.Marca || item.articulo?.proveedor?.Nombre || (item.articulo?.Autor && String(item.rubro?.nombre || item.articulo?.Rubro || '').trim().toLowerCase() === 'libros')) && (
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
                                    {item.articulo?.Marca && (
                                      <Chip
                                        label={`Marca: ${item.articulo.Marca}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.65rem',
                                          color: '#455a64',
                                          borderColor: alpha('#455a64', 0.3),
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
                                    {item.articulo?.Autor && String(item.rubro?.nombre || item.articulo?.Rubro || '').trim().toLowerCase() === 'libros' && (
                                      <Chip
                                        label={`Autor: ${item.articulo.Autor}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.65rem',
                                          color: '#6a1b9a',
                                          borderColor: alpha('#6a1b9a', 0.3),
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
                <PaginacionMudras
                  page={page}
                  rowsPerPage={rowsPerPage}
                  total={articulosFiltrados.length}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  itemLabel="artículos"
                  accentColor={theme.primary}
                  rowsPerPageOptions={[50, 100, 150, 300, 500]}
                />
              </Paper>
            </Paper>
          </>
        )}
        
        {/* Lightbox para imagen */}
        <Dialog
          open={imagenAmpliada}
          onClose={() => setImagenAmpliada(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#000',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 500,
              bgcolor: '#000',
            }}
          >
            {urlImagenAmpliada && (
              <img
                src={urlImagenAmpliada}
                alt="Imagen ampliada"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            )}
            <IconButton
              onClick={() => setImagenAmpliada(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              }}
            >
              <Icon icon="mdi:close" width={24} />
            </IconButton>
          </Box>
        </Dialog>
      </Box>
    </Box>
  );
};

export default TablaStockPuntoVenta;
