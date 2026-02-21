// /src/components/rubros/TablaRubros.tsx
'use client';

import {
  Box,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Tooltip,
  Typography,
  InputAdornment,
  TextField,
  IconButton,
  Skeleton,
  Menu,
  Divider,
  Button,
  MenuItem,
} from '@mui/material';
import PaginacionMudras from '@/components/ui/PaginacionMudras';
import { alpha } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  IconSearch,
  IconCategory,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconDotsVertical,
} from '@tabler/icons-react';
import { BUSCAR_RUBROS } from '@/components/rubros/graphql/queries';
import { ELIMINAR_RUBRO } from '@/components/rubros/graphql/mutations';
import type { BuscarRubrosResponse, RubroConEstadisticas } from '@/app/interfaces/graphql.types';
import { verdeMilitar, azul, rojo } from '@/ui/colores';
import ModalEditarRubro from './ModalEditarRubro';
import ModalDetallesRubro from './ModalDetallesRubro';
import ModalEliminarRubro from './ModalEliminarRubro';

type Props = {
  onNuevoRubro?: () => void;
  puedeCrear?: boolean;
};

type TablaRubrosUiState = {
  page: number;
  rowsPerPage: number;
  filtroInput: string;
  filtro: string;
  filtrosColumna: ColFilters;
};

const tablaRubrosUiStateCache = new Map<string, TablaRubrosUiState>();

interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

type RubroParaModal = {
  id: number;
  nombre: string;
  codigo?: string;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
  unidadMedida?: string;
};

/* ======================== Tipos de filtros por columna ======================== */
type ColKey = 'nombre' | 'codigo';
type ColFilters = Partial<Record<ColKey, string>>;

