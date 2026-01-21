'use client';
import React, { useMemo } from 'react';
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
  Button
} from '@mui/material';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import { useMutation } from '@apollo/client/react';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { ELIMINAR_ARTICULO } from '@/components/articulos/graphql/mutations';
import { BUSCAR_ARTICULOS } from '@/components/articulos/graphql/queries';

type ArticuloMin = Pick<Articulo, 'id' | 'Codigo' | 'Descripcion'>;

interface Props {
  open: boolean;
  onClose: () => void;
  articulo: ArticuloMin | null;
  textoConfirmacion: string;
  setTextoConfirmacion: (v: string) => void;
  onSuccess?: () => void;
}

const PELIGRO_BASE = '#d32f2f';

export default function ModalEliminarArticulo({ open, onClose, articulo, textoConfirmacion, setTextoConfirmacion, onSuccess }: Props) {
  const palabraCorrecta = 'ELIMINAR';
  const textoValido = textoConfirmacion === palabraCorrecta;
  const articuloId = useMemo(() => (articulo?.id != null ? Number(articulo.id) : null), [articulo?.id]);
  const [eliminarArticulo, { loading }] = useMutation(ELIMINAR_ARTICULO, {
    refetchQueries: [{ query: BUSCAR_ARTICULOS }],
  });
  const [error, setError] = React.useState('');

  const handleConfirm = async () => {
    if (!textoValido || articuloId == null) return;
    try {
      await eliminarArticulo({ variables: { id: articuloId } });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar artículo:', err);
      setError(err.message || 'Error al eliminar artículo');
    }
  };

  const cerrarModalEliminar = () => {
    setTextoConfirmacion('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={cerrarModalEliminar}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
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
            Eliminación Permanente de Artículo
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
              Está a punto de eliminar permanentemente el artículo:
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
                &quot;{articulo?.Descripcion || 'Sin descripción'}&quot;
              </Typography>
              {articulo?.Codigo && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Código: {articulo.Codigo}
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
              <li>¿Estás seguro de que deseas eliminar el artículo &quot;{articulo?.Descripcion}&quot;?</li>
              <li>Todas las referencias en ventas y stock se perderán o quedarán huérfanas</li>
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
                  borderRadius: 0,
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

      <DialogActions sx={{ p: 2, bgcolor: '#f1f2f6', borderTop: '1px solid #e0e0e0', gap: 2, borderRadius: 0 }}>
        <Button
          onClick={cerrarModalEliminar}
          variant="outlined"
          disabled={loading}
          sx={{
            flex: 1,
            borderColor: '#b0bec5',
            color: '#546e7a',
            '&:hover': { borderColor: '#78909c', bgcolor: '#eceff1', color: '#37474f' },
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 0,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disableElevation
          disabled={!textoValido || loading}
          sx={{
            flex: 1,
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' },
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 0,
            boxShadow: 'none',
          }}
        >
          {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
