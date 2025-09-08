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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Eliminar usuario</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          ¿Seguro que deseas eliminar al usuario {usuario?.displayName || usuario?.username || ''}? Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="error" onClick={onConfirmar}>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}
