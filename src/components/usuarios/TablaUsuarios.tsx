'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Stack,
  Divider,
  MenuItem,
} from '@mui/material';
import PaginacionMudras from '@/components/ui/PaginacionMudras';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@apollo/client/react';
import {
  IconSearch,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconPlus,
  IconDotsVertical,
  IconUserShield,
} from '@tabler/icons-react';

import { USUARIOS_ADMIN_QUERY } from './graphql/queries';
import { grisNeutro, azul, rojo } from '@/ui/colores';

import ModalNuevoUsuario from './ModalNuevoUsuario';
import ModalEditarUsuario from './ModalEditarUsuario';
import ModalEliminarUsuario from './ModalEliminarUsuario';
import ModalAsignarRoles from './ModalAsignarRoles';

export interface UsuarioListado {
  id: string;
  username: string | null;
  email: string | null;
  displayName: string;
  userType: 'EMPRESA' | 'CLIENTE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: string[];
}

interface UsuariosAdminQueryResponse {
  usuariosAdmin: {
    total: number;
    items: Array<{
      id: string;
      username: string | null;
      email: string | null;
      displayName: string;
      userType: 'EMPRESA' | 'CLIENTE';
      isActive: boolean;
      mustChangePassword: boolean;
      createdAt: string;
      updatedAt: string;
      roles: string[];
    }>;
  };
}

interface UsuariosAdminQueryVariables {
  filtros: {
    pagina?: number;
    limite?: number;
    busqueda?: string;
    username?: string;
    email?: string;
    nombre?: string;
    estado?: string;
  };
}

interface Props {
  onRefetch?: () => void;
}

