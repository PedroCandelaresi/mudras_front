'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  IconSearch,
  IconBarcode,
  IconPlus,
  IconAlertTriangle,
} from '@tabler/icons-react';
import {
  BUSCAR_ARTICULOS_CAJA,
  type BuscarArticulosCajaResponse,
  type ArticuloCaja,
} from '@/components/caja-registradora/graphql/queries';

interface BusquedaArticulosProps {
  puestoVentaId: number;
  onAgregarArticulo: (articulo: ArticuloCaja, cantidad: number) => void;
  articulosEnCarrito: { [key: number]: number }; // articuloId -> cantidad
}

export const BusquedaArticulos: React.FC<BusquedaArticulosProps> = ({
  puestoVentaId,
  onAgregarArticulo,
  articulosEnCarrito,
}) => {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<ArticuloCaja[]>([]);
  const [cantidades, setCantidades] = useState<{ [key: number]: number }>({});

  const variables = {
    input: {
      nombre: termino.trim() || undefined,
      sku: termino.trim() || undefined,
      codigoBarras: termino.trim() || undefined,
      puestoVentaId,
      limite: 20,
    },
  } as const;

  const { data, loading, error, refetch } = useQuery<BuscarArticulosCajaResponse>(BUSCAR_ARTICULOS_CAJA, {
    variables,
    skip: termino.trim().length < 2,
  });

  // Actualizar resultados cuando cambian los datos
  useEffect(() => {
    if (data?.buscarArticulosCaja) {
      setResultados(data.buscarArticulosCaja);
    } else if (termino.trim().length < 2) {
      setResultados([]);
    }
  }, [data, termino]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      console.error('Error al buscar artículos:', error);
    }
  }, [error]);

  const handleBuscarPorCodigo = () => {
    if (termino.trim()) {
      refetch({
        input: {
          ...variables.input,
          nombre: termino.trim() || undefined,
          codigoBarras: termino.trim() || undefined,
          sku: termino.trim() || undefined,
        },
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleBuscarPorCodigo();
    }
  };

  const handleCantidadChange = (articuloId: number, cantidad: string) => {
    const cantidadNum = parseFloat(cantidad) || 0;
    setCantidades((prev: { [key: number]: number }) => ({
      ...prev,
      [articuloId]: cantidadNum,
    }));
  };

  const handleAgregar = (articulo: ArticuloCaja) => {
    const cantidad = cantidades[articulo.id] || 1;
    if (cantidad > 0) {
      onAgregarArticulo(articulo, cantidad);
      // Limpiar cantidad después de agregar
      setCantidades((prev: { [key: number]: number }) => ({
        ...prev,
        [articulo.id]: 1,
      }));
    }
  };

  const calcularStockDespuesVenta = (articulo: ArticuloCaja): number => {
    const cantidadEnCarrito = articulosEnCarrito[articulo.id] || 0;
    const cantidadAAgregar = cantidades[articulo.id] || 1;
    const stockActual = parseFloat(String(articulo.Deposito || 0));
    return stockActual - cantidadEnCarrito - cantidadAAgregar;
  };

  const puedeAgregar = (articulo: ArticuloCaja): boolean => {
    const stockDespues = calcularStockDespuesVenta(articulo);
    const stockActual = parseFloat(String(articulo.Deposito || 0));
    return stockDespues >= 0 || stockActual > 0;
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Buscar Artículos
      </Typography>

      {/* Campo de búsqueda */}
      <TextField
        fullWidth
        placeholder="Buscar por código, descripción o escanear código de barras..."
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={20} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleBuscarPorCodigo}
                disabled={!termino.trim() || loading}
                size="small"
              >
                <IconBarcode size={20} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al buscar artículos: {error.message}
        </Alert>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <List>
          {resultados.map((articulo) => {
            const stockDespues = calcularStockDespuesVenta(articulo);
            const cantidad = cantidades[articulo.id] || 1;
            const cantidadEnCarrito = articulosEnCarrito[articulo.id] || 0;

            return (
              <ListItem
                key={articulo.id}
                divider
                sx={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  py: 2,
                }}
              >
                {/* Información del artículo */}
                <Box display="flex" justifyContent="space-between" width="100%" mb={1}>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {articulo.Codigo} - {articulo.Descripcion}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {articulo.Rubro} • ${articulo.PrecioVenta.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  {/* Chips de estado */}
                  <Box display="flex" gap={1} alignItems="center">
                    {articulo.EnPromocion && (
                      <Chip label="Promoción" color="secondary" size="small" />
                    )}
                    {parseFloat(String(articulo.Deposito || 0)) <= articulo.StockMinimo && (
                      <Chip
                        icon={<IconAlertTriangle size={16} />}
                        label="Stock Bajo"
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>

                {/* Stock y controles */}
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                  <Box>
                    <Typography variant="body2">
                      Stock disponible: <strong>{parseFloat(String(articulo.Deposito || 0))}</strong>
                    </Typography>
                    {cantidadEnCarrito > 0 && (
                      <Typography variant="body2" color="info.main">
                        En carrito: {cantidadEnCarrito}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color={stockDespues < 0 ? 'error.main' : 'text.secondary'}
                    >
                      Después de venta: {stockDespues}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      type="number"
                      size="small"
                      value={cantidad}
                      onChange={(e) => handleCantidadChange(articulo.id, e.target.value)}
                      inputProps={{
                        min: 0.1,
                        step: 0.1,
                        style: { textAlign: 'center' },
                      }}
                      sx={{ width: 80 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<IconPlus size={16} />}
                      onClick={() => handleAgregar(articulo)}
                      disabled={!puedeAgregar(articulo) || cantidad <= 0}
                    >
                      Agregar
                    </Button>
                  </Box>
                </Box>

                {/* Advertencia de stock */}
                {stockDespues < 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    No hay suficiente stock disponible
                  </Alert>
                )}
              </ListItem>
            );
          })}
        </List>
      )}

      {/* Sin resultados */}
      {termino.trim().length >= 2 && !loading && resultados.length === 0 && (
        <Box textAlign="center" py={3}>
          <Typography color="text.secondary">
            No se encontraron artículos para &quot;{termino}&quot;
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
