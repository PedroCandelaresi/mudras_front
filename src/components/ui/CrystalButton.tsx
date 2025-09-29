'use client';

import { Button, IconButton, ButtonProps, IconButtonProps } from '@mui/material';
import { styled, alpha, darken, lighten } from '@mui/material/styles';

/* ---------- helpers públicos ---------- */
export const forceWhiteIconsSX = {
  color: '#fff !important',
  textShadow: '0 1px 1px rgba(0,0,0,.18)',
  '& .MuiButton-startIcon, & .MuiButton-endIcon': { '& svg': { color: '#fff !important' } },
  '& svg': { color: '#fff !important' },
  '& svg path, & svg circle, & svg rect, & svg line, & svg polyline, & svg polygon': {
    stroke: '#fff !important',
    fill: 'none',
  },
};
export const forceWhiteIconSX = forceWhiteIconsSX;

/* ---------- tipos ---------- */
type VariantStyle = 'solid' | 'light';
type BaseCompat = { baseColor?: string; glassColor?: string; glasscolor?: string; edgecolor?: string };
type SolidProps = ButtonProps & BaseCompat & { intensity?: number; forceWhiteIcons?: boolean };
type LightProps = ButtonProps & BaseCompat;
type CrystalButtonProps = (SolidProps | LightProps) & { variantStyle?: VariantStyle };

/* ---------- utils ---------- */
const resolveBase = (theme: any, p: BaseCompat) =>
  p.baseColor || p.glassColor || p.glasscolor || p.edgecolor || theme.palette.primary.main;

/* ---------- GLOSS shared ---------- */
/** Capa de brillo a pantalla completa: tira superior + “swoosh” diagonal + leve luz inferior */
const glossAfter = (intensity = 1) => ({
  content: '""',
  position: 'absolute' as const,
  inset: 0,                    // ← cubre todo el botón
  borderRadius: 'inherit',
  pointerEvents: 'none',
  backgroundImage: `
    /* tira superior */
    linear-gradient(
      to bottom,
      rgba(255,255,255,${0.55 * intensity}) 0%,
      rgba(255,255,255,${0.35 * intensity}) 24%,
      rgba(255,255,255,${0.15 * intensity}) 34%,
      rgba(255,255,255,0) 44%
    ),
    /* swoosh diagonal (reflejo curvado) */
    radial-gradient(
      220% 140% at 80% -20%,
      rgba(255,255,255,${0.58 * intensity}) 0%,
      rgba(255,255,255,${0.28 * intensity}) 38%,
      rgba(255,255,255,0) 60%
    ),
    /* leve brillo inferior */
    linear-gradient(
      to top,
      rgba(255,255,255,${0.12 * intensity}) 0%,
      rgba(255,255,255,0) 18%
    )
  `,
  backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
  mixBlendMode: 'screen' as const, // look “glass”
});

