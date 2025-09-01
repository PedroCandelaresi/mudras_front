'use client';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import { 
  IconCurrencyDollar, 
  IconShoppingCart, 
  IconUsers,
  IconTrendingUp,
  IconCalendarMonth,
  IconClock,
  IconPercentage
} from '@tabler/icons-react';

const EstadisticasVentas = () => {
  // Datos ficticios para la demo
  const estadisticasVentas = {
    ventasSemanales: 89750,
    ventasMensuales: 485000,
    transaccionesHoy: 47,
    ticketPromedio: 12500,
    crecimientoSemanal: 15.3,
    crecimientoMensual: 8.7,
    horasPico: '14:00 - 18:00',
    metodoPagoTop: 'Tarjeta de Crédito',
    categoriaTop: 'Electrónicos',
    ventasPorHora: [
      { hora: '09:00', ventas: 3 },
      { hora: '10:00', ventas: 7 },
      { hora: '11:00', ventas: 12 },
      { hora: '12:00', ventas: 15 },
      { hora: '13:00', ventas: 18 },
      { hora: '14:00', ventas: 25 },
      { hora: '15:00', ventas: 28 },
      { hora: '16:00', ventas: 32 },
      { hora: '17:00', ventas: 29 },
      { hora: '18:00', ventas: 22 }
    ]
  };

  const maxVentas = Math.max(...estadisticasVentas.ventasPorHora.map(v => v.ventas));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Estadísticas de Ventas
        </Typography>

        {/* Ventas Semanales */}
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'primary.light',
            mb: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <IconCalendarMonth size={20} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                ${estadisticasVentas.ventasSemanales.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ventas esta semana
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconTrendingUp size={16} color="green" />
            <Typography variant="caption" color="success.main">
              +{estadisticasVentas.crecimientoSemanal}% vs semana anterior
            </Typography>
          </Box>
        </Box>

        {/* Transacciones Hoy */}
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'warning.light',
            mb: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
              <IconShoppingCart size={20} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {estadisticasVentas.transaccionesHoy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transacciones hoy
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Ticket promedio: ${estadisticasVentas.ticketPromedio.toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Información Adicional */}
        <Box mb={2}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Insights
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                <IconClock size={16} />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Horario pico
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {estadisticasVentas.horasPico}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                <IconCurrencyDollar size={16} />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Método de pago preferido
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {estadisticasVentas.metodoPagoTop}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                <IconPercentage size={16} />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Categoría top
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {estadisticasVentas.categoriaTop}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Ventas por Hora (Gráfico Simple) */}
        <Box>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Ventas por Hora
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {estadisticasVentas.ventasPorHora.slice(-5).map((item, index) => (
              <Box key={index} display="flex" alignItems="center" gap={2}>
                <Typography variant="caption" sx={{ minWidth: 50 }}>
                  {item.hora}
                </Typography>
                <Box 
                  sx={{ 
                    flex: 1, 
                    height: 8, 
                    bgcolor: 'grey.200', 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: `${(item.ventas / maxVentas) * 100}%`,
                      height: '100%',
                      bgcolor: 'primary.main',
                      borderRadius: 4
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ minWidth: 30 }}>
                  {item.ventas}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Crecimiento Mensual */}
        <Box mt={2}>
          <Chip
            icon={<IconTrendingUp size={16} />}
            label={`Crecimiento mensual: +${estadisticasVentas.crecimientoMensual}%`}
            color="success"
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default EstadisticasVentas;
