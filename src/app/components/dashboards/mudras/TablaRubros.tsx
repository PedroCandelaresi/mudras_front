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
  Stack,
  Menu,
  Divider,
} from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_RUBROS } from '@/app/queries/mudras.queries';
import { Rubro } from '@/app/interfaces/mudras.types';
import { RubrosResponse } from '@/app/interfaces/graphql.types';
import { IconSearch, IconCategory, IconRefresh, IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical } from '@tabler/icons-react';
import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { etiquetaUnidad, abrevUnidad, type UnidadMedida } from '@/app/utils/unidades';
import { teal } from '@/ui/colores';

interface Props {
  onNuevoRubro?: () => void;
  puedeCrear?: boolean;
}

const TablaRubros: React.FC<Props> = ({ onNuevoRubro, puedeCrear = true }) => {
  const { data, loading, error, refetch } = useQuery<RubrosResponse>(GET_RUBROS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'rubro' | 'codigo'>(null);
  const [filtroColInput, setFiltroColInput] = useState('');

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
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderColor: teal.borderOuter, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: teal.toolbarBg, border: '1px solid', borderColor: teal.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={teal.textStrong}>
          <IconCategory style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Rubros y Categorías
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {puedeCrear && (
            <Button variant="contained" onClick={onNuevoRubro} sx={{ textTransform: 'none', bgcolor: teal.primary, '&:hover': { bgcolor: teal.primaryHover } }} startIcon={<IconPlus size={18} />}>Nuevo Rubro</Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar rubros..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
            sx={{ minWidth: 250 }}
          />
          <Button variant="contained" sx={{ textTransform: 'none', bgcolor: teal.primary, '&:hover': { bgcolor: teal.primaryHover } }} onClick={() => setPage(0)}>Buscar</Button>
          <Button variant="outlined" color="inherit" onClick={() => { setFiltro(''); setPage(0); }} sx={{ textTransform: 'none', borderColor: teal.headerBorder, color: teal.textStrong, '&:hover': { borderColor: teal.textStrong, bgcolor: teal.toolbarBg } }}>Limpiar filtros</Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: teal.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size={'small'} sx={{ '& .MuiTableCell-head': { bgcolor: teal.headerBg, color: teal.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: teal.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 } }}>
              <TableCell sx={{ fontWeight: 700, color: teal.headerText, borderBottom: '3px solid', borderColor: teal.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Categoría
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('rubro'); setFiltroColInput(''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: teal.headerText, borderBottom: '3px solid', borderColor: teal.headerBorder }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Código
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={(e) => { setColumnaActiva('codigo'); setFiltroColInput(''); setMenuAnchor(e.currentTarget); }}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: teal.headerText, borderBottom: '3px solid', borderColor: teal.headerBorder }}>Unidad</TableCell>
              <TableCell sx={{ fontWeight: 700, color: teal.headerText, borderBottom: '3px solid', borderColor: teal.headerBorder }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: teal.headerText, borderBottom: '3px solid', borderColor: teal.headerBorder, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rubrosPaginados.map((rubro, index) => {
              const colorScheme = getColorByIndex(index);
              return (
                <TableRow 
                  key={rubro.Id}
                  sx={{ 
                    bgcolor: index % 2 === 1 ? 'grey.50' : 'inherit',
                    '&:hover': { bgcolor: teal.rowHover },
                    cursor: 'pointer'
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: teal.primary, 
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

      {/* Menú de filtros por columna (simple) */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'rubro' && 'Filtrar por Categoría'}
          {columnaActiva === 'codigo' && 'Filtrar por Código'}
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
                  setFiltro(filtroColInput);
                  setPage(0);
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => { setFiltroColInput(''); }}>Limpiar</Button>
              <Button size="small" variant="contained" sx={{ bgcolor: teal.primary, '&:hover': { bgcolor: teal.primaryHover } }} onClick={() => {
                setFiltro(filtroColInput);
                setPage(0);
                setMenuAnchor(null);
                setColumnaActiva(null);
              }}>Aplicar</Button>
            </Stack>
          </Box>
        )}
      </Menu>

      <Box mt={1} mb={1} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Mostrando {rubrosPaginados.length} rubros en esta página.
        </Typography>
      </Box>

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
