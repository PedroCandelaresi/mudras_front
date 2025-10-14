"use client";

import React from 'react';
import { Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography, TextField, InputAdornment, Menu, Divider, Stack } from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { IconSearch } from '@tabler/icons-react';
import { marron } from '@/ui/colores';
import { useQuery, useMutation } from '@apollo/client/react';
import { USUARIOS_INTERNOS_QUERY, CREAR_USUARIO_INTERNO_MUT, ACTUALIZAR_USUARIO_INTERNO_MUT, ELIMINAR_USUARIO_INTERNO_MUT, type UsuarioInterno } from './graphql/internos';
import { CreateInternalUserModal, type CrearUsuarioInternoForm } from './CreateInternalUserModal';
import { EditInternalUserModal, type EditarUsuarioInternoForm } from './EditInternalUserModal';
import { DeleteInternalUserDialog } from './DeleteInternalUserDialog';

interface Props {
  refetchToken?: number | string;
}

export function InternalUsersTable({ refetchToken }: Props) {
  const [crearAbierto, setCrearAbierto] = React.useState(false);
  const [editarAbierto, setEditarAbierto] = React.useState(false);
  const [eliminarAbierto, setEliminarAbierto] = React.useState(false);
  const [usuarioSel, setUsuarioSel] = React.useState<UsuarioInterno | null>(null);
  const [pagina, setPagina] = React.useState(0);
  const [limite, setLimite] = React.useState(20);
  const [filtro, setFiltro] = React.useState('');
  const [filtroInput, setFiltroInput] = React.useState('');

  const { data, loading, error, refetch } = useQuery<{ usuarios: UsuarioInterno[] }>(USUARIOS_INTERNOS_QUERY, { fetchPolicy: 'cache-and-network' });
  const [crearUsuario] = useMutation(CREAR_USUARIO_INTERNO_MUT);
  const [actualizarUsuario] = useMutation(ACTUALIZAR_USUARIO_INTERNO_MUT);
  const [eliminarUsuario] = useMutation(ELIMINAR_USUARIO_INTERNO_MUT);

  React.useEffect(() => { if (refetchToken !== undefined) { refetch(); } }, [refetchToken, refetch]);

  const usuarios = React.useMemo(() => {
    const items = data?.usuarios ?? [];
    if (!filtro.trim()) return items;
    const t = filtro.trim().toLowerCase();
    return items.filter(u => [u.nombre, u.apellido, u.username, u.email].some(v => (v || '').toLowerCase().includes(t)));
  }, [data, filtro]);

  const paginados = React.useMemo(() => usuarios.slice(pagina * limite, pagina * limite + limite), [usuarios, pagina, limite]);

  const onCrear = async (form: CrearUsuarioInternoForm) => {
    await crearUsuario({ variables: { input: { ...form, salario: form.salario ?? 0 } } });
    setCrearAbierto(false);
    await refetch();
  };

  const onGuardar = async (form: EditarUsuarioInternoForm) => {
    if (!usuarioSel) return;
    await actualizarUsuario({ variables: { id: usuarioSel.id, input: form } });
    setEditarAbierto(false);
    await refetch();
  };

  const onEliminar = async () => {
    if (!usuarioSel) return;
    await eliminarUsuario({ variables: { id: usuarioSel.id } });
    setEliminarAbierto(false);
    await refetch();
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, bgcolor: marron.toolbarBg, border: '1px solid', borderColor: marron.toolbarBorder, borderRadius: 1 }}>
        <Typography variant="h6" fontWeight={700} color={marron.textStrong}>Empleados (internos)</Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Button variant="contained" onClick={() => setCrearAbierto(true)} sx={{ textTransform: 'none', bgcolor: marron.primary, '&:hover': { bgcolor: marron.primaryHover } }}>
            Nuevo empleado
          </Button>
          <TextField
            size="small"
            placeholder="Buscar..."
            value={filtroInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltroInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { setFiltro(filtroInput); setPagina(0); } }}
            InputProps={{ startAdornment: (
              <InputAdornment position="start"><IconSearch size={18} /></InputAdornment>
            )}}
            sx={{ minWidth: 240 }}
          />
          <Button variant="contained" onClick={() => { setFiltro(filtroInput); setPagina(0); }} sx={{ textTransform: 'none', bgcolor: marron.primary, '&:hover': { bgcolor: marron.primaryHover } }} startIcon={<IconSearch size={18} />}>Buscar</Button>
          {loading && <CircularProgress size={20} />}
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: marron.borderInner, bgcolor: 'background.paper', mt: 2 }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: marron.headerBg, color: marron.headerText } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7' }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fbe9e7' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginados.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.nombre} {u.apellido}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip size="small" label={u.rol} /></TableCell>
                <TableCell>
                  <Chip size="small" color={u.estado === 'ACTIVO' ? 'success' : u.estado === 'SUSPENDIDO' ? 'warning' : 'default'} label={u.estado} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar"><span><IconButton size="small" onClick={() => { setUsuarioSel(u); setEditarAbierto(true); }}><IconEdit size={18} /></IconButton></span></Tooltip>
                  <Tooltip title="Eliminar"><span><IconButton size="small" color="error" onClick={() => { setUsuarioSel(u); setEliminarAbierto(true); }}><IconTrash size={18} /></IconButton></span></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && paginados.length === 0 && (
              <TableRow><TableCell colSpan={6}><Typography variant="body2" color="text.secondary">Sin resultados</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={usuarios.length}
        page={pagina}
        onPageChange={(_e, p) => setPagina(p)}
        rowsPerPage={limite}
        onRowsPerPageChange={(e) => { setLimite(parseInt(e.target.value, 10)); setPagina(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />

      {/* Modales */}
      <CreateInternalUserModal open={crearAbierto} onClose={() => setCrearAbierto(false)} onSubmit={onCrear} />
      <EditInternalUserModal open={editarAbierto} usuario={usuarioSel} onClose={() => setEditarAbierto(false)} onSubmit={onGuardar} />
      <DeleteInternalUserDialog open={eliminarAbierto} usuario={usuarioSel} onClose={() => setEliminarAbierto(false)} onConfirmar={onEliminar} />
    </Paper>
  );
}