const TablaRubros: React.FC<Props> = ({ onNuevoRubro, puedeCrear = true }) => {
  const cacheKey = 'tabla-rubros';
  const cachedState = tablaRubrosUiStateCache.get(cacheKey);
  /* ---------- Estado de tabla / filtros ---------- */
  const [page, setPage] = useState(cachedState?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(cachedState?.rowsPerPage ?? 150);
  const tableTopRef = React.useRef<HTMLDivElement>(null);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const pendingRestoreScrollTopRef = React.useRef<number | null>(null);

  // Buscador general (input) y aplicado (filtro)
  const [filtroInput, setFiltroInput] = useState(cachedState?.filtroInput ?? '');
  const [filtro, setFiltro] = useState(cachedState?.filtro ?? ''); // lo que viaja al servidor

  // Filtros por columna (UI + aplicado)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | ColKey>(null);
  const [filtroColInput, setFiltroColInput] = useState('');
  const [filtrosColumna, setFiltrosColumna] = useState<ColFilters>(cachedState?.filtrosColumna ?? { nombre: '', codigo: '' });

  // Modales
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<RubroParaModal | null>(null);
  const [textoConfirmacion, setTextoConfirmacion] = useState('');

  React.useEffect(() => {
    tablaRubrosUiStateCache.set(cacheKey, {
      page,
      rowsPerPage,
      filtroInput,
      filtro,
      filtrosColumna,
    });
  }, [cacheKey, page, rowsPerPage, filtroInput, filtro, filtrosColumna]);

  /* ---------- Build del término de búsqueda para el servidor ---------- */
  const busquedaServidor = useMemo(() => {
    const partes = [filtroInput, filtrosColumna.nombre, filtrosColumna.codigo]
      .map((s) => (s || '').trim())
      .filter(Boolean);
    // El filtro "aplicado" es la unión; así los filtros de header impactan en la query
    return (partes.join(' ') || filtro || undefined);
  }, [filtroInput, filtrosColumna, filtro]);

  /* ---------- Query ---------- */
  const { data, loading, error, refetch } = useQuery<BuscarRubrosResponse>(BUSCAR_RUBROS, {
    variables: { pagina: page, limite: rowsPerPage, busqueda: busquedaServidor },
    fetchPolicy: 'cache-and-network',
  });

  const refetchKeepingScroll = React.useCallback(() => {
    const current = tableContainerRef.current;
    if (current) pendingRestoreScrollTopRef.current = current.scrollTop;
    return refetch();
  }, [refetch]);

  const [eliminarRubro] = useMutation(ELIMINAR_RUBRO);

  /* ---------- Handlers de header filters (como Proveedores) ---------- */
  const abrirMenuColumna = (col: ColKey) => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
    setFiltroColInput(filtrosColumna[col] || '');
    setMenuAnchor(e.currentTarget);
  };
  const cerrarMenuColumna = () => {
    setMenuAnchor(null);
    setColumnaActiva(null);
  };
  const aplicarFiltroColumna = () => {
    if (!columnaActiva) return;
    setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: filtroColInput }));
    setPage(0);
    cerrarMenuColumna();
    // update el "filtro" aplicado para forzar refetch con la combinación
    setFiltro((prev) => prev); // noop: dependemos de busquedaServidor (useMemo) y state cambiados
    refetchKeepingScroll();
  };
  const limpiarFiltroColumna = () => {
    if (!columnaActiva) return;
    setFiltroColInput('');
    setFiltrosColumna((prev) => ({ ...prev, [columnaActiva]: '' }));
  };

  /* ---------- Acciones de fila ---------- */
  const handleViewRubro = (rubro: RubroConEstadisticas) => {
    setRubroSeleccionado({
      id: rubro.id,
      nombre: rubro.nombre,
      codigo: rubro.codigo,
      porcentajeRecargo: rubro.porcentajeRecargo,
      porcentajeDescuento: rubro.porcentajeDescuento,
      cantidadArticulos: rubro.cantidadArticulos,
      cantidadProveedores: rubro.cantidadProveedores,
      unidadMedida: (rubro as any).unidadMedida,
    });
    setModalDetallesOpen(true);
  };

  const handleEditRubro = (rubro: RubroConEstadisticas) => {
    setRubroSeleccionado({
      id: rubro.id,
      nombre: rubro.nombre,
      codigo: rubro.codigo,
      porcentajeRecargo: rubro.porcentajeRecargo,
      porcentajeDescuento: rubro.porcentajeDescuento,
      cantidadArticulos: rubro.cantidadArticulos,
      cantidadProveedores: rubro.cantidadProveedores,
      unidadMedida: (rubro as any).unidadMedida,
    });
    setModalEditarOpen(true);
  };

  const handleDeleteRubro = (rubro: RubroConEstadisticas) => {
    setRubroSeleccionado({
      id: rubro.id,
      nombre: rubro.nombre,
      codigo: rubro.codigo,
      porcentajeRecargo: rubro.porcentajeRecargo,
      porcentajeDescuento: rubro.porcentajeDescuento,
      cantidadArticulos: rubro.cantidadArticulos,
      cantidadProveedores: rubro.cantidadProveedores,
      unidadMedida: (rubro as any).unidadMedida,
    });
    setTextoConfirmacion('');
    setModalEliminarOpen(true);
  };

  const handleNuevoRubro = () => {
    setRubroSeleccionado(null);
    setModalEditarOpen(true);
  };

  const cerrarModales = () => {
    setModalEditarOpen(false);
    setModalDetallesOpen(false);
    setModalEliminarOpen(false);
    setRubroSeleccionado(null);
    setTextoConfirmacion('');
  };

  const confirmarEliminacion = async () => {
    if (rubroSeleccionado && textoConfirmacion === 'ELIMINAR') {
      try {
        await eliminarRubro({ variables: { id: rubroSeleccionado.id } });
        cerrarModales();
        refetchKeepingScroll();
      } catch (err: any) {
        console.error('Error al eliminar rubro:', err);
        alert('Ocurrió un error al eliminar el rubro: ' + (err.message || 'Desconocido'));
      }
    }
  };

  /* ---------- Paginación ---------- */
  const rubros = data?.buscarRubros?.rubros ?? [];
  const total = data?.buscarRubros?.total ?? 0;
  const totalPaginas = Math.ceil(total / rowsPerPage);
  const paginaActual = page + 1;



  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const limpiarFiltros = () => {
    setFiltro('');
    setFiltroInput('');
    setFiltrosColumna({ nombre: '', codigo: '' });
    setPage(0);
    refetchKeepingScroll();
  };

  React.useEffect(() => {
    if (loading) return;
    const prevTop = pendingRestoreScrollTopRef.current;
    if (prevTop == null) return;
    pendingRestoreScrollTopRef.current = null;
    requestAnimationFrame(() => {
      if (tableContainerRef.current) tableContainerRef.current.scrollTop = prevTop;
    });
  }, [loading, rubros.length]);

  /* ---------- Toolbar ---------- */
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
      <Box display="flex" alignItems="center" gap={1}>
        {puedeCrear && (
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={onNuevoRubro || handleNuevoRubro}
            disableElevation
            sx={{
              borderRadius: 0,
              textTransform: 'none',
              bgcolor: verdeMilitar.primary,
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': { bgcolor: verdeMilitar.primaryHover }
            }}
          >
            Nuevo Rubro
          </Button>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          placeholder="Buscar rubros..."
          size="small"
          value={filtroInput}
          onChange={(e) => { setFiltroInput(e.target.value); setPage(0); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setFiltro(filtroInput);
              setPage(0);
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} color="#757575" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              bgcolor: '#f5f5f5',
              '& fieldset': { borderColor: '#e0e0e0' },
              '&:hover fieldset': { borderColor: '#bdbdbd' },
              '&.Mui-focused fieldset': { borderColor: verdeMilitar.primary },
            }
          }}
        />

        <Button
          variant="outlined"
          startIcon={<IconRefresh size={18} />}
          onClick={limpiarFiltros}
          sx={{ borderRadius: 0, textTransform: 'none', color: '#757575', borderColor: '#e0e0e0', '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' } }}
        >
          Limpiar
        </Button>
      </Box>
    </Box>
  );

  /* ---------- Tabla ---------- */
  const tabla = (
    <TableContainer
      ref={tableContainerRef}
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 0,
        border: '1px solid #e0e0e0',
        bgcolor: '#ffffff',
        overflow: 'auto',
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          minWidth: 700,
          '& .MuiTableRow-root': {
            minHeight: 56, // Compact
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
            bgcolor: verdeMilitar.tableStriped || '#f6f9f4',
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover': {
            bgcolor: alpha(verdeMilitar.primary, 0.12),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: verdeMilitar.tableHeader || '#68823b',
            color: '#ffffff', // White text
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: verdeMilitar.tableHeader || '#68823b', color: '#ffffff', fontWeight: 600, letterSpacing: 0.5, borderRadius: 0 } }}>
            {/* Nombre + menú de filtro como Proveedores */}
            <TableCell align="left">
              <Box display="flex" alignItems="center" gap={1}>
                Nombre
                <Tooltip title="Filtrar columna">
                  <IconButton
                    size="small" color="inherit"
                    aria-label="Filtrar columna nombre"
                    aria-haspopup="menu"
                    onClick={abrirMenuColumna('nombre')}
                    sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            {/* Código + menú de filtro */}
            <TableCell align="left">
              <Box display="flex" alignItems="center" gap={1}>
                Código
                <Tooltip title="Filtrar columna">
                  <IconButton
                    size="small" color="inherit"
                    aria-label="Filtrar columna código"
                    aria-haspopup="menu"
                    onClick={abrirMenuColumna('codigo')}
                    sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            <TableCell align="center">Artículos</TableCell>
            <TableCell align="center">Proveedores</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rubros.map((rubro) => (
            <TableRow key={rubro.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={<IconCategory size={18} />}
                    size="medium"
                    sx={{
                      bgcolor: verdeMilitar.primary,
                      borderRadius: 0, // Flat Chip
                      color: '#fff',
                      height: 32,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                  <Typography variant="body2" fontWeight={600}>{rubro.nombre}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                  {rubro.codigo || 'Sin código'}
                </Typography>
              </TableCell>
              <TableCell align="center">{rubro.cantidadArticulos != null ? rubro.cantidadArticulos : 0}</TableCell>
              <TableCell align="center">{rubro.cantidadProveedores != null ? rubro.cantidadProveedores : 0}</TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={0.5}>
                  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      onClick={() => handleViewRubro(rubro as RubroConEstadisticas)}
                      sx={{ color: azul.primary, '&:hover': { bgcolor: alpha(azul.primary, 0.1) } }}
                    >
                      <IconEye size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => handleEditRubro(rubro as RubroConEstadisticas)}
                      sx={{ color: verdeMilitar.primary, '&:hover': { bgcolor: alpha(verdeMilitar.primary, 0.1) } }}
                    >
                      <IconEdit size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRubro(rubro as RubroConEstadisticas)}
                      sx={{ color: rojo.primary || '#d32f2f', '&:hover': { bgcolor: alpha(rojo.primary || '#d32f2f', 0.1) } }}
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
  );

  /* ---------- Menú de filtros por columna (idéntico patrón a Proveedores) ---------- */
  const menuFiltros = (
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
            placeholder="Escribe para filtrar…"
            value={filtroColInput}
            onChange={(e) => setFiltroColInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                aplicarFiltroColumna();
              }
            }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
            <Button
              size="small"
              onClick={limpiarFiltroColumna}
              sx={{ textTransform: 'none', color: '#757575' }}
            >
              Limpiar
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={aplicarFiltroColumna}
              sx={{ borderRadius: 0, bgcolor: verdeMilitar.primary, textTransform: 'none', '&:hover': { bgcolor: verdeMilitar.primaryHover } }}
            >
              Aplicar
            </Button>
          </Stack>
        </Box>
      )}
    </Menu>
  );

  /* ---------- Paginador ---------- */

  /* ======================== Loading / Error ======================== */
  if (loading && !data) {
    return (
      <Paper elevation={0} sx={{ p: 0, borderRadius: 0, bgcolor: 'transparent' }}>
        <Box sx={{ px: 1, py: 1, mb: 2 }}>
          <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 0 }} />
        </Box>
        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 0 }} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 0, border: '1px solid #e0e0e0' }}>
        {toolbar}
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6" mb={2} fontWeight={700}>
            Error al cargar rubros
          </Typography>
          <Typography color="text.secondary" mb={2}>
            {error.message}
          </Typography>
          <Button
            variant="contained"
            startIcon={<IconRefresh />}
            onClick={() => refetchKeepingScroll()}
            sx={{ borderRadius: 0, textTransform: 'none', bgcolor: azul.primary }}
          >
            Reintentar
          </Button>
        </Box>
      </Paper>
    );
  }

  /* ---------- Render ---------- */
  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box ref={tableTopRef} />
        {toolbar}
        <PaginacionMudras
          page={page}
          rowsPerPage={rowsPerPage}
          total={total}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          itemLabel="rubros"
          accentColor={verdeMilitar.primary}
          rowsPerPageOptions={[50, 100, 150, 300, 500]}
        />
        {tabla}
        <PaginacionMudras
          page={page}
          rowsPerPage={rowsPerPage}
          total={total}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          itemLabel="rubros"
          accentColor={verdeMilitar.primary}
          rowsPerPageOptions={[50, 100, 150, 300, 500]}
        />
      </Box>

      {menuFiltros}

      <ModalEditarRubro
        open={modalEditarOpen}
        onClose={cerrarModales}
        rubro={rubroSeleccionado}
        onSuccess={refetchKeepingScroll}
        accentColor={verdeMilitar.primary}
      />

      <ModalDetallesRubro open={modalDetallesOpen} onClose={cerrarModales} rubro={rubroSeleccionado} />

      <ModalEliminarRubro
        open={modalEliminarOpen}
        onClose={cerrarModales}
        onConfirm={confirmarEliminacion}
        rubro={rubroSeleccionado}
        textoConfirmacion={textoConfirmacion}
        setTextoConfirmacion={setTextoConfirmacion}
      />
    </>
  );
};

export default TablaRubros;
