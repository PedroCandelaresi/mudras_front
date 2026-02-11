'use client'
import Image from 'next/image';
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
                <Image
                  src="/logo.svg"
                  alt="Mudras Logo"
                  width={300}
                  height={100}
                  style={{
                    opacity: 0.8,
                    height: 'auto'
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
