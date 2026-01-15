'use client';
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Divider, IconButton, Button } from '@mui/material';
import { IconX } from '@tabler/icons-react';

type ModalBaseProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  accentColor?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /**
    * Texto del botón de aceptar (si no se pasan actions custom).
    */
  aceptarTexto?: string;
  /**
   * Callback al aceptar (si no se pasan actions custom).
   */
  onAceptar?: () => void;
  /**
   * Deshabilitar botón aceptar.
   */
  deshabilitarAceptar?: boolean;
};

const VH_MAX = 90;

export function ModalBase({
  open,
  onClose,
  title,
  icon,
  accentColor = '#5D4037',
  maxWidth = 'md',
  fullWidth = true,
  subtitle,
  actions,
  children,
  aceptarTexto = 'Guardar',
  onAceptar,
  deshabilitarAceptar = false
}: ModalBaseProps) {

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 0,
          boxShadow: 3,
          maxHeight: `${VH_MAX}vh`,
          border: '1px solid #e0e0e0'
        }
      }}
    >
      <DialogTitle sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {icon && (
              <Box sx={{ display: 'flex', color: accentColor }}>
                {icon}
              </Box>
            )}
            <Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        {children}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', justifyContent: 'flex-end' }}>
        {actions ? actions : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose} color="inherit">
              Cerrar
            </Button>
            {onAceptar && (
              <Button
                onClick={onAceptar}
                variant="contained"
                disabled={deshabilitarAceptar}
                sx={{ bgcolor: accentColor, '&:hover': { bgcolor: accentColor } }}
              >
                {aceptarTexto}
              </Button>
            )}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}
export default ModalBase;

