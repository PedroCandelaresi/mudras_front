# Refactorización Estética: ModalConfirmacionVenta

## Resumen
El modal de confirmación de venta necesita aplicar el patrón estético de los modales de detalles/edición existentes (artículos, proveedores, rubros).

## Cambios Principales

### 1. Imports Adicionales
```typescript
import { alpha, darken } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@mui/material';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';
```

### 2. Constantes de Layout y Colores
```typescript
const VH_MAX = 85;
const HEADER_H = 88;
const FOOTER_H = 88;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;
const NBSP = '\u00A0';

const makeColors = (base?: string) => {
  const primary = base || verde.primary;
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.5),
    chipBorder: 'rgba(255,255,255,0.35)',
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
  };
};

const currency = (v: number) =>
  v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
```

### 3. Cambiar Iconos de Tabler a Iconify
```typescript
// ANTES:
const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: IconCash },
  // ...
];

// DESPUÉS:
const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: 'mdi:cash' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito', icon: 'mdi:credit-card' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito', icon: 'mdi:credit-card-multiple' },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: 'mdi:bank-transfer' },
  { value: 'CHEQUE', label: 'Cheque', icon: 'mdi:checkbook' },
  { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente', icon: 'mdi:book-open-variant' },
  { value: 'OTRO', label: 'Otro', icon: 'mdi:dots-horizontal' },
];
```

### 4. Estructura del Dialog
```typescript
<Dialog
  open={open}
  onClose={handleClose}
  maxWidth="lg"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      bgcolor: 'transparent',
      overflow: 'hidden',
      maxHeight: `${VH_MAX}vh`,
    },
  }}
>
  <TexturedPanel
    accent={COLORS.primary}
    radius={12}
    contentPadding={0}
    bgTintPercent={12}
    bgAlpha={1}
    textureBaseOpacity={0.22}
    textureBoostOpacity={0.19}
    textureBrightness={1.12}
    textureContrast={1.03}
    tintOpacity={0.38}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
      {/* Header, Content, Footer */}
    </Box>
  </TexturedPanel>
</Dialog>
```

### 5. Header con Ícono y Chips
```typescript
<DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', px: 3, py: 2.25, gap: 2 }}>
    {/* Ícono circular */}
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
        color: '#fff',
      }}
    >
      <Icon icon="mdi:cash-register" width={22} height={22} />
    </Box>

    {/* Título y subtítulo */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography variant="h6" fontWeight={700} color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
        Confirmar Venta
      </Typography>
      <Typography variant="caption" color="rgba(255,255,255,0.85)" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
        Revisa los detalles y configura el pago
      </Typography>
    </Box>

    {/* Chips informativos */}
    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, pr: 1.5 }}>
      <Chip
        label={`${articulos.length}${NBSP}${articulos.length === 1 ? 'artículo' : 'artículos'}`}
        size="small"
        sx={{
          bgcolor: 'rgba(0,0,0,0.35)',
          color: '#fff',
          border: `1px solid ${COLORS.chipBorder}`,
          fontWeight: 600,
          px: 1.5,
          py: 0.5,
          height: 28,
        }}
      />
      <Chip
        label={currency(subtotal)}
        size="small"
        sx={{
          bgcolor: 'rgba(0,0,0,0.35)',
          color: '#fff',
          border: `1px solid ${COLORS.chipBorder}`,
          fontWeight: 700,
          px: 1.5,
          py: 0.5,
          height: 28,
        }}
      />
    </Box>

    {/* Botón cerrar */}
    <CrystalSoftButton
      baseColor={COLORS.primary}
      onClick={handleClose}
      title="Cerrar"
      sx={{
        width: 40,
        height: 40,
        minWidth: 40,
        p: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        transform: 'none !important',
        transition: 'none',
        '&:hover': { transform: 'none !important' },
      }}
    >
      <Icon icon="mdi:close" color="#fff" width={22} height={22} />
    </CrystalSoftButton>
  </Box>
</DialogTitle>
```

### 6. Divisor Decorativo (Header)
```typescript
<Divider
  sx={{
    height: DIV_H,
    border: 0,
    backgroundImage: `
      linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
      linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
      linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
    `,
    backgroundRepeat: 'no-repeat, no-repeat, repeat',
    backgroundSize: '100% 1px, 100% 1px, 100% 100%',
    backgroundPosition: 'top left, bottom left, center',
    flex: '0 0 auto',
  }}
/>
```

### 7. Contenido con WoodBackdrop
```typescript
<DialogContent
  sx={{
    p: 0,
    borderRadius: 0,
    overflow: 'auto',
    maxHeight: CONTENT_MAX,
    flex: '0 1 auto',
  }}
>
  <Box sx={{ position: 'relative', borderRadius: 0, overflow: 'hidden' }}>
    <WoodBackdrop accent={COLORS.primary} radius={0} inset={0} strength={0.7} texture="wide" />
    <Box
      sx={{
        position: 'relative',
        zIndex: 1,
        p: 4,
        borderRadius: 0,
        backdropFilter: 'saturate(118%) blur(0.4px)',
        background: 'rgba(255,255,255,0.86)',
      }}
    >
      {/* Contenido aquí */}
    </Box>
  </Box>
</DialogContent>
```

