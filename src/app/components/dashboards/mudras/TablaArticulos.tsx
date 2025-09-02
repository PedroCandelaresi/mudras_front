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
  Stack
} from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_ARTICULOS } from '@/app/queries/mudras.queries';
import { Articulo } from '@/app/interfaces/mudras.types';
import { ArticulosResponse } from '@/app/interfaces/graphql.types';
import { IconSearch, IconPackage, IconRefresh, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';

interface Props {
  soloSinStock?: boolean;
}

const TablaArticulos: React.FC<Props> = ({ soloSinStock = false }) => {
  const { data, loading, error, refetch } = useQuery<ArticulosResponse>(GET_ARTICULOS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');

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
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="success.dark">
          <IconPackage style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {soloSinStock ? 'Artículos sin stock' : 'Artículos'}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'success.lighter' }}>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Rubro</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Precio Venta</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Proveedor</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articulosPaginados.map((articulo) => (
              <TableRow 
                key={articulo.id}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'success.lighter',
                    cursor: 'pointer'
                  }
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {articulo.Codigo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: 'success.main', 
                        width: 32, 
                        height: 32, 
                        mr: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      {articulo.Descripcion?.charAt(0) || 'A'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {articulo.Descripcion || 'Sin descripción'}
                    </Typography>
                  </Box>
                </TableCell>
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
                    {parseFloat(String(articulo.Deposito ?? 0)) || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="success.main">
                    ${articulo.PrecioVenta?.toLocaleString() || '0'}
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
                      >
                        <IconEye size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar artículo">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleEditArticulo(articulo)}
                      >
                        <IconEdit size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar artículo">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteArticulo(articulo)}
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
