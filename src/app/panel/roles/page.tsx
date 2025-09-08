'use client';

import React from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import { Alert, Box, Snackbar, Typography } from '@mui/material';
import { RolesTable, type RolItem, type PermisoItem } from '@/components/roles/RolesTable';
import { AssignPermisosModal } from '@/components/roles/AssignPermisosModal';
import { apiFetch } from '@/lib/api';

export default function RolesPage() {
  const [rolSel, setRolSel] = React.useState<RolItem | null>(null);
  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [refetchToken, setRefetchToken] = React.useState(0);

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState<string>('');
  const [snackSev, setSnackSev] = React.useState<'success' | 'error' | 'info'>('success');

  const ok = (msg: string) => { setSnackSev('success'); setSnackMsg(msg); setSnackOpen(true); };
  const fail = (msg: string) => { setSnackSev('error'); setSnackMsg(msg); setSnackOpen(true); };

  function abrirAsignacion(rol: RolItem) {
    setRolSel(rol);
    setModalAbierto(true);
  }

  async function cargarPermisos(): Promise<PermisoItem[]> {
    return apiFetch<PermisoItem[]>('/roles/permissions');
  }

  async function guardarAsignacion(permissionIds: string[]) {
    if (!rolSel) return;
    try {
      await apiFetch(`/roles/${rolSel.id}/permissions`, { method: 'POST', body: { permissionIds } });
      ok('Permisos actualizados');
      setModalAbierto(false);
      setRefetchToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al asignar permisos');
    }
  }

  return (
    <PageContainer title="Roles - Mudras" description="Gestión de roles y permisos">
      <Box>
        <Typography variant="h4" mb={2}>Roles</Typography>
        <RolesTable onAsignarPermisos={abrirAsignacion} refetchToken={refetchToken} />
        <AssignPermisosModal
          open={modalAbierto}
          rol={rolSel}
          onClose={() => setModalAbierto(false)}
          onSubmit={guardarAsignacion}
          cargarPermisos={cargarPermisos}
        />

        <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackOpen(false)} severity={snackSev} variant="filled" sx={{ width: '100%' }}>
            {snackMsg}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}