/* ---------- estilos ---------- */
/** SÓLIDO */
const solidStyle = (base: string, intensity = 0.66) => {
  const top = alpha(lighten(base, 0.18), 0.98);
  const mid = alpha(base, 1);
  const bot = alpha(darken(base, 0.22), 0.96);

  return {
    background: `linear-gradient(180deg, ${top} 0%, ${mid} 56%, ${bot} 100%)`,
    border: 'none',
    boxShadow: `
      0 12px 26px ${alpha(base, 0.32)},
      0 3px 10px ${alpha(base, 0.20)},
      inset 0 1px 0 ${alpha('#fff', 0.50)},
      inset 0 -1px 0 ${alpha('#000', 0.16)}
    `,
    '&::after': {
      ...glossAfter(1),        // ← brillo a botón completo
    },
    '&:hover': {
      background: `linear-gradient(180deg,
        ${alpha(lighten(base, 0.20), 1)} 0%,
        ${alpha(base, 1)} 56%,
        ${alpha(darken(base, 0.26), 0.98)} 100%)`,
      boxShadow: `
        0 14px 30px ${alpha(base, 0.40)},
        0 5px 12px ${alpha(base, 0.24)},
        inset 0 1px 0 ${alpha('#fff', 0.62)}
      `,
      transform: 'translateY(-0.5px)',
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: `0 8px 18px ${alpha(base, 0.28)}, inset 0 2px 3px ${alpha('#000', 0.20)}`,
      background: `linear-gradient(180deg,
        ${alpha(lighten(base, 0.10), 1)} 0%,
        ${alpha(darken(base, 0.05), 1)} 56%,
        ${alpha(darken(base, 0.28), 1)} 100%)`,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 3px rgba(255,255,255,0.92), 0 0 0 6px ${alpha(base, 0.28)}`,
    },
    '&.Mui-disabled': {
      opacity: 0.58,
      boxShadow: 'none',
      background: `linear-gradient(180deg,
        ${alpha(lighten(base, 0.06), 0.70)} 0%,
        ${alpha(base, 0.68)} 60%,
        ${alpha(darken(base, 0.18), 0.56)} 100%)`,
      color: alpha('#fff', 0.9),
    },
  };
};

/** LIGHT (blanco) */
const lightStyle = (base: string) => ({
  color: 'rgba(22,24,28,.92)',
  background: `
    linear-gradient(180deg, rgba(255,255,255,0.995) 0%, rgba(255,255,255,0.97) 58%, rgba(255,255,255,0.95) 100%),
    linear-gradient(180deg, ${alpha('#000', 0.10)} 0%, ${alpha('#000', 0)} 14%, ${alpha('#000', 0)} 86%, ${alpha('#000', 0.10)} 100%)
  `,
  border: 'none',
  boxShadow: `
    0 10px 22px ${alpha(base, 0.18)},
    inset 0 1px 0 ${alpha('#fff', 0.96)},
    inset 0 -1px 0 ${alpha('#000', 0.12)}
  `,
  '&::before': { content: 'none' },
  '&::after': {
    ...glossAfter(0.7),        // ↓ menos intenso para blanco
  },
  '&:hover': {
    color: 'rgba(22,24,28,.92)',
    background: `
      linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.985) 58%, rgba(255,255,255,0.96) 100%),
      linear-gradient(180deg, ${alpha('#000', 0.12)} 0%, ${alpha('#000', 0)} 14%, ${alpha('#000', 0)} 86%, ${alpha('#000', 0.12)} 100%)
    `,
    boxShadow: `0 12px 26px ${alpha(base, 0.24)}, inset 0 1px 0 ${alpha('#fff', 0.98)}, inset 0 -1px 0 ${alpha('#000', 0.14)}`,
    transform: 'translateY(-.5px)',
  },
  '&:active': { transform: 'translateY(1px)', boxShadow: `0 8px 18px ${alpha(base, 0.20)}, inset 0 2px 3px ${alpha('#000', 0.16)}` },
  '&:focus-visible': { outline: 'none', boxShadow: `0 0 0 3px rgba(255,255,255,0.92), 0 0 0 6px ${alpha(base, 0.22)}` },
  '&.Mui-disabled': { opacity: 0.75, boxShadow: 'none' },
});

/** SOFT (pastel) */
const softStyle = (base: string) => {
  const top = alpha(lighten(base, 0.78), 0.98);
  const mid = alpha(lighten(base, 0.58), 0.97);
  const bot = alpha(lighten(base, 0.44), 0.96);

  return {
    color: 'rgba(22,24,28,.92)',
    background: `linear-gradient(180deg, ${top} 0%, ${mid} 58%, ${bot} 100%)`,
    border: 'none',
    boxShadow: `
      0 10px 22px ${alpha(base, 0.22)},
      inset 0 1px 0 ${alpha('#fff', 0.94)},
      inset 0 -1px 0 ${alpha('#000', 0.10)}
    `,
    '&::before': { content: 'none' },
    '&::after': {
      ...glossAfter(0.9),      // intermedio
    },
    '&:hover': {
      background: `linear-gradient(180deg,
        ${alpha(lighten(base, 0.70), 1)} 0%,
        ${alpha(lighten(base, 0.52), 0.99)} 58%,
        ${alpha(lighten(base, 0.40), 0.98)} 100%)`,
      boxShadow: `0 12px 26px ${alpha(base, 0.28)}, inset 0 1px 0 ${alpha('#fff', 0.98)}, inset 0 -1px 0 ${alpha('#000', 0.12)}`,
      transform: 'translateY(-.5px)',
    },
    '&:active': { transform: 'translateY(1px)', boxShadow: `0 8px 18px ${alpha(base, 0.22)}, inset 0 2px 3px ${alpha('#000', 0.14)}` },
    '&.Mui-disabled': { opacity: 0.78, boxShadow: 'none' },
  };
};

/* ---------- implementaciones ---------- */
const SolidRoot = styled(Button, {
  shouldForwardProp: (p) =>
    !['baseColor','glassColor','glasscolor','edgecolor','intensity','forceWhiteIcons'].includes(String(p)),
})<SolidProps>(({ theme, ...p }) => {
  const base = resolveBase(theme, p);
  return {
    position: 'relative',
    minHeight: 40,
    padding: '10px 18px',
    borderRadius: 12,
    fontWeight: 800,
    letterSpacing: 0.15,
    color: '#fff',
    textShadow: '0 1px 1px rgba(0,0,0,.18)',
    backdropFilter: 'blur(6px) saturate(140%)',
    WebkitBackdropFilter: 'blur(6px) saturate(140%)',
    ...solidStyle(base, p.intensity ?? 0.66),
    ...forceWhiteIconsSX,
  };
});

export const CrystalIconButton = styled(IconButton, {
  shouldForwardProp: (p) => !['baseColor','glassColor','glasscolor','edgecolor'].includes(String(p)),
})<IconButtonProps & BaseCompat>(({ theme, ...p }) => {
  const base = resolveBase(theme, p);
  return {
    width: 34,
    height: 34,
    borderRadius: 12,
    color: '#fff',
    border: 'none',
    backdropFilter: 'blur(6px) saturate(140%)',
    WebkitBackdropFilter: 'blur(6px) saturate(140%)',
    ...solidStyle(base, 0.66),  // heredará el ::after full-bleed
    '& svg': { color: '#fff' },
    '& svg path, & svg circle, & svg rect, & svg line, & svg polyline, & svg polygon': {
      stroke: '#fff !important', fill: 'none',
    },
    '&.Mui-disabled': { opacity: 0.58, boxShadow: 'none' },
  };
});

export const CrystalLightButton = styled(Button, {
  shouldForwardProp: (p) => !['baseColor','glassColor','glasscolor','edgecolor'].includes(String(p)),
})<LightProps>(({ theme, ...p }) => {
  const base = resolveBase(theme, p);
  return {
    position: 'relative',
    minHeight: 40,
    padding: '10px 18px',
    borderRadius: 12,
    fontWeight: 800,
    letterSpacing: 0.15,
    backdropFilter: 'blur(6px) saturate(140%)',
    WebkitBackdropFilter: 'blur(6px) saturate(140%)',
    ...lightStyle(base),
  };
});

export const CrystalSoftButton = styled(Button, {
  shouldForwardProp: (p) => !['baseColor','glassColor','glasscolor','edgecolor'].includes(String(p)),
})<LightProps>(({ theme, ...p }) => {
  const base = resolveBase(theme, p);
  return {
    position: 'relative',
    minHeight: 40,
    padding: '10px 18px',
    borderRadius: 12,
    fontWeight: 800,
    letterSpacing: 0.15,
    backdropFilter: 'blur(6px) saturate(140%)',
    WebkitBackdropFilter: 'blur(6px) saturate(140%)',
    ...softStyle(base),
  };
});

/* ---------- wrapper ---------- */
export default function CrystalButton({ variantStyle = 'solid', ...rest }: CrystalButtonProps) {
  if (variantStyle === 'light') return <CrystalLightButton {...(rest as LightProps)} />;
  return <SolidRoot {...(rest as SolidProps)} />;
}
