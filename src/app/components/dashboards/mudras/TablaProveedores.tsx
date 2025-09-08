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
import { GET_PROVEEDORES } from '@/app/queries/mudras.queries';
import { Proveedor } from '@/app/interfaces/mudras.types';
import { ProveedoresResponse } from '@/app/interfaces/graphql.types';
import { IconSearch, IconUsers, IconRefresh, IconPhone, IconMail, IconEdit, IconTrash, IconEye, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { IconButton, Tooltip, Menu, Divider } from '@mui/material';
import { azul } from '@/ui/colores';

interface Props {
  onNuevoProveedor?: () => void;
  puedeCrear?: boolean;
}

const TablaProveedores: React.FC<Props> = ({ onNuevoProveedor, puedeCrear = true }) => {
  const { data, loading, error, refetch } = useQuery<ProveedoresResponse>(GET_PROVEEDORES);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'nombre' | 'contacto' | 'localidad' | 'cuit'>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{ nombre?: string; contacto?: string; localidad?: string; cuit?: string; }>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  // Funciones para manejar acciones
  const handleViewProveedor = (proveedor: Proveedor) => {
    console.log('Ver proveedor:', proveedor);
    // TODO: Implementar modal de vista detallada
  };

  const handleEditProveedor = (proveedor: Proveedor) => {
    console.log('Editar proveedor:', proveedor);
    // TODO: Implementar modal de edición
  };

  const handleDeleteProveedor = (proveedor: Proveedor) => {
    console.log('Eliminar proveedor:', proveedor);
    // TODO: Implementar confirmación y eliminación
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const proveedores: Proveedor[] = data?.proveedores || [];
  
  const proveedoresFiltrados = proveedores.filter((p) => {
    const text = filtro.toLowerCase();
    const pasaTexto = !text || (
      (p.Nombre || '').toLowerCase().includes(text) ||
      (p.Contacto || '').toLowerCase().includes(text) ||
      (p.Localidad || '').toLowerCase().includes(text) ||
      (p.CUIT || '').includes(text)
    );
    const pasaNombre = filtrosColumna.nombre ? (p.Nombre || '').toLowerCase().includes(filtrosColumna.nombre.toLowerCase()) : true;
    const pasaContacto = filtrosColumna.contacto ? (p.Contacto || '').toLowerCase().includes(filtrosColumna.contacto.toLowerCase()) : true;
    const pasaLocalidad = filtrosColumna.localidad ? (p.Localidad || '').toLowerCase().includes(filtrosColumna.localidad.toLowerCase()) : true;
    const pasaCuit = filtrosColumna.cuit ? (p.CUIT || '').toLowerCase().includes(filtrosColumna.cuit.toLowerCase()) : true;
    return pasaTexto && pasaNombre && pasaContacto && pasaLocalidad && pasaCuit;
  });

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
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={3}>Proveedores</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Nombre', 'Contacto', 'Teléfono', 'Email', 'Localidad', 'CUIT', 'Saldo'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
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
          {columnaActiva === 'contacto' && 'Filtrar por Contacto'}
          {columnaActiva === 'localidad' && 'Filtrar por Ubicación'}
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
      <Paper sx={{ p: 3, textAlign: 'center' }}>
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
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderColor: azul.borderOuter, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: azul.toolbarBg, border: '1px solid', borderColor: azul.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={azul.textStrong}>
          <IconUsers style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Proveedores
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {puedeCrear && (
            <Button variant="contained" onClick={onNuevoProveedor} sx={{ textTransform: 'none', bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }} startIcon={<IconPlus size={18} />}>Nuevo Proveedor</Button>
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
                      <IconSearch size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Contacto
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('contacto'); setFiltroColInput(filtrosColumna.contacto || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconSearch size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>Teléfono</TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Ubicación
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('localidad'); setFiltroColInput(filtrosColumna.localidad || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconSearch size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  CUIT
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('cuit'); setFiltroColInput(filtrosColumna.cuit || ''); setMenuAnchor(e.currentTarget); }}>
                      <IconSearch size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: azul.headerText, borderBottom: '3px solid', borderColor: azul.headerBorder }}>Saldo</TableCell>
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
                      <Typography variant="caption" color="text.secondary">
                        Código: {proveedor.Codigo || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {proveedor.Contacto || 'Sin contacto'}
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
                  <Typography variant="body2">
                    {proveedor.Localidad && proveedor.Provincia 
                      ? `${proveedor.Localidad}, ${proveedor.Provincia}`
                      : proveedor.Localidad || proveedor.Provincia || 'Sin ubicación'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {proveedor.CUIT || 'Sin CUIT'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`$${(proveedor.Saldo || 0).toLocaleString()}`}
                    color={getSaldoColor(proveedor.Saldo || 0)}
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
                        onClick={() => handleViewProveedor(proveedor)}
                      >
                        <IconEye size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar proveedor">
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handleEditProveedor(proveedor)}
                      >
                        <IconEdit size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar proveedor">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProveedor(proveedor)}
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
        count={proveedoresFiltrados.length}
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

export default TablaProveedores;
