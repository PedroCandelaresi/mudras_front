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
import { GET_PROVEEDORES } from '@/queries/proveedores';
import { Proveedor, ProveedoresResponse } from '@/interfaces/proveedores';
import { IconSearch, IconUsers, IconRefresh, IconPhone, IconMail, IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical } from '@tabler/icons-react';
import { useState } from 'react';
import { IconButton, Tooltip, Menu, Divider } from '@mui/material';
import { azul } from '@/ui/colores';
import { ModalDetallesProveedor, ModalEditarProveedor, ModalEliminarProveedor } from '@/components/proveedores';

interface Props {
  onNuevoProveedor?: () => void;
  puedeCrear?: boolean;
}

const TablaProveedores: React.FC<Props> = ({ onNuevoProveedor, puedeCrear = true }) => {
  const { data, loading, error, refetch } = useQuery<ProveedoresResponse>(GET_PROVEEDORES);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtro, setFiltro] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'nombre' | 'codigo' | 'cuit'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{ nombre?: string; codigo?: string; cuit?: string; }>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  // Estados para modales
  const [modalDetalles, setModalDetalles] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);

  // Funciones para manejar acciones
  const handleViewProveedor = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalDetalles(true);
  };

  const handleEditProveedor = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalEditar(true);
  };

  const handleDeleteProveedor = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalEliminar(true);
  };

  const handleNuevoProveedor = () => {
    setProveedorSeleccionado(null);
    setModalEditar(true);
  };

  const handleProveedorGuardado = () => {
    refetch();
    setModalEditar(false);
    setProveedorSeleccionado(null);
  };

  const handleProveedorEliminado = () => {
    refetch();
    setModalEliminar(false);
    setProveedorSeleccionado(null);
  };

  const cerrarModales = () => {
    setModalDetalles(false);
    setModalEditar(false);
    setModalEliminar(false);
    setProveedorSeleccionado(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const proveedores: Proveedor[] = data?.proveedores || [];
  
  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const cumpleFiltroGeneral = filtro === '' || 
      proveedor.Nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      proveedor.Codigo?.toString().toLowerCase().includes(filtro.toLowerCase()) ||
      proveedor.CUIT?.toLowerCase().includes(filtro.toLowerCase());

    const cumpleFiltrosColumna = Object.entries(filtrosColumna).every(([campo, valor]) => {
      if (!valor) return true;
      const valorCampo = proveedor[campo as keyof Proveedor];
      return valorCampo?.toString().toLowerCase().includes(valor.toLowerCase());
    });

    return cumpleFiltroGeneral && cumpleFiltrosColumna;
  });

  const totalPaginas = Math.ceil(proveedoresFiltrados.length / rowsPerPage);
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

  const proveedoresPaginados = proveedoresFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getSaldoColor = (saldo: number) => {
    if (saldo > 0) return 'error';
    if (saldo < 0) return 'success';
    return 'default';
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" mb={3}>Proveedores</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Proveedor', 'Código', 'Teléfono', 'Email', 'CUIT'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4, 5].map((cell) => (
                    <TableCell key={cell}>
                      <Skeleton variant="text" width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      {/* Menú de filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'nombre' && 'Filtrar por Proveedor'}
          {columnaActiva === 'codigo' && 'Filtrar por Código'}
          {columnaActiva === 'cuit' && 'Filtrar por CUIT'}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {columnaActiva && (
          <Box px={1} pb={1}>
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Escribe para filtrar..."
              value={filtroColInput}
              onChange={(e) => setFiltroColInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                  setPage(0);
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => { setFiltroColInput(''); setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: '' })); }}>Limpiar</Button>
              <Button size="small" variant="contained" sx={{ bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }} onClick={() => {
                setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                setPage(0);
                setMenuAnchor(null);
                setColumnaActiva(null);
              }}>Aplicar</Button>
            </Stack>
          </Box>
        )}
      </Menu>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography color="error" variant="h6" mb={2}>
          Error al cargar proveedores
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
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none' , borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: azul.toolbarBg, border: '1px solid', borderColor: azul.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={azul.textStrong}>
          <IconUsers style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Proveedores
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {puedeCrear && (
            <Button variant="contained" onClick={onNuevoProveedor || handleNuevoProveedor} sx={{ textTransform: 'none', bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }} startIcon={<IconPlus size={18} />}>Nuevo Proveedor</Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar proveedores..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
            sx={{ minWidth: 250 }}
          />
          <Button variant="contained" sx={{ textTransform: 'none', bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }} onClick={() => setPage(0)}>Buscar</Button>
          <Button variant="outlined" color="inherit" onClick={() => { setFiltro(''); setPage(0); }} sx={{ textTransform: 'none', borderColor: azul.headerBorder, color: azul.textStrong, '&:hover': { borderColor: azul.textStrong, bgcolor: azul.toolbarBg } }}>Limpiar filtros</Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: azul.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size={'small'} sx={{ '& .MuiTableCell-head': { bgcolor: azul.headerBg, color: azul.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: azul.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 } }}>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Proveedor
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('nombre'); setFiltroColInput(filtrosColumna.nombre || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Código
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('codigo'); setFiltroColInput(filtrosColumna.codigo || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>Teléfono</TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  CUIT
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('cuit'); setFiltroColInput(filtrosColumna.cuit || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proveedoresPaginados.map((proveedor, idx) => (
              <TableRow 
                key={proveedor.IdProveedor}
                sx={{ 
                  bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit',
                  '&:hover': { bgcolor: azul.rowHover },
                  cursor: 'pointer'
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: azul.primary, 
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        fontSize: '1rem'
                      }}
                    >
                      {proveedor.Nombre?.charAt(0) || 'P'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {proveedor.Nombre || 'Sin nombre'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                    {proveedor.Codigo || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {proveedor.Telefono && (
                      <>
                        <IconPhone size={16} style={{ marginRight: 4, color: '#666' }} />
                        <Typography variant="body2">
                          {proveedor.Telefono}
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {proveedor.Mail && (
                      <>
                        <IconMail size={16} style={{ marginRight: 4, color: '#666' }} />
                        <Typography variant="body2">
                          {proveedor.Mail}
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {proveedor.CUIT || 'Sin CUIT'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Ver detalles">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewProveedor(proveedor)}
                        sx={{
                          bgcolor: '#1976d2',
                          color: 'white',
                          borderRadius: 1.5,
                          width: 32,
                          height: 32,
                          '&:hover': {
                            bgcolor: '#1565c0'
                          }
                        }}
                      >
                        <IconEye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar proveedor">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditProveedor(proveedor)}
                        sx={{
                          bgcolor: '#2e7d32',
                          color: 'white',
                          borderRadius: 1.5,
                          width: 32,
                          height: 32,
                          '&:hover': {
                            bgcolor: '#1b5e20'
                          }
                        }}
                      >
                        <IconEdit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar proveedor">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteProveedor(proveedor)}
                        sx={{
                          bgcolor: '#d32f2f',
                          color: 'white',
                          borderRadius: 1.5,
                          width: 32,
                          height: 32,
                          '&:hover': {
                            bgcolor: '#c62828'
                          }
                        }}
                      >
                        <IconTrash size={18} />
                      </IconButton>
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
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, proveedoresFiltrados.length)} de ${proveedoresFiltrados.length}`}
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
                        bgcolor: azul.primary,
                        color: 'white',
                        '&:hover': { bgcolor: azul.primaryHover }
                      } : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: azul.rowHover }
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

      {/* Modales */}
      <ModalDetallesProveedor
        open={modalDetalles}
        onClose={cerrarModales}
        proveedor={proveedorSeleccionado}
      />

      <ModalEditarProveedor
        open={modalEditar}
        onClose={cerrarModales}
        proveedor={proveedorSeleccionado}
        onProveedorGuardado={handleProveedorGuardado}
      />

      <ModalEliminarProveedor
        open={modalEliminar}
        onClose={cerrarModales}
        proveedor={proveedorSeleccionado}
        onProveedorEliminado={handleProveedorEliminado}
      />
    </Paper>
  );
};

export default TablaProveedores;
