'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { rosa } from './colores-rosa';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';
import { useQuery } from '@apollo/client/react';
import { GET_PROVEEDORES_POR_RUBRO, GET_ARTICULOS_POR_RUBRO } from '@/queries/rubros';
import { 
  Proveedor, 
  Articulo, 
  ArticulosPorRubroResponse, 
  ProveedoresPorRubroResponse 
} from '@/interfaces/rubros';

interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

interface ModalDetallesRubroProps {
  open: boolean;
  onClose: () => void;
  rubro: Rubro | null;
}

const ModalDetallesRubro = ({ open, onClose, rubro }: ModalDetallesRubroProps) => {
  const [filtro, setFiltro] = useState('');
  const [filtroInput, setFiltroInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Query para obtener proveedores del rubro
  const { 
    data: proveedoresData, 
    loading: loadingProveedores 
  } = useQuery<ProveedoresPorRubroResponse>(GET_PROVEEDORES_POR_RUBRO, {
    variables: { rubroId: rubro?.id },
    skip: !rubro?.id || !open
  });

  const { 
    data: articulosData, 
    loading: loadingArticulos,
    refetch: refetchArticulos
  } = useQuery<ArticulosPorRubroResponse>(GET_ARTICULOS_POR_RUBRO, {
    variables: { 
      rubroId: rubro?.id,
      filtro: filtro || undefined,
      offset: page * rowsPerPage,
      limit: rowsPerPage
    },
    skip: !rubro?.id || !open
  });

  // Datos derivados de las queries
  const proveedores = proveedoresData?.proveedoresPorRubro || [];
  const articulos = articulosData?.articulosPorRubro.articulos || [];
  const totalArticulos = articulosData?.articulosPorRubro.total || 0;
  
  // Filtrar artículos localmente si es necesario
  const articulosFiltrados = articulos;

  // Helper functions para stock
  const getStockLabel = (stock: number, minimo: number = 5) => {
    if (stock <= 0) return 'Sin stock';
    if (stock <= minimo) return 'Stock bajo';
    return `${stock} u.`;
  };

  const getStockColor = (stock: number, minimo: number = 5): 'error' | 'warning' | 'success' => {
    if (stock <= 0) return 'error';
    if (stock <= minimo) return 'warning';
    return 'success';
  };

  // Pagination functions
  const totalPaginas = Math.ceil(totalArticulos / rowsPerPage);
  const paginaActual = page + 1;

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const generarNumerosPaginas = () => {
    const paginas: (number | string)[] = [];
    const maxPaginas = 5;
    
    if (totalPaginas <= maxPaginas) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        paginas.push(1);
        paginas.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

  // Refetch cuando cambian los filtros o la paginación
  useEffect(() => {
    if (rubro?.id && open) {
      refetchArticulos();
    }
  }, [filtro, page, rowsPerPage, rubro?.id, open, refetchArticulos]);

  const handleClose = () => {
    setFiltro('');
    setFiltroInput('');
    setPage(0);
    onClose();
  };

  if (!rubro) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ p: 0, display: 'none' }} />

      <DialogContent sx={{ p: 2 }}>
        <TexturedPanel accent={rosa.primary} radius={12} contentPadding={0}>
          {/* Header del modal con estilo toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: rosa.light, border: '1px solid', borderColor: rosa.accent, borderRadius: 1, m: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: rosa.primary, borderRadius: '50%', p: 1, display: 'flex', color: 'white' }}>
                <Icon icon="mdi:tag-outline" width={20} height={20} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color={rosa.textStrong}>Detalle del Rubro</Typography>
                <Typography variant="caption" color="text.secondary">Visualizando: {rubro.codigo ? `${rubro.codigo} - ` : ''}{rubro.nombre}</Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: rosa.textStrong }}>
              <IconX size={18} />
            </IconButton>
          </Box>

          <Box sx={{ px: 2, pb: 2 }}>
        {/* Información básica del rubro */}
        <Box mb={3}>
          {/* Cards de estadísticas */}
          <Box display="flex" gap={2} sx={{ mb: 3 }}>
            <Box flex={1}>
              <Card sx={{ 
                backgroundColor: rosa.light, 
                border: '1px solid', 
                borderColor: rosa.accent,
                borderRadius: 2
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" fontWeight={700} color={rosa.primary}>
                    {totalArticulos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Artículos
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box flex={1}>
              <Card sx={{ 
                backgroundColor: '#e8f5e8', 
                border: '1px solid', 
                borderColor: '#c8e6c9',
                borderRadius: 2
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" fontWeight={700} color={rosa.secondary}>
                    {proveedores.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Proveedores
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Proveedores */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={600} color="text.primary" mb={2}>
            Proveedores Asociados
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {proveedores.length > 0 ? (
              proveedores.map((proveedor) => (
                <Chip
                  key={proveedor.id}
                  label={proveedor.nombre}
                  sx={{
                    bgcolor: rosa.primary,
                    color: 'white',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: rosa.primaryHover
                    }
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay proveedores asociados
              </Typography>
            )}
          </Box>
        </Box>

        {/* Tabla de artículos */}
        <Box>
          {/* Toolbar con título y búsqueda */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ 
              px: 2, 
              py: 1.5, 
              bgcolor: rosa.light, 
              border: '1px solid', 
              borderColor: rosa.accent, 
              borderRadius: 1, 
              mb: 2 
            }}
          >
            <Typography variant="h6" fontWeight={700} color={rosa.textStrong}>
              Artículos del Rubro ({articulosFiltrados.length})
            </Typography>
            <TextField
              placeholder="Buscar artículos..."
              value={filtroInput}
              onChange={(e) => setFiltroInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setFiltro(filtroInput);
                  setPage(0);
                }
              }}
              size="small"
              sx={{ 
                minWidth: 280,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: rosa.primary
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: rosa.primary
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} color={rosa.primary} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Tabla de artículos mejorada */}
          <Paper elevation={0} sx={{ border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' }}>
            {/* Header fijo */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: rosa.textStrong,
                    backgroundColor: rosa.light,
                    borderBottom: '3px solid',
                    borderColor: rosa.accent,
                    width: '15%'
                  }}>
                    Código
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: rosa.textStrong,
                    backgroundColor: rosa.light,
                    borderBottom: '3px solid',
                    borderColor: rosa.accent,
                    width: '35%'
                  }}>
                    Descripción
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: rosa.textStrong,
                    backgroundColor: rosa.light,
                    borderBottom: '3px solid',
                    borderColor: rosa.accent,
                    width: '12%'
                  }}>
                    Stock
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: rosa.textStrong,
                    backgroundColor: rosa.light,
                    borderBottom: '3px solid',
                    borderColor: rosa.accent,
                    width: '15%'
                  }}>
                    Precio
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: rosa.textStrong,
                    backgroundColor: rosa.light,
                    borderBottom: '3px solid',
                    borderColor: rosa.accent,
                    width: '23%'
                  }}>
                    Proveedor
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
            
            {/* Contenido scrolleable */}
            <TableContainer 
              sx={{ 
                maxHeight: 300,
                '&::-webkit-scrollbar': {
                  width: '12px',
                  height: '12px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: rosa.primary,
                  borderRadius: '6px',
                  border: '2px solid #f8f9fa',
                  '&:hover': {
                    backgroundColor: rosa.primaryHover
                  }
                },
                '&::-webkit-scrollbar-corner': {
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <Table>
                <TableBody sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                  {loadingArticulos ? (
                    // Skeleton loading
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton variant="text" height={24} /></TableCell>
                        <TableCell><Skeleton variant="text" height={24} /></TableCell>
                        <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                        <TableCell><Skeleton variant="text" height={24} /></TableCell>
                        <TableCell><Skeleton variant="text" height={24} /></TableCell>
                      </TableRow>
                    ))
                  ) : articulosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {filtro ? 'No se encontraron artículos con ese criterio' : 'No hay artículos en este rubro'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    articulosFiltrados.map((articulo, idx) => (
                      <TableRow 
                        key={articulo.id}
                        sx={{ 
                          bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit',
                          '&:hover': { bgcolor: rosa.rowHover },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} color="text.secondary">
                            {articulo.codigo || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            sx={{ 
                              whiteSpace: 'normal',
                              lineHeight: 1.4
                            }}
                          >
                            {articulo.descripcion}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStockLabel(articulo.stock, 5)}
                            color={getStockColor(articulo.stock, 5)}
                            size="small"
                            variant="filled"
                            sx={{ 
                              fontWeight: 600,
                              minWidth: 80
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color={rosa.primary}>
                            ${articulo.precio?.toLocaleString('es-AR') || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              whiteSpace: 'normal',
                              lineHeight: 1.4
                            }}
                          >
                            {articulo.proveedor?.nombre || 'Sin proveedor'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Paginación personalizada */}
          {totalArticulos > 0 && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              p: 2, 
              borderColor: rosa.accent,
              bgcolor: 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Filas por página:
                </Typography>
                <TextField
                  select
                  size="small"
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  sx={{ minWidth: 80 }}
                >
                  {[50, 100, 150].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Mostrando {Math.min((page) * rowsPerPage + 1, totalArticulos)} - {Math.min((page + 1) * rowsPerPage, totalArticulos)} de {totalArticulos} artículos
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {generarNumerosPaginas().map((numeroPagina, index) => (
                    <Box key={index}>
                      {numeroPagina === '...' ? (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                          ...
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          variant={paginaActual === numeroPagina ? 'contained' : 'text'}
                          onClick={() => handleChangePage((numeroPagina as number) - 1)}
                          sx={{
                            minWidth: 32,
                            height: 32,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            ...(paginaActual === numeroPagina ? {
                              bgcolor: rosa.primary,
                              color: 'white',
                              '&:hover': { bgcolor: rosa.primaryHover }
                            } : {
                              color: 'text.secondary',
                              '&:hover': { bgcolor: rosa.rowHover }
                            })
                          }}
                        >
                          {numeroPagina}
                        </Button>
                      )}
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleChangePage(0)}
                    disabled={page === 0}
                    sx={{ color: 'text.secondary' }}
                    title="Primera página"
                  >
                    ⏮
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                    sx={{ color: 'text.secondary' }}
                    title="Página anterior"
                  >
                    ⏪
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleChangePage(page + 1)}
                    disabled={totalArticulos === 0 || (page + 1) * rowsPerPage >= totalArticulos}
                    sx={{ color: 'text.secondary' }}
                    title="Página siguiente"
                  >
                    ⏩
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleChangePage(totalPaginas - 1)}
                    disabled={page >= totalPaginas - 1}
                    sx={{ color: 'text.secondary' }}
                    title="Última página"
                  >
                    ⏭
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
          </Box>
        </TexturedPanel>
      </DialogContent>

      <DialogActions sx={{ 
        p: 4, 
        pt: 0, 
        gap: 2
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            mt: 3,
            px: 4,
            py: 1.5,
            borderColor: rosa.primary,
            color: rosa.primary,
            '&:hover': {
              borderColor: rosa.primaryHover,
              backgroundColor: rosa.light
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDetallesRubro;
