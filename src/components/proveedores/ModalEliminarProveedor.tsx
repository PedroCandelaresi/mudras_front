// /home/candelaresi/proyectos/mudras/frontend/src/components/proveedores/ModalEliminarProveedor.tsx
'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Alert,
  InputAdornment
} from '@mui/material';
import { useState, useEffect } from 'react';
import { IconX, IconAlertTriangle } from '@tabler/icons-react';
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

  const [eliminarProveedor] = useMutation(ELIMINAR_PROVEEDOR);

  // Limpiar estado cuando se abre/cierra el modal
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
        sx: { 
          borderRadius: 3,
          border: '3px solid #d32f2f',
          boxShadow: '0 0 30px rgba(211, 47, 47, 0.3), 0 8px 32px rgba(0,0,0,0.12)',
          background: 'linear-gradient(135deg, #ffebee 0%, #fff 100%)'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
            animation: 'slide 2s linear infinite'
          },
          '@keyframes slide': {
            '0%': { transform: 'translateX(-20px)' },
            '100%': { transform: 'translateX(20px)' }
          }
        }}
      >
        <Box 
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            p: 1.5,
            display: 'flex',
            animation: 'pulse 1.5s ease-in-out infinite alternate',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '100%': { transform: 'scale(1.1)' }
            }
          }}
        >
          <IconAlertTriangle size={28} />
        </Box>
        <Box sx={{ zIndex: 1, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            ⚠️ ZONA DE PELIGRO ⚠️
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
            Eliminación Permanente de Proveedor
          </Typography>
        </Box>
        <IconButton 
          onClick={cerrarModalEliminar} 
          size="small" 
          sx={{ 
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            zIndex: 2
          }}
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 4, p: 5, pt: 4, bgcolor: '#fff' }}>
        {/* Alerta de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={4}>
          <Box 
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: '#ffebee',
              border: '2px dashed #d32f2f',
              textAlign: 'center'
            }}
          >
            <IconAlertTriangle size={48} color="#d32f2f" style={{ marginBottom: 16 }} />
            <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700, mb: 2 }}>
              ¡ATENCIÓN! Esta acción es IRREVERSIBLE
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              Está a punto de eliminar permanentemente el proveedor:
            </Typography>
            <Box 
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 1,
                border: '1px solid #d32f2f',
                display: 'inline-block'
              }}
            >
              <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                &quot;{proveedor.Nombre}&quot;
              </Typography>
              {proveedor.Codigo && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Código: {proveedor.Codigo}
                </Typography>
              )}
              {proveedor.Contacto && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Contacto: {proveedor.Contacto}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 28
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ⚠️ CONSECUENCIAS DE ESTA ACCIÓN:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>¿Estás seguro de que deseas eliminar el proveedor &quot;{proveedor?.Nombre}&quot;?</li>
              <li>Todos los artículos asociados quedarán sin proveedor</li>
              <li>Se perderá el historial de compras registrado</li>
              <li>Esta acción NO se puede deshacer</li>
            </Typography>
          </Alert>

          <Box>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#d32f2f', fontWeight: 700 }}>
              ELIMINAR
            </Typography>
            <TextField
              placeholder="Escriba la palabra de confirmación"
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value.toUpperCase())}
              fullWidth
              variant="outlined"
              error={textoConfirmacion !== '' && textoConfirmacion !== 'ELIMINAR'}
              helperText={textoConfirmacion !== '' && textoConfirmacion !== 'ELIMINAR' ? '❌ Debe escribir exactamente "ELIMINAR"' : textoConfirmacion === 'ELIMINAR' ? '✅ Confirmación correcta' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: textoConfirmacion === 'ELIMINAR' ? '#e8f5e8' : '#ffebee',
                  '& fieldset': {
                    borderColor: textoConfirmacion === 'ELIMINAR' ? '#4caf50' : '#d32f2f',
                    borderWidth: 2
                  },
                  '&:hover fieldset': {
                    borderColor: textoConfirmacion === 'ELIMINAR' ? '#4caf50' : '#d32f2f'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: textoConfirmacion === 'ELIMINAR' ? '#4caf50' : '#d32f2f'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconAlertTriangle size={20} color="#d32f2f" />
                  </InputAdornment>
                ),
                style: {
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textAlign: 'center'
                }
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions 
        sx={{ 
          p: 4, 
          pt: 2,
          bgcolor: '#ffebee'
        }}
      >
        <Button 
          onClick={cerrarModalEliminar}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 4,
            py: 1,
            borderColor: '#666',
            color: '#666',
            '&:hover': {
              borderColor: '#333',
              color: '#333',
              bgcolor: '#f5f5f5'
            }
          }}
        >
          ❌ Cancelar
        </Button>
        <Button 
          onClick={confirmarEliminacion}
          variant="contained"
          disabled={textoConfirmacion !== 'ELIMINAR'}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 4,
            py: 1,
            bgcolor: '#d32f2f',
            color: 'white',
            fontWeight: 700,
            '&:hover': {
              bgcolor: '#b71c1c',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(211, 47, 47, 0.4)'
            },
            '&:disabled': {
              bgcolor: '#ccc',
              color: '#666'
            },
            transition: 'all 0.2s ease'
          }}
        >
          ⚠️ ELIMINAR PERMANENTEMENTE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEliminarProveedor;
