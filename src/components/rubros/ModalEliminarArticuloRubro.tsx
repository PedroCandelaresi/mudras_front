// /home/candelaresi/proyectos/mudras/frontend/src/components/rubros/ModalEliminarArticuloRubro.tsx
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
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';

import { marron } from './colores-marron';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';

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

const ACCENT = marron.primary;
const ACCENT_DARK = marron.primaryHover ?? marron.primary;
const ACCENT_SOFT_BG = marron.secondary ?? '#EDDFD4';

export function ModalEliminarArticuloRubro({ open, onClose, onConfirm, articuloSeleccionado, cantidadSeleccionados, textoConfirmacion, setTextoConfirmacion }: Props) {
  const multiple = cantidadSeleccionados > 1;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, color: 'white', display: 'flex', alignItems: 'center', gap: 2, py: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1, position: 'relative' }}>
          <Box sx={{ bgcolor: alpha('#ffffff', 0.18), borderRadius: '50%', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconAlertTriangle size={28} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>⚠️ ELIMINAR ARTÍCULO{multiple ? 'S' : ''}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Esta acción no se puede deshacer</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: 'white', bgcolor: alpha('#ffffff', 0.1), '&:hover': { bgcolor: alpha('#ffffff', 0.2) }, zIndex: 2 }}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 4, p: 5, pt: 4, bgcolor: '#fff' }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Box sx={{ p: 3, borderRadius: 2, border: `2px solid ${alpha(ACCENT, 0.25)}`, bgcolor: ACCENT_SOFT_BG, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconAlertTriangle size={24} color={ACCENT} />
            <Box>
              <Typography variant="body1" fontWeight={600} color={ACCENT}>
                ¿Está seguro que quiere eliminar {multiple ? `${cantidadSeleccionados} artículos` : 'este artículo'} del rubro?
              </Typography>
              {!multiple && articuloSeleccionado && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Artículo: <strong>{articuloSeleccionado.codigo} - {articuloSeleccionado.descripcion}</strong>
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" mt={1}>
                Esta acción removerá {multiple ? 'los artículos' : 'el artículo'} del rubro.
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={600} mb={2} color={ACCENT}>Para confirmar la acción escriba la palabra ELIMINAR</Typography>
            <TextField
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Escriba ELIMINAR para confirmar"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><IconAlertTriangle size={16} color={ACCENT} /></InputAdornment>) }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 4, pt: 2, bgcolor: alpha(ACCENT, 0.08), borderTop: '1px solid #eee', gap: 1.5 }}>
        <CrystalSoftButton
          baseColor={ACCENT}
          onClick={onClose}
          sx={{
            minHeight: 42,
            px: 3,
            fontWeight: 600,
            color: marron.textStrong,
          }}
        >
          Cancelar
        </CrystalSoftButton>
        <CrystalButton
          baseColor={ACCENT}
          onClick={onConfirm}
          disabled={textoConfirmacion !== 'ELIMINAR'}
          sx={{
            minHeight: 42,
            px: 4,
            fontWeight: 700,
            '&:disabled': {
              opacity: 0.55,
              boxShadow: 'none',
            },
          }}
        >
          ⚠️ ELIMINAR {multiple ? 'ARTÍCULOS' : 'ARTÍCULO'}
        </CrystalButton>
      </DialogActions>
    </Dialog>
  );
}

