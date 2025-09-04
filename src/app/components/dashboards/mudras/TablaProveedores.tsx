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
import { IconButton, Tooltip } from '@mui/material';

interface Props {
  onNuevoProveedor?: () => void;
  puedeCrear?: boolean;
}

const TablaProveedores: React.FC<Props> = ({ onNuevoProveedor, puedeCrear = true }) => {
  const { data, loading, error, refetch } = useQuery<ProveedoresResponse>(GET_PROVEEDORES);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');

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
  
  const proveedoresFiltrados = proveedores.filter((proveedor) =>
    proveedor.Nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    proveedor.Contacto?.toLowerCase().includes(filtro.toLowerCase()) ||
    proveedor.Localidad?.toLowerCase().includes(filtro.toLowerCase()) ||
    proveedor.CUIT?.includes(filtro)
  );

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
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="secondary.main">
          <IconUsers style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Proveedores
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {puedeCrear && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<IconPlus size={18} />}
              onClick={onNuevoProveedor}
              sx={{
                textTransform: 'none',
                bgcolor: 'secondary.main',
                '&:hover': { bgcolor: 'secondary.dark' }
              }}
            >
              Nuevo Proveedor
            </Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar proveedores..."
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
            color="secondary"
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
            <TableRow sx={{ bgcolor: 'secondary.light' }}>
              <TableCell sx={{ fontWeight: 600, color: 'secondary.dark' }}>Proveedor</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'secondary.dark' }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'secondary.dark' }}>Teléfono</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'secondary.dark' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'secondary.dark' }}>Ubicación</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'secondary.dark' }}>CUIT</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'warning.dark' }}>Saldo</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'warning.dark', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proveedoresPaginados.map((proveedor) => (
              <TableRow 
                key={proveedor.IdProveedor}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'secondary.lighter',
                    cursor: 'pointer'
                  }
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: 'secondary.main', 
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
