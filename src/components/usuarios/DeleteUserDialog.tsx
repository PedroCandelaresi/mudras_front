"use client";
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';
import type { UsuarioListado } from './UserTable';

interface Props {
  open: boolean;
  usuario: UsuarioListado | null;
  onClose: () => void;
  onConfirmar: () => void;
}

export function DeleteUserDialog({ open, usuario, onClose, onConfirmar }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' } }}
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontWeight: 700 }}>
        Eliminar usuario
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1">
          ¿Seguro que deseas eliminar al usuario <strong>{usuario?.displayName || usuario?.username || ''}</strong>?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600 }}>Cancelar</Button>
        <Button variant="contained" color="error" onClick={onConfirmar} disableElevation sx={{ borderRadius: 0, fontWeight: 600 }}>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}
