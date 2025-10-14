"use client";
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';
import type { UsuarioInterno } from './graphql/internos';

interface Props {
  open: boolean;
  usuario: UsuarioInterno | null;
  onClose: () => void;
  onConfirmar: () => void;
}

export function DeleteInternalUserDialog({ open, usuario, onClose, onConfirmar }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Eliminar empleado</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          ¿Seguro que deseas eliminar a {usuario ? `${usuario.nombre} ${usuario.apellido}` : ''}? Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="error" onClick={onConfirmar}>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}

