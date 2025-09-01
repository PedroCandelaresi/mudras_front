'use client'
import { useState, useEffect, PropsWithChildren } from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import { Grid, Box, Typography, Card } from '@mui/material';
import EstadisticasCards from '@/app/components/dashboards/mudras/EstadisticasCards';
import VentasCards from '@/app/components/dashboards/mudras/VentasCards';
import ProveedoresCards from '@/app/components/dashboards/mudras/ProveedoresCards';
import AlertasCards from '@/app/components/dashboards/mudras/AlertasCards';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';



function SquareCard({
  title,
  titleSx,
  cardSx,
  children,
}: PropsWithChildren<{ title?: string; titleSx?: any; cardSx?: any }>) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        // Cuadrado en md+; en mobile que fluya en altura
        aspectRatio: { xs: 'auto', md: '1 / 1' },
      }}
    >
      <Card
        sx={{
          position: { md: 'absolute' },
          inset: { md: 0 },
          p: 2,
          borderRadius: 2,
          boxShadow: 2,
          ...cardSx,
        }}
      >
        {title && (
          <Typography variant="h6" fontWeight={600} mb={1} sx={titleSx}>
            {title}
          </Typography>
        )}
        {children}
      </Card>
    </Box>
  );
}

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(false);
  }, []);

  // Datos hardcodeados para gráficos
  const ventasData = [
    { mes: 'Ene', ventas: 4000 },
    { mes: 'Feb', ventas: 3000 },
    { mes: 'Mar', ventas: 5000 },
    { mes: 'Abr', ventas: 4500 },
    { mes: 'May', ventas: 6000 },
    { mes: 'Jun', ventas: 5500 }
  ];

  const stockData = [
    { name: 'Cristales', value: 400, color: '#7B1FA2' },
    { name: 'Inciensos', value: 300, color: '#4A148C' },
    { name: 'Aceites', value: 200, color: '#E1BEE7' },
    { name: 'Velas', value: 100, color: '#D1C4E9' }
  ];

  return (
    <PageContainer title="Mudras Gestión" description="Sistema completo de gestión comercial y tienda online">
      <Box mt={1} mx={2}>
        {/* Título Principal */}
        <Box mb={4} textAlign="center">
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              background: 'linear-gradient(45deg, #7B1FA2 30%, #4A148C 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0
            }}
          >
            ✨ Mudras Gestión
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Columna izquierda - Cards con gráficos */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Primera card con gráfico */}
              <Card 
                sx={{ 
                  p: 2,
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  boxShadow: 2,
                  border: '1px solid #E9ECEF',
                  height: '180px'
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  mb={1} 
                  sx={{ color: '#495057', fontSize: '1.1rem' }}
                >
                  Ventas Mensuales
                </Typography>
                <Box sx={{ height: '130px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventasData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="mes" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="ventas" fill="#7B1FA2" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>

              {/* Segunda card con gráfico */}
              <Card 
                sx={{ 
                  p: 2,
                  bgcolor: '#F3E5F5',
                  borderRadius: 2,
                  boxShadow: 2,
                  border: '1px solid #E1BEE7',
                  height: '180px'
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  mb={1} 
                  sx={{ color: '#7B1FA2', fontSize: '1.1rem' }}
                >
                  Stock por Categoría
                </Typography>
                <Box sx={{ height: '130px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {stockData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Box>
          </Grid>

          {/* Columna derecha - Cards 2x2 existentes */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <EstadisticasCards />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <VentasCards />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <ProveedoresCards />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <AlertasCards />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}

