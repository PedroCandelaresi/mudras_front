'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  Skeleton,
  Button,
  Tooltip,
  TablePagination
} from '@mui/material';
import { Search, Store, Warehouse, MoreVert } from '@mui/icons-material';
import { IconSearch, IconPlus, IconTrash, IconEdit, IconEye, IconRefresh } from '@tabler/icons-react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerPuntosMudrasResponse,
} from '@/components/puntos-mudras/graphql/queries';
import { ELIMINAR_PUNTO_MUDRAS } from '@/components/puntos-mudras/graphql/mutations';
import { PuntoMudras, FiltrosPuntosMudras } from '@/interfaces/puntos-mudras';
import ModalConfirmarEliminacion from '@/components/ui/ModalConfirmarEliminacion';
import { grisVerdoso, grisRojizo } from '@/ui/colores';

// Extender la interfaz para incluir campos calculados
interface PuntoMudrasConEstadisticas extends PuntoMudras {
  totalArticulos?: number;
  valorInventario?: number;
}

interface TablaPuntosMudrasProps {
  tipo: 'venta' | 'deposito';
  onEditarPunto?: (punto: PuntoMudras) => void;
  onVerInventario?: (punto: PuntoMudras) => void;
  onNuevoPunto?: () => void;
}

export default function TablaPuntosMudras({ tipo, onEditarPunto, onVerInventario, onNuevoPunto }: TablaPuntosMudrasProps) {
  const [busqueda, setBusqueda] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoMudras | null>(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Query para obtener puntos desde el backend
  const { data, loading, error, refetch } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);

  // Mutation para eliminar punto
  const [eliminarPunto] = useMutation(ELIMINAR_PUNTO_MUDRAS, {
    onCompleted: (data) => {
      console.log('✅ [ELIMINACION] Eliminación completada exitosamente:', data);
      setEliminando(false);
      setModalEliminarAbierto(false);
      setPuntoSeleccionado(null);
      refetch();
      setMenuAnchor(null);
      // Disparar evento para actualizar tabs en otras páginas
      window.dispatchEvent(new CustomEvent('puntosVentaActualizados'));
    },
    onError: (error) => {
      console.error('❌ [ELIMINACION] Error al eliminar punto:', error);
      console.error('❌ [ELIMINACION] Error completo:', JSON.stringify(error, null, 2));
      setEliminando(false);
      setModalEliminarAbierto(false);
    },
    refetchQueries: [{ query: OBTENER_PUNTOS_MUDRAS }]
  });

  const puntos = data?.obtenerPuntosMudras || [];

  const puntosFiltrados = puntos.filter(punto => {
    if (!busqueda) return true;
    return punto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
           punto.direccion?.toLowerCase().includes(busqueda.toLowerCase()) ||
           punto.telefono?.toLowerCase().includes(busqueda.toLowerCase());
  });

  const totalPaginas = Math.ceil(puntosFiltrados.length / rowsPerPage);
  const paginaActual = page + 1;

  const generarNumerosPaginas = () => {
    const paginas = [];
    const maxVisible = 7; // Máximo de páginas visibles
    
    if (totalPaginas <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para truncar páginas
      if (paginaActual <= 4) {
        // Inicio: 1, 2, 3, 4, 5, ..., última
        for (let i = 1; i <= 5; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        // Final: 1, ..., n-4, n-3, n-2, n-1, n
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        // Medio: 1, ..., actual-1, actual, actual+1, ..., última
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

  const puntosPaginados = puntosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, punto: PuntoMudras) => {
    setMenuAnchor(event.currentTarget);
    setPuntoSeleccionado(punto);
  };

  const handleEliminarPunto = async () => {
    console.log('🗑️ [ELIMINACION] Iniciando eliminación de punto:', puntoSeleccionado);
    setEliminando(true);
    if (puntoSeleccionado) {
      try {
        console.log('🗑️ [ELIMINACION] Ejecutando mutation eliminarPunto con ID:', puntoSeleccionado.id);
        const resultado = await eliminarPunto({
          variables: { id: puntoSeleccionado.id }
        });
        console.log('🗑️ [ELIMINACION] Resultado de eliminación:', resultado);
        // Los callbacks onCompleted y onError del useMutation se encargan del resto
      } catch (error) {
        console.error('❌ [ELIMINACION] Error al eliminar punto:', error);
        setEliminando(false);
        setModalEliminarAbierto(false);
      }
    } else {
      console.log('⚠️ [ELIMINACION] No hay punto seleccionado');
      setEliminando(false);
      setModalEliminarAbierto(false);
    }
  };

  const handleConfirmarEliminacion = () => {
    console.log('🗑️ [ELIMINACION] Abriendo modal para punto:', puntoSeleccionado);
    
    // Verificar si es el único punto de su tipo
    const puntosDelMismoTipo = puntos.filter(p => p.tipo === tipo);
    if (puntosDelMismoTipo.length <= 1) {
      alert(`No se puede eliminar este ${tipo === 'venta' ? 'punto de venta' : 'depósito'} porque debe existir al menos uno.`);
      setMenuAnchor(null);
      setPuntoSeleccionado(null);
      return;
    }
    
    setModalEliminarAbierto(true);
    // NO limpiar puntoSeleccionado aquí - lo necesitamos para el modal
    setMenuAnchor(null); // Solo cerrar el menú
  };

  const handleCancelarEliminacion = () => {
    console.log('🗑️ [ELIMINACION] Cancelando eliminación');
    setModalEliminarAbierto(false);
    setPuntoSeleccionado(null);
  };

  const handleEditarPunto = () => {
    if (puntoSeleccionado && onEditarPunto) {
      onEditarPunto(puntoSeleccionado);
    }
    handleMenuClose();
  };

  const handleVerInventario = () => {
    if (puntoSeleccionado && onVerInventario) {
      onVerInventario(puntoSeleccionado);
    }
    handleMenuClose();
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setPuntoSeleccionado(null);
  };

  const getColorByTipo = (tipo: 'venta' | 'deposito') => {
    return tipo === 'venta' ? 'success' : 'warning';
  };

  const getIconByTipo = (tipo: 'venta' | 'deposito') => {
    return tipo === 'venta' ? <Store sx={{ fontSize: 16 }} /> : <Warehouse sx={{ fontSize: 16 }} />;
  };

  // Obtener paleta de colores según el tipo
  const getPaletaColores = () => {
    return tipo === 'venta' ? grisVerdoso : grisRojizo;
  };

  const paleta = getPaletaColores();

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" mb={2}>
          Error al cargar {tipo === 'venta' ? 'puntos de venta' : 'depósitos'}
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

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={3} color={paleta.textStrong}>
          {tipo === 'venta' ? 'Puntos de Venta' : 'Depósitos'}
        </Typography>
        <TableContainer>
          <Table>
            <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={40} height={40} /></TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderColor: paleta.borderOuter, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: paleta.toolbarBg, border: '1px solid', borderColor: paleta.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={paleta.textStrong}>
          {tipo === 'venta' ? (
            <><Store style={{ marginRight: 8, verticalAlign: 'middle' }} /> Puntos de Venta</>
          ) : (
            <><Warehouse style={{ marginRight: 8, verticalAlign: 'middle' }} /> Depósitos</>
          )}
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {onNuevoPunto && (
            <Button
              variant="contained"
              sx={{ textTransform: 'none', bgcolor: paleta.primary, '&:hover': { bgcolor: paleta.primaryHover } }}
              startIcon={<IconPlus size={18} />}
              onClick={onNuevoPunto}
            >
              Nuevo {tipo === 'venta' ? 'Punto de Venta' : 'Depósito'}
            </Button>
          )}
          <TextField
            size="small"
            placeholder={`Buscar ${tipo === 'venta' ? 'puntos de venta' : 'depósitos'}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
            sx={{ minWidth: 250 }}
          />
          <Tooltip title="Buscar">
            <span>
              <Button
                variant="contained"
                sx={{ textTransform: 'none', bgcolor: paleta.primary, '&:hover': { bgcolor: paleta.primaryHover } }}
                startIcon={<IconSearch size={18} />}
                onClick={() => refetch()}
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
            onClick={() => setBusqueda('')}
            sx={{ textTransform: 'none', borderColor: paleta.borderOuter, color: paleta.textStrong, '&:hover': { borderColor: paleta.textStrong, bgcolor: paleta.toolbarBg } }}
          >
            Limpiar
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: paleta.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size={'small'} sx={{ '& .MuiTableCell-head': { bgcolor: paleta.headerBg, color: paleta.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: paleta.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 }, '& th:first-of-type': { borderTopLeftRadius: 8 }, '& th:last-of-type': { borderTopRightRadius: 8 } }}>
              <TableCell sx={{
                fontWeight: 700,
                color: paleta.headerText,
                borderBottom: '3px solid',
                borderColor: paleta.headerBorder,
                width: { xs: '30%', sm: '25%', md: '25%' }
              }}>
                Nombre
              </TableCell>
              <TableCell sx={{
                fontWeight: 700,
                color: paleta.headerText,
                borderBottom: '3px solid',
                borderColor: paleta.headerBorder,
                width: { xs: '25%', sm: '20%', md: '20%' }
              }}>
                Descripción
              </TableCell>
              <TableCell sx={{
                fontWeight: 700,
                color: paleta.headerText,
                borderBottom: '3px solid',
                borderColor: paleta.headerBorder,
                width: { xs: '25%', sm: '25%', md: '25%' }
              }}>
                Ubicación
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: paleta.headerText, borderBottom: '3px solid', borderColor: paleta.headerBorder }}>
                Estado
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: paleta.headerText, borderBottom: '3px solid', borderColor: paleta.headerBorder, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            {puntosFiltrados.map((punto, idx) => (
              <TableRow 
                key={punto.id}
                sx={{ 
                  bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit',
                  '&:hover': { bgcolor: paleta.rowHover }
                }}
              >
                <TableCell sx={{ width: { xs: '30%', sm: '25%', md: '25%' } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      icon={getIconByTipo(punto.tipo)}
                      label={punto.tipo === 'venta' ? 'Venta' : 'Depósito'}
                      size="small"
                      sx={{ 
                        bgcolor: paleta.chipBg,
                        color: paleta.chipText,
                        fontWeight: 500
                      }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal' }}>
                        {punto.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {punto.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: { xs: '25%', sm: '20%', md: '20%' } }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'normal' }}>
                    {punto.descripcion || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(punto.fechaCreacion).toLocaleDateString('es-AR')}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: { xs: '25%', sm: '25%', md: '25%' } }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'normal' }}>
                    {punto.direccion || '-'}
                  </Typography>
                  {punto.telefono && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      📞 {punto.telefono}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={punto.activo ? 'Activo' : 'Inactivo'}
                    color={punto.activo ? 'success' : 'default'}
                    size="small"
                    variant="filled"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Ver detalles">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => console.log('Ver punto:', punto)}
                        sx={{ p: 0.75 }}
                      >
                        <IconEye size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar punto">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => {
                          setPuntoSeleccionado(punto);
                          handleEditarPunto();
                        }}
                        sx={{ p: 0.75 }}
                      >
                        <IconEdit size={20} />
                      </IconButton>
                    </Tooltip>
                    {onVerInventario && (
                      <Tooltip title="Ver inventario">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            setPuntoSeleccionado(punto);
                            handleVerInventario();
                          }}
                          sx={{ p: 0.75 }}
                        >
                          <Store sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={puntos.filter(p => p.tipo === tipo).length <= 1 ? `No se puede eliminar el único ${tipo === 'venta' ? 'punto de venta' : 'depósito'}` : "Eliminar punto"}>
                      <span>
                        <IconButton 
                          size="small" 
                          color="error"
                          disabled={puntos.filter(p => p.tipo === tipo).length <= 1}
                          onClick={() => {
                            setPuntoSeleccionado(punto);
                            handleConfirmarEliminacion();
                          }}
                          sx={{ p: 0.75, opacity: puntos.filter(p => p.tipo === tipo).length <= 1 ? 0.3 : 1 }}
                        >
                          <IconTrash size={20} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación personalizada */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
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
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, puntosFiltrados.length)} de ${puntosFiltrados.length}`}
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
                    onClick={() => handleChangePage(null, (numeroPagina as number) - 1)}
                    sx={{
                      minWidth: 32,
                      height: 32,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      ...(paginaActual === numeroPagina ? {
                        bgcolor: grisVerdoso.primary,
                        color: 'white',
                        '&:hover': { bgcolor: grisVerdoso.primaryHover }
                      } : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: grisVerdoso.rowHover }
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
              onClick={() => handleChangePage(null, 0)}
              disabled={page === 0}
              sx={{ color: 'text.secondary' }}
              title="Primera página"
            >
              ⏮
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
              sx={{ color: 'text.secondary' }}
              title="Página anterior"
            >
              ◀
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ color: 'text.secondary' }}
              title="Página siguiente"
            >
              ▶
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleChangePage(null, totalPaginas - 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ color: 'text.secondary' }}
              title="Última página"
            >
              ⏭
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Mensaje si no hay resultados */}
      {!loading && puntosFiltrados.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            No se encontraron {tipo === 'venta' ? 'puntos de venta' : 'depósitos'} que coincidan con la búsqueda
          </Typography>
        </Box>
      )}

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmarEliminacion
        abierto={modalEliminarAbierto}
        titulo="¿Está seguro que quiere eliminar este Punto Mudras?"
        descripcion={`Esta acción eliminará permanentemente "${puntoSeleccionado?.nombre}" y no se puede deshacer.`}
        nombreEntidad={puntoSeleccionado?.nombre || ''}
        onConfirmar={handleEliminarPunto}
        onCancelar={handleCancelarEliminacion}
        cargando={eliminando}
      />
    </Paper>
  );
}
