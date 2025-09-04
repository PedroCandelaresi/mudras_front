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
import { GET_RUBROS } from '@/app/queries/mudras.queries';
import { Rubro } from '@/app/interfaces/mudras.types';
import { RubrosResponse } from '@/app/interfaces/graphql.types';
import { IconSearch, IconCategory, IconRefresh, IconEdit, IconTrash, IconEye, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { etiquetaUnidad, abrevUnidad, type UnidadMedida } from '@/app/utils/unidades';

interface Props {
  onNuevoRubro?: () => void;
  puedeCrear?: boolean;
}

const TablaRubros: React.FC<Props> = ({ onNuevoRubro, puedeCrear = true }) => {
  const { data, loading, error, refetch } = useQuery<RubrosResponse>(GET_RUBROS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');

  // Funciones para manejar acciones
  const handleViewRubro = (rubro: Rubro) => {
    console.log('Ver rubro:', rubro);
    // TODO: Implementar modal de vista detallada
  };

  const handleEditRubro = (rubro: Rubro) => {
    console.log('Editar rubro:', rubro);
    // TODO: Implementar modal de edición
  };

  const handleDeleteRubro = (rubro: Rubro) => {
    console.log('Eliminar rubro:', rubro);
    // TODO: Implementar confirmación y eliminación
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const rubros: Rubro[] = data?.rubros || [];
  
  const rubrosFiltrados = rubros.filter((rubro) =>
    rubro.Rubro?.toLowerCase().includes(filtro.toLowerCase()) ||
    rubro.Codigo?.toLowerCase().includes(filtro.toLowerCase())
  );

  const rubrosPaginados = rubrosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getColorByIndex = (index: number) => {
    const colors = ['warning', 'secondary', 'success', 'error', 'info', 'primary'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={3}>Rubros</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Rubro', 'Código', 'ID'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3].map((cell) => (
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
          Error al cargar rubros
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
        <Typography variant="h5" fontWeight={600} color="success.main">
          <IconCategory style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Rubros y Categorías
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {puedeCrear && (
            <Button
              variant="contained"
              color="success"
              startIcon={<IconPlus size={18} />}
              onClick={onNuevoRubro}
              sx={{
                textTransform: 'none',
                bgcolor: 'success.main',
                '&:hover': { bgcolor: 'success.dark' }
              }}
            >
              Nuevo Rubro
            </Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar rubros..."
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
            <TableRow sx={{ bgcolor: 'success.light' }}>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>Unidad</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'success.dark', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rubrosPaginados.map((rubro, index) => {
              const colorScheme = getColorByIndex(index);
              return (
                <TableRow 
                  key={rubro.Id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'success.lighter',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: `${colorScheme}.main`, 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          fontSize: '1rem'
                        }}
                      >
                        {rubro.Rubro?.charAt(0) || 'R'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {rubro.Rubro || 'Sin nombre'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rubro.Codigo || 'Sin código'}
                      color={colorScheme as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {etiquetaUnidad((rubro as any).UnidadPorDefecto as UnidadMedida)} ({abrevUnidad((rubro as any).UnidadPorDefecto as UnidadMedida)})
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      #{rubro.Id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewRubro(rubro)}
                        >
                          <IconEye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar rubro">
                        <IconButton 
                          size="small" 
                          color="warning"
                          onClick={() => handleEditRubro(rubro)}
                        >
                          <IconEdit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar rubro">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteRubro(rubro)}
                        >
                          <IconTrash size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={rubrosFiltrados.length}
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

export default TablaRubros;
