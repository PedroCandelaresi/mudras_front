// /home/candelaresi/proyectos/mudras/frontend/src/components/rubros/ModalEliminarRubro.tsx
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
  Alert,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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

const PELIGRO_BASE = '#d32f2f';
const PELIGRO_BASE_DARK = '#b71c1c';
const PELIGRO_BASE_LIGHT = '#ffebee';
const PELIGRO_PAPER_TOP = alpha('#ffffff', 0.65);
const PELIGRO_GLOW = 'rgba(211, 47, 47, 0.35)';
const NEUTRO_SUAVE = '#f5f5f5';

export function ModalEliminarRubro({ open, onClose, onConfirm, rubro, textoConfirmacion, setTextoConfirmacion }: Props) {
  const palabraCorrecta = 'ELIMINAR';
  const textoValido = textoConfirmacion === palabraCorrecta;
  const mostrarError = textoConfirmacion !== '' && !textoValido;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: `1px solid ${PELIGRO_BASE}`,
          boxShadow: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: PELIGRO_BASE,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Eliminar Rubro
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'white',
            '&:hover': { bgcolor: alpha('#fff', 0.1) },
          }}
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, p: 3, pt: 1, bgcolor: '#fff' }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Alert severity="error" icon={<IconAlertTriangle size={24} />} sx={{ borderRadius: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              ¡ATENCIÓN! Esta acción es IRREVERSIBLE
            </Typography>
            <Typography variant="body2">
              Está a punto de eliminar permanentemente el rubro <strong>{rubro ? `"${rubro.nombre}"` : ''}</strong>.
            </Typography>
          </Alert>

          <Box sx={{ p: 2, bgcolor: '#f9fafb', border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Consecuencias:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
              <li>Se eliminará el rubro permanentemente.</li>
              <li>Los artículos asociados quedarán sin rubro.</li>
              <li>Esta acción NO se puede deshacer.</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={600} mb={1} display="block" color={PELIGRO_BASE}>
              Escriba &quot;ELIMINAR&quot; para confirmar
            </Typography>
            <TextField
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value.toUpperCase())}
              fullWidth
              placeholder="ELIMINAR"
              error={mostrarError}
              helperText={mostrarError ? 'Debe escribir exactamente "ELIMINAR"' : ''}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconAlertTriangle size={18} color={PELIGRO_BASE} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 0 }
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f9fafb' }}>
        <Box display="flex" width="100%" justifyContent="flex-end" gap={2}>
          <Box
            component="button"
            onClick={onClose}
            sx={{
              px: 3, py: 1,
              border: '1px solid #ccc',
              bgcolor: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.secondary',
              transition: 'background 0.2s',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            Cancelar
          </Box>

          <Box
            component="button"
            onClick={onConfirm}
            disabled={!textoValido}
            sx={{
              px: 3, py: 1,
              border: 'none',
              bgcolor: textoValido ? PELIGRO_BASE : '#e0e0e0',
              color: '#fff',
              cursor: textoValido ? 'pointer' : 'not-allowed',
              fontWeight: 700,
              fontSize: '0.875rem',
              transition: 'background 0.2s',
              '&:hover': textoValido ? { bgcolor: PELIGRO_BASE_DARK } : {}
            }}
          >
            CONFIRMAR ELIMINACIÓN
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ModalEliminarRubro;
