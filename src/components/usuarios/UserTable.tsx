"use client";

import React, { useState } from 'react';
import { Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography, TextField, InputAdornment, Menu, Divider, Stack } from '@mui/material';
import { IconEdit, IconTrash, IconUserShield, IconSearch, IconDotsVertical } from '@tabler/icons-react';
import { marron } from '@/ui/colores';
import { useQuery } from '@apollo/client/react';
import { USUARIOS_ADMIN_QUERY } from './graphql/queries';
import SearchToolbar from '@/components/ui/SearchToolbar';

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
  onCrear?: () => void;
  onEditar?: (u: UsuarioListado) => void;
  onRoles?: (u: UsuarioListado) => void;
  onEliminar?: (u: UsuarioListado) => void;
  refetchToken?: number | string;
  onlyType?: 'EMPRESA' | 'CLIENTE';
}

export function UserTable({ onCrear, onEditar, onRoles, onEliminar, refetchToken, onlyType }: Props) {
  const [pagina, setPagina] = useState(0);
  const [limite, setLimite] = useState(20);
  const [total, setTotal] = useState(0);
  const [usuarios, setUsuarios] = useState<UsuarioListado[]>([]);
  const [filtro, setFiltro] = useState(''); // filtro aplicado
  const [filtroInput, setFiltroInput] = useState(''); // valor tipeado en la barra
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'username' | 'email' | 'nombre' | 'estado'>(null);
  const [filtroColInput, setFiltroColInput] = useState<string>('');
  const [filtrosColumna, setFiltrosColumna] = useState({
    username: '',
    email: '',
    nombre: '',
    estado: '',
  });

  const filtrosVariables = React.useMemo(() => {
    const filtrosActivos = {
      pagina,
      limite,
      busqueda: filtro || undefined,
      username: filtrosColumna.username || undefined,
      email: filtrosColumna.email || undefined,
      nombre: filtrosColumna.nombre || undefined,
      estado: filtrosColumna.estado || undefined,
    };

    return {
      filtros: filtrosActivos,
    };
  }, [pagina, limite, filtro, filtrosColumna]);

  const { data, loading, error, refetch } = useQuery<UsuariosAdminQueryResponse, UsuariosAdminQueryVariables>(USUARIOS_ADMIN_QUERY, {
    variables: filtrosVariables,
    fetchPolicy: 'cache-and-network',
  });

  React.useEffect(() => {
    if (refetchToken !== undefined) {
      refetch(filtrosVariables);
    }
  }, [refetchToken, refetch, filtrosVariables]);

  React.useEffect(() => {
    if (!data?.usuariosAdmin) return;
    const { total: totalUsuarios, items } = data.usuariosAdmin;
    const mapeados = items.map((usuario) => ({
      id: usuario.id,
      username: usuario.username ?? null,
      email: usuario.email ?? null,
      displayName: usuario.displayName,
      userType: usuario.userType,
      isActive: usuario.isActive,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
      roles: usuario.roles,
    }));
    const filtrados = onlyType ? mapeados.filter((u) => u.userType === onlyType) : mapeados;
    setTotal(onlyType ? filtrados.length : totalUsuarios);
    setUsuarios(filtrados);
  }, [data, onlyType]);

  const limpiarFiltros = () => {
    setFiltro('');
    setFiltroInput('');
    setFiltrosColumna({ username: '', email: '', nombre: '', estado: '' });
    setColumnaActiva(null);
    setMenuAnchor(null);
    setPagina(0);
  };

  const abrirMenuColumna = (col: typeof columnaActiva) => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
    if (col) setFiltroColInput(filtrosColumna[col]);
    setMenuAnchor(e.currentTarget);
  };
  const cerrarMenuColumna = () => {
    setMenuAnchor(null);
    setColumnaActiva(null);
  };

  const toolbar = (
    <Box
      sx={{
        px: 1,
        py: 1,
        bgcolor: marron.toolbarBg,
        border: '1px solid',
        borderColor: marron.toolbarBorder,
        borderRadius: 1,
        marginTop: 0,
      }}
    >
      <SearchToolbar
        title="Usuarios"
        baseColor={marron.primary}
        placeholder="Buscar usuarios..."
        searchValue={filtroInput}
        onSearchValueChange={setFiltroInput}
        onSubmitSearch={() => { setFiltro(filtroInput); setPagina(0); }}
        onClear={() => { limpiarFiltros(); setPagina(0); }}
        canCreate={Boolean(onCrear)}
        createLabel="Nuevo Usuario"
        onCreateClick={onCrear}
        searchDisabled={loading}
      />
      {loading && (
        <Box display="flex" justifyContent="flex-end" mt={0.5}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Box>
  );

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
        {toolbar}
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6" mb={2}>
            Error al cargar usuarios
          </Typography>
          <Typography color="text.secondary" mb={2}>
            {error.message}
          </Typography>
          <Button variant="outlined" onClick={() => refetch(filtrosVariables)}>
            Reintentar
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
      {toolbar}

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: marron.borderInner, bgcolor: 'background.paper', mt: 2 }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: marron.headerBg, color: marron.headerText } }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <TableRow sx={{ bgcolor: marron.headerBg, '& th': { top: 0, position: 'sticky', zIndex: 5 }, '& th:first-of-type': { borderTopLeftRadius: 0 }, '& th:last-of-type': { borderTopRightRadius: 0 } }}>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7', borderBottom: '3px solid', borderColor: '#a1887f' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Username
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('username')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7', borderBottom: '3px solid', borderColor: '#a1887f' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Email
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('email')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7', borderBottom: '3px solid', borderColor: '#a1887f' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Nombre
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('nombre')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7', borderBottom: '3px solid', borderColor: '#a1887f' }}>
                Tipo
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7', borderBottom: '3px solid', borderColor: '#a1887f' }}>
                Roles
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7', borderBottom: '3px solid', borderColor: '#a1887f' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Estado
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" color="inherit" onClick={abrirMenuColumna('estado')}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: marron.headerText, borderBottom: '3px solid', borderColor: marron.headerBorder }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            {usuarios.map((u, idx) => (
              <TableRow
                key={u.id}
                sx={{
                  bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit',
                  '&:hover': { bgcolor: marron.rowHover },
                }}
              >
                <TableCell>{u.username ?? '-'}</TableCell>
                <TableCell>{u.email ?? '-'}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal' }}>
                    {u.displayName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={u.userType} sx={{ bgcolor: marron.chipBg, color: marron.chipText, fontWeight: 500 }} />
                </TableCell>
                <TableCell>
                  {(u.roles ?? []).map((r) => (
                    <Chip key={r} label={r} size="small" sx={{ mr: 0.5, bgcolor: marron.toolbarBg, color: marron.headerBg }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={u.isActive ? 'Activo' : 'Inactivo'} sx={{ bgcolor: u.isActive ? '#c8e6c9' : '#fff3e0', color: u.isActive ? '#1b5e20' : '#ef6c00' }} />
                </TableCell>
                <TableCell align="center">
                  {onEditar && (
                    <Tooltip title="Editar">
                      <IconButton onClick={() => onEditar(u)} size="small" sx={{ p: 0.75, color: marron.primary }}>
                        <IconEdit size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onRoles && (
                    <Tooltip title="Roles">
                      <IconButton onClick={() => onRoles(u)} size="small" sx={{ p: 0.75, color: marron.primary }}>
                        <IconUserShield size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onEliminar && (
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => onEliminar(u)} size="small" sx={{ p: 0.75 }}>
                        <IconTrash size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
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
          {columnaActiva === 'username' && 'Filtrar por Username'}
          {columnaActiva === 'email' && 'Filtrar por Email'}
          {columnaActiva === 'nombre' && 'Filtrar por Nombre'}
          {columnaActiva === 'estado' && 'Filtrar por Estado'}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {columnaActiva && (
          <Box px={1} pb={1}>
            {columnaActiva === 'estado' ? (
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['Activo', 'Inactivo'].map((op) => (
                    <Button
                      key={op}
                      size="small"
                      variant={filtrosColumna.estado === op ? 'contained' : 'outlined'}
                      sx={{ textTransform: 'none', bgcolor: filtrosColumna.estado === op ? '#8d6e63' : 'inherit', color: filtrosColumna.estado === op ? 'white' : 'inherit' }}
                      onClick={() => { setFiltrosColumna((p) => ({ ...p, estado: op })); setPagina(0); cerrarMenuColumna(); }}
                    >
                      {op}
                    </Button>
                  ))}
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Button size="small" onClick={() => { setFiltrosColumna((p) => ({ ...p, estado: '' })); setPagina(0); cerrarMenuColumna(); }}>Limpiar</Button>
                </Stack>
              </Stack>
            ) : (
              <>
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
                      setPagina(0);
                      cerrarMenuColumna();
                    }
                  }}
                />
                <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
                  <Button size="small" onClick={() => { setFiltroColInput(''); }}>Limpiar</Button>
                  <Button size="small" variant="contained" sx={{ bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }} onClick={() => {
                    if (!columnaActiva) return;
                    setFiltrosColumna((p) => ({ ...p, [columnaActiva!]: filtroColInput }));
                    setPagina(0);
                    cerrarMenuColumna();
                  }}>Aplicar</Button>
                </Stack>
              </>
            )}
          </Box>
        )}
      </Menu>

      <Box mt={1} mb={1} display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Mostrando {usuarios.length} usuarios en esta página.
        </Typography>
      </Box>

      <TablePagination
        component="div"
        count={total}
        page={pagina}
        onPageChange={(_, p) => setPagina(p)}
        rowsPerPage={limite}
        onRowsPerPageChange={(e) => { setLimite(parseInt(e.target.value, 10)); setPagina(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Paper>
  );
}
