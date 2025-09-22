'use client';
import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, IconButton, Button, InputAdornment } from '@mui/material';
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

export function ModalEliminarArticuloRubro({ open, onClose, onConfirm, articuloSeleccionado, cantidadSeleccionados, textoConfirmacion, setTextoConfirmacion }: Props): JSX.Element {
  const multiple = cantidadSeleccionados > 1;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2, py: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1, position: 'relative' }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconAlertTriangle size={28} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>⚠️ ELIMINAR ARTÍCULO{multiple ? 'S' : ''}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Esta acción no se puede deshacer</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, zIndex: 2 }}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 4, p: 5, pt: 4, bgcolor: '#fff' }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Box sx={{ p: 3, borderRadius: 2, border: '2px solid #ffebee', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconAlertTriangle size={24} color="#d32f2f" />
            <Box>
              <Typography variant="body1" fontWeight={600} color="#d32f2f">¿Está seguro que quiere eliminar {multiple ? `${cantidadSeleccionados} artículos` : 'este artículo'} del rubro?</Typography>
              {!multiple && articuloSeleccionado && (
                <Typography variant="body2" color="text.secondary" mt={1}>Artículo: <strong>{articuloSeleccionado.codigo} - {articuloSeleccionado.descripcion}</strong></Typography>
              )}
              <Typography variant="body2" color="text.secondary" mt={1}>Esta acción removerá {multiple ? 'los artículos' : 'el artículo'} del rubro.</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={600} mb={2} color="#d32f2f">Para confirmar la acción escriba la palabra ELIMINAR</Typography>
            <TextField
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Escriba ELIMINAR para confirmar"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><IconAlertTriangle size={16} color="#d32f2f" /></InputAdornment>) }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 4, pt: 2, bgcolor: '#fafafa', borderTop: '1px solid #eee' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2, px: 3, color: 'text.secondary', border: '1px solid #ddd', '&:hover': { bgcolor: '#f5f5f5' } }}>Cancelar</Button>
        <Button onClick={onConfirm} disabled={textoConfirmacion !== 'ELIMINAR'} sx={{ textTransform: 'none', borderRadius: 2, px: 4, bgcolor: '#d32f2f', color: 'white', fontWeight: 600, '&:hover': { bgcolor: '#b71c1c' }, '&:disabled': { bgcolor: '#ccc', color: '#999' } }}>⚠️ ELIMINAR {multiple ? 'ARTÍCULOS' : 'ARTÍCULO'}</Button>
      </DialogActions>
    </Dialog>
  );
}
