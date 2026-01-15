'use client';
import { Alert, Box, Snackbar, Typography, Tabs, Tab } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import React from 'react';
import { UserTable, type UsuarioListado } from '@/components/usuarios/UserTable';
// Reemplazado por UpsertEmpresaUserModal
import UpsertEmpresaUserModal from '@/components/usuarios/UpsertEmpresaUserModal';
import { AssignRolesModal, type RolItem } from '@/components/usuarios/AssignRolesModal';
import { usePermisos } from '@/lib/permisos';
import { RolesTable, type PermisoItem } from '@/components/roles/RolesTable';
import { AssignPermisosModal } from '@/components/roles/AssignPermisosModal';
import { CreateRoleModal } from '@/components/roles/CreateRoleModal';
import { PermisosTable, type PermisoListado } from '@/components/permisos/PermisosTable';
import { CreatePermisoModal, type CrearPermisoForm } from '@/components/permisos/CreatePermisoModal';
import { EditPermisoModal, type EditarPermisoForm } from '@/components/permisos/EditPermisoModal';
import { useSearchParams } from 'next/navigation';
import { DeleteUserDialog } from '@/components/usuarios/DeleteUserDialog';
import { apiFetch } from '@/lib/api';
import { marron } from '@/ui/colores';

export default function Usuarios() {
  const { tienePermiso } = usePermisos();
  // Ajuste de nombres para coincidir con los permisos del backend (usuarios.*)
  const puedeCrear = tienePermiso('usuarios.create');
  const puedeEditar = tienePermiso('usuarios.update');
  const puedeEliminar = tienePermiso('usuarios.delete');
  const puedeAsignarRoles = tienePermiso('roles.assign');

  // Tabs: 0 Mudras (EMPRESA), 1 Clientes (CLIENTE), 2 Roles, 3 Permisos
  const searchParams = useSearchParams();
  const [tab, setTab] = React.useState('0');
  React.useEffect(() => {
    const t = searchParams?.get('tab');
    if (t != null && ['0', '1', '2', '3'].includes(t)) setTab(t);
  }, [searchParams]);

  const [crearAbierto, setCrearAbierto] = React.useState(false);
  const [editarAbierto, setEditarAbierto] = React.useState(false);
  const [rolesAbierto, setRolesAbierto] = React.useState(false);
  const [eliminarAbierto, setEliminarAbierto] = React.useState(false);
  const [usuarioSel, setUsuarioSel] = React.useState<UsuarioListado | null>(null);
  const [rolesDisponibles, setRolesDisponibles] = React.useState<RolItem[]>([]);
  const [refetchToken, setRefetchToken] = React.useState(0);

  // Queries y mutations
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

  // Modal unificado maneja creación y edición

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



  /* ======================== Render ======================== */
  return (
    <PageContainer title="Usuarios - Mudras" description="Gestión de usuarios, roles y permisos">
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2, color: '#333' }}>
          Gestión de Usuarios
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: marron.primary },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'text.secondary',
                '&.Mui-selected': { color: marron.primary }
              }
            }}
          >
            <Tab label="Mudras" value="0" />
            <Tab label="Clientes" value="1" />
            <Tab label="Roles" value="2" />
            <Tab label="Permisos" value="3" />
          </Tabs>
        </Box>

        <Box>
          {tab === '0' && (
            <UserTable
              onCrear={puedeCrear ? () => setCrearAbierto(true) : undefined}
              onEditar={puedeEditar ? (u) => { setUsuarioSel(u); setEditarAbierto(true); } : undefined}
              onRoles={puedeAsignarRoles ? (u) => { abrirRoles(u); } : undefined}
              onEliminar={puedeEliminar ? (u) => abrirEliminar(u) : undefined}
              refetchToken={refetchToken}
              onlyType="EMPRESA"
            />
          )}

          {tab === '1' && (
            <UserTable
              onCrear={undefined}
              onEditar={puedeEditar ? (u) => { setUsuarioSel(u); setEditarAbierto(true); } : undefined}
              onRoles={undefined}
              onEliminar={puedeEliminar ? (u) => abrirEliminar(u) : undefined}
              refetchToken={refetchToken}
              onlyType="CLIENTE"
            />
          )}

          {tab === '2' && (
            <RolesTable onAsignarPermisos={abrirAsignacionPermisos} onCrear={() => setCrearRolAbierto(true)} refetchToken={refetchRolesToken} />
          )}

          {tab === '3' && (
            <PermisosTable onCrear={() => setCrearPermAbierto(true)} onEditar={abrirEditarPermiso} onEliminar={abrirEliminarPermiso} refetchToken={refetchPermsToken} />
          )}
        </Box>
      </Box>

      {/* Modal Usuarios (Mudras) unificado, inspirado en Rubros */}
      <UpsertEmpresaUserModal
        open={crearAbierto || editarAbierto}
        mode={crearAbierto ? 'create' : 'edit'}
        usuario={editarAbierto ? usuarioSel as any : null}
        onClose={() => { setCrearAbierto(false); setEditarAbierto(false); }}
        onSaved={() => setRefetchToken((v) => v + 1)}
      />
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
    </PageContainer>
  );
}
