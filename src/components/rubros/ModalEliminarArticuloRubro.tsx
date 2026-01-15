'use client';

import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Alert
} from '@mui/material';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';

interface Articulo { id: number; codigo?: string; descripcion?: string }

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  articuloSeleccionado: Articulo | null;
  cantidadSeleccionados: number;
  textoConfirmacion: string;
  setTextoConfirmacion: (v: string) => void;
}

export function ModalEliminarArticuloRubro({ open, onClose, onConfirm, articuloSeleccionado, cantidadSeleccionados, textoConfirmacion, setTextoConfirmacion }: Props) {
  const multiple = cantidadSeleccionados > 1;

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
          border: '1px solid #e0e0e0', // Simple border
          bgcolor: '#ffffff'
        }
      }}
    >
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
            Eliminar Artículo{multiple ? 's' : ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" gap={3}>

          {/* Warning Box */}
          <Alert severity="error" sx={{ borderRadius: 0 }} icon={<IconAlertTriangle fontSize="inherit" />}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              ¿Estás seguro que querés eliminar {multiple ? `${cantidadSeleccionados} artículos` : 'este artículo'} del rubro?
            </Typography>
            {!multiple && articuloSeleccionado && (
              <Typography variant="body2" display="block">
                Artículo: <strong>{articuloSeleccionado.codigo} - {articuloSeleccionado.descripcion}</strong>
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Esta acción removerá {multiple ? 'los artículos' : 'el artículo'} del rubro.
            </Typography>
          </Alert>

          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Confirmación
            </Typography>
            <TextField
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Escribí ELIMINAR para confirmar"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: '#fff',
                  '&.Mui-focused fieldset': {
                    borderColor: textoConfirmacion === 'ELIMINAR' ? '#2e7d32' : '#d32f2f',
                  }
                }
              }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><IconAlertTriangle size={16} color={textoConfirmacion === 'ELIMINAR' ? '#2e7d32' : '#d32f2f'} /></InputAdornment>) }}
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
          onClick={onConfirm}
          variant="contained"
          disableElevation
          disabled={textoConfirmacion !== 'ELIMINAR'}
          sx={{
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' },
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 0
          }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
