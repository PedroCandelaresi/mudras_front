'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Grid
} from '@mui/material';
import { Icon } from '@iconify/react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';

interface ProveedorRubro {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  rubroNombre: string;
  cantidadArticulos: number;
}

interface EstadisticasRubros {
  totalRelaciones: number;
  proveedoresUnicos: number;
  rubrosUnicos: number;
  totalArticulos: number;
}

export default function RubrosPorProveedorPage() {
  const [relaciones, setRelaciones] = useState<ProveedorRubro[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasRubros | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroRubro, setFiltroRubro] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ObtenerRelacionesProveedorRubro {
              obtenerRelacionesProveedorRubro {
                id
                proveedorId
                proveedorNombre
                rubroNombre
                cantidadArticulos
              }
              obtenerEstadisticasProveedorRubro {
                totalRelaciones
                proveedoresUnicos
                rubrosUnicos
                totalArticulos
              }
            }
          `
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setRelaciones(result.data.obtenerRelacionesProveedorRubro || []);
      setEstadisticas(result.data.obtenerEstadisticasProveedorRubro || null);
      
    } catch (error) {
      console.error('Error al cargar relaciones:', error);
      setError('Error al cargar los datos de proveedores y rubros');
    } finally {
      setLoading(false);
    }
  };

  const relacionesFiltradas = relaciones.filter(relacion => {
    const matchProveedor = relacion.proveedorNombre.toLowerCase().includes(filtroProveedor.toLowerCase());
    const matchRubro = relacion.rubroNombre.toLowerCase().includes(filtroRubro.toLowerCase());
    return matchProveedor && matchRubro;
  });

  const proveedoresUnicos = Array.from(new Set(relacionesFiltradas.map(r => r.proveedorNombre)));
  const rubrosUnicos = Array.from(new Set(relacionesFiltradas.map(r => r.rubroNombre)));

  return (
    <PageContainer title="Rubros por Proveedor" description="Gestión de relaciones entre proveedores y rubros">
      <Box>
        {/* Estadísticas */}
        {estadisticas && (
          <Box display="flex" gap={3} mb={3} flexWrap="wrap">
            <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Icon icon="mdi:link" width={32} color="#2196f3" />
                  <Box>
                    <Typography variant="h4">{estadisticas.totalRelaciones}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Relaciones
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Icon icon="mdi:factory" width={32} color="#4caf50" />
                  <Box>
                    <Typography variant="h4">{estadisticas.proveedoresUnicos}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Proveedores
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Icon icon="mdi:tag" width={32} color="#ff9800" />
                  <Box>
                    <Typography variant="h4">{estadisticas.rubrosUnicos}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rubros
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Icon icon="mdi:package" width={32} color="#9c27b0" />
                  <Box>
                    <Typography variant="h4">{estadisticas.totalArticulos}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Artículos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        <DashboardCard title="Relaciones Proveedor-Rubro">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Filtros */}
          <Box display="flex" gap={2} mb={3} flexDirection={{ xs: 'column', md: 'row' }}>
            <TextField
              label="Filtrar por Proveedor"
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:factory" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            
            <TextField
              label="Filtrar por Rubro"
              value={filtroRubro}
              onChange={(e) => setFiltroRubro(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:tag" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Resumen de filtros */}
          {(filtroProveedor || filtroRubro) && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {relacionesFiltradas.length} relaciones • 
                {proveedoresUnicos.length} proveedores • 
                {rubrosUnicos.length} rubros
              </Typography>
            </Box>
          )}

          {/* Tabla */}
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Rubro</TableCell>
                  <TableCell align="right">Artículos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton width={200} /></TableCell>
                      <TableCell><Skeleton width={150} /></TableCell>
                      <TableCell align="right"><Skeleton width={60} /></TableCell>
                    </TableRow>
                  ))
                ) : relacionesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Box py={4}>
                        <Icon icon="mdi:database-search" width={48} color="#ccc" />
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          No se encontraron relaciones
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  relacionesFiltradas.map((relacion) => (
                    <TableRow key={relacion.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Icon icon="mdi:factory" width={16} />
                          <Typography variant="body2" fontWeight={500}>
                            {relacion.proveedorNombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={relacion.rubroNombre} 
                          size="small" 
                          variant="outlined"
                          icon={<Icon icon="mdi:tag" width={14} />}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {relacion.cantidadArticulos}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Información adicional */}
          {!loading && relacionesFiltradas.length > 0 && (
            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                💡 Esta tabla muestra las relaciones entre proveedores y rubros basadas en los artículos existentes.
                Los datos se actualizan automáticamente cuando se ejecuta el script de sincronización.
              </Typography>
            </Box>
          )}
        </DashboardCard>
      </Box>
    </PageContainer>
  );
}