const TablaUsuarios: React.FC<Props> = () => {
  const tableTopRef = React.useRef<HTMLDivElement>(null);
  /* ---------- Estado de tabla / filtros ---------- */
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  // Filtros
  const [filtroInput, setFiltroInput] = useState('');
  const [filtro, setFiltro] = useState('');

  // Filtros por columna
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'username' | 'email' | 'nombre' | 'estado'>(null);
  const [filtroColInput, setFiltroColInput] = useState('');
  const [filtrosColumna, setFiltrosColumna] = useState({
    username: '',
    email: '',
    nombre: '',
    estado: '',
  });

  // Modales
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [modalRolesOpen, setModalRolesOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioListado | null>(null);

  /* ---------- Query ---------- */
  const filtrosVariables = useMemo(() => ({
    filtros: {
      pagina: page,
      limite: rowsPerPage,
      busqueda: filtro || undefined,
      username: filtrosColumna.username || undefined,
      email: filtrosColumna.email || undefined,
      nombre: filtrosColumna.nombre || undefined,
      estado: filtrosColumna.estado || undefined,
    }
  }), [page, rowsPerPage, filtro, filtrosColumna]);

  const { data, loading, error, refetch } = useQuery<UsuariosAdminQueryResponse, UsuariosAdminQueryVariables>(USUARIOS_ADMIN_QUERY, {
    variables: filtrosVariables,
    fetchPolicy: 'cache-and-network',
  });

  const usuarios = useMemo(() => {
    if (!data?.usuariosAdmin?.items) return [];
    return data.usuariosAdmin.items.map(u => ({
      id: u.id,
      username: u.username ?? null,
      email: u.email ?? null,
      displayName: u.displayName,
      userType: u.userType,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      roles: u.roles,
    }));
  }, [data]);

  const total = data?.usuariosAdmin?.total ?? 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------- Handlers ---------- */
  const handleNuevoUsuario = () => {
    setUsuarioSeleccionado(null);
    setModalNuevoOpen(true);
  };

  const handleEditarUsuario = (usuario: UsuarioListado) => {
    setUsuarioSeleccionado(usuario);
    setModalEditarOpen(true);
  };

  const handleRolesUsuario = (usuario: UsuarioListado) => {
    setUsuarioSeleccionado(usuario);
    setModalRolesOpen(true);
  };

  const handleEliminarUsuario = (usuario: UsuarioListado) => {
    setUsuarioSeleccionado(usuario);
    setModalEliminarOpen(true);
  };

  const cerrarModales = () => {
    setModalNuevoOpen(false);
    setModalEditarOpen(false);
    setModalEliminarOpen(false);
    setModalRolesOpen(false);
    setUsuarioSeleccionado(null);
  };

  const onSuccessAction = () => {
    refetch();
    // cerrarModales se llama dentro de los modales usualmente o aquí si los modales lo requieren
  };

  /* ---------- Filtros Headers ---------- */
  const abrirMenuColumna = (col: typeof columnaActiva) => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
    if (col) setFiltroColInput(filtrosColumna[col]);
    setMenuAnchor(e.currentTarget);
  };

  const cerrarMenuColumna = () => {
    setMenuAnchor(null);
    setColumnaActiva(null);
  };

  const aplicarFiltroColumna = () => {
    if (!columnaActiva) return;
    setFiltrosColumna(prev => ({ ...prev, [columnaActiva]: filtroColInput }));
    setPage(0);
    cerrarMenuColumna();
  };

  const limpiarFiltroColumna = () => {
    if (!columnaActiva) return;
    setFiltroColInput('');
    setFiltrosColumna(prev => ({ ...prev, [columnaActiva]: '' }));
  };

  const limpiarTodosFiltros = () => {
    setFiltro('');
    setFiltroInput('');
    setFiltrosColumna({ username: '', email: '', nombre: '', estado: '' });
    setPage(0);
  };

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
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={handleNuevoUsuario}
          disableElevation
          sx={{
            borderRadius: 0,
            textTransform: 'none',
            bgcolor: grisNeutro.primary, // Neutral Gray
            fontWeight: 600,
            px: 3,
            py: 1,
            '&:hover': { bgcolor: grisNeutro.primaryHover }
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          placeholder="Buscar usuarios..."
          size="small"
          value={filtroInput}
          onChange={(e) => setFiltroInput(e.target.value)}
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
              '&.Mui-focused fieldset': { borderColor: grisNeutro.primary },
            }
          }}
        />

        <Button
          variant="outlined"
          startIcon={<IconRefresh size={18} />}
          onClick={limpiarTodosFiltros}
          sx={{ borderRadius: 0, textTransform: 'none', color: '#757575', borderColor: '#e0e0e0', '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' } }}
        >
          Limpiar
        </Button>
      </Box>
    </Box>
  );

  /* ---------- Render Colores Roles ---------- */
  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('admin')) return { bg: '#ffebee', color: '#c62828' }; // Red
    if (r.includes('super')) return { bg: '#e8eaf6', color: '#283593' }; // Blue
    if (r === 'user' || r === 'usuario') return { bg: '#f1f8e9', color: '#33691e' }; // Green
    return { bg: '#fff3e0', color: '#ef6c00' }; // Orange/Warn default
  };

  /* ---------- Tabla ---------- */
  const tabla = (
    <TableContainer
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
            bgcolor: grisNeutro.tableStriped,
          },
          '& .MuiTableBody-root .MuiTableRow-root:hover': {
            bgcolor: alpha(grisNeutro.primary, 0.12),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: grisNeutro.tableHeader, // Neutral Header
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ '& th': { borderBottom: 'none' } }}>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                Username
                <Tooltip title="Filtrar columna">
                  <IconButton size="small" color="inherit" onClick={abrirMenuColumna('username')}>
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                Email
                <Tooltip title="Filtrar columna">
                  <IconButton size="small" color="inherit" onClick={abrirMenuColumna('email')}>
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                Nombre
                <Tooltip title="Filtrar columna">
                  <IconButton size="small" color="inherit" onClick={abrirMenuColumna('nombre')}>
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell>Roles</TableCell>
            <TableCell align="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                Estado
                <Tooltip title="Filtrar columna">
                  <IconButton size="small" color="inherit" onClick={abrirMenuColumna('estado')}>
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            // Simple loading state
            <TableRow><TableCell colSpan={6} align="center">Cargando...</TableCell></TableRow>
          ) : error ? (
            <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'error.main' }}>Error: {error.message}</TableCell></TableRow>
          ) : usuarios.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center">No hay usuarios.</TableCell></TableRow>
          ) : (
            usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{u.username || '-'}</Typography>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.displayName}</TableCell>
                <TableCell>
                  {(u.roles || []).map(role => {
                    const style = getRoleColor(role);
                    return (
                      <Chip
                        key={role}
                        label={role}
                        size="small"
                        sx={{
                          borderRadius: 0,
                          mr: 0.5,
                          bgcolor: style.bg,
                          color: style.color,
                          fontWeight: 600
                        }}
                      />
                    );
                  })}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={u.isActive ? 'Activo' : 'Inactivo'}
                    sx={{
                      borderRadius: 0,
                      bgcolor: u.isActive ? '#e8f5e9' : '#fff3e0',
                      color: u.isActive ? '#2e7d32' : '#e65100',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={0.5}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEditarUsuario(u)} sx={{ color: grisNeutro.primary }}>
                        <IconEdit size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Asignar Roles">
                      <IconButton size="small" onClick={() => handleRolesUsuario(u)} sx={{ color: grisNeutro.textStrong }}>
                        <IconUserShield size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleEliminarUsuario(u)} sx={{ color: rojo.primary }}>
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
  );

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {toolbar}

        <Box ref={tableTopRef} />
        <PaginacionMudras
          page={page}
          rowsPerPage={rowsPerPage}
          total={total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          itemLabel="usuarios"
          accentColor={azul.primary}
          rowsPerPageOptions={[20, 50, 100, 150]}
        />

        {tabla}

        <PaginacionMudras
          page={page}
          rowsPerPage={rowsPerPage}
          total={total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          itemLabel="usuarios"
          accentColor={azul.primary}
          rowsPerPageOptions={[20, 50, 100, 150]}
        />
      </Box>

      {/* Menu Filtros */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenuColumna}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          {columnaActiva === 'estado' ? (
            <Stack spacing={1}>
              {['Activo', 'Inactivo'].map(opt => (
                <Button
                  key={opt}
                  variant={filtrosColumna.estado === opt ? 'contained' : 'outlined'}
                  onClick={() => { setFiltrosColumna(prev => ({ ...prev, estado: opt })); setPage(0); cerrarMenuColumna(); }}
                >
                  {opt}
                </Button>
              ))}
              <Button onClick={limpiarFiltroColumna}>Limpiar</Button>
            </Stack>
          ) : (
            <>
              <TextField
                size="small"
                fullWidth
                placeholder="Filtrar..."
                value={filtroColInput}
                onChange={(e) => setFiltroColInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltroColumna(); }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                <Button size="small" onClick={limpiarFiltroColumna}>Limpiar</Button>
                <Button size="small" variant="contained" onClick={aplicarFiltroColumna}>Aplicar</Button>
              </Stack>
            </>
          )}
        </Box>
      </Menu>

      <ModalNuevoUsuario
        open={modalNuevoOpen}
        onClose={cerrarModales}
        onSuccess={onSuccessAction}
      />
      <ModalEditarUsuario
        open={modalEditarOpen}
        onClose={cerrarModales}
        usuario={usuarioSeleccionado}
        onSuccess={onSuccessAction}
      />
      <ModalEliminarUsuario
        open={modalEliminarOpen}
        onClose={cerrarModales}
        usuario={usuarioSeleccionado}
        onSuccess={onSuccessAction}
      />
      <ModalAsignarRoles
        open={modalRolesOpen}
        onClose={cerrarModales}
        usuario={usuarioSeleccionado}
        onSuccess={onSuccessAction}
      />
    </>
  );
};

export default TablaUsuarios;
