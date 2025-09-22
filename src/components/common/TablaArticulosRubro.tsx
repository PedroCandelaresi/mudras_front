'use client';
import React from 'react';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import { verde } from '@/ui/colores';

export interface Articulo {
  id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
  proveedor?: {
    id: number;
    nombre: string;
  };
}

interface TablaArticulosRubroProps {
  articulos: Articulo[];
  total: number;
  loading?: boolean;
  
  // Filtros y búsqueda
  filtro: string;
  onFiltroChange: (filtro: string) => void;
  
  // Selección
  articulosSeleccionados: number[];
  onSeleccionChange: (ids: number[]) => void;
  
  // Paginación
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  
  // Acciones
  onEliminarSeleccionados?: () => void;
  
  // Configuración
  compact?: boolean;
  showProveedores?: boolean;
}

export function TablaArticulosRubro({
  articulos,
  total,
  loading = false,
  filtro,
  onFiltroChange,
  articulosSeleccionados,
  onSeleccionChange,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEliminarSeleccionados,
  compact = false,
  showProveedores = true
}: TablaArticulosRubroProps) {

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSeleccionChange(articulos.map(a => a.id));
    } else {
      onSeleccionChange([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      onSeleccionChange([...articulosSeleccionados, id]);
    } else {
      onSeleccionChange(articulosSeleccionados.filter(selectedId => selectedId !== id));
    }
  };

  const isAllSelected = articulos.length > 0 && articulosSeleccionados.length === articulos.length;
  const isIndeterminate = articulosSeleccionados.length > 0 && articulosSeleccionados.length < articulos.length;

  const cellPadding = compact ? 1 : 1.5;
  const fontSize = compact ? '0.8rem' : '0.875rem';

  return (
    <Box>
      {/* Toolbar */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ 
          px: 2, 
          py: 1.25, 
          bgcolor: verde.toolbarBg, 
          border: '1px solid', 
          borderColor: verde.toolbarBorder, 
          borderRadius: 1, 
          mb: 1.5 
        }}
      >
        <Typography variant="body1" fontWeight={700} color={verde.textStrong}>
          Artículos del Rubro ({total})
        </Typography>
        
        <TextField
          placeholder="Buscar artículos..."
          value={filtro}
          onChange={(e) => {
            onFiltroChange(e.target.value);
            onPageChange(0);
          }}
          size="small"
          sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} color={verde.primary} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Botón eliminar seleccionados */}
      {articulosSeleccionados.length > 0 && onEliminarSeleccionados && (
        <Box mb={2}>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<IconTrash />} 
            onClick={onEliminarSeleccionados}
            sx={{ textTransform: 'none' }}
          >
            Eliminar {articulosSeleccionados.length} artículo(s) seleccionado(s)
          </Button>
        </Box>
      )}

      {/* Tabla */}
      <Paper 
        elevation={0} 
        sx={{ 
          border: '1px solid', 
          borderColor: verde.toolbarBorder, 
          borderRadius: 2, 
          bgcolor: 'background.paper', 
          overflow: 'hidden' 
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: verde.headerBg }}>
                <TableCell 
                  padding="checkbox" 
                  sx={{ 
                    borderBottom: `1px solid ${verde.headerBorder}`,
                    py: cellPadding
                  }}
                >
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    sx={{ color: verde.headerText }}
                  />
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    color: verde.headerText, 
                    borderBottom: `1px solid ${verde.headerBorder}`,
                    fontSize,
                    py: cellPadding
                  }}
                >
                  Código
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    color: verde.headerText, 
                    borderBottom: `1px solid ${verde.headerBorder}`,
                    fontSize,
                    py: cellPadding
                  }}
                >
                  Descripción
                </TableCell>
                {showProveedores && (
                  <TableCell 
                    sx={{ 
                      fontWeight: 700, 
                      color: verde.headerText, 
                      borderBottom: `1px solid ${verde.headerBorder}`,
                      fontSize,
                      py: cellPadding
                    }}
                  >
                    Proveedor
                  </TableCell>
                )}
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 700, 
                    color: verde.headerText, 
                    borderBottom: `1px solid ${verde.headerBorder}`,
                    fontSize,
                    py: cellPadding
                  }}
                >
                  Precio
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 700, 
                    color: verde.headerText, 
                    borderBottom: `1px solid ${verde.headerBorder}`,
                    fontSize,
                    py: cellPadding
                  }}
                >
                  Stock
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showProveedores ? 6 : 5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cargando artículos...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : articulos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showProveedores ? 6 : 5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron artículos
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                articulos.map((articulo, index) => (
                  <TableRow
                    key={articulo.id}
                    sx={{
                      bgcolor: index % 2 === 0 ? 'transparent' : verde.alternateRow,
                      '&:hover': { bgcolor: verde.rowHover }
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ py: cellPadding }}>
                      <Checkbox
                        checked={articulosSeleccionados.includes(articulo.id)}
                        onChange={(e) => handleSelectOne(articulo.id, e.target.checked)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize, py: cellPadding }}>
                      <Typography variant="caption" fontWeight={600}>
                        {articulo.codigo}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize, py: cellPadding }}>
                      <Typography variant="caption" sx={{ fontSize }}>
                        {articulo.descripcion}
                      </Typography>
                    </TableCell>
                    {showProveedores && (
                      <TableCell sx={{ py: cellPadding }}>
                        {articulo.proveedor ? (
                          <Chip
                            label={articulo.proveedor.nombre}
                            size="small"
                            sx={{
                              bgcolor: verde.primary,
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              height: 24
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary" fontStyle="italic">
                            Sin proveedor
                          </Typography>
                        )}
                      </TableCell>
                    )}
                    <TableCell align="right" sx={{ fontSize, py: cellPadding }}>
                      <Typography variant="caption" fontWeight={600}>
                        ${articulo.precio.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize, py: cellPadding }}>
                      <Typography variant="caption">
                        {articulo.stock}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">Filas por página:</Typography>
            <TextField 
              select 
              size="small" 
              value={rowsPerPage} 
              onChange={(e) => {
                onRowsPerPageChange(parseInt(e.target.value, 10));
                onPageChange(0);
              }} 
              sx={{ minWidth: 70 }}
            >
              {[50, 100, 150].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {Array.from({ length: Math.ceil(total / rowsPerPage) }, (_, i) => i + 1).map((numeroPagina) => (
              <Button 
                key={numeroPagina} 
                size="small" 
                variant={page + 1 === numeroPagina ? 'contained' : 'text'} 
                onClick={() => onPageChange(numeroPagina - 1)} 
                sx={{ 
                  minWidth: 30, 
                  height: 30, 
                  textTransform: 'none', 
                  fontSize: '0.8rem', 
                  ...(page + 1 === numeroPagina ? { 
                    bgcolor: verde.primary, 
                    color: 'white', 
                    '&:hover': { bgcolor: verde.primaryHover } 
                  } : { 
                    color: 'text.secondary', 
                    '&:hover': { bgcolor: verde.rowHover } 
                  }) 
                }}
              >
                {numeroPagina}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
