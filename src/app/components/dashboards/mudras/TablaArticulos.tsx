'use client';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Chip,
  Skeleton,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Menu,
  Divider,
  Autocomplete,
} from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { BUSCAR_ARTICULOS, GET_PROVEEDORES } from '@/app/queries/mudras.queries';
import { Articulo } from '@/app/interfaces/mudras.types';
import { BuscarArticulosResponse } from '@/app/interfaces/graphql.types';
import { IconSearch, IconPackage, IconTrash, IconEdit, IconEye, IconPlus, IconDotsVertical, IconRefresh } from '@tabler/icons-react';
import { verde } from '@/ui/colores';
import { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { abrevUnidad, type UnidadMedida } from '@/app/utils/unidades';

// Interfaz local para proveedores (para tipar la query GET_PROVEEDORES)
interface ProveedorLista {
  IdProveedor: number;
  Nombre: string;
  Codigo?: string;
}

interface Props {
  soloSinStock?: boolean;
  onNuevoArticulo?: () => void;
  puedeCrear?: boolean;
}

const TablaArticulos: React.FC<Props> = ({ soloSinStock = false, onNuevoArticulo, puedeCrear = true }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtro, setFiltro] = useState(''); // filtro aplicado
  const [filtroInput, setFiltroInput] = useState(''); // valor tipeado en la searchbar, se aplica con Enter
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'codigo' | 'descripcion' | 'rubro' | 'proveedor' | 'estado'>(null);
  const [filtroColInput, setFiltroColInput] = useState<string>(''); // valor temporal del input de columna
  const [filtrosColumna, setFiltrosColumna] = useState({
    codigo: '',
    descripcion: '',
    rubro: '',
    proveedor: '',
    estado: ''
  });
  const [proveedorSeleccionadoId, setProveedorSeleccionadoId] = useState<number | null>(null);

  // Cargamos proveedores una sola vez (cache-first) para usar en Autocomplete sin refetch por tecla
  const { data: dataProveedores } = useQuery<{ proveedores: ProveedorLista[] }>(GET_PROVEEDORES, {
    fetchPolicy: 'cache-first',
  });
  const proveedores: ProveedorLista[] = dataProveedores?.proveedores ?? [];

  // Variables para filtros globales (servidor)
  const estadoSeleccionado = (filtrosColumna.estado || '').toLowerCase();
  const filtrosServidor = {
    busqueda: filtro || undefined,
    // Campos específicos si están presentes
    codigo: filtrosColumna.codigo || undefined,
    descripcion: filtrosColumna.descripcion || undefined,
    // rubro (nombre) y proveedor (nombre) no tienen filtro directo por nombre en DTO,
    // se incluyen dentro de busqueda global si están definidos
    pagina: page,
    limite: rowsPerPage,
    ordenarPor: 'Descripcion',
    direccionOrden: 'ASC' as const,
    // Flags derivadas según selección de estado y prop soloSinStock
    soloConStock: estadoSeleccionado === 'con stock' ? true : undefined,
    soloStockBajo: estadoSeleccionado === 'bajo stock' ? true : undefined,
    soloSinStock: soloSinStock ? true : (estadoSeleccionado === 'sin stock' ? true : undefined),
    soloEnPromocion: undefined,
    proveedorId: proveedorSeleccionadoId ?? undefined,
  };

  // Logs de depuración: variables de filtros y cookies visibles en cliente (no httpOnly)
  if (typeof window !== 'undefined') {
    try {
      // Aviso: document.cookie no muestra cookies httpOnly
      // Esto es solo para verificar si existe alguna cookie accesible en cliente.
      console.debug('[TablaArticulos] document.cookie (cliente, no incluye httpOnly):', document.cookie);
    } catch {}
  }

  console.log('📊 [TABLA_ARTICULOS] Filtros aplicados:', filtrosServidor);
  console.log('📊 [TABLA_ARTICULOS] Usuario autenticado, cargando artículos...');

  const variablesQuery = {
    filtros: {
      ...filtrosServidor,
      // Si vienen rubro/proveedor por texto, los añadimos a la búsqueda global
      busqueda: [
        filtro,
        filtrosColumna.rubro,
        filtrosColumna.proveedor,
        // No incluir estado textual en la búsqueda global; se mapea a flags específicos
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    },
  } as const;

  console.debug('[TablaArticulos] Variables GraphQL ->', variablesQuery);

  const { data, loading, error, refetch } = useQuery<BuscarArticulosResponse>(BUSCAR_ARTICULOS, {
    variables: variablesQuery,
    fetchPolicy: 'cache-and-network',
  });

  // Logs separados para evitar problemas de tipos
  if (data) {
    console.log('📊 [TABLA_ARTICULOS] Query completada exitosamente:', data);
    console.log('📊 [TABLA_ARTICULOS] Total artículos encontrados:', data?.buscarArticulos?.total || 0);
  }
  
  if (error) {
    console.error('📊 [TABLA_ARTICULOS] Error en query:', error);
  }

  // Si hay error, desglosamos ApolloError
  if (error) {
    const maybeGqlErrors = (error as unknown as { graphQLErrors?: Array<{ message?: string; path?: ReadonlyArray<string | number>; extensions?: unknown }> }).graphQLErrors ?? [];
    if (maybeGqlErrors.length) {
      console.error('[TablaArticulos] graphQLErrors:', maybeGqlErrors.map(e => ({
        message: e?.message,
        path: e?.path,
        extensions: e?.extensions,
      })));
    }
    const maybeNetErr = (error as unknown as { networkError?: unknown }).networkError as unknown as {
      name?: string; message?: string; statusCode?: number; status?: number; result?: unknown; response?: unknown;
    } | undefined;
    if (maybeNetErr) {
      console.error('[TablaArticulos] networkError:', {
        name: maybeNetErr?.name,
        message: maybeNetErr?.message,
        statusCode: (maybeNetErr as any)?.statusCode ?? (maybeNetErr as any)?.status,
        result: (maybeNetErr as any)?.result,
        response: (maybeNetErr as any)?.response,
      });
    }
  }

  const abrirMenuColumna = (col: typeof columnaActiva) => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
    // Sincronizar input temporal con el valor aplicado actual de esa columna
    if (col) setFiltroColInput(filtrosColumna[col]);
    setMenuAnchor(e.currentTarget);
  };
  const cerrarMenuColumna = () => {
    setMenuAnchor(null);
    setColumnaActiva(null);
  };

  // Funciones para manejar acciones
  const handleViewArticulo = (articulo: Articulo) => {
    console.log('Ver artículo:', articulo);
    // TODO: Implementar modal de vista detallada
  };

  const handleEditArticulo = (articulo: Articulo) => {
    console.log('Editar artículo:', articulo);
    // TODO: Implementar modal de edición
  };

  const handleDeleteArticulo = (articulo: Articulo) => {
    console.log('Eliminar artículo:', articulo);
    // TODO: Implementar confirmación y eliminación
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const limpiarFiltros = () => {
    setFiltro('');
    setFiltroInput('');
    setFiltrosColumna({ codigo: '', descripcion: '', rubro: '', proveedor: '', estado: '' });
    setProveedorSeleccionadoId(null);
    setPage(0);
    refetch();
  };

  const articulos: Articulo[] = (data?.buscarArticulos?.articulos || []).filter((articulo): articulo is Articulo => articulo != null);
  const total: number = data?.buscarArticulos?.total ?? 0;
  console.debug('[TablaArticulos] Articulos recibidos:', articulos.length, '| total:', total, '| rowsPerPage:', rowsPerPage);

  // Sin scroll interno: la tabla crece y el scroll es el general de la página
  const usarScrollInterno = false;

  const getStockColor = (stock: number, stockMinimo: number) => {
    if (stock <= 0) return 'error';
    if (stock <= stockMinimo) return 'warning';
    return 'success';
  };

  const getStockLabel = (stock: number, stockMinimo: number) => {
    if (stock <= 0) return 'Sin Stock';
    if (stock <= stockMinimo) return 'Stock Bajo';
    return 'Disponible';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={3} color="success.dark">{soloSinStock ? 'Artículos sin stock' : 'Artículos'}</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Código', 'Descripción', 'Rubro', 'Stock', 'Precio', 'Proveedor'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <TableCell key={cell}>
                      <Skeleton variant="text" width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" mb={2}>
          Error al cargar artículos
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {error.message}
        </Typography>
        <Button 
          variant="contained" 
          color="warning"
          startIcon={<IconRefresh />}
          onClick={() => {
            console.debug('[TablaArticulos] Reintentar con variables ->', variablesQuery);
            refetch();
          }}
        >
          Reintentar
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderColor: verde.headerBorder, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: verde.toolbarBg, border: '1px solid', borderColor: verde.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={verde.textStrong}>
          <IconPackage style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {soloSinStock ? 'Artículos sin stock' : 'Artículos'}
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {puedeCrear && (
            <Button
              variant="contained"
              sx={{ textTransform: 'none', bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }}
              startIcon={<IconPlus size={18} />}
              onClick={onNuevoArticulo}
            >
              Nuevo Artículo
            </Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar artículos..."
            value={filtroInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFiltroInput(e.target.value); }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                setFiltro(filtroInput);
                setPage(0);
              }
            }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
            sx={{ minWidth: 250 }}
          />
          <Tooltip title="Buscar (Enter)">
            <span>
              <Button
                variant="contained"
                sx={{ textTransform: 'none', bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }}
                startIcon={<IconSearch size={18} />}
                onClick={() => { setFiltro(filtroInput); setPage(0); }}
                disabled={loading}
              >
                Buscar
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<IconTrash />}
            onClick={limpiarFiltros}
            sx={{ textTransform: 'none', borderColor: verde.headerBorder, color: verde.textStrong, '&:hover': { borderColor: verde.textStrong, bgcolor: verde.toolbarBg } }}
          >
            Limpiar filtros
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: verde.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size={'small'} sx={{ '& .MuiTableCell-head': { bgcolor: verde.headerBg, color: verde.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: verde.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 }, '& th:first-of-type': { borderTopLeftRadius: 8 }, '& th:last-of-type': { borderTopRightRadius: 8 } }}>
              <TableCell sx={{
                fontWeight: 700,
                color: verde.headerText,
                borderBottom: '3px solid',
                borderColor: verde.headerBorder,
                width: { xs: '50%', sm: '40%', md: '40%' }
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Descripción
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('descripcion')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{
                fontWeight: 700,
                color: verde.headerText,
                borderBottom: '3px solid',
                borderColor: verde.headerBorder,
                width: { xs: '20%', sm: '15%', md: '10%' }
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Rubro
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('rubro')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                Stock
              </TableCell>
              {/* Oculto Precio Venta */}
              <TableCell sx={{
                fontWeight: 700,
                color: verde.headerText,
                borderBottom: '3px solid',
                borderColor: verde.headerBorder,
                width: { xs: '30%', sm: '35%', md: '30%' }
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Proveedor
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('proveedor')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Estado
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('estado')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder, textAlign: 'center' }}>Acciones</TableCell>
              {usarScrollInterno && (
                <TableCell sx={{ p: 0, width: '12px', bgcolor: '#2f3e2e', borderBottom: '3px solid', borderColor: '#6b8f6b' }} />
              )}
            </TableRow>
          </TableHead>
          <TableBody sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            {articulos.map((articulo, idx) => (
              <TableRow 
                key={articulo.id}
                sx={{ 
                  bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit',
                  '&:hover': { bgcolor: verde.toolbarBg }
                }}
              >
                {/* Descripción (expandida) */}
                <TableCell sx={{ width: { xs: '50%', sm: '40%', md: '40%' } }}>
                  <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal' }}>
                    {articulo.Descripcion || '-'}
                  </Typography>
                </TableCell>
                {/* Rubro */}
                <TableCell sx={{ width: { xs: '20%', sm: '15%', md: '10%' } }}>
                  <Chip 
                    label={articulo.Rubro || 'Sin rubro'} 
                    size="small"
                    sx={{ 
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      fontWeight: 500
                    }}
                  />
                </TableCell>
                {/* Stock */}
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color={(parseFloat(String(articulo.Deposito ?? 0)) <= 0) ? 'error.main' : 'text.primary'}
                  >
                    {(parseFloat(String(articulo.Deposito ?? 0)) || 0)} {abrevUnidad(articulo.Unidad as UnidadMedida)}
                  </Typography>
                </TableCell>
                {/* Oculto Precio Venta */}
                {/* 6) Proveedor */}
                <TableCell sx={{ width: { xs: '30%', sm: '35%', md: '30%' } }}>
                  <Typography variant="body2" color="text.secondary">
                    {articulo.proveedor?.Nombre || 'Sin proveedor'}
                  </Typography>
                </TableCell>
                {/* 7) Estado */}
                <TableCell>
                  <Chip
                    label={getStockLabel(parseFloat(String(articulo.Deposito ?? 0)) || 0, articulo.StockMinimo || 0)}
                    color={getStockColor(parseFloat(String(articulo.Deposito ?? 0)) || 0, articulo.StockMinimo || 0)}
                    size="small"
                    variant="filled"
                  />
                  {articulo.EnPromocion && (
                    <Chip
                      label="Promoción"
                      color="warning"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </TableCell>
                {/* 8) Acciones */}
                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Ver detalles">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleViewArticulo(articulo)}
                        sx={{ p: 0.75 }}
                      >
                        <IconEye size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar artículo">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleEditArticulo(articulo)}
                        sx={{ p: 0.75 }}
                      >
                        <IconEdit size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar artículo">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteArticulo(articulo)}
                        sx={{ p: 0.75 }}
                      >
                        <IconTrash size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                {/* Celda espaciadora para alinear con header y reservar scroll */}
                {usarScrollInterno && (
                  <TableCell sx={{ p: 0, width: '12px' }} />
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={1} mb={1} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Mostrando {articulos.length} de {rowsPerPage} filas de esta página. {usarScrollInterno ? 'Desplázate dentro de la tabla para ver todas las filas.' : ''}
        </Typography>
      </Box>

      {/* Menú de filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenuColumna}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'codigo' && 'Filtrar por Código'}
          {columnaActiva === 'descripcion' && 'Filtrar por Descripción'}
          {columnaActiva === 'rubro' && 'Filtrar por Rubro'}
          {columnaActiva === 'proveedor' && 'Filtrar por Proveedor'}
          {columnaActiva === 'estado' && 'Filtrar por Estado'}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {columnaActiva && (
          <Box px={1} pb={1}>
            {columnaActiva === 'estado' ? (
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['Sin stock', 'Bajo stock', 'Con stock'].map((op) => (
                    <Button
                      key={op}
                      size="small"
                      variant={filtrosColumna.estado === op ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => {
                        setFiltrosColumna((p) => ({ ...p, estado: op }));
                        setPage(0);
                        cerrarMenuColumna();
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      {op}
                    </Button>
                  ))}
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Button size="small" onClick={() => { setFiltrosColumna((p) => ({ ...p, estado: '' })); setPage(0); cerrarMenuColumna(); }}>Limpiar</Button>
                </Stack>
              </Stack>
            ) : columnaActiva === 'proveedor' ? (
              <>
                <Autocomplete
                  size="small"
                  options={proveedores}
                  getOptionLabel={(op) => op?.Nombre ?? ''}
                  value={proveedores.find(p => p.IdProveedor === proveedorSeleccionadoId) ?? null}
                  onChange={(_e, value) => {
                    setProveedorSeleccionadoId(value?.IdProveedor ?? null);
                    setFiltrosColumna((p) => ({ ...p, proveedor: value?.Nombre ?? '' }));
                    setPage(0);
                    cerrarMenuColumna();
                  }}
                  isOptionEqualToValue={(op, val) => op.IdProveedor === val.IdProveedor}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Buscar proveedor..." fullWidth />
                  )}
                />
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Button size="small" onClick={() => { setProveedorSeleccionadoId(null); setFiltrosColumna((p) => ({ ...p, proveedor: '' })); setPage(0); cerrarMenuColumna(); }}>Limpiar</Button>
                </Stack>
              </>
            ) : (
              <>
                <TextField
                  size="small"
                  fullWidth
                  autoFocus
                  placeholder="Escribe para filtrar..."
                  value={filtroColInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroColInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && columnaActiva) {
                      setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: filtroColInput }));
                      setPage(0);
                      cerrarMenuColumna();
                    }
                  }}
                />
                <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
                  <Button size="small" onClick={() => { setFiltroColInput(''); }}>Limpiar</Button>
                  <Button size="small" variant="contained" color="success" onClick={() => {
                    if (!columnaActiva) return;
                    setFiltrosColumna((p) => ({ ...p, [columnaActiva!]: filtroColInput }));
                    setPage(0);
                    cerrarMenuColumna();
                  }}>Aplicar</Button>
                </Stack>
              </>
            )}
          </Box>
        )}
      </Menu>

      <TablePagination
        rowsPerPageOptions={[50, 100, 150]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Paper>
  );
};

export default TablaArticulos;
