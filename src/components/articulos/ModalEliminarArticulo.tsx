'use client';
import React, { useMemo } from 'react';
import {
  Box,
  Dialog,
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
  const [eliminarArticulo, { loading }] = useMutation(ELIMINAR_ARTICULO);

  const handleConfirm = async () => {
    if (!textoValido || articuloId == null) return;
    try {
      await eliminarArticulo({ variables: { id: articuloId } });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error al eliminar artículo:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
        },
      }}
    >
      <Box sx={{
        bgcolor: '#f5f5f5',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconAlertTriangle size={24} color={PELIGRO_BASE} />
          <Typography variant="h6" fontWeight={700} color={PELIGRO_BASE}>
            Zona de Peligro
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Alert severity="error" sx={{ borderRadius: 0 }} icon={<IconAlertTriangle fontSize="inherit" />}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              ¡Atención! Esta acción es irreversible
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Está a punto de eliminar permanentemente el artículo:
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {articulo ? `"${articulo.Descripcion ?? ''}"` : ''}
            </Typography>
            {articulo?.Codigo && (
              <Typography variant="caption" display="block">
                Código: {articulo.Codigo}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Se perderán todas las referencias asociadas.
            </Typography>
          </Alert>

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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: '#fff',
                  '&.Mui-focused fieldset': {
                    borderColor: textoValido ? '#2e7d32' : PELIGRO_BASE,
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconAlertTriangle size={20} color={textoValido ? '#2e7d32' : PELIGRO_BASE} />
                  </InputAdornment>
                )
              }}
            />
            {textoValido && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, fontWeight: 600 }}>
                ✅ Confirmación correcta
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', gap: 2 }}>
        <Button
          onClick={onClose}
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
          onClick={handleConfirm}
          disabled={!textoValido || loading}
          variant="contained"
          disableElevation
          sx={{
            bgcolor: PELIGRO_BASE,
            '&:hover': { bgcolor: '#b71c1c' },
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 0
          }}
        >
          Eliminar Artículo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
