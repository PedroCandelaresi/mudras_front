'use client'
import PageContainer from '@/components/container/PageContainer';
import { Grid, Box, Typography } from '@mui/material';

export default function Dashboard() {
  return (
    <PageContainer title="Mudras Gestión" description="Sistema completo de gestión comercial y tienda online">
      <Box mt={1} mx={2}>
        <Box mb={4} textAlign="center">
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary.main"
          >
            ✨ Mudras Gestión
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="60vh"
            >
              <Box mb={2}>
                <img
                  src="/images/logo.svg"
                  alt="Mudras Logo"
                  style={{
                    width: '300px',
                    height: 'auto',
                    opacity: 0.8
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
