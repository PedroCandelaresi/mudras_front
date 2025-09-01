'use client';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconPackage, 
  IconUsers,
  IconShoppingCart,
  IconCurrencyDollar,
  IconCalendar,
  IconStar
} from '@tabler/icons-react';

const ResumenNegocio = () => {
  // Datos ficticios para la demo
  const estadisticasNegocio = {
    ventasHoy: 15420,
    ventasAyer: 12350,
    clientesActivos: 847,
    productosVendidos: 156,
    ingresosMes: 485000,
    metaMensual: 600000,
    topProductos: [
      { nombre: 'Smartphone Galaxy S24', ventas: 45, precio: 850000 },
      { nombre: 'Notebook Lenovo ThinkPad', ventas: 32, precio: 1200000 },
      { nombre: 'Auriculares Sony WH-1000XM5', ventas: 28, precio: 320000 },
      { nombre: 'Tablet iPad Air', ventas: 24, precio: 750000 },
      { nombre: 'Mouse Logitech MX Master', ventas: 19, precio: 85000 }
    ],
    alertas: [
      { tipo: 'stock', mensaje: 'Stock bajo en 12 productos', color: 'warning' },
      { tipo: 'ventas', mensaje: 'Meta mensual al 80%', color: 'success' },
      { tipo: 'clientes', mensaje: '5 clientes nuevos hoy', color: 'info' }
    ]
  };

  const porcentajeVentas = ((estadisticasNegocio.ventasHoy - estadisticasNegocio.ventasAyer) / estadisticasNegocio.ventasAyer * 100);
  const porcentajeMeta = (estadisticasNegocio.ingresosMes / estadisticasNegocio.metaMensual * 100);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Resumen del Negocio
        </Typography>

        <Grid container spacing={3}>
          {/* Ventas de Hoy */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <IconCurrencyDollar />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ${estadisticasNegocio.ventasHoy.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ventas de hoy
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  {porcentajeVentas > 0 ? <IconTrendingUp size={16} color="green" /> : <IconTrendingDown size={16} color="red" />}
                  <Typography variant="caption" color={porcentajeVentas > 0 ? 'success.main' : 'error.main'}>
                    {porcentajeVentas > 0 ? '+' : ''}{porcentajeVentas.toFixed(1)}% vs ayer
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Clientes Activos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'info.light',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <IconUsers />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {estadisticasNegocio.clientesActivos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clientes activos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <IconCalendar size={14} style={{ marginRight: 4 }} />
                  Este mes
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Progreso Meta Mensual */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={600}>
                  Meta Mensual
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${estadisticasNegocio.ingresosMes.toLocaleString()} / ${estadisticasNegocio.metaMensual.toLocaleString()}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={porcentajeMeta} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: porcentajeMeta >= 100 ? 'success.main' : 'primary.main'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={1}>
                {porcentajeMeta.toFixed(1)}% completado
              </Typography>
            </Box>
          </Grid>

          {/* Top Productos */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Productos Más Vendidos
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {estadisticasNegocio.topProductos.map((producto, index) => (
                <Box 
                  key={index}
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  py={1}
                  sx={{ 
                    borderBottom: index < estadisticasNegocio.topProductos.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={index + 1} 
                      size="small" 
                      color={index === 0 ? 'warning' : index === 1 ? 'default' : 'default'}
                      sx={{ minWidth: 32 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {producto.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${producto.precio.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight={600}>
                      {producto.ventas} unidades
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Alertas */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Alertas
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {estadisticasNegocio.alertas.map((alerta, index) => (
                <Chip
                  key={index}
                  label={alerta.mensaje}
                  color={alerta.color as any}
                  variant="outlined"
                  size="small"
                  icon={
                    alerta.tipo === 'stock' ? <IconPackage size={16} /> :
                    alerta.tipo === 'ventas' ? <IconTrendingUp size={16} /> :
                    <IconStar size={16} />
                  }
                  sx={{ justifyContent: 'flex-start' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ResumenNegocio;
