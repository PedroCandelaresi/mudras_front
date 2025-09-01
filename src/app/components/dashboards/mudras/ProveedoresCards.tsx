'use client';
import { Box, Grid, Typography, Card } from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_STATS } from '@/app/queries/mudras.queries';
import { DashboardStatsResponse } from '@/app/interfaces/graphql.types';
import { 
  IconUsers, 
  IconUserCheck, 
  IconCreditCard, 
  IconUserPlus 
} from '@tabler/icons-react';

const ProveedoresCards = () => {
  const { data, loading } = useQuery<DashboardStatsResponse>(GET_DASHBOARD_STATS);

  // Calcular estadísticas reales usando los datos de la base de datos
  const totalProveedores = data?.proveedores?.length || 0;
  
  // Simulamos datos adicionales hasta que se agreguen campos en la query
  const proveedoresActivos = Math.floor(totalProveedores * 0.9) || 0;
  const proveedoresCuentaCorriente = Math.floor(totalProveedores * 0.3) || 0;
  const proveedoresNuevos = Math.floor(totalProveedores * 0.1) || 0;

  const estadisticasProveedores = [
    {
      icon: IconUsers,
      title: "Total",
      digits: loading ? 0 : totalProveedores,
      bgcolor: "primary",
      color: "#2E7D32"
    },
    {
      icon: IconUserCheck,
      title: "Activos",
      digits: loading ? 0 : proveedoresActivos,
      bgcolor: "success",
      color: "#4CAF50"
    },
    {
      icon: IconCreditCard,
      title: "Cuenta Corriente",
      digits: loading ? 0 : proveedoresCuentaCorriente,
      bgcolor: "info",
      color: "#2196F3"
    },
    {
      icon: IconUserPlus,
      title: "Nuevos",
      digits: loading ? 0 : proveedoresNuevos,
      bgcolor: "warning",
      color: "#FF9800"
    },
  ];

  return (
    <Card 
      sx={{ 
        p: 2,
        bgcolor: '#E8F5E8',
        borderRadius: 2,
        boxShadow: 2,
        border: '1px solid #C8E6C9',
        height: '200px',
        minHeight: '200px'
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight={600} 
        mb={1} 
        textAlign="left"
        sx={{ color: '#2E7D32', fontSize: '1.1rem' }}
      >
        Proveedores
      </Typography>
      <Grid container spacing={2}>
        {estadisticasProveedores.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <Grid key={i} size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
              <Box 
                bgcolor="white"
                textAlign="center"
                sx={{ 
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  boxShadow: 1,
                  p: 1,
                  minHeight: '65px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 0.5,
                      color: stat.color 
                    }}
                  >
                    <IconComponent size={18} />
                  </Box>
                  <Typography
                    color={stat.bgcolor + ".main"}
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.65rem"
                    lineHeight={1.1}
                    mb={0.2}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    color={stat.bgcolor + ".main"}
                    variant="body1"
                    fontWeight={700}
                    fontSize="0.8rem"
                    lineHeight={1}
                  >
                    {loading ? '...' : stat.digits.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
};

export default ProveedoresCards;
