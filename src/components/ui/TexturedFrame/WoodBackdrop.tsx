// /src/components/ui/TexturedFrame/WoodBackdrop.tsx
'use client';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

type Props = {
  accent: string;
  radius?: number;                // radio del contenedor de madera
  inset?: number;                 // margen interno desde los bordes
  strength?: number;              // intensidad del tinte
  texture?: 'square' | 'wide' | 'tabla';
};

const TEXTURES = {
  square: '/textures/woodgrain-h-1024.png',
  wide:   '/textures/woodgrain-h-wide-1024x512.png',
  tabla:  '/textures/maderaTablas.png',
} as const;

export function WoodBackdrop({
  accent,
  radius = 0,                     // <- antes 12: por defecto CUADRADO
  inset = 0,                      // <- antes 8: por defecto pegado a los bordes
  strength = 0.18,
  texture = 'square',
}: Props) {
  const url = TEXTURES[texture];
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        zIndex: 0,
        inset,
        borderRadius: radius,
        // si no hay radio, no recortes (evita halos/antialias y “sensación” de borde redondeado)
        overflow: radius ? 'hidden' : 'visible',
        backgroundImage: `
          linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 40%),
          url(${url}),
          radial-gradient(140% 90% at 50% -10%, ${alpha(accent, strength)}, transparent 70%)
        `,
        backgroundBlendMode: 'screen, multiply, soft-light',
        backgroundRepeat: 'no-repeat, repeat, no-repeat',
        backgroundSize: '100% 100%, 512px 512px, 100% 100%',
        backgroundPosition: 'center, 0 0, center',
        filter: 'grayscale(100%) contrast(1.18) brightness(1.03) saturate(1.05)',
        pointerEvents: 'none',
      }}
    />
  );
}
