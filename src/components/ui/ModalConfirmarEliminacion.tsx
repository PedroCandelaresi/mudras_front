'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface ModalConfirmarEliminacionProps {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  nombreEntidad: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

export default function ModalConfirmarEliminacion({
  abierto,
  titulo,
  descripcion,
  nombreEntidad,
  onConfirmar,
  onCancelar,
  cargando = false
}: ModalConfirmarEliminacionProps) {
  const [textoConfirmacion, setTextoConfirmacion] = useState('');
  const [error, setError] = useState('');

  // Resetear el input cada vez que se abre el modal
  useEffect(() => {
    if (abierto) {
      setTextoConfirmacion('');
      setError('');
    }
  }, [abierto]);

  const handleConfirmar = () => {
    console.log('Modal: Intentando confirmar eliminación, texto:', textoConfirmacion);
    if (textoConfirmacion === 'ELIMINAR') {
      console.log('Modal: Texto correcto, ejecutando onConfirmar');
      onConfirmar();
    } else {
      console.log('Modal: Texto incorrecto, mostrando error');
      setError('Debe escribir exactamente "ELIMINAR" para confirmar');
    }
  };

  const handleCancelar = () => {
    setTextoConfirmacion('');
    setError('');
    onCancelar();
  };

  const handleCambioTexto = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextoConfirmacion(event.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Dialog
      open={abierto}
      onClose={handleCancelar}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="error" />
          <Typography variant="h6" component="span">
            {titulo}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Typography variant="body1" color="text.secondary">
            {descripcion || `Esta acción eliminará permanentemente "${nombreEntidad}" y no se puede deshacer.`}
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 2 }}>
          Para confirmar la acción escriba la palabra <strong>ELIMINAR</strong>
        </Alert>

        <TextField
          fullWidth
          label="Confirmación"
          placeholder="Escriba ELIMINAR"
          value={textoConfirmacion}
          onChange={handleCambioTexto}
          error={!!error}
          helperText={error}
          disabled={cargando}
          autoFocus
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleCancelar}
          disabled={cargando}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          disabled={cargando || textoConfirmacion !== 'ELIMINAR'}
          variant="contained"
          color="error"
        >
          {cargando ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
