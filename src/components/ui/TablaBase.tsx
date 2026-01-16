'use client';
import React from 'react';
import { Box, TableContainer } from '@mui/material';
import { alpha } from '@mui/material/styles';

type TablaBaseProps = {
  accentColor: string;
  overlayTint?: string;
  children: React.ReactNode;
};

export function TablaBase({ accentColor, children }: TablaBaseProps) {
  return (
    <Box sx={{ position: 'relative', borderRadius: 0, overflow: 'hidden', border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Box>
  );
}

export function TablaContainer({ accentColor, children }: { accentColor: string; children: React.ReactNode }) {
  return (
    <TableContainer sx={{ position: 'relative', borderRadius: 0, border: '1px solid', borderColor: alpha(accentColor, 0.2), bgcolor: '#ffffff', overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </TableContainer>
  );
}

