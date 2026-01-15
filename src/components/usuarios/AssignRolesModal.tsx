"use client";
import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControlLabel, Checkbox, Box } from '@mui/material';

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
        Asignar roles
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={1} mt={1}>
          {rolesDisponibles.map((r) => (
            <FormControlLabel
              key={r.id}
              control={<Checkbox checked={!!seleccion[r.slug]} onChange={() => toggle(r.slug)} />}
              label={`${r.name} (${r.slug})`}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600 }}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disableElevation sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
