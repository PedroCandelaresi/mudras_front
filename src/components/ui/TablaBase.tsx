'use client';
import React from 'react';
import { Box, TableContainer } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';

type TablaBaseProps = {
  accentColor: string;
  overlayTint?: string;
  children: React.ReactNode;
};

export function TablaBase({ accentColor, overlayTint = 'rgba(255, 250, 242, 0.94)', children }: TablaBaseProps) {
  const biselExteriorConfig = crearConfiguracionBisel(accentColor, 1.5);
  const estilosBiselExterior = crearEstilosBisel(biselExteriorConfig, { zContenido: 2 });
  const accentInterior = accentColor;
  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: '0 18px 40px rgba(0,0,0,0.12)', background: 'transparent', ...estilosBiselExterior }}>
      <WoodBackdrop accent={accentColor} radius={3} inset={0} strength={0.16} texture="tabla" />
      <Box sx={{ position: 'absolute', inset: 0, backgroundColor: alpha(overlayTint, 0.82), zIndex: 0 }} />
      <Box sx={{ position: 'relative', zIndex: 2, p: 2.75 }}>
        {children}
      </Box>
    </Box>
  );
}

export function TablaContainer({ accentColor, children }: { accentColor: string; children: React.ReactNode }) {
  const accentInterior = accentColor;
  return (
    <TableContainer sx={{ position: 'relative', borderRadius: 0, border: '1px solid', borderColor: alpha(accentInterior, 0.38), bgcolor: 'rgba(255, 250, 242, 0.94)', backdropFilter: 'saturate(110%) blur(0.85px)', overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }}>
      <WoodBackdrop accent={accentColor} radius={0} inset={0} strength={0.12} texture="tabla" />
      <Box sx={{ position: 'absolute', inset: 0, backgroundColor: alpha('#fffaf3', 0.82), zIndex: 0 }} />
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {children}
      </Box>
    </TableContainer>
  );
}

