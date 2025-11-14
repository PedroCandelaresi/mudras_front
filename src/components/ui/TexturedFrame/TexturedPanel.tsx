// /home/candelaresi/proyectos/mudras/frontend/src/components/ui/TexturedFrame
'use client';
import { PropsWithChildren, memo, useMemo } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

/* ======================== API pública del componente ======================== */
export type TexturedPanelProps = PropsWithChildren<{
  /* Color principal del módulo (azul/verde/etc.) */
  accent?: string;

  /* Layout */
  radius?: number;
  contentPadding?: number;

  /* Fondo (mezcla del accent con un blanco azulado) */
  bgTintPercent?: number;     // 0–100: cuánto del accent entra al fondo
  bgAlpha?: number;           // 0–1: transparencia del fondo

  /* Textura (archivo gris/blanco) */
  textureUrl?: string;
  textureScale?: number;      // 0.8–1.6 (<1 = más detalle)
  textureBaseOpacity?: number;   // 0–1: opacidad de textura base
  textureBoostOpacity?: number;  // 0–1: refuerzo multiply de la veta
  textureContrast?: number;   // 0.5–1.5
  textureBrightness?: number; // 0.5–1.5

  /* Tinte de color sobre la textura */
  tintOpacity?: number;                  // 0–1
  tintMode?: 'overlay' | 'soft-light';   // modo de mezcla del tinte

  /* Bisel metálico (exterior e interior, con máscara => no engorda) */
  bevelWidth?: number;       // px
  bevelIntensity?: number;   // 0–1

  /* Brillos/sombras auxiliares */
  glossStrength?: number;    // 0–1 (brillo superior)
  vignetteStrength?: number; // 0–1 (sombra perimetral sutil)

  /* Estética general */
  variant?: 'borderless' | 'outlined';
  outlineWidth?: number;

  className?: string;
}>;

/* ============================== Tipos internos ============================== */
type ShellProps = {
  radius: number;
  accent: string;
  variant: 'borderless' | 'outlined';
  outlineWidth: number;
  bevelWidth: number;
  bevelIntensity: number;
  vignetteStrength: number;
};

type PanelProps = {
  accent: string;
  contentPadding: number;
  bgTintPercent: number;
  bgAlpha: number;

  textureUrl: string;
  textureScale: number;
  textureBaseOpacity: number;
  textureBoostOpacity: number;
  textureContrast: number;
  textureBrightness: number;

  tintOpacity: number;
  tintMode: 'overlay' | 'soft-light';

  radius: number;
  bevelWidth: number;
  bevelIntensity: number;
  glossStrength: number;
};

/* ======================= SHELL (no altera layout) ======================= */
const Shell = styled('div', {
  shouldForwardProp: (prop) =>
    ![
      'radius','accent','variant','outlineWidth',
      'bevelWidth','bevelIntensity','vignetteStrength',
    ].includes(String(prop)),
})<ShellProps>(({ radius }) => ({
  position: 'relative',
  borderRadius: radius,
  overflow: 'hidden',
  padding: 0,

  /* 🔥 Nada de fondo ni degradados ni sombras */
  background: 'transparent',
  boxShadow: 'none',
  filter: 'none',

  '&::after': {
    content: '""',
    display: 'none',
  },
}));


/* =================== PANEL (textura + color + bisel interno) =================== */
const Panel = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      'accent','contentPadding',
      'bgTintPercent','bgAlpha',
      'textureUrl','textureScale','textureBaseOpacity','textureBoostOpacity','textureContrast','textureBrightness',
      'tintOpacity','tintMode',
      'radius','bevelWidth','bevelIntensity','glossStrength',
    ].includes(String(prop)),
})<PanelProps>(({
  accent, contentPadding, bgTintPercent, bgAlpha,
  textureUrl, textureScale, textureBaseOpacity, textureBoostOpacity, textureContrast, textureBrightness,
  tintOpacity, tintMode, radius, bevelWidth, bevelIntensity, glossStrength,
}) => ({
  position: 'relative',
  borderRadius: Math.max(0, radius),
  overflow: 'hidden',
  padding: contentPadding,

  /* Fondo base con mezcla de color configurable */
  backgroundColor: `color-mix(in srgb, ${accent} ${Math.max(0, Math.min(100, bgTintPercent))}%, rgba(248,251,255,${Math.max(0, Math.min(1, bgAlpha))}))`,

  /* SIN bordes internos */
  boxShadow: 'none',

  /* TEXTURA BASE (visible debajo del tinte) */
  '& .tp-textureBase': {
    position: 'absolute', inset: 0,
    backgroundImage: `url("${textureUrl}")`,
    backgroundSize: `${Math.max(0.8, textureScale) * 100}% auto`,
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center',
    opacity: Math.max(0, Math.min(1, textureBaseOpacity)),
    filter: `grayscale(100%) contrast(${textureContrast}) brightness(${textureBrightness})`,
    zIndex: 1,
  },

  /* TINTE */
  '& .tp-tint': {
    position: 'absolute', inset: 0,
    background: accent,
    opacity: Math.max(0, Math.min(1, tintOpacity)),
    mixBlendMode: tintMode,
    zIndex: 2,
  },

  /* REFUERZO DE TEXTURA (multiplicado encima del tinte) */
  '& .tp-textureBoost': {
    position: 'absolute', inset: 0,
    backgroundImage: `url("${textureUrl}")`,
    backgroundSize: `${Math.max(0.8, textureScale) * 120}% auto`,
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center',
    mixBlendMode: 'multiply',
    opacity: Math.max(0, Math.min(1, textureBoostOpacity)),
    filter: `grayscale(100%) contrast(${textureContrast}) brightness(${textureBrightness})`,
    zIndex: 3,
  },

  /* BRILLO SUPERIOR */
  '& .tp-glossTop': {
    position: 'absolute', inset: 0,
    background: `linear-gradient(180deg, rgba(255,255,255,${0.30 * glossStrength}), rgba(255,255,255,0) 42%)`,
    mixBlendMode: 'screen',
    pointerEvents: 'none',
    zIndex: 4,
  },

  /* BISEL INTERIOR (anillo pegado al borde interno) */
  '& .tp-innerBevel': {
    position: 'absolute',
    inset: 0,
    borderRadius: Math.max(0, radius - Math.min(radius, Math.max(1.5, bevelWidth))),
    pointerEvents: 'none',
    zIndex: 5,

    boxShadow: [
      `inset 0 1px 0 rgba(255,255,255,${0.65 * bevelIntensity})`,
      `inset 0 -3px 8px rgba(0,0,0,${0.20 * bevelIntensity})`,
      `inset 0 0 0 1px rgba(255,255,255,${0.12 * bevelIntensity})`,
    ].join(', '),
  },


  '@supports not ((mask: radial-gradient(black, white)))': {
    '& .tp-innerBevel': {
      WebkitMask: 'none', mask: 'none',
      background: 'none',
      boxShadow: 'inset 0 1px 1px rgba(255,255,255,.55), inset 0 -1px 1px rgba(0,0,0,.22)',
    },
  },

  '& .tp-content': { position: 'relative', zIndex: 6 },
}));

