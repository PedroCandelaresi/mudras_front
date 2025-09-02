'use client';

import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalOffer as LocalOfferIcon,
  Store as StoreIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { EstadisticasArticulos } from '@/interfaces/articulo';

interface EstadisticasStockProps {
  estadisticas: EstadisticasArticulos;
}

export default function EstadisticasStock({ estadisticas }: EstadisticasStockProps) {
  const porcentajeConStock = estadisticas.totalArticulos > 0 
    ? (estadisticas.articulosConStock / estadisticas.totalArticulos) * 100 
    : 0;

  const porcentajeStockBajo = estadisticas.totalArticulos > 0 
    ? (estadisticas.articulosStockBajo / estadisticas.totalArticulos) * 100 
    : 0;

  const tarjetas = [
    {
      titulo: 'Total Artículos',
      valor: estadisticas.totalArticulos,
      icono: <InventoryIcon />,
      color: 'primary',
      descripcion: `${estadisticas.articulosActivos} activos`
    },
    {
      titulo: 'Con Stock',
      valor: estadisticas.articulosConStock,
      icono: <TrendingUpIcon />,
      color: 'success',
      descripcion: `${porcentajeConStock.toFixed(1)}% del total`,
      progreso: porcentajeConStock
    },
    {
      titulo: 'Sin Stock',
      valor: estadisticas.articulosSinStock,
      icono: <TrendingDownIcon />,
      color: 'error',
      descripcion: 'Requieren reposición'
    },
    {
      titulo: 'Stock Bajo',
      valor: estadisticas.articulosStockBajo,
      icono: <TrendingDownIcon />,
      color: 'warning',
      descripcion: `${porcentajeStockBajo.toFixed(1)}% del total`,
      progreso: porcentajeStockBajo
    },
    {
      titulo: 'En Promoción',
      valor: estadisticas.articulosEnPromocion,
      icono: <LocalOfferIcon />,
      color: 'secondary',
      descripcion: 'Ofertas activas'
    },
    {
      titulo: 'En Tienda',
      valor: estadisticas.articulosPublicadosEnTienda,
      icono: <StoreIcon />,
      color: 'info',
      descripcion: 'Publicados online'
    },
    {
      titulo: 'Valor Total Stock',
      valor: `$${estadisticas.valorTotalStock.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      icono: <AttachMoneyIcon />,
      color: 'primary',
      descripcion: 'Inventario valorizado',
      esMoneda: true
    }
  ];

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        Estadísticas del Stock
      </Typography>
      <Grid container spacing={2}>
        {tarjetas.map((tarjeta, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 12/7 }} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${getColorGradient(tarjeta.color)})`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box sx={{ opacity: 0.8 }}>
                    {tarjeta.icono}
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {tarjeta.esMoneda ? tarjeta.valor : tarjeta.valor.toLocaleString()}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                  {tarjeta.titulo}
                </Typography>
                
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {tarjeta.descripcion}
                </Typography>

                {tarjeta.progreso !== undefined && (
                  <Box mt={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={tarjeta.progreso} 
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white'
                        }
                      }}
                    />
                  </Box>
                )}

                {/* Decoración de fondo */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    opacity: 0.1,
                    fontSize: '4rem'
                  }}
                >
                  {tarjeta.icono}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function getColorGradient(color: string): string {
  const gradientes = {
    primary: '#1976d2, #42a5f5',
    success: '#2e7d32, #66bb6a',
    error: '#d32f2f, #ef5350',
    warning: '#ed6c02, #ff9800',
    secondary: '#9c27b0, #ba68c8',
    info: '#0288d1, #29b6f6'
  };
  
  return gradientes[color as keyof typeof gradientes] || gradientes.primary;
}
