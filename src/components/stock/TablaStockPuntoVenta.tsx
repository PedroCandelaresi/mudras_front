'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { Icon } from '@iconify/react';
import { PuntoMudras } from '@/interfaces/puntos-mudras';
import { verde } from '@/ui/colores';

interface ArticuloStock {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stockAsignado: number;
  stockTotal: number;
  rubro: {
    id: number;
    Descripcion: string;
  };
}

interface Props {
  puntoVenta: PuntoMudras;
  onModificarStock: (articulo: any) => void;
  onNuevaAsignacion: () => void;
  refetchTrigger: number;
}

export default function TablaStockPuntoVenta({ puntoVenta, onModificarStock, onNuevaAsignacion, refetchTrigger }: Props) {
  const [articulos, setArticulos] = useState<ArticuloStock[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroInput, setFiltroInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Cargar datos reales de stock del punto
  useEffect(() => {
    const cargarStock = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query ObtenerStockPuntoMudras($puntoMudrasId: Int!) {
                obtenerStockPuntoMudras(puntoMudrasId: $puntoMudrasId) {
                  id
                  nombre
                  codigo
                  precio
                  stockAsignado
                  stockTotal
                  rubro {
                    Id
                    Rubro
                  }
                }
              }
            `,
            variables: {
              puntoMudrasId: puntoVenta.id
            }
          })
        });

        const result = await response.json();
        
        if (result.data?.obtenerStockPuntoMudras) {
          setArticulos(result.data.obtenerStockPuntoMudras);
          console.log(`📦 Cargados ${result.data.obtenerStockPuntoMudras.length} artículos para punto ${puntoVenta.nombre}`);
        } else {
          console.error('Error al cargar stock:', result.errors);
          setArticulos([]);
        }
      } catch (error) {
        console.error('Error al cargar stock del punto:', error);
        setArticulos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarStock();
  }, [puntoVenta.id, refetchTrigger]);

  const handleModificarStock = (articulo: ArticuloStock) => {
    onModificarStock({
      ...articulo,
      puntoVentaId: puntoVenta.id,
      puntoVentaNombre: puntoVenta.nombre
    });
  };

  // Mostrar loading o mensaje cuando no hay artículos
  if (loading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600} color={verde.textStrong}>
            Stock en {puntoVenta.nombre}
          </Typography>
        </Box>
        
        <Paper elevation={0} sx={{ border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
          <Box p={4} textAlign="center">
            <Icon icon="mdi:loading" width={48} height={48} color="#ccc" className="animate-spin" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Cargando stock del punto...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (articulos.length === 0) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600} color={verde.textStrong}>
            Stock en {puntoVenta.nombre}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Icon icon="mdi:plus" />}
            onClick={onNuevaAsignacion}
            sx={{ 
              bgcolor: verde.primary,
              '&:hover': { bgcolor: verde.primaryHover }
            }}
          >
            Nueva Asignación
          </Button>
        </Box>
        
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          <Box p={4} textAlign="center">
            <Icon icon="mdi:package-variant-closed" width={48} height={48} color="#ccc" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Este punto de venta no tiene stock asignado
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Los registros de stock se inicializaron automáticamente. Usa "Nueva Asignación" para asignar cantidades.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  const handleBuscar = () => {
    setFiltro(filtroInput);
  };

  const handleLimpiarFiltros = () => {
    setFiltro('');
    setFiltroInput('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleBuscar();
    }
  };

  // Filtrar artículos según el filtro aplicado
  const articulosFiltrados = articulos.filter(articulo => {
    if (!filtro) return true;
    return articulo.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
           articulo.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
           articulo.rubro.Descripcion.toLowerCase().includes(filtro.toLowerCase());
  });

  const totalPaginas = Math.ceil(articulosFiltrados.length / rowsPerPage);
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

  const articulosPaginados = articulosFiltrados.slice(
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

  return (
    <Box>
      {/* Header con título y controles */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600} color={verde.textStrong}>
          Stock en {puntoVenta.nombre}
        </Typography>
      </Box>

      {/* Toolbar con búsqueda y botones */}
      <Box display="flex" gap={2} mb={2} alignItems="center">
        <TextField
          placeholder="Buscar por código, nombre o rubro..."
          value={filtroInput}
          onChange={(e) => setFiltroInput(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="mdi:magnify" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={handleBuscar}
          startIcon={<Icon icon="mdi:magnify" />}
          size="small"
        >
          Buscar
        </Button>
        <Button
          variant="outlined"
          onClick={handleLimpiarFiltros}
          startIcon={<Icon icon="mdi:filter-off" />}
          size="small"
        >
          Limpiar Filtros
        </Button>
        <Button
          variant="contained"
          onClick={onNuevaAsignacion}
          startIcon={<Icon icon="mdi:plus" />}
          size="small"
          sx={{
            bgcolor: verde.primary,
            '&:hover': { bgcolor: verde.primaryHover }
          }}
        >
          Nueva Asignación
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Artículo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rubro</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Precio</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Stock Asignado</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Stock Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articulosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Icon icon="mdi:package-variant-closed" width={48} height={48} color="#ccc" />
                    <Typography variant="body2" color="text.secondary">
                      {articulos.length === 0 
                        ? 'No hay artículos asignados a este punto de venta'
                        : 'No se encontraron artículos con los filtros aplicados'
                      }
                    </Typography>
                    {articulos.length === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Usa el botón &quot;Nueva Asignación&quot; para agregar artículos
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              articulosPaginados.map((articulo) => (
                <TableRow key={articulo.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {articulo.codigo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {articulo.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={articulo.rubro.Descripcion}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      ${articulo.precio.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      color={articulo.stockAsignado > 0 ? verde.textStrong : 'text.secondary'}
                    >
                      {articulo.stockAsignado}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {articulo.stockTotal} artículos en el punto de venta &quot;{puntoVenta.nombre}&quot;
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {articulo.stockAsignado === 0 ? (
                      <Chip 
                        label="Sin stock" 
                        size="small" 
                        color="error" 
                        variant="outlined"
                      />
                    ) : articulo.stockAsignado <= 5 ? (
                      <Chip 
                        label="Stock bajo" 
                      />
                    ) : (
                      <Chip 
                        label="Disponible" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modificar stock">
                      <IconButton 
                        size="small" 
                        onClick={() => handleModificarStock(articulo)}
                        sx={{ color: verde.primary }}
                      >
                        <Icon icon="mdi:package-variant" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
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
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, articulosFiltrados.length)} de ${articulosFiltrados.length}`}
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

    </Box>
  );
}
