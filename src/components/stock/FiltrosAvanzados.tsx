'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { FiltrosArticulo, EstadoArticulo } from '@/interfaces/articulo';

interface FiltrosAvanzadosProps {
  filtros: FiltrosArticulo;
  onChange: (filtros: FiltrosArticulo) => void;
  onClose: () => void;
}

export default function FiltrosAvanzados({ filtros, onChange, onClose }: FiltrosAvanzadosProps) {
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosArticulo>(filtros);

  const aplicarFiltros = () => {
    onChange(filtrosLocales);
    onClose();
  };

  const limpiarFiltros = () => {
    const filtrosLimpios: FiltrosArticulo = {
      pagina: 0,
      limite: filtros.limite,
      ordenarPor: 'Descripcion',
      direccionOrden: 'ASC'
    };
    setFiltrosLocales(filtrosLimpios);
    onChange(filtrosLimpios);
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtrosLocales.busqueda) count++;
    if (filtrosLocales.codigo) count++;
    if (filtrosLocales.descripcion) count++;
    if (filtrosLocales.marca) count++;
    if (filtrosLocales.rubroId) count++;
    if (filtrosLocales.proveedorId) count++;
    if (filtrosLocales.estado) count++;
    if (filtrosLocales.soloConStock) count++;
    if (filtrosLocales.soloStockBajo) count++;
    if (filtrosLocales.soloEnPromocion) count++;
    if (filtrosLocales.soloPublicadosEnTienda) count++;
    if (filtrosLocales.precioMinimo) count++;
    if (filtrosLocales.precioMaximo) count++;
    return count;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">
              Filtros Avanzados
            </Typography>
            {contarFiltrosActivos() > 0 && (
              <Chip 
                label={`${contarFiltrosActivos()} activos`} 
                color="primary" 
                size="small" 
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          {/* Búsqueda por campos específicos */}
          <Grid size={12}>
            <Typography variant="subtitle2" gutterBottom>
              Búsqueda Específica
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Código"
              value={filtrosLocales.codigo || ''}
              onChange={(e) => setFiltrosLocales({ 
                ...filtrosLocales, 
                codigo: e.target.value || undefined 
              })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Descripción"
              value={filtrosLocales.descripcion || ''}
              onChange={(e) => setFiltrosLocales({ 
                ...filtrosLocales, 
                descripcion: e.target.value || undefined 
              })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Marca"
              value={filtrosLocales.marca || ''}
              onChange={(e) => setFiltrosLocales({ 
                ...filtrosLocales, 
                marca: e.target.value || undefined 
              })}
            />
          </Grid>

          {/* Estado y categorías */}
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Estado y Categorías
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtrosLocales.estado || ''}
                label="Estado"
                onChange={(e) => setFiltrosLocales({ 
                  ...filtrosLocales, 
                  estado: e.target.value as EstadoArticulo || undefined 
                })}
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.values(EstadoArticulo).map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="ID Rubro"
              type="number"
              value={filtrosLocales.rubroId || ''}
              onChange={(e) => setFiltrosLocales({ 
                ...filtrosLocales, 
                rubroId: parseInt(e.target.value) || undefined 
              })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="ID Proveedor"
              type="number"
              value={filtrosLocales.proveedorId || ''}
              onChange={(e) => setFiltrosLocales({ 
                ...filtrosLocales, 
                proveedorId: parseInt(e.target.value) || undefined 
              })}
            />
          </Grid>

          {/* Rango de precios */}
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Rango de Precios
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Precio Mínimo"
              type="number"
              value={filtrosLocales.precioMinimo || ''}
              onChange={(e) => setFiltrosLocales({ 
                ...filtrosLocales, 
                precioMinimo: parseFloat(e.target.value) || undefined 
              })}
              InputProps={{
                startAdornment: '$'
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Precio Máximo"
              type="number"
              value={filtrosLocales.precioMaximo || ''}
              onChange={(e) => setFiltrosLocales({ 
                ...filtrosLocales, 
                precioMaximo: parseFloat(e.target.value) || undefined 
              })}
              InputProps={{
                startAdornment: '$'
              }}
            />
          </Grid>

          {/* Filtros booleanos */}
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Filtros Especiales
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtrosLocales.soloConStock || false}
                  onChange={(e) => setFiltrosLocales({ 
                    ...filtrosLocales, 
                    soloConStock: e.target.checked || undefined 
                  })}
                />
              }
              label="Solo con Stock"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtrosLocales.soloStockBajo || false}
                  onChange={(e) => setFiltrosLocales({ 
                    ...filtrosLocales, 
                    soloStockBajo: e.target.checked || undefined 
                  })}
                />
              }
              label="Solo Stock Bajo"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtrosLocales.soloEnPromocion || false}
                  onChange={(e) => setFiltrosLocales({ 
                    ...filtrosLocales, 
                    soloEnPromocion: e.target.checked || undefined 
                  })}
                />
              }
              label="Solo en Promoción"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtrosLocales.soloPublicadosEnTienda || false}
                  onChange={(e) => setFiltrosLocales({ 
                    ...filtrosLocales, 
                    soloPublicadosEnTienda: e.target.checked || undefined 
                  })}
                />
              }
              label="Solo en Tienda"
            />
          </Grid>

          {/* Ordenamiento */}
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Ordenamiento
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filtrosLocales.ordenarPor}
                label="Ordenar por"
                onChange={(e) => setFiltrosLocales({ 
                  ...filtrosLocales, 
                  ordenarPor: e.target.value 
                })}
              >
                <MenuItem value="Descripcion">Descripción</MenuItem>
                <MenuItem value="Codigo">Código</MenuItem>
                <MenuItem value="PrecioVenta">Precio</MenuItem>
                <MenuItem value="Deposito">Stock</MenuItem>
                <MenuItem value="Marca">Marca</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Dirección</InputLabel>
              <Select
                value={filtrosLocales.direccionOrden}
                label="Dirección"
                onChange={(e) => setFiltrosLocales({ 
                  ...filtrosLocales, 
                  direccionOrden: e.target.value as 'ASC' | 'DESC' 
                })}
              >
                <MenuItem value="ASC">Ascendente</MenuItem>
                <MenuItem value="DESC">Descendente</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Paginación */}
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Paginación
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Elementos por página</InputLabel>
              <Select
                value={filtrosLocales.limite}
                label="Elementos por página"
                onChange={(e) => setFiltrosLocales({ 
                  ...filtrosLocales, 
                  limite: e.target.value as number 
                })}
              >
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Botones de acción */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={limpiarFiltros}
          >
            Limpiar Filtros
          </Button>
          
          <Box display="flex" gap={1}>
            <Button onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={aplicarFiltros}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
