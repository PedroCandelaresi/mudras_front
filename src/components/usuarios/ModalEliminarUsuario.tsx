'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  IconButton,
  Alert,
  InputAdornment,
  Button,
} from '@mui/material';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { grisNeutro, rojo } from '@/ui/colores';
import { UsuarioListado } from './TablaUsuarios';
import { ELIMINAR_USUARIO_ADMIN_MUTATION } from './graphql/mutations';



interface Props {
  open: boolean;
  usuario: UsuarioListado | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEliminarUsuario({ open, usuario, onClose, onSuccess }: Props) {
  const [textoConfirmacion, setTextoConfirmacion] = useState('');
  const [deleteUser, { loading }] = useMutation(ELIMINAR_USUARIO_ADMIN_MUTATION);

  useEffect(() => {
    if (open) setTextoConfirmacion('');
  }, [open]);

  const palabraCorrecta = 'ELIMINAR';
  const textoValido = textoConfirmacion === palabraCorrecta;

  const handleConfirm = async () => {
    if (!usuario || !textoValido) return;
    try {
      await deleteUser({ variables: { id: usuario.id } });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: `3px solid ${rojo.primary}`,
          boxShadow: '0 0 30px rgba(211, 47, 47, 0.3)',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${rojo.primary} 0%, ${rojo.primaryHover} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2,
        }}
      >
        <IconAlertTriangle size={28} />
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
          Eliminar Usuario
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, p: 3 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="body1" mb={1}>
            Estás a punto de eliminar al usuario:
          </Typography>
          <Typography variant="h6" fontWeight={700} color={rojo.textStrong}>
            {usuario?.username || usuario?.email}
          </Typography>
        </Box>

        <Alert severity="error" icon={<IconAlertTriangle size={24} />} sx={{ mb: 3, borderRadius: 0 }}>
          <Typography variant="body2" fontWeight={600}>
            Esta acción es IRREVERSIBLE. El usuario perderá el acceso inmediatamente.
          </Typography>
        </Alert>

        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: grisNeutro.textStrong }}>
          Escribe "ELIMINAR" para confirmar:
        </Typography>
        <TextField
          fullWidth
          value={textoConfirmacion}
          onChange={(e) => setTextoConfirmacion(e.target.value.toUpperCase())}
          placeholder="ELIMINAR"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconAlertTriangle size={20} color={rojo.primary} />
              </InputAdornment>
            ),
            sx: { borderRadius: 0, fontWeight: 700, textAlign: 'center' }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: grisNeutro.toolbarBg, borderTop: `1px solid ${grisNeutro.toolbarBorder}` }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 0, color: grisNeutro.textStrong, borderColor: grisNeutro.borderOuter }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!textoValido || loading}
          sx={{
            bgcolor: rojo.primary,
            '&:hover': { bgcolor: rojo.primaryHover },
            borderRadius: 0,
            fontWeight: 700,
            boxShadow: 'none'
          }}
        >
          {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
