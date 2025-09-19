'use client';
import { Alert, Box, Snackbar, Typography, Tabs, Tab, Paper, Button } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import React from 'react';
import { UserTable, type UsuarioListado } from '@/components/usuarios/UserTable';
import { CreateUserModal, type CrearUsuarioForm } from '@/components/usuarios/CreateUserModal';
import { EditUserModal, type EditarUsuarioForm } from '@/components/usuarios/EditUserModal';
import { AssignRolesModal, type RolItem } from '@/components/usuarios/AssignRolesModal';
import { apiFetch } from '@/lib/api';
import { DeleteUserDialog } from '@/components/usuarios/DeleteUserDialog';
import { usePermisos } from '@/lib/permisos';
import { RolesTable, type PermisoItem } from '@/components/roles/RolesTable';
import { AssignPermisosModal } from '@/components/roles/AssignPermisosModal';
import { CreateRoleModal } from '@/components/roles/CreateRoleModal';
import { PermisosTable, type PermisoListado } from '@/components/permisos/PermisosTable';
import { CreatePermisoModal, type CrearPermisoForm } from '@/components/permisos/CreatePermisoModal';
import { EditPermisoModal, type EditarPermisoForm } from '@/components/permisos/EditPermisoModal';
import { Icon } from '@iconify/react';
import { useSearchParams } from 'next/navigation';

