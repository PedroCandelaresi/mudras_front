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
  Skeleton,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Menu,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { BUSCAR_RUBROS } from '@/app/queries/mudras.queries';
import { BuscarRubrosResponse, RubroConEstadisticas } from '@/app/interfaces/graphql.types';
import { IconSearch, IconCategory, IconRefresh, IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical } from '@tabler/icons-react';
import { useState } from 'react';
import { verde } from '@/ui/colores';

interface Props {
  onNuevoRubro?: () => void;
  puedeCrear?: boolean;
}

const TablaRubros: React.FC<Props> = ({ onNuevoRubro, puedeCrear = true }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtro, setFiltro] = useState('');
  const [filtroInput, setFiltroInput] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'nombre' | 'codigo'>(null);
  const [filtroColInput, setFiltroColInput] = useState('');
  const [filtrosColumna, setFiltrosColumna] = useState({
    nombre: '',
    codigo: ''
  });

  const { data, loading, error, refetch } = useQuery<BuscarRubrosResponse>(BUSCAR_RUBROS, {
    variables: {
      pagina: page,
      limite: rowsPerPage,
      busqueda: filtro || undefined
    },
    fetchPolicy: 'cache-and-network'
  });

  const abrirMenuColumna = (col: typeof columnaActiva) => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
    if (col) setFiltroColInput(filtrosColumna[col]);
    setMenuAnchor(e.currentTarget);
  };

  const cerrarMenuColumna = () => {
    setMenuAnchor(null);
    setColumnaActiva(null);
  };

  // Funciones para manejar acciones
  const handleViewRubro = (rubro: RubroConEstadisticas) => {
    console.log('Ver rubro:', rubro);
    // TODO: Implementar modal de vista detallada
  };

  const handleEditRubro = (rubro: RubroConEstadisticas) => {
    console.log('Editar rubro:', rubro);
    // TODO: Implementar modal de edición
  };

  const handleDeleteRubro = (rubro: RubroConEstadisticas) => {
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

  const limpiarFiltros = () => {
    setFiltro('');
    setFiltroInput('');
    setFiltrosColumna({ nombre: '', codigo: '' });
    setPage(0);
    refetch();
  };

  const rubros: RubroConEstadisticas[] = data?.buscarRubros?.rubros || [];
  const total: number = data?.buscarRubros?.total ?? 0;

  const totalPaginas = Math.ceil(total / rowsPerPage);
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

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" mb={3} color="success.dark">Rubros</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Nombre', 'Código', 'Artículos', 'Proveedores'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4].map((cell) => (
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
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
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
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none' , borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: verde.toolbarBg, border: '1px solid', borderColor: verde.toolbarBorder, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={verde.textStrong}>
          <IconCategory style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Rubros y Categorías
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {puedeCrear && (
            <Button
              variant="contained"
              sx={{ textTransform: 'none', bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }}
              startIcon={<IconPlus size={18} />}
              onClick={onNuevoRubro}
            >
              Nuevo Rubro
            </Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar rubros..."
            value={filtroInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFiltroInput(e.target.value); }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                setFiltro(filtroInput);
                setPage(0);
              }
            }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
            sx={{ minWidth: 250 }}
          />
          <Tooltip title="Buscar (Enter)">
            <span>
              <Button
                variant="contained"
                sx={{ textTransform: 'none', bgcolor: verde.primary, '&:hover': { bgcolor: verde.primaryHover } }}
                startIcon={<IconSearch size={18} />}
                onClick={() => { setFiltro(filtroInput); setPage(0); }}
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
            onClick={limpiarFiltros}
            sx={{ textTransform: 'none', borderColor: verde.headerBorder, color: verde.textStrong, '&:hover': { borderColor: verde.textStrong, bgcolor: verde.toolbarBg } }}
          >
            Limpiar filtros
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: verde.borderInner, bgcolor: 'background.paper' }}>
        <Table stickyHeader size={'small'} sx={{ '& .MuiTableCell-head': { bgcolor: verde.headerBg, color: verde.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: verde.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 }, '& th:first-of-type': { borderTopLeftRadius: 8 }, '& th:last-of-type': { borderTopRightRadius: 8 } }}>
              <TableCell sx={{
                fontWeight: 700,
                color: verde.headerText,
                borderBottom: '3px solid',
                borderColor: verde.headerBorder,
                width: { xs: '40%', sm: '35%', md: '30%' }
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Nombre
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('nombre')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{
                fontWeight: 700,
                color: verde.headerText,
                borderBottom: '3px solid',
                borderColor: verde.headerBorder,
                width: { xs: '20%', sm: '15%', md: '15%' }
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Código
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('codigo')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                Artículos
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder }}>
                Proveedores
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: verde.headerText, borderBottom: '3px solid', borderColor: verde.headerBorder, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            {rubros.map((rubro, idx) => (
              <TableRow 
                key={rubro.id}
                sx={{ 
                  bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit',
                  '&:hover': { bgcolor: verde.toolbarBg }
                }}
              >
                <TableCell sx={{ width: { xs: '40%', sm: '35%', md: '30%' } }}>
                  <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal' }}>
                    {rubro.nombre || 'Sin nombre'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: { xs: '20%', sm: '15%', md: '15%' } }}>
                  <Chip 
                    label={rubro.codigo || 'Sin código'} 
                    size="small"
                    sx={{ 
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      fontWeight: 500
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color="text.primary"
                  >
                    {rubro.cantidadArticulos}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color="text.primary"
                  >
                    {rubro.cantidadProveedores}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Ver detalles">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleViewRubro(rubro)}
                        sx={{ p: 0.75 }}
                      >
                        <IconEye size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar rubro">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleEditRubro(rubro)}
                        sx={{ p: 0.75 }}
                      >
                        <IconEdit size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar rubro">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteRubro(rubro)}
                        sx={{ p: 0.75 }}
                      >
                        <IconTrash size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      {/* Menú de filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenuColumna}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'nombre' && 'Filtrar por Nombre'}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroColInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter' && columnaActiva) {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: filtroColInput }));
                  setPage(0);
                  cerrarMenuColumna();
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => { setFiltroColInput(''); }}>Limpiar</Button>
              <Button size="small" variant="contained" color="success" onClick={() => {
                if (!columnaActiva) return;
                setFiltrosColumna((p) => ({ ...p, [columnaActiva!]: filtroColInput }));
                setPage(0);
                cerrarMenuColumna();
              }}>Aplicar</Button>
            </Stack>
          </Box>
        )}
      </Menu>

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
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, total)} de ${total}`}
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
                        bgcolor: verde.primary,
                        color: 'white',
                        '&:hover': { bgcolor: verde.primaryHover }
                      } : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: verde.rowHover }
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
    </Paper>
  );
};

export default TablaRubros;
