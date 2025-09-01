'use client';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function Usuarios() {
  return (
    <PageContainer title="Usuarios - Mudras" description="Gestión de usuarios">
      <Box>
        <Typography variant="h4" mb={2}>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body1">
          Administración de usuarios y permisos del sistema.
        </Typography>
      </Box>
    </PageContainer>
  );
}
