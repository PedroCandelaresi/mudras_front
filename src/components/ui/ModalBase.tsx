'use client';
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Divider } from '@mui/material';
import { darken, alpha } from '@mui/material/styles';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';

type ModalBaseProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  accentColor?: string;
  maxWidth?: 'sm'|'md'|'lg';
  fullWidth?: boolean;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const VH_MAX = 85;
const HEADER_H = 88;
const FOOTER_H = 88;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

export default function ModalBase({ open, onClose, title, icon, accentColor = '#5D4037', maxWidth = 'md', fullWidth = true, subtitle, actions, children }: ModalBaseProps) {
  const primary = accentColor;
  const primaryHover = darken(primary, 0.12);
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth} PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', bgcolor: 'transparent', overflow: 'hidden', maxHeight: `${VH_MAX}vh` } }}>
      <TexturedPanel accent={primary} radius={12} contentPadding={0} bgTintPercent={12} bgAlpha={1} textureBaseOpacity={0.22} textureBoostOpacity={0.19} textureBrightness={1.12} textureContrast={1.03} tintOpacity={0.4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
          <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', px: 3, py: 2.25, gap: 2 }}>
              {icon && (
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${primary} 0%, ${primaryHover} 100%)`, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)', color: '#fff' }}>
                  {icon}
                </Box>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" fontWeight={700} color="white" sx={{ textShadow: '0 4px 12px rgba(0,0,0,0.88), 0 0 2px rgba(0,0,0,0.72)' }}>{title}</Typography>
                {!!subtitle && (
                  <Typography variant="subtitle2" color="rgba(255,255,255,0.85)" fontWeight={700} sx={{ textShadow: '0 3px 9px rgba(0,0,0,0.82), 0 0 1px rgba(0,0,0,0.7)' }}>{subtitle}</Typography>
                )}
              </Box>
              <Box sx={{ ml: 'auto' }}>
                <CrystalSoftButton baseColor={primary} onClick={onClose} title="Cerrar" sx={{ width: 40, height: 40, minWidth: 40, p: 0, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                  ✕
                </CrystalSoftButton>
              </Box>
            </Box>
          </DialogTitle>
          <Divider sx={{ height: DIV_H, border: 0, backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
                linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
                linear-gradient(90deg, rgba(255,255,255,0.05), ${primary}, rgba(255,255,255,0.05))
              `, backgroundRepeat: 'no-repeat, no-repeat, repeat', backgroundSize: '100% 1px, 100% 1px, 100% 100%', backgroundPosition: 'top left, bottom left, center' }} />
          <DialogContent sx={{ p: 0, borderRadius: 0, overflow: 'auto', maxHeight: CONTENT_MAX, flex: '0 1 auto' }}>
            <Box sx={{ position: 'relative', zIndex: 1, p: 3, borderRadius: 0, backdropFilter: 'saturate(118%) blur(0.4px)', background: 'rgba(255,255,255,0.86)' }}>
              {children}
            </Box>
          </DialogContent>
          <Divider sx={{ height: DIV_H, border: 0, backgroundImage: `
                linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
                linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
                linear-gradient(90deg, rgba(255,255,255,0.05), ${primary}, rgba(255,255,255,0.05))
              `, backgroundRepeat: 'no-repeat, no-repeat, repeat', backgroundSize: '100% 1px, 100% 1px, 100% 100%', backgroundPosition: 'top left, bottom left, center' }} />
          <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 3, py: 2.5, gap: 1.5 }}>
              {actions || (
                <>
                  <CrystalSoftButton baseColor={primary} onClick={onClose}>Cerrar</CrystalSoftButton>
                  <CrystalButton baseColor={primary} disabled>Guardar</CrystalButton>
                </>
              )}
            </Box>
          </DialogActions>
        </Box>
      </TexturedPanel>
    </Dialog>
  );
}

