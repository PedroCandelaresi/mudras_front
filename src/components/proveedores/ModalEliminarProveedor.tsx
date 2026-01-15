'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Alert,
  InputAdornment,
  Paper
} from '@mui/material';
import { useState, useEffect } from 'react';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import { useMutation } from '@apollo/client/react';
import { ELIMINAR_PROVEEDOR } from '@/components/proveedores/graphql/mutations';
import { Proveedor } from '@/interfaces/proveedores';

interface ModalEliminarProveedorProps {
  open: boolean;
  onClose: () => void;
  proveedor: Proveedor | null;
  onProveedorEliminado: () => void;
}

const ModalEliminarProveedor = ({ open, onClose, proveedor, onProveedorEliminado }: ModalEliminarProveedorProps) => {
  const [textoConfirmacion, setTextoConfirmacion] = useState('');
  const [error, setError] = useState('');

  const [eliminarProveedor, { loading }] = useMutation(ELIMINAR_PROVEEDOR);

  useEffect(() => {
    if (open) {
      setTextoConfirmacion('');
      setError('');
    }
  }, [open]);

  const confirmarEliminacion = async () => {
    if (textoConfirmacion !== 'ELIMINAR' || !proveedor) {
      return;
    }

    try {
      await eliminarProveedor({
        variables: {
          id: proveedor.IdProveedor
        },
        refetchQueries: ['GetProveedores']
      });

      onProveedorEliminado();
      cerrarModalEliminar();
    } catch (error: any) {
      console.error('Error al eliminar proveedor:', error);
      setError(error.message || 'Error al eliminar el proveedor');
    }
  };

  const cerrarModalEliminar = () => {
    setTextoConfirmacion('');
    setError('');
    onClose();
  };

  if (!proveedor) return null;

  return (
    <Dialog
      open={open}
      onClose={cerrarModalEliminar}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0', // Simple border
          bgcolor: '#ffffff'
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        bgcolor: '#f5f5f5',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0',
        borderRadius: 0,
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconAlertTriangle size={24} color="#d32f2f" />
          <Typography variant="h6" fontWeight={700} color="#d32f2f">
            Eliminar Proveedor
          </Typography>
        </Box>
        <IconButton onClick={cerrarModalEliminar} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={3}>

          {/* Warning Box */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, bgcolor: '#fff5f5', borderColor: '#ef9a9a', display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#c62828" gutterBottom>
                Acción Irreversible
              </Typography>
              <Typography variant="body2" color="#c62828">
                Estás a punto de eliminar al proveedor <strong>{proveedor.Nombre}</strong>.
                Todos los artículos asociados quedarán sin proveedor y se perderá el historial de compras.
              </Typography>
            </Box>
          </Paper>

          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Confirmación
            </Typography>
            <TextField
              placeholder="Escribí ELIMINAR para confirmar"
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value.toUpperCase())}
              fullWidth
              variant="outlined"
              error={textoConfirmacion !== '' && textoConfirmacion !== 'ELIMINAR'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: '#fff',
                  '&.Mui-focused fieldset': {
                    borderColor: textoConfirmacion === 'ELIMINAR' ? '#2e7d32' : '#d32f2f',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconAlertTriangle size={20} color={textoConfirmacion === 'ELIMINAR' ? '#2e7d32' : '#d32f2f'} />
                  </InputAdornment>
                ),
              }}
            />
            {textoConfirmacion === 'ELIMINAR' && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, fontWeight: 600 }}>
                ✅ Confirmación correcta
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', gap: 2, borderRadius: 0 }}>
        <Button
          onClick={cerrarModalEliminar}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 0,
            px: 3
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={confirmarEliminacion}
          variant="contained"
          disableElevation
          disabled={textoConfirmacion !== 'ELIMINAR' || loading}
          sx={{
            flex: 1,
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' },
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 0
          }}
        >
          {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEliminarProveedor;
