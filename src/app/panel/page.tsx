'use client'
import { useState, useEffect, useMemo, PropsWithChildren } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { Grid, Box, Typography, Card, Paper } from '@mui/material';
import { oroBlanco } from '@/ui/colores';
import EstadisticasCards from '@/app/components/dashboards/mudras/EstadisticasCards';
import VentasCards from '@/app/components/dashboards/mudras/VentasCards';
import ProveedoresCards from '@/app/components/dashboards/mudras/ProveedoresCards';
import AlertasCards from '@/app/components/dashboards/mudras/AlertasCards';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_STATS } from '@/components/dashboards/mudras/graphql/queries';
import { DashboardStatsResponse } from '@/app/interfaces/graphql.types';

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
        aspectRatio: { xs: 'auto', md: '1 / 1' },
      }}
    >
      <Card
        sx={{
          position: { md: 'absolute' },
          inset: { md: 0 },
          p: 2,
          borderRadius: 0,
          boxShadow: 1,
          border: '1px solid #e0e0e0',
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
  const { data } = useQuery<DashboardStatsResponse>(GET_DASHBOARD_STATS);

  useEffect(() => {
    setLoading(false);
  }, []);

  const { barrasPorRubro, donutEstadoStock, totalArticulos } = useMemo(() => {
    const articulos = data?.articulos ?? [];
    const porRubro = new Map<string, { rubro: string; stock: number; minimo: number }>();
    for (const art of articulos as any[]) {
      const rubro = String(art.Rubro || 'Sin rubro');
      const stock = parseFloat(String(art.totalStock ?? 0)) || 0;
      const minimo = parseFloat(String(art.StockMinimo ?? 0)) || 0;
      const acc = porRubro.get(rubro) || { rubro, stock: 0, minimo: 0 };
      acc.stock += stock;
      acc.minimo += minimo;
      porRubro.set(rubro, acc);
    }
    const barras = Array.from(porRubro.values())
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 8);

    let sin = 0, bajo = 0, ok = 0;
    for (const art of articulos as any[]) {
      const stock = parseFloat(String(art.totalStock ?? 0)) || 0;
      const min = parseFloat(String(art.StockMinimo ?? 0)) || 0;
      if (stock <= 0) sin++;
      else if (min > 0 && stock <= min) bajo++;
      else ok++;
    }
    const donut = [
      { name: 'Sin stock', value: sin, color: '#E53935' },
      { name: 'Stock bajo', value: bajo, color: '#FB8C00' },
      { name: 'OK', value: ok, color: '#43A047' },
    ];

    return { barrasPorRubro: barras, donutEstadoStock: donut, totalArticulos: articulos.length };
  }, [data]);

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
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                sx={{
                  p: 2,
                  bgcolor: '#ffffff',
                  borderRadius: 0,
                  boxShadow: 1,
                  border: '1px solid #e0e0e0',
                  height: '240px'
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  mb={1}
                  sx={{ color: '#495057', fontSize: '1.1rem' }}
                >
                  Stock por Rubro (Unidades)
                </Typography>
                <Box sx={{ height: '190px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barrasPorRubro} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradMin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFD54F" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#FFE082" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="gradStock" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#66BB6A" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#7CB342" stopOpacity={0.85} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="rubro"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#777' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 0, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="minimo" name="Stock mínimo" fill="url(#gradMin)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="stock" name="Stock disponible" fill="url(#gradStock)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>

              <Card
                sx={{
                  p: 2,
                  bgcolor: '#ffffff',
                  borderRadius: 0,
                  boxShadow: 1,
                  border: '1px solid #e0e0e0',
                  height: '240px'
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  mb={1}
                  sx={{ color: '#7B1FA2', fontSize: '1.1rem' }}
                >
                  Estado de Stock
                </Typography>
                <Box sx={{ position: 'relative', height: '190px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutEstadoStock}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={(props: any) => `${Math.round((props.percent || 0) * 100)}%`}
                      >
                        {donutEstadoStock.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 0, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1, color: '#5E35B1' }}>{totalArticulos}</Typography>
                    <Typography variant="caption" sx={{ color: '#7b7b7b' }}>Artículos</Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
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
