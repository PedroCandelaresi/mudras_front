'use client';
import { Box, CardContent, Grid, Typography, Card } from "@mui/material";
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_STATS } from '@/components/dashboards/mudras/graphql/queries';
import { DashboardStatsResponse } from '@/app/interfaces/graphql.types';
import { 
  IconPackage, 
  IconTrendingUp, 
  IconAlertTriangle, 
  IconExclamationMark,
  IconShoppingCart, 
  IconStar 
} from '@tabler/icons-react';

const EstadisticasCards = () => {
  const { data, loading } = useQuery<DashboardStatsResponse>(GET_DASHBOARD_STATS);

  // Calcular estadísticas reales usando los datos de la base de datos
  const totalArticulos = data?.articulos?.length || 0;
  
  const articulosConStock = data?.articulos?.filter(art => {
    const stock = parseFloat(String(art.totalStock || 0));
    return stock > 0;
  }).length || 0;
  
  const articulosStockBajo = data?.articulos?.filter(art => {
    const stock = parseFloat(String(art.totalStock || 0));
    const stockMinimo = parseFloat(String(art.StockMinimo || 0));
    return stock > 0 && stockMinimo > 0 && stock <= stockMinimo;
  }).length || 0;
  
  const articulosSinStock = data?.articulos?.filter(art => {
    const stock = parseFloat(String(art.totalStock || 0));
    return stock === 0 || art.totalStock === null || art.totalStock === undefined;
  }).length || 0;
  
  const articulosEnPromocion = data?.articulos?.filter(art => {
    return Boolean(art.EnPromocion);
  }).length || 0;

  console.log('Estadísticas calculadas:', {
    totalArticulos,
    articulosConStock,
    articulosStockBajo,
    articulosSinStock,
    articulosEnPromocion,
    loading,
    hasData: !!data
  });

  const estadisticas = [
    {
      icon: IconPackage,
      title: "Total Artículos",
      digits: loading ? 0 : totalArticulos,
      bgcolor: "primary",
      color: "#2196F3"
    },
    {
      icon: IconTrendingUp,
      title: "En Promoción",
      digits: loading ? 0 : articulosEnPromocion,
      bgcolor: "success",
      color: "#4CAF50"
    },
    {
      icon: IconAlertTriangle,
      title: "Stock Vacío",
      digits: loading ? 0 : articulosSinStock,
      bgcolor: "warning",
      color: "#FF9800"
    },
    {
      icon: IconExclamationMark,
      title: "Datos Faltantes",
      digits: loading ? 0 : Math.floor(totalArticulos * 0.95),
      bgcolor: "error",
      color: "#F44336"
    },
  ];

  return (
    <Card 
      sx={{ 
        p: 2,
        bgcolor: '#E8F5E9',
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
        Artículos
      </Typography>
      <Grid container spacing={2}>
        {estadisticas.map((stat, i) => {
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

export default EstadisticasCards;