/* ================================ Componente ================================ */
function TexturedPanelBase({
  children,
  accent = '#1976d2',

  radius = 12,
  contentPadding = 12,

  bgTintPercent = 22,
  bgAlpha = 0.98,

  textureUrl = '/textures/brushed-metal-1024.png',
  textureScale = 1.10,
  textureBaseOpacity = 0.28,
  textureBoostOpacity = 0.22,
  textureContrast = 0.95,
  textureBrightness = 1.04,

  tintOpacity = 0.42,
  tintMode = 'overlay',

  bevelWidth = 10,
  bevelIntensity = 0.9,

  glossStrength = 1.0,
  vignetteStrength = 0.8,

  variant = 'borderless',
  outlineWidth = 1,
  className,
}: TexturedPanelProps) {
  // Capas estáticas memoizadas: no se vuelven a crear a menos que cambien estas props.
  const staticLayers = useMemo(() => (
    <>
      <div className="tp-textureBase" />
      <div className="tp-tint" />
      <div className="tp-textureBoost" />
      <div className="tp-glossTop" />
      <div className="tp-innerBevel" />
    </>
  ), []);

  return (
    <Shell
      className={className ?? ''}
      radius={radius}
      variant={variant}
      outlineWidth={outlineWidth}
      accent={accent}
      bevelWidth={bevelWidth}
      bevelIntensity={bevelIntensity}
      vignetteStrength={vignetteStrength}
    >
      <Panel
        accent={accent}
        contentPadding={contentPadding}
        bgTintPercent={bgTintPercent}
        bgAlpha={bgAlpha}
        textureUrl={textureUrl}
        textureScale={textureScale}
        textureBaseOpacity={textureBaseOpacity}
        textureBoostOpacity={textureBoostOpacity}
        textureContrast={textureContrast}
        textureBrightness={textureBrightness}
        tintOpacity={tintOpacity}
        tintMode={tintMode}
        radius={radius}
        bevelWidth={bevelWidth}
        bevelIntensity={bevelIntensity}
        glossStrength={glossStrength}
      >
        {staticLayers}
        <div className="tp-content">{children}</div>
      </Panel>
    </Shell>
  );
}

// Comparador personalizado: ignoramos cambios en `children` para evitar
// re-render del wrapper al cambiar pestañas. Solo re-renderiza si cambia
// alguna prop estructural que afecte al wrapper/capas.
function areEqual(prev: TexturedPanelProps, next: TexturedPanelProps): boolean {
  return (
    prev.accent === next.accent &&
    prev.radius === next.radius &&
    prev.contentPadding === next.contentPadding &&
    prev.bgTintPercent === next.bgTintPercent &&
    prev.bgAlpha === next.bgAlpha &&
    prev.textureUrl === next.textureUrl &&
    prev.textureScale === next.textureScale &&
    prev.textureBaseOpacity === next.textureBaseOpacity &&
    prev.textureBoostOpacity === next.textureBoostOpacity &&
    prev.textureContrast === next.textureContrast &&
    prev.textureBrightness === next.textureBrightness &&
    prev.tintOpacity === next.tintOpacity &&
    prev.tintMode === next.tintMode &&
    prev.bevelWidth === next.bevelWidth &&
    prev.bevelIntensity === next.bevelIntensity &&
    prev.glossStrength === next.glossStrength &&
    prev.vignetteStrength === next.vignetteStrength &&
    prev.variant === next.variant &&
    prev.outlineWidth === next.outlineWidth &&
    prev.className === next.className &&
    // Importante: permitir re-render cuando el contenido cambia
    prev.children === next.children
  );
}

export const TexturedPanel = memo(TexturedPanelBase, areEqual);
export default TexturedPanel;
