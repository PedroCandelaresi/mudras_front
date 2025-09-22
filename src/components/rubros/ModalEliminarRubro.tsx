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
  IconButton,
  Button,
  Alert,
  InputAdornment,
} from '@mui/material';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';

export interface Rubro { id: number; nombre: string; codigo?: string }

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rubro: Rubro | null;
  textoConfirmacion: string;
  setTextoConfirmacion: (v: string) => void;
}

export function ModalEliminarRubro({ open, onClose, onConfirm, rubro, textoConfirmacion, setTextoConfirmacion }: Props): JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: '3px solid #d32f2f', boxShadow: '0 0 30px rgba(211, 47, 47, 0.3), 0 8px 32px rgba(0,0,0,0.12)', background: 'linear-gradient(135deg, #ffebee 0%, #fff 100%)' } }}>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2, py: 3, position: 'relative' }}>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1.5, display: 'flex' }}>
          <IconAlertTriangle size={28} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>⚠️ ZONA DE PELIGRO ⚠️</Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>Eliminación Permanente de Rubro</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 4, p: 5, pt: 4, bgcolor: '#fff' }}>
        <Box display="flex" flexDirection="column" gap={4}>
          <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#ffebee', border: '2px dashed #d32f2f', textAlign: 'center' }}>
            <IconAlertTriangle size={48} color="#d32f2f" style={{ marginBottom: 16 }} />
            <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700, mb: 2 }}>¡ATENCIÓN! Esta acción es IRREVERSIBLE</Typography>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>Está a punto de eliminar permanentemente el rubro:</Typography>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #d32f2f', display: 'inline-block' }}>
              <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                {rubro ? `"${rubro.nombre}"` : ''}
              </Typography>
              {rubro?.codigo && (
                <Typography variant="body2" sx={{ color: '#666' }}>Código: {rubro.codigo}</Typography>
              )}
            </Box>
          </Box>

          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>⚠️ CONSECUENCIAS DE ESTA ACCIÓN:</Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Se eliminará el rubro permanentemente</li>
              <li>Los artículos asociados quedarán sin rubro</li>
              <li>Esta acción NO se puede deshacer</li>
              <li>Se perderán todas las relaciones del rubro</li>
            </Typography>
          </Alert>

          <Box>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#d32f2f', fontWeight: 700 }}>ELIMINAR</Typography>
            <TextField
              placeholder="Escriba la palabra de confirmación"
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value.toUpperCase())}
              fullWidth
              variant="outlined"
              error={textoConfirmacion !== '' && textoConfirmacion !== 'ELIMINAR'}
              helperText={textoConfirmacion !== '' && textoConfirmacion !== 'ELIMINAR' ? '❌ Debe escribir exactamente "ELIMINAR"' : textoConfirmacion === 'ELIMINAR' ? '✅ Confirmación correcta' : ''}
              InputProps={{ startAdornment: (<InputAdornment position="start"><IconAlertTriangle size={20} color="#d32f2f" /></InputAdornment>), style: { fontSize: '1.1rem', fontWeight: 600, textAlign: 'center' } }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2, bgcolor: '#ffebee' }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, px: 4, py: 1, borderColor: '#666', color: '#666', '&:hover': { borderColor: '#333', color: '#333', bgcolor: '#f5f5f5' } }}>
          ❌ Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={textoConfirmacion !== 'ELIMINAR'} sx={{ textTransform: 'none', borderRadius: 2, px: 4, py: 1, bgcolor: '#d32f2f', color: 'white', fontWeight: 700, '&:hover': { bgcolor: '#b71c1c' }, '&:disabled': { bgcolor: '#ccc', color: '#666' } }}>
          ⚠️ ELIMINAR PERMANENTEMENTE
        </Button>
      </DialogActions>
    </Dialog>
  );
}
