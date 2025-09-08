"use client";
import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControlLabel, Checkbox } from '@mui/material';

export interface RolItem { id: string; name: string; slug: string; }

interface Props {
  open: boolean;
  rolesDisponibles: RolItem[];
  rolesAsignados: string[]; // slugs
  onClose: () => void;
  onSubmit: (roles: string[]) => void; // slugs
}

export function AssignRolesModal({ open, rolesDisponibles, rolesAsignados, onClose, onSubmit }: Props) {
  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const inicial: Record<string, boolean> = {};
    rolesDisponibles.forEach((r) => { inicial[r.slug] = rolesAsignados.includes(r.slug); });
    setSeleccion(inicial);
  }, [rolesDisponibles, rolesAsignados]);

  const toggle = (slug: string) => setSeleccion((s) => ({ ...s, [slug]: !s[slug] }));

  const submit = () => {
    const activos = Object.entries(seleccion).filter(([, v]) => v).map(([k]) => k);
    onSubmit(activos);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Asignar roles</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-2 py-2">
          {rolesDisponibles.map((r) => (
            <FormControlLabel key={r.id} control={<Checkbox checked={!!seleccion[r.slug]} onChange={() => toggle(r.slug)} />} label={`${r.name} (${r.slug})`} />
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
