'use client';
import { Box, Grid, Typography, Card } from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_STATS } from '@/components/dashboards/mudras/graphql/queries';
import { DashboardStatsResponse } from '@/app/interfaces/graphql.types';
import { 
  IconAlertTriangle, 
  IconCalendarX, 
  IconShoppingCart, 
  IconArrowBackUp 
} from '@tabler/icons-react';

const AlertasCards = () => {
  const { data, loading } = useQuery<DashboardStatsResponse>(GET_DASHBOARD_STATS);

  // Calcular alertas reales usando los datos de la base de datos
  const articulosStockBajo = data?.articulos?.filter(art => {
    const stock = parseFloat(String(art.totalStock || 0));
    const stockMinimo = parseFloat(String(art.StockMinimo || 0));
    return stock > 0 && stockMinimo > 0 && stock <= stockMinimo;
  }).length || 0;

  // Simulamos otras alertas hasta que se agreguen a la query
  const vencimientos = 3; // Productos próximos a vencer
  const pedidosPendientes = 12; // Pedidos sin procesar
  const devoluciones = 2; // Devoluciones pendientes

  const estadisticasAlertas = [
    {
      icon: IconAlertTriangle,
      title: "Stock Bajo",
      digits: loading ? 0 : articulosStockBajo,
      bgcolor: "error",
      color: "#F44336"
    },
    {
      icon: IconCalendarX,
      title: "Vencimientos",
      digits: vencimientos,
      bgcolor: "warning",
      color: "#FF9800"
    },
    {
      icon: IconShoppingCart,
      title: "Pedidos",
      digits: pedidosPendientes,
      bgcolor: "info",
      color: "#2196F3"
    },
    {
      icon: IconArrowBackUp,
      title: "Devoluciones",
      digits: devoluciones,
      bgcolor: "secondary",
      color: "#9C27B0"
    },
  ];

  return (
    <Card 
      sx={{ 
        p: 2,
        bgcolor: '#FFF3E0',
        borderRadius: 2,
        boxShadow: 2,
        border: '1px solid #FFCC80',
        height: '200px',
        minHeight: '200px'
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight={600} 
        mb={1} 
        textAlign="left"
        sx={{ color: '#E64A19', fontSize: '1.1rem' }}
      >
        Alertas
      </Typography>
      <Grid container spacing={2}>
        {estadisticasAlertas.map((stat, i) => {
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
                    {stat.digits.toLocaleString()}
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

export default AlertasCards;
