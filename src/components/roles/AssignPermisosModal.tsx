"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControlLabel, Checkbox, TextField, Box } from '@mui/material';
import type { RolItem, PermisoItem } from './RolesTable';

interface Props {
  open: boolean;
  rol: RolItem | null;
  onClose: () => void;
  onSubmit: (permissionIds: string[]) => void;
  cargarPermisos: () => Promise<PermisoItem[]>;
}

export function AssignPermisosModal({ open, rol, onClose, onSubmit, cargarPermisos }: Props) {
  const [permisos, setPermisos] = useState<PermisoItem[]>([]);
  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({});
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (!open) return;
    cargarPermisos().then((lista) => {
      setPermisos(lista);
      const actuales = new Set((rol?.rolePermissions || []).map((rp) => rp.permission.id));
      const dict: Record<string, boolean> = {};
      for (const p of lista) dict[p.id] = actuales.has(p.id);
      setSeleccion(dict);
    });
  }, [open, rol, cargarPermisos]);

  const toggle = (id: string) => setSeleccion((s) => ({ ...s, [id]: !s[id] }));

  const submit = () => {
    const activos = Object.entries(seleccion).filter(([, v]) => v).map(([k]) => k);
    onSubmit(activos);
  };

  const permisosFiltrados = permisos.filter((p) => {
    const q = filtro.trim().toLowerCase();
    if (!q) return true;
    const label = `${p.resource}:${p.action}`.toLowerCase();
    return label.includes(q);
  });

  /* ======================== Render ======================== */
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' } }}
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontWeight: 700 }}>
        Asignar permisos al rol {rol?.name}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            size="small"
            label="Buscar permiso (recurso:acción)"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            fullWidth
            InputProps={{ sx: { borderRadius: 0 } }}
          />
          <Box className="max-h-80 overflow-auto" display="flex" flexDirection="column" gap={0.5} sx={{ border: '1px solid #eee', p: 1 }}>
            {permisosFiltrados.map((p) => (
              <FormControlLabel
                key={p.id}
                control={<Checkbox checked={!!seleccion[p.id]} onChange={() => toggle(p.id)} />}
                label={`${p.resource}:${p.action} ${p.description ? `- ${p.description}` : ''}`}
                sx={{ ml: 0 }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600 }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={submit}
          disableElevation
          sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
