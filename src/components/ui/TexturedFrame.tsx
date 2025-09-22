'use client';
import { PropsWithChildren } from 'react';
import { Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

type TexturedFrameProps = PropsWithChildren<{
  accent?: string; // Color de tinte (ej: azul, verde, violeta)
  p?: number | string; // Padding interno
  radius?: number; // Radio del borde
  showOuterBorder?: boolean;
}>;

const Outer = styled(Paper)<{ $accent: string; $radius: number; $showOuterBorder: boolean }>(
  ({ $accent, $radius, $showOuterBorder }) => ({
    position: 'relative',
    borderRadius: $radius,
    overflow: 'hidden',
    padding: 2,
    background: `linear-gradient(135deg, rgba(240,240,240,.95), rgba(200,200,200,.98))`,
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,.6),
      inset 0 -1px 0 rgba(0,0,0,.25),
      0 8px 24px rgba(0,0,0,.16)
    `,
    border: $showOuterBorder ? `1px solid ${$accent}` : 'none',
  })
);

const Inner = styled(Box)<{ $accent: string }>(({ $accent }) => ({
  position: 'relative',
  borderRadius: 10,
  overflow: 'hidden',
  outline: '1px solid rgba(255,255,255,.35)',
  boxShadow: `
    inset 0 2px 6px rgba(0,0,0,.18),
    inset 0 -1px 0 rgba(255,255,255,.35)
  `,
  // Tintado metálico: capa de color semi-transparente sobre la textura gris
  backgroundColor: $accent + '99', // alpha ≈ 0.6
  backgroundImage: [
    'linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 38%)',
    'url("/textures/brushed-metal-1024.jpg")',
    'url("/textures/noise-128.png")',
  ].join(','),
  backgroundBlendMode: 'screen, multiply, overlay',
  backgroundSize: '100% 100%, cover, 128px 128px',
  backgroundPosition: 'center, center, 0 0',
  backdropFilter: 'saturate(115%) blur(0.6px)',

  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0) 50%)',
    pointerEvents: 'none',
  },
}));

export function TexturedFrame({
  children,
  accent = '#1565c0', // azul por defecto
  p = 16,
  radius = 12,
  showOuterBorder = true,
}: TexturedFrameProps) {
  return (
    <Outer elevation={0} $accent={accent} $radius={radius} $showOuterBorder={showOuterBorder}>
      <Inner $accent={accent} sx={{ p }}>
        {children}
      </Inner>
    </Outer>
  );
}