export default function Usuarios() {
  const { tienePermiso } = usePermisos();
  const puedeCrear = tienePermiso('users.create');
  const puedeEditar = tienePermiso('users.update');
  const puedeEliminar = tienePermiso('users.delete');
  const puedeAsignarRoles = tienePermiso('users.assign_roles') || tienePermiso('roles.assign');

  // Tabs: 0 Usuarios, 1 Roles, 2 Permisos
  const searchParams = useSearchParams();
  const [tab, setTab] = React.useState(0);
  React.useEffect(() => {
    const t = searchParams?.get('tab');
    if (t != null) {
      const n = Number(t);
      if (!Number.isNaN(n) && n >= 0 && n <= 2) setTab(n);
    }
  }, [searchParams]);

  const [crearAbierto, setCrearAbierto] = React.useState(false);
  const [editarAbierto, setEditarAbierto] = React.useState(false);
  const [rolesAbierto, setRolesAbierto] = React.useState(false);
  const [eliminarAbierto, setEliminarAbierto] = React.useState(false);
  const [usuarioSel, setUsuarioSel] = React.useState<UsuarioListado | null>(null);
  const [rolesDisponibles, setRolesDisponibles] = React.useState<RolItem[]>([]);
  const [refetchToken, setRefetchToken] = React.useState(0);

  // Estado para pestaña Roles
  const [rolSel, setRolSel] = React.useState<RolItem | null>(null);
  const [modalPermisosAbierto, setModalPermisosAbierto] = React.useState(false);
  const [refetchRolesToken, setRefetchRolesToken] = React.useState(0);
  const [crearRolAbierto, setCrearRolAbierto] = React.useState(false);

  // Estado para pestaña Permisos
  const [refetchPermsToken, setRefetchPermsToken] = React.useState(0);
  const [crearPermAbierto, setCrearPermAbierto] = React.useState(false);
  const [editarPermAbierto, setEditarPermAbierto] = React.useState(false);
  const [eliminarPermAbierto, setEliminarPermAbierto] = React.useState(false);
  const [permSel, setPermSel] = React.useState<PermisoListado | null>(null);

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

  // Lógica pestaña Roles
  function abrirAsignacionPermisos(rol: RolItem) {
    setRolSel(rol);
    setModalPermisosAbierto(true);
  }
  async function cargarPermisos(): Promise<PermisoItem[]> {
    return apiFetch<PermisoItem[]>('/roles/permissions');
  }
  async function guardarAsignacionPermisos(permissionIds: string[]) {
    if (!rolSel) return;
    try {
      await apiFetch(`/roles/${rolSel.id}/permissions`, { method: 'POST', body: { permissionIds } });
      ok('Permisos actualizados');
      setModalPermisosAbierto(false);
      setRefetchRolesToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al asignar permisos');
    }
  }

  // Lógica pestaña Permisos
  function abrirEditarPermiso(p: PermisoListado) { setPermSel(p); setEditarPermAbierto(true); }
  function abrirEliminarPermiso(p: PermisoListado) { setPermSel(p); setEliminarPermAbierto(true); }
  async function crearPermiso(data: CrearPermisoForm) {
    try {
      await apiFetch('/permissions', { method: 'POST', body: data });
      setCrearPermAbierto(false);
      ok('Permiso creado');
      setRefetchPermsToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al crear permiso');
    }
  }
  async function editarPermiso(data: EditarPermisoForm) {
    if (!permSel) return;
    try {
      await apiFetch(`/permissions/${permSel.id}`, { method: 'PUT', body: data });
      setEditarPermAbierto(false);
      ok('Permiso actualizado');
      setRefetchPermsToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al actualizar permiso');
    }
  }
  async function eliminarPermiso() {
    if (!permSel) return;
    try {
      await apiFetch(`/permissions/${permSel.id}`, { method: 'DELETE' });
      setEliminarPermAbierto(false);
      ok('Permiso eliminado');
      setRefetchPermsToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al eliminar permiso');
    }
  }

  return (
    <PageContainer title="Usuarios - Mudras" description="Gestión de usuarios, roles y permisos">
      <Box>
        <Typography variant="h4" fontWeight={700} color="#5d4037" sx={{ mb: 2 }}>
          Gestión de Usuarios
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#5d4037', borderRadius: 2, overflow: 'hidden', bgcolor: '#d7ccc8' }}>
          {/* Toolbar superior con tabs estilo Artículos pero en paleta marrón */}
          <Box sx={{ bgcolor: 'transparent', px: 2, py: 2, borderRadius: 0 }}>
            <Tabs
              value={tab}
              onChange={(_e, v) => setTab(v)}
              aria-label="usuarios tabs"
              TabIndicatorProps={{ sx: { display: 'none' } }}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTab-root': {
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: '#8d6e63',
                  '&:hover': { bgcolor: '#a1887f' },
                  '& .MuiTab-iconWrapper': { mr: 1 }
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: '#5d4037',
                  color: 'common.white'
                }
              }}
            >
              <Tab icon={<Icon icon="mdi:account-group" />} label="Usuarios" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:shield-account" />} label="Roles" iconPosition="start" />
              <Tab icon={<Icon icon="mdi:clipboard-text-outline" />} label="Permisos" iconPosition="start" />
            </Tabs>
          </Box>
          {/* Contenido con mismo fondo y padding */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 2, borderRadius: 0 }}>
            <Box sx={{ pt: 2 }}>
              {/* Pestaña Usuarios */}
              {tab === 0 && (
                <UserTable
                  onCrear={puedeCrear ? () => setCrearAbierto(true) : undefined}
                  onEditar={puedeEditar ? (u) => { setUsuarioSel(u); setEditarAbierto(true); } : undefined}
                  onRoles={puedeAsignarRoles ? (u) => { abrirRoles(u); } : undefined}
                  onEliminar={puedeEliminar ? (u) => abrirEliminar(u) : undefined}
                  refetchToken={refetchToken}
                />
              )}

              {/* Pestaña Roles */}
              {tab === 1 && (
                <RolesTable onAsignarPermisos={abrirAsignacionPermisos} onCrear={() => setCrearRolAbierto(true)} refetchToken={refetchRolesToken} />
              )}

              {/* Pestaña Permisos */}
              {tab === 2 && (
                <PermisosTable onCrear={() => setCrearPermAbierto(true)} onEditar={abrirEditarPermiso} onEliminar={abrirEliminarPermiso} refetchToken={refetchPermsToken} />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Modales Usuarios */}
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

        {/* Modales Roles */}
        <AssignPermisosModal
          open={modalPermisosAbierto}
          rol={rolSel}
          onClose={() => setModalPermisosAbierto(false)}
          onSubmit={guardarAsignacionPermisos}
          cargarPermisos={cargarPermisos}
        />
        <CreateRoleModal open={crearRolAbierto} onClose={() => setCrearRolAbierto(false)} onCreated={() => setRefetchRolesToken((v) => v + 1)} />

        {/* Modales Permisos */}
        <CreatePermisoModal open={crearPermAbierto} onClose={() => setCrearPermAbierto(false)} onSubmit={crearPermiso} />
        <EditPermisoModal open={editarPermAbierto} permiso={permSel} onClose={() => setEditarPermAbierto(false)} onSubmit={editarPermiso} />
        <DeleteUserDialog open={eliminarPermAbierto} usuario={permSel as any} onClose={() => setEliminarPermAbierto(false)} onConfirmar={eliminarPermiso} />

        {/* Snackbar global */}
        <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackOpen(false)} severity={snackSev} variant="filled" sx={{ width: '100%' }}>
            {snackMsg}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}
