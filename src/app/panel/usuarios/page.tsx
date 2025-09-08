'use client';
import { Alert, Box, Snackbar, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import React from 'react';
import { UserTable, type UsuarioListado } from '@/components/usuarios/UserTable';
import { CreateUserModal, type CrearUsuarioForm } from '@/components/usuarios/CreateUserModal';
import { EditUserModal, type EditarUsuarioForm } from '@/components/usuarios/EditUserModal';
import { AssignRolesModal, type RolItem } from '@/components/usuarios/AssignRolesModal';
import { apiFetch } from '@/lib/api';
import { DeleteUserDialog } from '@/components/usuarios/DeleteUserDialog';

export default function Usuarios() {
  const [crearAbierto, setCrearAbierto] = React.useState(false);
  const [editarAbierto, setEditarAbierto] = React.useState(false);
  const [rolesAbierto, setRolesAbierto] = React.useState(false);
  const [eliminarAbierto, setEliminarAbierto] = React.useState(false);
  const [usuarioSel, setUsuarioSel] = React.useState<UsuarioListado | null>(null);
  const [rolesDisponibles, setRolesDisponibles] = React.useState<RolItem[]>([]);
  const [refetchToken, setRefetchToken] = React.useState(0);

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState<string>('');
  const [snackSev, setSnackSev] = React.useState<'success' | 'error' | 'info'>('success');

  const ok = (msg: string) => { setSnackSev('success'); setSnackMsg(msg); setSnackOpen(true); };
  const fail = (msg: string) => { setSnackSev('error'); setSnackMsg(msg); setSnackOpen(true); };

  async function crearUsuario(data: CrearUsuarioForm) {
    try {
      await apiFetch('/users', { method: 'POST', body: data });
      setCrearAbierto(false);
      ok('Usuario creado correctamente');
      setRefetchToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al crear usuario');
    }
  }

  async function guardarUsuario(data: EditarUsuarioForm) {
    if (!usuarioSel) return;
    try {
      await apiFetch(`/users/${usuarioSel.id}`, { method: 'PUT', body: data });
      setEditarAbierto(false);
      ok('Usuario actualizado');
      setRefetchToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al actualizar usuario');
    }
  }

  async function abrirRoles(u: UsuarioListado) {
    setUsuarioSel(u);
    // cargar roles disponibles
    const roles = await apiFetch<RolItem[]>('/roles');
    setRolesDisponibles(roles);
    setRolesAbierto(true);
  }

  async function asignarRoles(slugs: string[]) {
    if (!usuarioSel) return;
    try {
      await apiFetch(`/users/${usuarioSel.id}/roles`, { method: 'POST', body: { roles: slugs } });
      setRolesAbierto(false);
      ok('Roles asignados');
      setRefetchToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al asignar roles');
    }
  }

  function abrirEliminar(u: UsuarioListado) {
    setUsuarioSel(u);
    setEliminarAbierto(true);
  }

  async function confirmarEliminar() {
    if (!usuarioSel) return;
    try {
      await apiFetch(`/users/${usuarioSel.id}`, { method: 'DELETE' });
      setEliminarAbierto(false);
      ok('Usuario eliminado');
      setRefetchToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al eliminar usuario');
    }
  }

  return (
    <PageContainer title="Usuarios - Mudras" description="Gestión de usuarios">
      <Box>
        <Typography variant="h4" mb={2}>
          Gestión de Usuarios
        </Typography>
        <UserTable
          onCrear={() => setCrearAbierto(true)}
          onEditar={(u) => { setUsuarioSel(u); setEditarAbierto(true); }}
          onRoles={(u) => { abrirRoles(u); }}
          onEliminar={(u) => abrirEliminar(u)}
          refetchToken={refetchToken}
        />

        <CreateUserModal open={crearAbierto} onClose={() => setCrearAbierto(false)} onSubmit={crearUsuario} />
        <EditUserModal open={editarAbierto} usuario={usuarioSel} onClose={() => setEditarAbierto(false)} onSubmit={guardarUsuario} />
        <AssignRolesModal
          open={rolesAbierto}
          rolesDisponibles={rolesDisponibles}
          rolesAsignados={usuarioSel?.roles ?? []}
          onClose={() => setRolesAbierto(false)}
          onSubmit={asignarRoles}
        />
        <DeleteUserDialog open={eliminarAbierto} usuario={usuarioSel} onClose={() => setEliminarAbierto(false)} onConfirmar={confirmarEliminar} />

        <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackOpen(false)} severity={snackSev} variant="filled" sx={{ width: '100%' }}>
            {snackMsg}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}
