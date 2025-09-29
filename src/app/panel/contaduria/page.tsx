'use client';
import { Grid, Box, Typography } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import TablaAsientos from '@/components/contaduria/TablaAsientos';
import TablaCuentasContables from '@/components/contaduria/TablaCuentasContables';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';

export default function Contaduria() {
  return (
    <PageContainer title="Contaduría - Mudras" description="Gestión contable">
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h4" fontWeight={600} color="success.main" mb={2}>
              Contaduría
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
              <TablaAsientos />
            </TexturedPanel>
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
              <TablaCuentasContables />
            </TexturedPanel>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
