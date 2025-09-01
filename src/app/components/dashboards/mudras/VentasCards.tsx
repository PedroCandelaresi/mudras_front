'use client';
import { Box, Grid, Typography, Card } from "@mui/material";
import { 
  IconCash, 
  IconTrendingUp, 
  IconCalendarEvent, 
  IconChartLine 
} from '@tabler/icons-react';

const VentasCards = () => {
  // Datos simulados para ventas - se pueden conectar a GraphQL después
  const estadisticasVentas = [
    {
      icon: IconCash,
      title: "Hoy",
      digits: 12450,
      bgcolor: "primary",
      color: "#7B1FA2"
    },
    {
      icon: IconTrendingUp,
      title: "Semana",
      digits: 85300,
      bgcolor: "secondary",
      color: "#4A148C"
    },
    {
      icon: IconCalendarEvent,
      title: "Mes",
      digits: 325000,
      bgcolor: "info",
      color: "#2196F3"
    },
    {
      icon: IconChartLine,
      title: "Año",
      digits: 1850000,
      bgcolor: "success",
      color: "#4CAF50"
    },
  ];

  return (
    <Card 
      sx={{ 
        p: 2,
        bgcolor: '#F3E5F5',
        borderRadius: 2,
        boxShadow: 2,
        border: '1px solid #E1BEE7',
        height: '200px',
        minHeight: '200px'
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight={600} 
        mb={1} 
        textAlign="left"
        sx={{ color: '#7B1FA2', fontSize: '1.1rem' }}
      >
        Ventas
      </Typography>
      <Grid container spacing={2}>
        {estadisticasVentas.map((stat, i) => {
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
                    ${stat.digits.toLocaleString()}
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

export default VentasCards;
