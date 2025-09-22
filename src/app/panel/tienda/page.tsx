'use client';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

export default function Tienda() {
  return (
    <PageContainer title="Tienda Online - Mudras" description="Gestión de tienda online">
      <Box>
        <TexturedPanel
          accent="#1976d2"
          radius={14}
          contentPadding={12}
          bgTintPercent={22}
          bgAlpha={0.98}
          tintMode="soft-light"
          tintOpacity={0.42}
          textureScale={1.1}
          textureBaseOpacity={0.18}
          textureBoostOpacity={0.12}
          textureContrast={0.92}
          textureBrightness={1.03}
          bevelWidth={12}
          bevelIntensity={1.0}
          glossStrength={1.0}
          vignetteStrength={0.9}
        >
          <Typography variant="h4" mb={2}>
            Tienda Online
          </Typography>
          <Typography variant="body1">
            Configuración y gestión de la tienda online.
          </Typography>
        </TexturedPanel>
      </Box>
    </PageContainer>
  );
}
