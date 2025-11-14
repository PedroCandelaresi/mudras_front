"use client";

import { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';
import { alpha, lighten, darken } from '@mui/material/styles';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton, forceWhiteIconsSX } from '@/components/ui/CrystalButton';
import { trace } from 'console';

export interface StylizedTabDefinition {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  color: string;
}

export interface StylizedTabbedPanelProps {
  tabs: StylizedTabDefinition[];
  activeKey: string;
  onChange: (key: string) => void;
  children?: ReactNode;
  tabsExtra?: ReactNode;
  contentProps?: BoxProps;
}

export const createBevelWrapper = (color: string) => {
  const edgeWidth = 2;
  const topHighlightColor = alpha(lighten(color, 0.85), 0.9);
  const bottomShadowColor = alpha(darken(color, 0.6), 0.85);
  const leftHighlightColor = alpha(lighten(color, 0.6), 0.8);
  const rightShadowColor = alpha(darken(color, 0.6), 0.76);
  const borderTint = alpha(lighten(color, 0.2), 0.6);
  const innerLight = alpha(lighten(color, 0.58), 0.22);
  const innerShadow = alpha(darken(color, 0.62), 0.26);

  return {
    position: 'relative' as const,
    borderRadius: 2,
    overflow: 'hidden' as const,
    background: 'transparent',
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none' as const,
      boxShadow: `
        inset 0 ${edgeWidth}px 0 ${topHighlightColor},
        inset 0 -${edgeWidth + 0.4}px 0 ${bottomShadowColor},
        inset ${edgeWidth}px 0 0 ${leftHighlightColor},
        inset -${edgeWidth + 0.4}px 0 0 ${rightShadowColor}
      `,
      zIndex: 3,
    },
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      inset: edgeWidth,
      borderRadius: 'inherit',
      pointerEvents: 'none' as const,
      border: `1px solid ${borderTint}`,
      boxShadow: `
        inset 0 ${edgeWidth * 5.2}px ${edgeWidth * 6.4}px ${innerLight},
        inset 0 -${edgeWidth * 5.2}px ${edgeWidth * 6.4}px ${innerShadow}
      `,
      mixBlendMode: 'soft-light' as const,
      zIndex: 2,
    },
    '& > *': { position: 'relative', zIndex: 1 },
  };
};

const StylizedTabbedPanel = ({
  tabs,
  activeKey,
  onChange,
  children,
  tabsExtra,
  contentProps,
}: StylizedTabbedPanelProps) => {
  if (!tabs.length) {
    return <>{children}</>;
  }

  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];
  const accentColor = activeTab.color;
  const baseBg = alpha(lighten(accentColor, 0.08), 0.9);

  return (
    <Box sx={createBevelWrapper(accentColor)}>
      <TexturedPanel
        accent={accentColor}
        radius={14}
        contentPadding={12}
        bgTintPercent={22}
        bgAlpha={0.98}
        tintMode="soft-light"
        tintOpacity={0.42}
        textureScale={1.08}
        textureBaseOpacity={0.18}
        textureBoostOpacity={0.12}
        textureContrast={0.92}
        textureBrightness={1.03}
        bevelWidth={2}
        bevelIntensity={1.0}
        glossStrength={1.0}
        vignetteStrength={0.9}
      >
        <Box
          sx={{
            bgcolor: 'transparent',
            px: 1,
            py: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab.key;
              const ButtonComp = isActive ? CrystalButton : CrystalSoftButton;
              return (
                <ButtonComp
                  key={tab.key}
                  baseColor={tab.color}
                  startIcon={tab.icon}
                  onClick={() => onChange(tab.key)}
                  sx={{ ...forceWhiteIconsSX, minHeight: 40, borderRadius: 1, px: 2 }}
                >
                  {tab.label}
                </ButtonComp>
              );
            })}
          </Box>
          {tabsExtra && (
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>{tabsExtra}</Box>
          )}
        </Box>

        <Box
          {...contentProps}
          sx={{
            borderRadius: 2,
            bgcolor: 'transparent',
            transition: 'background-color .2s ease',
            px: 2,
            pb: 2,
            pt: 2,
            ...contentProps?.sx,
          }}
        >
          {children}
        </Box>
      </TexturedPanel>
    </Box>
  );
};

export default StylizedTabbedPanel;
