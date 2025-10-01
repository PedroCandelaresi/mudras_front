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
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
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
          borderRadius: 3,
          border: `3px solid ${PELIGRO_BASE}`,
          boxShadow: `0 0 30px ${PELIGRO_GLOW}, 0 8px 32px rgba(0,0,0,0.12)`,
          background: `linear-gradient(135deg, ${PELIGRO_BASE_LIGHT} 0%, ${PELIGRO_PAPER_TOP} 100%)`,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${PELIGRO_BASE} 0%, ${PELIGRO_BASE_DARK} 100%)`,
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
            background:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.12) 10px, rgba(255,255,255,0.12) 20px)',
            animation: 'slide 2s linear infinite',
          },
          '@keyframes slide': {
            '0%': { transform: 'translateX(-20px)' },
            '100%': { transform: 'translateX(20px)' },
          },
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
              '100%': { transform: 'scale(1.1)' },
            },
          }}
        >
          <IconAlertTriangle size={28} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            ⚠️ ZONA DE PELIGRO ⚠️
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
            Eliminación Permanente de Rubro
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            zIndex: 2,
          }}
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 4, p: 5, pt: 4, bgcolor: '#fff' }}>
        <Box display="flex" flexDirection="column" gap={4}>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: PELIGRO_BASE_LIGHT,
              border: `2px dashed ${PELIGRO_BASE}`,
              textAlign: 'center',
            }}
          >
            <IconAlertTriangle size={48} color={PELIGRO_BASE} style={{ marginBottom: 16 }} />
            <Typography variant="h6" sx={{ color: PELIGRO_BASE, fontWeight: 700, mb: 2 }}>
              ¡ATENCIÓN! Esta acción es IRREVERSIBLE
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>Está a punto de eliminar permanentemente el rubro:</Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: '#fff',
                borderRadius: 1,
                border: `1px solid ${PELIGRO_BASE}`,
                display: 'inline-block',
              }}
            >
              <Typography variant="h6" sx={{ color: PELIGRO_BASE, fontWeight: 700 }}>
                {rubro ? `"${rubro.nombre}"` : ''}
              </Typography>
              {rubro?.codigo && (
                <Typography variant="body2" sx={{ color: '#666' }}>Código: {rubro.codigo}</Typography>
              )}
            </Box>
          </Box>

          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              bgcolor: alpha(PELIGRO_BASE, 0.06),
              color: PELIGRO_BASE,
              '& .MuiAlert-icon': { fontSize: 28 },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>⚠️ CONSECUENCIAS DE ESTA ACCIÓN:</Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Se eliminará el rubro permanentemente.</li>
              <li>Los artículos asociados quedarán sin rubro.</li>
              <li>Esta acción NO se puede deshacer.</li>
              <li>Se perderán todas las relaciones del rubro.</li>
            </Typography>
          </Alert>

          <Box>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: PELIGRO_BASE, fontWeight: 700 }}>
              ELIMINAR
            </Typography>
            <TextField
              placeholder="Escriba la palabra de confirmación"
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value.toUpperCase())}
              fullWidth
              variant="outlined"
              error={mostrarError}
              helperText={
                mostrarError
                  ? '❌ Debe escribir exactamente "ELIMINAR"'
                  : textoValido
                  ? '✅ Confirmación correcta'
                  : ''
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: textoValido ? alpha('#4caf50', 0.08) : alpha(PELIGRO_BASE, 0.08),
                  '& fieldset': {
                    borderColor: textoValido ? '#4caf50' : PELIGRO_BASE,
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: textoValido ? '#4caf50' : PELIGRO_BASE,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: textoValido ? '#4caf50' : PELIGRO_BASE,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconAlertTriangle size={20} color={PELIGRO_BASE} />
                  </InputAdornment>
                ),
                style: {
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textAlign: 'center',
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 4,
          pt: 2,
          bgcolor: PELIGRO_BASE_LIGHT,
          gap: 1.5,
        }}
      >
        <CrystalSoftButton
          baseColor={NEUTRO_SUAVE}
          onClick={onClose}
          sx={{
            color: '#424242',
            fontWeight: 600,
            minHeight: 40,
            px: 4,
            '&:hover': { color: '#212121' },
          }}
        >
          ❌ Cancelar
        </CrystalSoftButton>
        <CrystalButton
          baseColor={PELIGRO_BASE}
          onClick={onConfirm}
          disabled={!textoValido}
          sx={{
            minHeight: 40,
            px: 4,
            fontWeight: 800,
            '&:disabled': {
              opacity: 0.5,
              boxShadow: 'none',
            },
          }}
        >
          ⚠️ ELIMINAR PERMANENTEMENTE
        </CrystalButton>
      </DialogActions>
    </Dialog>
  );
}

export default ModalEliminarRubro;
