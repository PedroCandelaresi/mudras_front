'use client';
import { Alert, Box, Snackbar, Typography } from '@mui/material';
import { alpha, lighten, darken } from '@mui/material/styles';
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
import { Icon } from '@iconify/react';
import { useSearchParams } from 'next/navigation';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton, forceWhiteIconsSX } from '@/components/ui/CrystalButton';
import { DeleteUserDialog } from '@/components/usuarios/DeleteUserDialog';
import { apiFetch } from '@/lib/api';
import { marron } from '@/ui/colores';
import StylizedTabbedPanel, { type StylizedTabDefinition } from '@/components/ui/StylizedTabbedPanel';

// Wrapper estilo Artículos pero con paleta marrón
const createBevelWrapper = (color: string) => {
  const edgeWidth = 2;
  const topHighlightColor = alpha(lighten(color, 0.85), 0.9);
  const bottomShadowColor = alpha(darken(color, 0.6), 0.85);
  const leftHighlightColor = alpha(lighten(color, 0.6), 0.8);
  const rightShadowColor = alpha(darken(color, 0.6), 0.76);
  const borderTint = alpha(lighten(color, 0.2), 0.6);
  const innerLight = alpha(lighten(color, 0.58), 0.22);
  const innerShadow = alpha(darken(color, 0.62), 0.26);

  return {
    position: 'relative' as const,
    borderRadius: 2,
    overflow: 'hidden' as const,
    background: 'transparent',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none' as const,
      boxShadow: `
        inset 0 ${edgeWidth}px 0 ${topHighlightColor},
        inset 0 -${edgeWidth + 0.4}px 0 ${bottomShadowColor},
        inset ${edgeWidth}px 0 0 ${leftHighlightColor},
        inset -${edgeWidth + 0.4}px 0 0 ${rightShadowColor}
      `,
      zIndex: 3,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: edgeWidth,
      borderRadius: 'inherit',
      pointerEvents: 'none' as const,
      border: `1px solid ${borderTint}`,
      boxShadow: `
        inset 0 ${edgeWidth * 5.2}px ${edgeWidth * 6.4}px ${innerLight},
        inset 0 -${edgeWidth * 5.2}px ${edgeWidth * 6.4}px ${innerShadow}
      `,
      mixBlendMode: 'soft-light' as const,
      zIndex: 2,
    },
    '& > *': { position: 'relative', zIndex: 1 },
  };
};

const tabsPanel: StylizedTabDefinition[] = [
  {
    key: 'usuarios',
    label: 'Usuarios / Roles / Permisos',
    icon: <Icon icon="mdi:account-cog" />,
    color: marron.primary,
  },
];

