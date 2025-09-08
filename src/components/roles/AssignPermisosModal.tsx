"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControlLabel, Checkbox, TextField } from '@mui/material';
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Asignar permisos al rol {rol?.name}</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-2 py-2">
          <TextField size="small" label="Buscar permiso (recurso:acción)" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <div className="max-h-80 overflow-auto">
            {permisosFiltrados.map((p) => (
              <FormControlLabel
                key={p.id}
                control={<Checkbox checked={!!seleccion[p.id]} onChange={() => toggle(p.id)} />}
                label={`${p.resource}:${p.action} ${p.description ? `- ${p.description}` : ''}`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
