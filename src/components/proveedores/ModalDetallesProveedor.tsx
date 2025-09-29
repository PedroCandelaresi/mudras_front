// /home/candelaresi/proyectos/mudras/frontend/src/components/proveedores/ModalDetallesProveedor.tsx
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
import { IconSearch, IconX, IconMail, IconPhone, IconMapPin, IconWorld } from '@tabler/icons-react';
import { azul } from '@/ui/colores';
import { useQuery } from '@apollo/client/react';
import { GET_PROVEEDOR, GET_ARTICULOS_POR_PROVEEDOR } from '@/components/proveedores/graphql/queries';
import { 
  Proveedor, 
  Articulo, 
  ArticulosPorProveedorResponse, 
  ProveedorResponse 
} from '@/interfaces/proveedores';

interface ModalDetallesProveedorProps {
  open: boolean;
  onClose: () => void;
  proveedor: Proveedor | null;
}

const ModalDetallesProveedor = ({ open, onClose, proveedor }: ModalDetallesProveedorProps) => {
  const [filtro, setFiltro] = useState('');
  const [filtroInput, setFiltroInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Query para obtener detalles completos del proveedor
  const { 
    data: proveedorData, 
    loading: loadingProveedor 
  } = useQuery<ProveedorResponse>(GET_PROVEEDOR, {
    variables: { id: proveedor?.IdProveedor },
    skip: !proveedor?.IdProveedor || !open
  });

  const { 
    data: articulosData, 
    loading: loadingArticulos,
    refetch: refetchArticulos
  } = useQuery<ArticulosPorProveedorResponse>(GET_ARTICULOS_POR_PROVEEDOR, {
    variables: { 
      proveedorId: proveedor?.IdProveedor,
      filtro: filtro || undefined,
      offset: page * rowsPerPage,
      limit: rowsPerPage
    },
    skip: !proveedor?.IdProveedor || !open
  });

  // Datos derivados de las queries
  const proveedorCompleto = proveedorData?.proveedor || proveedor;
  const articulos = articulosData?.articulosPorProveedor.articulos || [];
  const totalArticulos = articulosData?.articulosPorProveedor.total || 0;
  
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
    if (proveedor?.IdProveedor && open) {
      refetchArticulos();
    }
  }, [filtro, page, rowsPerPage, proveedor?.IdProveedor, open, refetchArticulos]);

  const handleClose = () => {
    setFiltro('');
    setFiltroInput('');
    setPage(0);
    onClose();
  };

  if (!proveedor) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        backgroundColor: azul.headerBg,
        color: azul.headerText,
        borderBottom: '3px solid',
        borderColor: azul.headerBorder
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600} color={azul.headerText}>
            Detalle del Proveedor: {proveedorCompleto?.Codigo ? `${proveedorCompleto.Codigo} - ` : ''}{proveedorCompleto?.Nombre}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: azul.headerText }}>
            <IconX size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 3, px: 3, pt: 4, pb: 3 }}>
        {/* Información básica del proveedor */}
        <Box mb={3}>
          {/* Cards de estadísticas mejoradas */}
          <Box display="flex" gap={3} sx={{ mb: 4 }}>
            <Box flex={1}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '2px solid',
                borderColor: azul.primary,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.12)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(25, 118, 210, 0.2)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: 2 
                  }}>
                    <Icon 
                      icon="mdi:package-variant" 
                      width={32} 
                      height={32} 
                      color={azul.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Typography variant="h3" fontWeight={800} color={azul.primary}>
                      {totalArticulos}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color={azul.primary} fontWeight={600}>
                    Artículos Asociados
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box flex={1}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                border: '2px solid',
                borderColor: 'success.main',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.12)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.2)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: 2 
                  }}>
                    <Icon 
                      icon="mdi:cash" 
                      width={32} 
                      height={32} 
                      color="success.main"
                      style={{ marginRight: 8 }}
                    />
                    <Typography variant="h3" fontWeight={800} color="success.main">
                      ${(proveedorCompleto?.Saldo || 0).toLocaleString('es-AR')}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="success.main" fontWeight={600}>
                    Saldo Actual
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Información de contacto mejorada */}
          <Box display="flex" gap={3} mb={4} flexWrap="wrap">
            <Card sx={{ 
              flex: '1 1 300px',
              minWidth: 300,
              borderRadius: 3,
              border: '1px solid',
              borderColor: azul.borderInner,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box sx={{
                      bgcolor: azul.chipBg,
                      borderRadius: '50%',
                      p: 1.5,
                      display: 'flex'
                    }}>
                      <Icon icon="mdi:account-multiple" width={24} color={azul.primary} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color={azul.primary}>
                      Información de Contacto
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    {proveedorCompleto?.Contacto && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Icon icon="mdi:account" width={20} color={azul.primary} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            CONTACTO
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {proveedorCompleto.Contacto}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {proveedorCompleto?.Telefono && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <IconPhone size={20} color={azul.primary} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            TELÉFONO
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {proveedorCompleto.Telefono}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {proveedorCompleto?.Celular && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Icon icon="mdi:cellphone" width={20} color={azul.primary} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            CELULAR
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {proveedorCompleto.Celular}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {proveedorCompleto?.Mail && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <IconMail size={20} color={azul.primary} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            EMAIL
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {proveedorCompleto.Mail}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {proveedorCompleto?.Web && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <IconWorld size={20} color={azul.primary} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            SITIO WEB
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {proveedorCompleto.Web}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            
            <Card sx={{ 
              flex: '1 1 300px',
              minWidth: 300,
              borderRadius: 3,
              border: '1px solid',
              borderColor: azul.borderInner,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box sx={{
                      bgcolor: 'success.light',
                      borderRadius: '50%',
                      p: 1.5,
                      display: 'flex'
                    }}>
                      <Icon icon="mdi:map-marker" width={24} color="success.main" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      Información Fiscal y Ubicación
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    {proveedorCompleto?.CUIT && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Icon icon="mdi:card-account-details" width={20} color="success.main" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            CUIT
                          </Typography>
                          <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                            {proveedorCompleto.CUIT}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {proveedorCompleto?.Direccion && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <IconMapPin size={20} color="success.main" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            DIRECCIÓN
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {proveedorCompleto.Direccion}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {(proveedorCompleto?.Localidad || proveedorCompleto?.Provincia) && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Icon icon="mdi:city" width={20} color="success.main" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            UBICACIÓN
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {[proveedorCompleto.Localidad, proveedorCompleto.Provincia].filter(Boolean).join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {proveedorCompleto?.CP && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Icon icon="mdi:mailbox" width={20} color="success.main" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            CÓDIGO POSTAL
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {proveedorCompleto.CP}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {proveedorCompleto?.Rubro && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Icon icon="mdi:tag" width={20} color="success.main" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            RUBRO
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {proveedorCompleto.Rubro}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
          </Box>

          {/* Observaciones */}
          {proveedorCompleto?.Observaciones && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} color={azul.primary} mb={2}>
                  Observaciones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {proveedorCompleto.Observaciones}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

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
              bgcolor: azul.toolbarBg, 
              border: '1px solid', 
              borderColor: azul.toolbarBorder, 
              borderRadius: 1, 
              mb: 2 
            }}
          >
            <Typography variant="h6" fontWeight={700} color={azul.textStrong}>
              Artículos del Proveedor ({articulosFiltrados.length})
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
                    borderColor: azul.primary
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: azul.primary
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} color={azul.primary} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Tabla de artículos mejorada */}
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              borderColor: azul.headerBorder, 
              borderRadius: 2, 
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            <TableContainer 
              sx={{ 
                maxHeight: 400,
                '&::-webkit-scrollbar': {
                  width: '12px',
                  height: '12px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: azul.primary,
                  borderRadius: '6px',
                  border: '2px solid #f8f9fa',
                  '&:hover': {
                    backgroundColor: azul.primaryHover
                  }
                },
                '&::-webkit-scrollbar-corner': {
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: azul.headerText,
                      backgroundColor: azul.headerBg,
                      borderBottom: '3px solid',
                      borderColor: azul.headerBorder,
                      width: '15%'
                    }}>
                      Código
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: azul.headerText,
                      backgroundColor: azul.headerBg,
                      borderBottom: '3px solid',
                      borderColor: azul.headerBorder,
                      width: '40%'
                    }}>
                      Descripción
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: azul.headerText,
                      backgroundColor: azul.headerBg,
                      borderBottom: '3px solid',
                      borderColor: azul.headerBorder,
                      width: '15%'
                    }}>
                      Stock
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: azul.headerText,
                      backgroundColor: azul.headerBg,
                      borderBottom: '3px solid',
                      borderColor: azul.headerBorder,
                      width: '15%'
                    }}>
                      Precio
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: azul.headerText,
                      backgroundColor: azul.headerBg,
                      borderBottom: '3px solid',
                      borderColor: azul.headerBorder,
                      width: '15%'
                    }}>
                      Rubro
                    </TableCell>
                  </TableRow>
                </TableHead>
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
                          {filtro ? 'No se encontraron artículos con ese criterio' : 'No hay artículos de este proveedor'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    articulosFiltrados.map((articulo, idx) => (
                      <TableRow 
                        key={articulo.id}
                        sx={{ 
                          bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit',
                          '&:hover': { bgcolor: azul.toolbarBg },
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
                          <Typography variant="body2" fontWeight={600} color={azul.primary}>
                            ${articulo.precio?.toLocaleString('es-AR') || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={(articulo as any).rubroNombre || 'Sin rubro'} 
                            size="small"
                            sx={{ 
                              bgcolor: 'success.light',
                              color: 'success.dark',
                              fontWeight: 500
                            }}
                          />
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
              borderColor: azul.headerBorder,
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
                              bgcolor: azul.primary,
                              color: 'white',
                              '&:hover': { bgcolor: azul.primaryHover }
                            } : {
                              color: 'text.secondary',
                              '&:hover': { bgcolor: azul.toolbarBg }
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
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 2
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderColor: azul.primary,
            color: azul.primary,
            '&:hover': {
              borderColor: azul.primaryHover,
              backgroundColor: azul.chipBg
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDetallesProveedor;
