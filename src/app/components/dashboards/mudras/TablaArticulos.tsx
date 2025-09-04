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
  Avatar,
  Skeleton,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Menu,
  Divider,
  FormControlLabel,
  Switch
} from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_ARTICULOS } from '@/app/queries/mudras.queries';
import { Articulo } from '@/app/interfaces/mudras.types';
import { ArticulosResponse } from '@/app/interfaces/graphql.types';
import { IconSearch, IconPackage, IconRefresh, IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical } from '@tabler/icons-react';
import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { abrevUnidad, type UnidadMedida } from '@/app/utils/unidades';

interface Props {
  soloSinStock?: boolean;
  onNuevoArticulo?: () => void;
  puedeCrear?: boolean;
}

const TablaArticulos: React.FC<Props> = ({ soloSinStock = false, onNuevoArticulo, puedeCrear = true }) => {
  const { data, loading, error, refetch } = useQuery<ArticulosResponse>(GET_ARTICULOS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');
  const [densa, setDensa] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'codigo' | 'descripcion' | 'rubro' | 'proveedor' | 'estado'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState({
    codigo: '',
    descripcion: '',
    rubro: '',
    proveedor: '',
    estado: ''
  });

  const abrirMenuColumna = (col: typeof columnaActiva) => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
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

  const articulos: Articulo[] = data?.articulos || [];
  
  // Filtrar artículos por texto y por estado de stock (si aplica)
  const articulosFiltrados = articulos
    .filter((articulo) =>
      articulo.Descripcion?.toLowerCase().includes(filtro.toLowerCase()) ||
      articulo.Codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
      articulo.Rubro?.toLowerCase().includes(filtro.toLowerCase()) ||
      articulo.proveedor?.Nombre?.toLowerCase().includes(filtro.toLowerCase())
    )
    // filtros por columna
    .filter((a) => (filtrosColumna.codigo ? a.Codigo?.toLowerCase().includes(filtrosColumna.codigo.toLowerCase()) : true))
    .filter((a) => (filtrosColumna.descripcion ? a.Descripcion?.toLowerCase().includes(filtrosColumna.descripcion.toLowerCase()) : true))
    .filter((a) => (filtrosColumna.rubro ? a.Rubro?.toLowerCase().includes(filtrosColumna.rubro.toLowerCase()) : true))
    .filter((a) => (filtrosColumna.proveedor ? a.proveedor?.Nombre?.toLowerCase().includes(filtrosColumna.proveedor.toLowerCase()) : true))
    .filter((a) => {
      if (!filtrosColumna.estado) return true;
      const stock = parseFloat(String(a.Deposito ?? 0)) || 0;
      const minimo = parseFloat(String(a.StockMinimo ?? 0)) || 0;
      const etiqueta = getStockLabel(stock, minimo).toLowerCase();
      return etiqueta.includes(filtrosColumna.estado.toLowerCase());
    })
    .filter((articulo) => {
      if (!soloSinStock) return true;
      const stock = parseFloat(String(articulo.Deposito ?? 0));
      return Number.isFinite(stock) ? stock <= 0 : true;
    });

  const articulosPaginados = articulosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          onClick={() => refetch()}
        >
          Reintentar
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderColor: 'grey.200', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="success.dark">
          <IconPackage style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {soloSinStock ? 'Artículos sin stock' : 'Artículos'}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {puedeCrear && (
            <Button
              variant="contained"
              color="success"
              startIcon={<IconPlus size={18} />}
              onClick={onNuevoArticulo}
              sx={{
                textTransform: 'none',
                bgcolor: 'success.main',
                '&:hover': { bgcolor: 'success.dark' }
              }}
            >
              Nuevo Artículo
            </Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar artículos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControlLabel 
            control={<Switch checked={densa} onChange={(e) => setDensa(e.target.checked)} color="success" />} 
            label="Densa" 
          />
          <Button
            variant="outlined"
            color="success"
            startIcon={<IconRefresh />}
            onClick={() => refetch()}
          >
            Actualizar
          </Button>
        </Stack>
      </Box>

      <TableContainer sx={{ maxHeight: '65vh', borderRadius: 2, border: '1px solid', borderColor: 'grey.200', bgcolor: 'background.paper', scrollbarGutter: 'stable both-edges', overflow: 'hidden' }}>
        <Table stickyHeader size={densa ? 'small' : 'medium'} sx={{ '& .MuiTableCell-head': { bgcolor: '#2f3e2e', color: '#eef5ee' } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: '#2f3e2e', '& th': { top: 0, position: 'sticky', zIndex: 5 }, '& th:first-of-type': { borderTopLeftRadius: 8 }, '& th:last-of-type': { borderTopRightRadius: 8 } }}>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', borderBottom: '3px solid', borderColor: '#6b8f6b' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Código
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('codigo')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', borderBottom: '3px solid', borderColor: '#6b8f6b' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Descripción
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('descripcion')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', borderBottom: '3px solid', borderColor: '#6b8f6b' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Rubro
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('rubro')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', borderBottom: '3px solid', borderColor: '#6b8f6b' }}>
                Stock
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', borderBottom: '3px solid', borderColor: '#6b8f6b' }}>
                Precio Venta
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', borderBottom: '3px solid', borderColor: '#6b8f6b' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Proveedor
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('proveedor')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', borderBottom: '3px solid', borderColor: '#6b8f6b' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Estado
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('estado')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', borderBottom: '3px solid', borderColor: '#6b8f6b', textAlign: 'center' }}>Acciones</TableCell>
              {/* Columna espaciadora para ancho de scrollbar */}
              <TableCell sx={{ p: 0, width: '12px', bgcolor: '#2f3e2e', borderBottom: '3px solid', borderColor: '#6b8f6b' }} />
            </TableRow>
          </TableHead>
          <TableBody sx={{ '& .MuiTableCell-root': { py: densa ? 1 : 1.5 } }}>
            {articulosPaginados.map((articulo, idx) => (
              <TableRow 
                key={articulo.id}
                sx={{ 
                  bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit',
                  '&:hover': { 
                    bgcolor: 'success.lighter',
                  }
                }}
              >
                <TableCell>
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
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color={(parseFloat(String(articulo.Deposito ?? 0)) <= 0) ? 'error.main' : 'text.primary'}
                  >
                    {(parseFloat(String(articulo.Deposito ?? 0)) || 0)} {abrevUnidad(articulo.Unidad as UnidadMedida)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="success.main">
                    ${articulo.PrecioVenta?.toLocaleString() || '0'} / {abrevUnidad(articulo.Unidad as UnidadMedida)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {articulo.proveedor?.Nombre || 'Sin proveedor'}
                  </Typography>
                </TableCell>
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
                <TableCell sx={{ p: 0, width: '12px' }} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Escribe para filtrar..."
              value={filtrosColumna[columnaActiva]}
              onChange={(e) => setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: e.target.value }))}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => { if (!columnaActiva) return; setFiltrosColumna((p) => ({ ...p, [columnaActiva!]: '' })); }}>Limpiar</Button>
              <Button size="small" variant="contained" color="success" onClick={cerrarMenuColumna}>Aplicar</Button>
            </Stack>
          </Box>
        )}
      </Menu>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={articulosFiltrados.length}
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
