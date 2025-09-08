'use client';

import React from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import { Alert, Box, Snackbar, Typography } from '@mui/material';
import { PermisosTable, type PermisoListado } from '@/components/permisos/PermisosTable';
import { CreatePermisoModal, type CrearPermisoForm } from '@/components/permisos/CreatePermisoModal';
import { EditPermisoModal, type EditarPermisoForm } from '@/components/permisos/EditPermisoModal';
import { DeleteUserDialog } from '@/components/usuarios/DeleteUserDialog';
import { apiFetch } from '@/lib/api';

export default function PermisosPage() {
  const [refetchToken, setRefetchToken] = React.useState(0);
  const [crearAbierto, setCrearAbierto] = React.useState(false);
  const [editarAbierto, setEditarAbierto] = React.useState(false);
  const [eliminarAbierto, setEliminarAbierto] = React.useState(false);
  const [permSel, setPermSel] = React.useState<PermisoListado | null>(null);

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState<string>('');
  const [snackSev, setSnackSev] = React.useState<'success' | 'error' | 'info'>('success');

  const ok = (msg: string) => { setSnackSev('success'); setSnackMsg(msg); setSnackOpen(true); };
  const fail = (msg: string) => { setSnackSev('error'); setSnackMsg(msg); setSnackOpen(true); };

  function abrirEditar(p: PermisoListado) { setPermSel(p); setEditarAbierto(true); }
  function abrirEliminar(p: PermisoListado) { setPermSel(p); setEliminarAbierto(true); }

  async function crearPermiso(data: CrearPermisoForm) {
    try {
      await apiFetch('/permissions', { method: 'POST', body: data });
      setCrearAbierto(false);
      ok('Permiso creado');
      setRefetchToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al crear permiso');
    }
  }

  async function editarPermiso(data: EditarPermisoForm) {
    if (!permSel) return;
    try {
      await apiFetch(`/permissions/${permSel.id}`, { method: 'PUT', body: data });
      setEditarAbierto(false);
      ok('Permiso actualizado');
      setRefetchToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al actualizar permiso');
    }
  }

  async function eliminarPermiso() {
    if (!permSel) return;
    try {
      await apiFetch(`/permissions/${permSel.id}`, { method: 'DELETE' });
      setEliminarAbierto(false);
      ok('Permiso eliminado');
      setRefetchToken((v) => v + 1);
    } catch (e: any) {
      fail(e?.message || 'Error al eliminar permiso');
    }
  }

  return (
    <PageContainer title="Permisos - Mudras" description="Gestión de permisos">
      <Box>
        <Typography variant="h4" mb={2}>Permisos</Typography>
        <PermisosTable onCrear={() => setCrearAbierto(true)} onEditar={abrirEditar} onEliminar={abrirEliminar} refetchToken={refetchToken} />

        <CreatePermisoModal open={crearAbierto} onClose={() => setCrearAbierto(false)} onSubmit={crearPermiso} />
        <EditPermisoModal open={editarAbierto} permiso={permSel} onClose={() => setEditarAbierto(false)} onSubmit={editarPermiso} />
        <DeleteUserDialog open={eliminarAbierto} usuario={permSel as any} onClose={() => setEliminarAbierto(false)} onConfirmar={eliminarPermiso} />

        <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackOpen(false)} severity={snackSev} variant="filled" sx={{ width: '100%' }}>
            {snackMsg}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}