### 8. Reemplazar Paper por Card
```typescript
// ANTES:
<Paper elevation={1} sx={{ p: 2, mb: 2 }}>
  <Typography variant="h6" gutterBottom>
    Configuración de Venta
  </Typography>
  {/* ... */}
</Paper>

// DESPUÉS:
<Card
  sx={{
    borderRadius: 2,
    border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
    background: alpha(COLORS.primary, 0.05),
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
    mb: 2,
  }}
>
  <CardContent sx={{ p: 2.5 }}>
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      <Icon icon="mdi:cog-outline" width={20} height={20} color={COLORS.primary} />
      <Typography variant="h6" fontWeight={700} color={COLORS.textStrong}>
        Configuración de Venta
      </Typography>
    </Box>
    {/* ... */}
  </CardContent>
</Card>
```

### 9. Estilos para Inputs
```typescript
const fieldSx = useMemo(
  () => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      background: '#ffffff',
      '& fieldset': { borderColor: COLORS.inputBorder },
      '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: COLORS.primary,
    },
  }),
  [COLORS]
);

const selectSx = useMemo(
  () => ({
    borderRadius: 2,
    background: '#ffffff',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.inputBorder },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.inputBorderHover },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
  }),
  [COLORS]
);

// Aplicar a todos los TextField y Select:
<TextField {...props} sx={fieldSx} />
<Select {...props} sx={selectSx} />
```

### 10. Divisor Footer
```typescript
<Divider
  sx={{
    height: DIV_H,
    border: 0,
    backgroundImage: `
      linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
      linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
      linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
    `,
    backgroundRepeat: 'no-repeat, no-repeat, repeat',
    backgroundSize: '100% 1px, 100% 1px, 100% 100%',
    backgroundPosition: 'top left, bottom left, center',
    flex: '0 0 auto',
  }}
/>
```

### 11. Footer con Botones Crystal
```typescript
<DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 3, py: 2.5, gap: 1.5 }}>
    <CrystalSoftButton
      baseColor={COLORS.primary}
      onClick={handleClose}
      disabled={creandoVenta}
      sx={{
        minHeight: 44,
        px: 3,
        fontWeight: 600,
      }}
    >
      Cancelar
    </CrystalSoftButton>
    <CrystalButton
      baseColor={COLORS.primary}
      onClick={handleConfirmarVenta}
      disabled={!puedeConfirmar || creandoVenta}
      sx={{
        minHeight: 44,
        px: 3,
        fontWeight: 700,
        '&:disabled': {
          opacity: 0.55,
          boxShadow: 'none',
        },
      }}
    >
      {creandoVenta ? 'Procesando...' : 'Confirmar Venta'}
    </CrystalButton>
  </Box>
</DialogActions>
```

### 12. Iconos en Lista de Pagos
```typescript
// Cambiar el renderizado de iconos en la tabla de pagos:
{pagos.map((pago, index) => {
  const metodo = METODOS_PAGO.find(m => m.value === pago.metodoPago);
  return (
    <TableRow key={index}>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {metodo && <Icon icon={metodo.icon} width={18} height={18} color={COLORS.primary} />}
          {metodo?.label}
        </Box>
      </TableCell>
      {/* ... */}
    </TableRow>
  );
})}
```

### 13. Select de Método de Pago
```typescript
<Select
  value={nuevoPago.metodoPago}
  onChange={(e) => setNuevoPago(prev => ({ ...prev, metodoPago: e.target.value as any }))}
  label="Método"
  sx={selectSx}
>
  {METODOS_PAGO.map(metodo => (
    <MenuItem key={metodo.value} value={metodo.value}>
      <Box display="flex" alignItems="center" gap={1}>
        <Icon icon={metodo.icon} width={18} height={18} />
        {metodo.label}
      </Box>
    </MenuItem>
  ))}
</Select>
```

## Notas Importantes
- Mantener toda la lógica de negocio intacta
- Solo cambiar la presentación visual
- Usar `COLORS` en lugar de colores hardcodeados
- Aplicar `fieldSx` y `selectSx` a todos los inputs
- Reemplazar todos los `Paper` por `Card` con los estilos apropiados
- Cambiar todos los `Button` por `CrystalButton` o `CrystalSoftButton`
- Usar `Icon` de `@iconify/react` en lugar de componentes de Tabler

## Resultado Esperado
Un modal visualmente consistente con el resto de los modales del sistema, manteniendo toda la funcionalidad existente.
