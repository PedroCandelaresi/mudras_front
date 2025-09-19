'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useQuery } from '@apollo/client/react';
import { OBTENER_STOCK_PUNTO_MUDRAS, StockPuntoMudrasResponse } from '@/queries/stock-puntos-venta';
import { PuntoMudras } from '@/interfaces/puntos-mudras';
import { verde } from '@/ui/colores';

interface ArticuloStock {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stockAsignado: number;
  stockTotal: number;
  rubro: {
    id: number;
    Descripcion: string;
  };
}

interface Props {
  puntoVenta: PuntoMudras;
  onModificarStock: (articulo: any) => void;
  refetchTrigger: number;
}

export default function TablaStockPuntoVenta({ puntoVenta, onModificarStock, refetchTrigger }: Props) {
  const [articulos, setArticulos] = useState<ArticuloStock[]>([]);

  const { data, loading, error, refetch } = useQuery<StockPuntoMudrasResponse>(OBTENER_STOCK_PUNTO_MUDRAS, {
    variables: {
      puntoMudrasId: puntoVenta.id
    },
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    if (data?.obtenerStockPuntoMudras) {
      setArticulos(data.obtenerStockPuntoMudras);
    }
  }, [data]);

  useEffect(() => {
    if (refetchTrigger > 0) {
      refetch();
    }
  }, [refetchTrigger, refetch]);

  const handleModificarStock = (articulo: ArticuloStock) => {
    onModificarStock({
      ...articulo,
      puntoVentaId: puntoVenta.id,
      puntoVentaNombre: puntoVenta.nombre
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress color="success" />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando stock de {puntoVenta.nombre}...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar el stock de {puntoVenta.nombre}: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600} color={verde.textStrong}>
          Stock en {puntoVenta.nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total de artículos: {articulos.length}
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Artículo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rubro</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Precio</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Stock Asignado</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Stock Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articulos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay artículos asignados a este punto de venta
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              articulos.map((articulo) => (
                <TableRow key={articulo.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {articulo.codigo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {articulo.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={articulo.rubro.Descripcion}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      ${articulo.precio.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      color={articulo.stockAsignado > 0 ? verde.textStrong : 'text.secondary'}
                    >
                      {articulo.stockAsignado}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {articulo.stockTotal}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {articulo.stockAsignado === 0 ? (
                      <Chip 
                        label="Sin stock" 
                        size="small" 
                        color="error" 
                        variant="outlined"
                      />
                    ) : articulo.stockAsignado <= 5 ? (
                      <Chip 
                        label="Stock bajo" 
                        size="small" 
                        color="warning" 
                        variant="outlined"
                      />
                    ) : (
                      <Chip 
                        label="Disponible" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modificar stock">
                      <IconButton 
                        size="small" 
                        onClick={() => handleModificarStock(articulo)}
                        sx={{ color: verde.primary }}
                      >
                        <Icon icon="mdi:package-variant" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
