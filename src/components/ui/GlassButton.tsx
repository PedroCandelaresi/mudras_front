// components/ui/GlassButton.tsx
'use client';
import { Button, ButtonProps } from '@mui/material';
import { styled, alpha, darken, lighten } from '@mui/material/styles';

type Props = ButtonProps & { glassColor?: string };

const GlassButtonRoot = styled(Button, {
  shouldForwardProp: (p) => p !== 'glassColor',
})<Props>(({ theme, glassColor }) => {
  const base = glassColor || theme.palette.primary.main;

  const top    = lighten(base, 0.08);   // leve luz arriba
  const mid    = base;                   // color puro
  const bottom = darken(base, 0.22);     // sombra abajo

  return {
    position: 'relative',
    borderRadius: 18,
    padding: '10px 18px',
    fontWeight: 800,
    letterSpacing: 0.15,
    color: '#fff',
    textTransform: 'none',
    background: `linear-gradient(180deg, ${top} 0%, ${mid} 52%, ${bottom} 100%)`,
    border: `1px solid ${alpha('#fff', 0.28)}`,
    boxShadow: `
      0 10px 24px ${alpha(darken(base, 0.35), 0.45)},
      0 3px 8px ${alpha(darken(base, 0.20), 0.35)},
      inset 0 2px 0 ${alpha('#fff', 0.70)},
      inset 0 -2px 6px ${alpha(darken(base, 0.30), 0.60)}
    `,
    transition: 'transform .08s ease, box-shadow .2s ease, background .2s ease',
    // rim/bisel exterior real: “anillo” independiente
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 18,
      padding: 1.5, // grosor del borde biselado
      background: `linear-gradient(180deg,
        ${alpha('#fff', 0.6)} 0%,
        ${alpha('#fff', 0.15)} 35%,
        ${alpha('#000', 0.18)} 100%
      )`,
      WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    },
    // brillo superior “vidrio”
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 5,
      right: 5,
      top: 5,
      height: '42%',
      borderRadius: 14,
      background: `linear-gradient(180deg,
        ${alpha('#fff', 0.95)} 0%,
        ${alpha('#fff', 0.28)} 60%,
        ${alpha('#fff', 0)} 100%
      )`,
      filter: 'blur(.2px)',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: `linear-gradient(180deg,
        ${lighten(base, 0.02)} 0%,
        ${mid} 52%,
        ${darken(base, 0.25)} 100%
      )`,
      boxShadow: `
        0 12px 28px ${alpha(darken(base, 0.35), 0.55)},
        0 5px 12px ${alpha(darken(base, 0.25), 0.40)},
        inset 0 2px 0 ${alpha('#fff', 0.75)}
      `,
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: `
        0 6px 14px ${alpha(darken(base, 0.40), 0.50)},
        inset 0 2px 4px ${alpha('#000', 0.25)}
      `,
      '&::after': { top: 7, height: '38%' },
    },
    '& .MuiButton-startIcon, & .MuiButton-endIcon': { color: '#fff' },
  };
});

export default function GlassButton(props: Props) {
  return <GlassButtonRoot disableElevation {...props} />;
}
