# Cambios Pendientes - ModalConfirmacionVenta.tsx

## ✅ Cambios Ya Aplicados
- ✅ Imports actualizados (Card, CardContent, alpha, darken, Icon)
- ✅ Iconos de métodos de pago cambiados a iconify (mdi:*)
- ✅ Constantes de layout agregadas (VH_MAX, HEADER_H, etc.)
- ✅ Función `makeColors()` agregada
- ✅ Función `currency()` agregada
- ✅ Variable `COLORS` agregada al componente

## 🔧 Cambios Pendientes (Hacer Manualmente)

### 1. Agregar estilos de campos (línea ~450, antes del return)
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
```

### 2. Reemplazar apertura del Dialog (línea ~453)
**ANTES:**
```typescript
<Dialog
  open={open}
  onClose={handleClose}
  maxWidth="lg"
  fullWidth
  PaperProps={{
    sx: { minHeight: '80vh' }
  }}
>
  <DialogTitle>
    <Typography variant="h5">Confirmar Venta</Typography>
    <Typography variant="body2" color="text.secondary">
      Revisa los detalles y configura el pago
    </Typography>
  </DialogTitle>

  <DialogContent dividers>
```

**DESPUÉS:**
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
      {/* ===== HEADER ===== */}
      <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', px: 3, py: 2.25, gap: 2 }}>
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography variant="h6" fontWeight={700} color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              Confirmar Venta
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.85)" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
              Revisa los detalles y configura el pago
            </Typography>
          </Box>

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

      {/* Divisor header */}
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

      {/* ===== CONTENIDO ===== */}
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
```

### 3. Reemplazar todos los `<Paper>` por `<Card>` con CardContent

**BUSCAR (línea ~473):**
```typescript
<Paper elevation={1} sx={{ p: 2, mb: 2 }}>
  <Typography variant="h6" gutterBottom>
    Configuración de Venta
  </Typography>
```

**REEMPLAZAR POR:**
```typescript
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
```

**Y cerrar con:**
```typescript
  </CardContent>
</Card>
```

### 4. Aplicar estilos a todos los Select
Agregar `sx={selectSx}` a todos los `<Select>`:
- Línea ~482 (Tipo de Venta)
- Línea ~530 (Puesto de Venta)
- Línea ~686 (Método de pago)

### 5. Aplicar estilos a todos los TextField
Agregar `sx={fieldSx}` a todos los `<TextField>`:
- Línea ~506 (Usuario)
- Línea ~564 (Punto de stock)
- Línea ~596 (Cliente)
- Línea ~612 (Observaciones)
- Línea ~703 (Monto de pago)

### 6. Cambiar iconos en Select de métodos de pago (línea ~690)
**ANTES:**
```typescript
<MenuItem key={metodo.value} value={metodo.value}>
  <Box display="flex" alignItems="center" gap={1}>
    <metodo.icon size={16} />
    {metodo.label}
  </Box>
</MenuItem>
```

**DESPUÉS:**
```typescript
<MenuItem key={metodo.value} value={metodo.value}>
  <Box display="flex" alignItems="center" gap={1}>
    <Icon icon={metodo.icon} width={18} height={18} />
    {metodo.label}
  </Box>
</MenuItem>
```

### 7. Cambiar iconos en tabla de pagos (línea ~742)
**ANTES:**
```typescript
<Box display="flex" alignItems="center" gap={1}>
  {metodo && <metodo.icon size={16} />}
  {metodo?.label}
</Box>
```

**DESPUÉS:**
```typescript
<Box display="flex" alignItems="center" gap={1}>
  {metodo && <Icon icon={metodo.icon} width={18} height={18} color={COLORS.primary} />}
  {metodo?.label}
</Box>
```

### 8. Cerrar DialogContent y agregar divisor + footer (línea ~836, ANTES de `</DialogContent>`)
**AGREGAR ANTES DE `</DialogContent>`:**
```typescript
              </Box>
            </Box>
          </DialogContent>

          {/* Divisor footer */}
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

          {/* ===== FOOTER ===== */}
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
        </Box>
      </TexturedPanel>
    </Dialog>
```

### 9. Eliminar el DialogActions antiguo (líneas ~838-850)
Eliminar completamente:
```typescript
<DialogActions sx={{ p: 3 }}>
  <Button onClick={handleClose} disabled={creandoVenta}>
    Cancelar
  </Button>
  <Button
    variant="contained"
    onClick={handleConfirmarVenta}
    disabled={!puedeConfirmar || creandoVenta}
    startIcon={creandoVenta ? <CircularProgress size={16} /> : undefined}
  >
    {creandoVenta ? 'Procesando...' : 'Confirmar Venta'}
  </Button>
</DialogActions>
```

## 📝 Notas
- Todos los cambios mantienen la lógica de negocio intacta
- Solo se modifican aspectos visuales/estéticos
- El modal quedará consistente con los otros modales del sistema
- Verificar que no queden imports sin usar después de los cambios
