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
  Box,
  Skeleton,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import { Store, Warehouse } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { IconEdit, IconEye, IconRefresh, IconTrash, IconInfoCircle, IconPhone } from '@tabler/icons-react'; // Added IconPhone
import { useQuery, useMutation } from '@apollo/client/react';
import { alpha } from '@mui/material/styles';
import {
  OBTENER_PUNTOS_MUDRAS,
  type ObtenerPuntosMudrasResponse,
} from '@/components/puntos-mudras/graphql/queries';
import { ELIMINAR_PUNTO_MUDRAS } from '@/components/puntos-mudras/graphql/mutations';
import { PuntoMudras } from '@/interfaces/puntos-mudras';
import ModalConfirmarEliminacion from '@/components/ui/ModalConfirmarEliminacion';
import { grisRojizo } from '@/ui/colores';
import SearchToolbar from '@/components/ui/SearchToolbar';

interface TablaPuntosMudrasProps {
  tipo: 'venta' | 'deposito';
  onEditarPunto?: (punto: PuntoMudras) => void;
  onVerInventario?: (punto: PuntoMudras) => void;
  onNuevoPunto?: () => void;
  onEliminado?: (punto: PuntoMudras) => void;
}

export default function TablaPuntosMudras({ tipo, onEditarPunto, onVerInventario, onNuevoPunto, onEliminado }: TablaPuntosMudrasProps) {
  const [busqueda, setBusqueda] = useState('');
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoMudras | null>(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(150);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>({ open: false, msg: '', sev: 'success' });

  // Tema de colores
  const paleta = grisRojizo;
  const headerBg = paleta.primary; // Fallback since tableHeader is missing
  const tableStriped = paleta.alternateRow; // Fallback since tableStriped is missing

  // Query para obtener puntos
  const { data, loading, error, refetch } = useQuery<ObtenerPuntosMudrasResponse>(OBTENER_PUNTOS_MUDRAS, {
    fetchPolicy: 'cache-first', // Usamos cache primero para velocidad, invalidación externa manejará updates
  });

  // Mutation para eliminar punto
  const [eliminarPunto] = useMutation(ELIMINAR_PUNTO_MUDRAS, {
    onCompleted: (data) => {
      setEliminando(false);
      setModalEliminarAbierto(false);
      if (puntoSeleccionado && onEliminado) onEliminado(puntoSeleccionado);
      if (!onEliminado && puntoSeleccionado) {
        setSnack({ open: true, msg: `${puntoSeleccionado.tipo === 'venta' ? 'Punto' : 'Depósito'} eliminado`, sev: 'success' });
      }
      setPuntoSeleccionado(null);
      refetch();
      window.dispatchEvent(new CustomEvent('puntosVentaActualizados'));
    },
    onError: (error) => {
      setEliminando(false);
      setModalEliminarAbierto(false);
      setSnack({ open: true, msg: error?.message || 'Error al eliminar', sev: 'error' });
    },
    refetchQueries: [{ query: OBTENER_PUNTOS_MUDRAS }]
  });

  const puntos = (data?.obtenerPuntosMudras || []).filter((punto) => punto.tipo === tipo);

  const puntosFiltrados = puntos.filter(punto => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase().trim();
    return punto.nombre.toLowerCase().includes(q) ||
      punto.direccion?.toLowerCase().includes(q) ||
      punto.telefono?.toLowerCase().includes(q);
  });

  const totalPaginas = Math.ceil(puntosFiltrados.length / rowsPerPage);

  const puntosPaginados = puntosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleConfirmarEliminacion = (punto: PuntoMudras) => {
    const puntosDelMismoTipo = puntos.filter(p => p.tipo === tipo);
    if (puntosDelMismoTipo.length <= 1) {
      setSnack({ open: true, msg: `No se puede eliminar el único ${tipo === 'venta' ? 'punto de venta' : 'depósito'}.`, sev: 'error' });
      return;
    }
    setPuntoSeleccionado(punto);
    setModalEliminarAbierto(true);
  };

  const toolbar = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        p: 2,
        bgcolor: '#ffffff',
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {onNuevoPunto && (
          <Button
            variant="contained"
            onClick={onNuevoPunto}
            startIcon={<Icon icon="mdi:plus" />}
            disableElevation
            sx={{
              borderRadius: 0,
              textTransform: 'none',
              bgcolor: paleta.primary,
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': { bgcolor: paleta.primaryHover }
            }}
          >
            {tipo === 'venta' ? 'Nuevo Punto' : 'Nuevo Depósito'}
          </Button>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <SearchToolbar
          title=""
          baseColor={paleta.primary}
          placeholder={`Buscar ${tipo === 'venta' ? 'puntos' : 'depósitos'}...`}
          searchValue={busqueda}
          onSearchValueChange={setBusqueda}
          onSubmitSearch={() => setPage(0)}
          onClear={() => { setBusqueda(''); setPage(0); }}
          searchDisabled={loading}
        />
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
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
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error: {error.message}</Typography>
        <Button onClick={() => refetch()} sx={{ mt: 2 }}>Reintentar</Button>
      </Paper>
    );
  }

  return (
    <Box>
      {toolbar}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
          overflow: 'hidden'
        }}
      >
        <Table stickyHeader size="small" sx={{
          minWidth: 700,
          '& .MuiTableRow-root': {
            minHeight: 56,
            transition: 'background-color 0.2s',
          },
          '& .MuiTableCell-root': {
            fontSize: '0.85rem',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #f0f0f0',
            color: '#37474f',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
            bgcolor: tableStriped,
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover': {
            bgcolor: alpha(paleta.primary, 0.12),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: headerBg,
            color: '#ffffff',
          }
        }}>
          <TableHead>
            <TableRow>
              <TableCell>NOMBRE</TableCell>
              <TableCell>DESCRIPCIÓN</TableCell>
              <TableCell>UBICACIÓN</TableCell>
              <TableCell align="center">ESTADO</TableCell>
              <TableCell align="center">ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {puntosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Stack alignItems="center" spacing={1}>
                    <IconInfoCircle size={48} color="#9e9e9e" />
                    <Typography color="text.secondary">No se encontraron resultados</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              puntosPaginados.map((punto) => (
                <TableRow key={punto.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {punto.nombre}
                    </Typography>
                    {/* ID opcional pequeño */}
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                      ID: {punto.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {punto.descripcion || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{punto.direccion || '-'}</Typography>
                      {punto.telefono && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          <IconPhone size={14} color="#757575" />
                          <Typography variant="caption" color="text.secondary">{punto.telefono}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={punto.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      sx={{
                        borderRadius: 0,
                        fontWeight: 600,
                        bgcolor: punto.activo ? '#e8f5e9' : '#fafafa',
                        color: punto.activo ? '#2e7d32' : '#757575',
                        border: punto.activo ? 'none' : '1px solid #bdbdbd'
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      {onVerInventario && (
                        <Tooltip title="Ver Inventario">
                          <IconButton size="small" onClick={() => onVerInventario(punto)} sx={{ color: '#0288d1', '&:hover': { bgcolor: alpha('#0288d1', 0.1) } }}>
                            <Store />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onEditarPunto && (
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => onEditarPunto(punto)} sx={{ color: paleta.primary, '&:hover': { bgcolor: alpha(paleta.primary, 0.1) } }}>
                            <IconEdit size={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleConfirmarEliminacion(punto)}
                          sx={{ color: '#d32f2f', '&:hover': { bgcolor: alpha('#d32f2f', 0.1) } }}
                        >
                          <IconTrash size={20} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 3,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Mostrando {Math.min(rowsPerPage, puntosPaginados.length)} de {puntosFiltrados.length} {tipo === 'venta' ? 'puntos' : 'depósitos'}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            select
            size="small"
            value={String(rowsPerPage)}
            onChange={handleChangeRowsPerPage}
            sx={{ minWidth: 80 }}
            InputProps={{ sx: { borderRadius: 0, fontSize: '0.875rem' } }}
          >
            {[50, 100, 150, 300, 500].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0}
              sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}
            >
              <Icon icon="mdi:chevron-left" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleChangePage(page + 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}
            >
              <Icon icon="mdi:chevron-right" />
            </IconButton>
          </Box>
        </Stack>
      </Box>

      {/* Modal Confirmación Eliminación */}
      <ModalConfirmarEliminacion
        abierto={modalEliminarAbierto}
        titulo="¿Eliminar punto?"
        descripcion={`Se eliminará permanentemente "${puntoSeleccionado?.nombre}".`}
        nombreEntidad={puntoSeleccionado?.nombre || ''}
        onConfirmar={() => {
          if (puntoSeleccionado) eliminarPunto({ variables: { id: puntoSeleccionado.id } });
        }}
        onCancelar={() => {
          setModalEliminarAbierto(false);
          setPuntoSeleccionado(null);
        }}
        cargando={eliminando}
      />

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%', borderRadius: 0 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
