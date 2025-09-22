'use client';
import { Grid, Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import TablaPedidos from '@/components/pedidos/TablaPedidos';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

export default function Pedidos() {
  return (
    <PageContainer title="Pedidos - Mudras" description="Gestión de pedidos">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h4" fontWeight={600} color="success.main" mb={2}>
              Gestión de Pedidos
            </Typography>
          </Grid>
          <Grid size={12}>
            <TexturedPanel
              accent="#2e7d32"
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
              <TablaPedidos />
            </TexturedPanel>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