export default function Usuarios() {
  const { tienePermiso } = usePermisos();
  // Ajuste de nombres para coincidir con los permisos del backend (usuarios.*)
  const puedeCrear = tienePermiso('usuarios.create');
  const puedeEditar = tienePermiso('usuarios.update');
  const puedeEliminar = tienePermiso('usuarios.delete');
  const puedeAsignarRoles = tienePermiso('roles.assign');

  // Tabs: 0 Mudras (EMPRESA), 1 Clientes (CLIENTE), 2 Roles, 3 Permisos
  const searchParams = useSearchParams();
  const [tab, setTab] = React.useState(0);
  React.useEffect(() => {
    const t = searchParams?.get('tab');
    if (t != null) {
      const n = Number(t);
      if (!Number.isNaN(n) && n >= 0 && n <= 3) setTab(n);
    }
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

  const activeColor = marron.primary;
  const baseBg = alpha('#4B2E25', 0.9);
  const [activePanelTab, setActivePanelTab] = React.useState('usuarios');

  return (
    <PageContainer title="Usuarios - Mudras" description="Gestión de usuarios, roles y permisos">
      <StylizedTabbedPanel
        tabs={tabsPanel}
        activeKey={activePanelTab}
        onChange={setActivePanelTab}
      >
      <Box sx={createBevelWrapper(activeColor)}>
        <TexturedPanel
          accent={activeColor}
          radius={14}
          contentPadding={12}
          bgTintPercent={22}
          bgAlpha={0.98}
          tintMode="soft-light"
          tintOpacity={0.42}
          textureScale={1.1}
          textureBaseOpacity={0.18}
          textureBoostOpacity={0.12}
          textureContrast={0.92}
          textureBrightness={1.03}
          bevelWidth={12}
          bevelIntensity={1.0}
          glossStrength={1.0}
          vignetteStrength={0.9}
        >
          {/* Toolbar con estilo Crystal */}
          <Box sx={{ bgcolor: 'transparent', px: 1, py: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {tab === 0 ? (
                <CrystalButton baseColor={marron.primary} startIcon={<Icon icon="mdi:account-tie-outline" />} onClick={() => setTab(0)} sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}>
                  Mudras
                </CrystalButton>
              ) : (
                <CrystalSoftButton baseColor={marron.primary} startIcon={<Icon icon="mdi:account-tie-outline" />} onClick={() => setTab(0)} sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}>
                  Mudras
                </CrystalSoftButton>
              )}
              {tab === 1 ? (
                <CrystalButton baseColor={marron.primary} startIcon={<Icon icon="mdi:account" />} onClick={() => setTab(1)} sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}>
                  Clientes
                </CrystalButton>
              ) : (
                <CrystalSoftButton baseColor={marron.primary} startIcon={<Icon icon="mdi:account" />} onClick={() => setTab(1)} sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}>
                  Clientes
                </CrystalSoftButton>
              )}
              {tab === 2 ? (
                <CrystalButton baseColor={marron.primary} startIcon={<Icon icon="mdi:shield-account" />} onClick={() => setTab(2)} sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}>
                  Roles
                </CrystalButton>
              ) : (
                <CrystalSoftButton baseColor={marron.primary} startIcon={<Icon icon="mdi:shield-account" />} onClick={() => setTab(2)} sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}>
                  Roles
                </CrystalSoftButton>
              )}
              {tab === 3 ? (
                <CrystalButton baseColor={marron.primary} startIcon={<Icon icon="mdi:clipboard-text-outline" />} onClick={() => setTab(3)} sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}>
                  Permisos
                </CrystalButton>
              ) : (
                <CrystalSoftButton baseColor={marron.primary} startIcon={<Icon icon="mdi:clipboard-text-outline" />} onClick={() => setTab(3)} sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}>
                  Permisos
                </CrystalSoftButton>
              )}
            </Box>
          </Box>

          {/* Contenido principal */}
          <Box sx={{ bgcolor: 'transparent', px: 2, pb: 2, pt: 1.5 }}>
            <Box sx={{ pt: 2 }}>
              {tab === 0 && (
                <Box sx={{ borderRadius: 2, bgcolor: baseBg, transition: 'background-color .2s ease' }}>
                  <UserTable
                    onCrear={puedeCrear ? () => setCrearAbierto(true) : undefined}
                    onEditar={puedeEditar ? (u) => { setUsuarioSel(u); setEditarAbierto(true); } : undefined}
                    onRoles={puedeAsignarRoles ? (u) => { abrirRoles(u); } : undefined}
                    onEliminar={puedeEliminar ? (u) => abrirEliminar(u) : undefined}
                    refetchToken={refetchToken}
                    onlyType="EMPRESA"
                  />
                </Box>
              )}

              {tab === 1 && (
                <Box sx={{ borderRadius: 2, bgcolor: baseBg, transition: 'background-color .2s ease' }}>
                  <UserTable
                    onCrear={undefined}
                    onEditar={puedeEditar ? (u) => { setUsuarioSel(u); setEditarAbierto(true); } : undefined}
                    onRoles={undefined}
                    onEliminar={puedeEliminar ? (u) => abrirEliminar(u) : undefined}
                    refetchToken={refetchToken}
                    onlyType="CLIENTE"
                  />
                </Box>
              )}

              {tab === 2 && (
                <RolesTable onAsignarPermisos={abrirAsignacionPermisos} onCrear={() => setCrearRolAbierto(true)} refetchToken={refetchRolesToken} />
              )}

              {tab === 3 && (
                <PermisosTable onCrear={() => setCrearPermAbierto(true)} onEditar={abrirEditarPermiso} onEliminar={abrirEliminarPermiso} refetchToken={refetchPermsToken} />
              )}
            </Box>
          </Box>
        </TexturedPanel>
      
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
      </Box>
      </StylizedTabbedPanel>
    </PageContainer>
  );
}
