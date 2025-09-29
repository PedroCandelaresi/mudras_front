// /components/ui/TexturedFrame/WoodPanel.tsx
'use client';
import { PropsWithChildren } from 'react';
import { Paper, Box } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

type WoodPanelProps = PropsWithChildren<{
  accent?: string;     // color de tinte (ej: rosa.primary)
  radius?: number;
  p?: number | string;
  strength?: number;   // 0.1–0.6 cuánta tinta aplicar
  blur?: number;       // 0–2px
  texture?: 'square' | 'wide';
}>;

const Outer = styled(Paper)<{ $radius: number }>(({ $radius }) => ({
  position: 'relative',
  borderRadius: $radius,
  padding: 2,
  background: 'linear-gradient(135deg, rgba(255,255,255,.85), rgba(230,230,230,.95))',
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,.6),
    inset 0 -1px 0 rgba(0,0,0,.18),
    0 10px 28px rgba(0,0,0,.16)
  `
}));

const Inner = styled(Box)<{ $accent: string; $strength: number; $blur: number; $src: string }>(
  ({ $accent, $strength, $blur, $src }) => ({
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    // 1) textura en escala de grises
    backgroundImage: `
      url(${$src}),
      radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.35), transparent 60%)
    `,
    backgroundSize: '512px 512px, cover',  // repetible
    backgroundRepeat: 'repeat, no-repeat',
    backgroundPosition: 'center',
    // 2) tinte: superponemos un color semitransparente
    backgroundColor: alpha($accent, $strength),
    backgroundBlendMode: 'multiply, screen',
    // 3) toques metálicos/mate
    boxShadow: `
      inset 0 2px 6px rgba(0,0,0,.16),
      inset 0 -1px 0 rgba(255,255,255,.35)
    `,
    backdropFilter: `saturate(115%) blur(${$blur}px)`,
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0) 38%)',
      pointerEvents: 'none'
    }
  })
);

export function WoodPanel({
  children,
  accent = '#d81b60',
  radius = 12,
  p = 16,
  strength = 0.28,
  blur = 0.6,
  texture = 'square'
}: WoodPanelProps) {
  const src =
    texture === 'wide'
      ? '/textures/wood/woodgrain-h-wide-1024x512.png'
      : '/textures/wood/woodgrain-h-1024.png';

  return (
    <Outer elevation={0} $radius={radius}>
      <Inner $src={src} $accent={accent} $strength={strength} $blur={blur} sx={{ p }}>
        {children}
      </Inner>
    </Outer>
  );
}
