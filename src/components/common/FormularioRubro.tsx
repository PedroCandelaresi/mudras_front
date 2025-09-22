'use client';
import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { IconTag } from '@tabler/icons-react';
import { azul } from '@/ui/colores';

export interface FormRubro {
  nombre: string;
  codigo: string;
  porcentajeRecargo: number;
  porcentajeDescuento: number;
}

interface FormularioRubroProps {
  formData: FormRubro;
  setFormData: (data: FormRubro) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function FormularioRubro({ 
  formData, 
  setFormData, 
  disabled = false,
  compact = false 
}: FormularioRubroProps) {
  const handleChange = (field: keyof FormRubro, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const fieldSpacing = compact ? 2 : 2.5;
  const labelVariant = compact ? 'body2' : 'body1';

  return (
    <Box display="flex" flexDirection="column" gap={fieldSpacing}>
      {/* Nombre y Código */}
      <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { xs: 1, md: 2 } }}>
          <Typography 
            variant={labelVariant} 
            fontWeight={600} 
            color={azul.textStrong} 
            mb={1} 
            display="flex" 
            alignItems="center" 
            gap={1}
          >
            <IconTag size={18} color={azul.primary} />
            Nombre del Rubro
          </Typography>
          <TextField
            size="small"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value.toUpperCase())}
            fullWidth
            required
            disabled={disabled}
            variant="outlined"
            placeholder="Ingrese el nombre del rubro"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: disabled ? 'grey.100' : 'white'
              }
            }}
          />
        </Box>
        
        <Box sx={{ flex: { xs: 1, md: 1 } }}>
          <Typography 
            variant={labelVariant} 
            fontWeight={600} 
            color={azul.textStrong} 
            mb={1} 
            display="flex" 
            alignItems="center" 
            gap={1}
          >
            <Icon icon="mdi:code-tags" style={{ color: azul.primary, fontSize: 18 }} />
            Código (opcional)
          </Typography>
          <TextField
            size="small"
            value={formData.codigo}
            onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
            fullWidth
            disabled={disabled}
            variant="outlined"
            placeholder="Ingrese el código del rubro"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: disabled ? 'grey.100' : 'white'
              }
            }}
          />
        </Box>
      </Box>

      {/* Porcentajes */}
      <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { xs: 1, md: 1 } }}>
          <Typography 
            variant={labelVariant} 
            fontWeight={600} 
            color={azul.textStrong} 
            mb={1} 
            display="flex" 
            alignItems="center" 
            gap={1}
          >
            <Icon icon="mdi:account-cash" style={{ color: azul.primary, fontSize: 18 }} />
            Recargo Proveedor (%)
          </Typography>
          <TextField
            size="small"
            type="number"
            value={formData.porcentajeRecargo}
            onChange={(e) => handleChange('porcentajeRecargo', parseFloat(e.target.value) || 0)}
            fullWidth
            disabled={disabled}
            variant="outlined"
            placeholder="0.00"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: disabled ? 'grey.100' : 'white'
              }
            }}
            helperText="Sobre precio final del proveedor (incluye sus recargos)"
          />
        </Box>
        
        <Box sx={{ flex: { xs: 1, md: 1 } }}>
          <Typography 
            variant={labelVariant} 
            fontWeight={600} 
            color={azul.textStrong} 
            mb={1} 
            display="flex" 
            alignItems="center" 
            gap={1}
          >
            <Icon icon="mdi:tag-percent" style={{ color: azul.primary, fontSize: 18 }} />
            Descuento Venta (%)
          </Typography>
          <TextField
            size="small"
            type="number"
            value={formData.porcentajeDescuento}
            onChange={(e) => handleChange('porcentajeDescuento', parseFloat(e.target.value) || 0)}
            fullWidth
            disabled={disabled}
            variant="outlined"
            placeholder="0.00"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: disabled ? 'grey.100' : 'white'
              }
            }}
            helperText="Sobre precio final de venta (después de todos los recargos)"
          />
        </Box>
      </Box>
    </Box>
  );
}
