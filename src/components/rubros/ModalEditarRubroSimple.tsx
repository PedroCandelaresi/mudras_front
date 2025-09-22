'use client';
import React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { rosa } from './colores-rosa';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

export interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  rubro?: Rubro | null;
  onSuccess?: () => void;
}

const ModalEditarRubroSimple: React.FC<Props> = ({ open, onClose, rubro, onSuccess }) => {
  const [formData, setFormData] = React.useState({
    nombre: '',
    codigo: '',
    porcentajeRecargo: 0,
    porcentajeDescuento: 0
  });
  
  const [error, setError] = React.useState('');

  // Inicializar formulario cuando se abre el modal
  React.useEffect(() => {
    if (open) {
      if (rubro) {
        setFormData({
          nombre: rubro.nombre || '',
          codigo: rubro.codigo || '',
          porcentajeRecargo: rubro.porcentajeRecargo || 0,
          porcentajeDescuento: rubro.porcentajeDescuento || 0
        });
      } else {
        setFormData({
          nombre: '',
          codigo: '',
          porcentajeRecargo: 0,
          porcentajeDescuento: 0
        });
      }
      setError('');
    }
  }, [open, rubro]);

  const handleClose = () => {
    onClose();
  };

  const handleGuardar = async () => {
    try {
      // Validación básica
      if (!formData.nombre.trim()) {
        setError('El nombre es requerido');
        return;
      }

      // TODO: Implementar guardado real con GraphQL
      console.log('Guardando rubro:', formData);
      
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err) {
      setError('Error al guardar el rubro');
    }
  };

  const rubroEditando = !!rubro;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth 
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: '85vh',
          bgcolor: 'transparent',
          overflow: 'hidden'
        }
      }}
    >
      <TexturedPanel 
        accent={rosa.primary} 
        radius={12} 
        contentPadding={0} 
        bgTintPercent={10} 
        bgAlpha={1} 
        textureBaseOpacity={0.18} 
        textureBoostOpacity={0.14} 
        textureBrightness={1.1} 
        tintOpacity={0.35}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '85vh' }}>
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            pb: 2,
            borderBottom: '1px solid rgba(0,0,0,0.08)'
          }}>
            <Icon 
              icon="material-symbols:category" 
              style={{ 
                fontSize: 28, 
                color: rosa.primary 
              }} 
            />
            <Typography variant="h5" fontWeight={700} color={rosa.textStrong}>
              {rubroEditando ? 'Editar Rubro' : 'Nuevo Rubro'}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            <Box display="flex" flexDirection="column" gap={2.5}>
              {error && (
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#ffebee', 
                    border: '1px solid #f44336', 
                    borderRadius: 2,
                    color: '#d32f2f'
                  }}
                >
                  {error}
                </Box>
              )}

              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Nombre del Rubro"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    variant="outlined"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: rosa.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: rosa.primary,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: rosa.primary,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Código"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: rosa.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: rosa.primary,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: rosa.primary,
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Porcentaje de Recargo (%)"
                    type="number"
                    value={formData.porcentajeRecargo}
                    onChange={(e) => setFormData({ ...formData, porcentajeRecargo: parseFloat(e.target.value) || 0 })}
                    variant="outlined"
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: rosa.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: rosa.primary,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: rosa.primary,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Porcentaje de Descuento (%)"
                    type="number"
                    value={formData.porcentajeDescuento}
                    onChange={(e) => setFormData({ ...formData, porcentajeDescuento: parseFloat(e.target.value) || 0 })}
                    variant="outlined"
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: rosa.primary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: rosa.primary,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: rosa.primary,
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(0,0,0,0.08)',
            gap: 2 
          }}>
            <Button
              onClick={handleClose}
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
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              variant="contained"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 4,
                py: 1,
                bgcolor: rosa.primary,
                color: 'white',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: rosa.primaryHover,
                },
              }}
            >
              {rubroEditando ? 'Actualizar Rubro' : 'Crear Rubro'}
            </Button>
          </DialogActions>
        </Box>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalEditarRubroSimple;
