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
  Box,
  Skeleton,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  TextField,
} from '@mui/material';
import { Store, Warehouse, MoreVert } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { IconEdit, IconEye, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerPuntosMudrasResponse,
} from '@/components/puntos-mudras/graphql/queries';
import { ELIMINAR_PUNTO_MUDRAS } from '@/components/puntos-mudras/graphql/mutations';
import { PuntoMudras, FiltrosPuntosMudras } from '@/interfaces/puntos-mudras';
import ModalConfirmarEliminacion from '@/components/ui/ModalConfirmarEliminacion';
import { grisVerdoso, grisRojizo } from '@/ui/colores';
import SearchToolbar from '@/components/ui/SearchToolbar';

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
  onEliminado?: (punto: PuntoMudras) => void;
}

export default function TablaPuntosMudras({ tipo, onEditarPunto, onVerInventario, onNuevoPunto, onEliminado }: TablaPuntosMudrasProps) {
  const [busqueda, setBusqueda] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoMudras | null>(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>({ open: false, msg: '', sev: 'success' });

  // Query para obtener puntos desde el backend
  const { data, loading, error, refetch } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS);

  // Mutation para eliminar punto
  const [eliminarPunto] = useMutation(ELIMINAR_PUNTO_MUDRAS, {
    onCompleted: (data) => {
      console.log('✅ [ELIMINACION] Eliminación completada exitosamente:', data);
      setEliminando(false);
      setModalEliminarAbierto(false);
      if (puntoSeleccionado && onEliminado) onEliminado(puntoSeleccionado);
      // Feedback interno si no hay manejador externo
      if (!onEliminado && puntoSeleccionado) {
        setSnack({ open: true, msg: `${puntoSeleccionado.tipo === 'venta' ? 'Punto' : 'Depósito'} eliminado: ${puntoSeleccionado.nombre}`, sev: 'success' });
      }
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
      setSnack({ open: true, msg: error?.message || 'Error al eliminar el punto', sev: 'error' });
    },
    refetchQueries: [{ query: OBTENER_PUNTOS_MUDRAS }]
  });

  const puntos = (data?.obtenerPuntosMudras || []).filter((punto) => punto.tipo === tipo);

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

  const toolbar = (
    <Box
      sx={{
        px: 1,
        py: 1,
        bgcolor: paleta.toolbarBg,
        border: '1px solid',
        borderColor: paleta.toolbarBorder,
        borderRadius: 1,
        mb: 2,
      }}
    >
      <SearchToolbar
        title={tipo === 'venta' ? 'Puntos de Venta' : 'Depósitos'}
        icon={
          tipo === 'venta'
            ? <Store style={{ marginRight: 8, verticalAlign: 'middle' }} />
            : <Warehouse style={{ marginRight: 8, verticalAlign: 'middle' }} />
        }
        baseColor={paleta.primary}
        placeholder={`Buscar ${tipo === 'venta' ? 'puntos de venta' : 'depósitos'}...`}
        searchValue={busqueda}
        onSearchValueChange={setBusqueda}
        onSubmitSearch={() => {
          setPage(0);
          void refetch();
        }}
        onClear={() => {
          setBusqueda('');
          setPage(0);
          void refetch();
        }}
        canCreate={Boolean(onNuevoPunto)}
        createLabel={tipo === 'venta' ? 'Nuevo Punto de Venta' : 'Nuevo Depósito'}
        onCreateClick={onNuevoPunto}
        searchDisabled={loading}
      />
    </Box>
  );

  if (error) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderColor: paleta.borderOuter, borderRadius: 2, bgcolor: 'background.paper' }}>
        {toolbar}
        <Box sx={{ p: 3, textAlign: 'center' }}>
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
        </Box>
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

  /* ======================== Render ======================== */
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid #e0e0e0' }}>
      {toolbar}

      <TableContainer sx={{ borderRadius: 0 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Nombre</TableCell>
              <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Descripción</TableCell>
              <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Ubicación</TableCell>
              <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Estado</TableCell>
              <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 700, borderRadius: 0 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {puntosPaginados.map((punto, idx) => (
              <TableRow key={punto.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      icon={getIconByTipo(punto.tipo)}
                      label={punto.tipo === 'venta' ? 'Venta' : 'Depósito'}
                      size="small"
                      sx={{ borderRadius: 0, fontWeight: 600, bgcolor: punto.tipo === 'venta' ? 'success.light' : 'warning.light', color: punto.tipo === 'venta' ? 'success.dark' : 'warning.dark' }}
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
                <TableCell>
                  <Typography variant="body2">{punto.descripcion || '-'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(punto.fechaCreacion).toLocaleDateString('es-AR')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{punto.direccion || '-'}</Typography>
                  {punto.telefono && <Typography variant="caption" display="block">📞 {punto.telefono}</Typography>}
                </TableCell>
                <TableCell>
                  <Chip
                    label={punto.activo ? 'Activo' : 'Inactivo'}
                    color={punto.activo ? 'success' : 'default'}
                    size="small"
                    sx={{ borderRadius: 0 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => console.log('Ver punto:', punto)}>
                        <IconEye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar punto">
                      <IconButton size="small" color="primary" onClick={() => { setPuntoSeleccionado(punto); handleEditarPunto(); }}>
                        <IconEdit size={18} />
                      </IconButton>
                    </Tooltip>
                    {onVerInventario && (
                      <Tooltip title="Ver inventario">
                        <IconButton size="small" color="secondary" onClick={() => { setPuntoSeleccionado(punto); handleVerInventario(); }}>
                          <Store sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={puntos.filter(p => p.tipo === tipo).length <= 1 ? `No se puede eliminar el único ${tipo === 'venta' ? 'punto de venta' : 'depósito'}` : "Eliminar punto"}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={puntos.filter(p => p.tipo === tipo).length <= 1}
                          onClick={() => { setPuntoSeleccionado(punto); handleConfirmarEliminacion(); }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {!loading && puntosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No se encontraron {tipo === 'venta' ? 'puntos de venta' : 'depósitos'}.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Flat */}
      <Box sx={{ borderTop: '1px solid #e0e0e0', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fafafa' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">Filas por página:</Typography>
          <TextField
            select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            size="small"
            variant="standard"
            InputProps={{ disableUnderline: true, sx: { fontSize: '0.875rem' } }}
          >
            {[10, 25, 50, 100].map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, puntosFiltrados.length)} de {puntosFiltrados.length}
          </Typography>
          <Box>
            <IconButton size="small" onClick={() => handleChangePage(null, page - 1)} disabled={page === 0}>
              <Icon icon="mdi:chevron-left" />
            </IconButton>
            <IconButton size="small" onClick={() => handleChangePage(null, page + 1)} disabled={page >= totalPaginas - 1}>
              <Icon icon="mdi:chevron-right" />
            </IconButton>
          </Box>
        </Box>
      </Box>

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
      {/* Snackbar interno para feedback */}
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%', borderRadius: 0 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
