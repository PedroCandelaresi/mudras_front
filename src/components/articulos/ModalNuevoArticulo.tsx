'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  Stack,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  IconX,
  IconPhoto,
  IconUpload,
  IconShoppingCart,
  IconTag,
  IconPercentage,
  IconWorld,
  IconPalette,
  IconLock,
  IconUser,
  IconCrown
} from '@tabler/icons-react';
import { UNIDADES, UNIDADES_POR_DEFECTO_POR_RUBRO, abrevUnidad, type UnidadMedida } from '../../app/utils/unidades';
import { TexturedPanel } from '../../app/components/ui-components/TexturedFrame/TexturedPanel';
import { verde } from '../../ui/colores';

interface ModalNuevoArticuloProps {
  open: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'diseñadora' | 'vendedor';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`modal-tabpanel-${index}`}
      aria-labelledby={`modal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ModalNuevoArticulo: React.FC<ModalNuevoArticuloProps> = ({ 
  open, 
  onClose, 
  userRole = 'admin' // Por defecto admin para demo
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    // Datos básicos del artículo
    nombre: '',
    descripcion: '',
    codigo: '',
    categoria: '',
    precio: '',
    costo: '',
    stock: '',
    stockMinimo: '',
    unidad: 'unidad' as UnidadMedida,
    
    // Configuración de tienda web
    publicarTienda: false,
    tituloTienda: '',
    descripcionTienda: '',
    palabrasClave: '',
    categoriaWeb: '',
    
    // Ofertas y promociones
    enOferta: false,
    precioOferta: '',
    fechaInicioOferta: '',
    fechaFinOferta: '',
    
    enPromocion: false,
    tipoPromocion: '',
    descuentoPromocion: '',
    fechaInicioPromocion: '',
    fechaFinPromocion: '',
    
    // Configuración visual
    imagenPrincipal: null as File | null,
    imagenesSecundarias: [] as File[],
    colorPrincipal: '#1976d2',
    destacado: false,
    mostrarEnInicio: false
  });

  const isDesigner = userRole === 'diseñadora';
  const canEditPricing = !isDesigner;
  const canEditSpecs = !isDesigner;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoriaChange = (categoria: string) => {
    const clave = categoria?.toLowerCase();
    const unidadPorDefecto = (UNIDADES_POR_DEFECTO_POR_RUBRO as Record<string, UnidadMedida | undefined>)[clave] || 'unidad';
    setFormData(prev => ({ ...prev, categoria, unidad: unidadPorDefecto }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'principal' | 'secundarias') => {
    const files = event.target.files;
    if (!files) return;

    if (type === 'principal') {
      handleInputChange('imagenPrincipal', files[0]);
    } else {
      const newImages = Array.from(files);
      handleInputChange('imagenesSecundarias', [...formData.imagenesSecundarias, ...newImages]);
    }
  };

  const handleSubmit = () => {
    console.log('Datos del artículo:', formData);
    console.log('Rol del usuario:', userRole);
    // Aquí iría la lógica para enviar los datos al backend
    onClose();
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <IconCrown size={16} color="#ff9800" />;
      case 'diseñadora':
        return <IconPalette size={16} color="#e91e63" />;
      default:
        return <IconUser size={16} color="#2196f3" />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrador';
      case 'diseñadora':
        return 'Diseñadora Gráfica';
      default:
        return 'Vendedor';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth 
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: '85vh',
          bgcolor: 'transparent',
          overflow: 'hidden'
        }
      }}
    >
      <TexturedPanel 
        accent={verde.primary} 
        radius={12} 
        contentPadding={0} 
        bgTintPercent={10} 
        bgAlpha={1} 
        textureBaseOpacity={0.18} 
        textureBoostOpacity={0.14} 
        textureBrightness={1.1} 
        tintOpacity={0.35}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '85vh' }}>
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" fontWeight={600}>
                Nuevo Artículo
              </Typography>
              <IconButton onClick={onClose} size="small">
                <IconX />
              </IconButton>
            </Box>
          </DialogTitle>

      <DialogContent>
        {/* Alerta de permisos para diseñadora */}
        {isDesigner && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconLock size={16} />
              <Typography variant="body2">
                Como diseñadora gráfica, tienes acceso a configuraciones visuales y de tienda web, 
                pero no puedes modificar precios ni características técnicas del producto.
              </Typography>
            </Stack>
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label="Información Básica" 
              icon={<IconShoppingCart size={16} />}
              disabled={isDesigner}
            />
            <Tab 
              label="Tienda Web" 
              icon={<IconWorld size={16} />}
            />
            <Tab 
              label="Ofertas y Promociones" 
              icon={<IconTag size={16} />}
            />
            <Tab 
              label="Configuración Visual" 
              icon={<IconPalette size={16} />}
            />
          </Tabs>
        </Box>

        {/* Tab 1: Información Básica */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Datos del Producto
              </Typography>
            </Grid>
            
            <Grid size={6}>
              <TextField
                fullWidth
                label="Nombre del Artículo"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                disabled={isDesigner}
              />
            </Grid>
            
            <Grid size={6}>
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                disabled={isDesigner}
              />
            </Grid>
            
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                disabled={isDesigner}
              />
            </Grid>

            {/* Categoría y Unidad */}
            <Grid size={6}>
              <FormControl fullWidth disabled={isDesigner}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.categoria}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                  label="Categoría"
                >
                  <MenuItem value="cristales">Cristales</MenuItem>
                  <MenuItem value="inciensos">Inciensos</MenuItem>
                  <MenuItem value="aceites">Aceites Esenciales</MenuItem>
                  <MenuItem value="velas">Velas</MenuItem>
                  <MenuItem value="joyeria">Joyería</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={6}>
              <FormControl fullWidth disabled={isDesigner}>
                <InputLabel>Unidad de Medida</InputLabel>
                <Select
                  value={formData.unidad}
                  label="Unidad de Medida"
                  onChange={(e) => handleInputChange('unidad', e.target.value as UnidadMedida)}
                >
                  {UNIDADES.map((u) => (
                    <MenuItem key={u.clave} value={u.clave}>
                      {u.etiqueta} ({u.abreviatura})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Stock y Precios */}
            <Grid size={4}>
              <TextField
                fullWidth
                label={`Stock Inicial (${abrevUnidad(formData.unidad)})`}
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                disabled={isDesigner}
              />
            </Grid>

            <Grid size={4}>
              <TextField
                fullWidth
                label="Precio de Venta"
                type="number"
                value={formData.precio}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                disabled={!canEditPricing}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  endAdornment: (
                    <Typography sx={{ ml: 1, color: 'text.secondary' }}>
                      / {abrevUnidad(formData.unidad)}
                    </Typography>
                  )
                }}
              />
            </Grid>

            <Grid size={4}>
              <TextField
                fullWidth
                label="Costo"
                type="number"
                value={formData.costo}
                onChange={(e) => handleInputChange('costo', e.target.value)}
                disabled={!canEditPricing}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>

            <Grid size={4}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                type="number"
                value={formData.stockMinimo}
                onChange={(e) => handleInputChange('stockMinimo', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Tienda Web */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.publicarTienda}
                    onChange={(e) => handleInputChange('publicarTienda', e.target.checked)}
                  />
                }
                label="Publicar en Tienda Web"
              />
            </Grid>
            
            {formData.publicarTienda && (
              <>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Título para Tienda Web"
                    value={formData.tituloTienda}
                    onChange={(e) => handleInputChange('tituloTienda', e.target.value)}
                    helperText="Título optimizado para SEO"
                  />
                </Grid>
                
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Descripción para Tienda Web"
                    value={formData.descripcionTienda}
                    onChange={(e) => handleInputChange('descripcionTienda', e.target.value)}
                    helperText="Descripción atractiva para clientes online"
                  />
                </Grid>
                
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Palabras Clave"
                    value={formData.palabrasClave}
                    onChange={(e) => handleInputChange('palabrasClave', e.target.value)}
                    helperText="Separadas por comas"
                  />
                </Grid>
                
                <Grid size={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categoría Web</InputLabel>
                    <Select
                      value={formData.categoriaWeb}
                      onChange={(e) => handleInputChange('categoriaWeb', e.target.value)}
                      label="Categoría Web"
                    >
                      <MenuItem value="destacados">Productos Destacados</MenuItem>
                      <MenuItem value="nuevos">Nuevos Ingresos</MenuItem>
                      <MenuItem value="populares">Más Populares</MenuItem>
                      <MenuItem value="ofertas">En Oferta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={12}>
                  <Stack direction="row" spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.destacado}
                          onChange={(e) => handleInputChange('destacado', e.target.checked)}
                        />
                      }
                      label="Producto Destacado"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.mostrarEnInicio}
                          onChange={(e) => handleInputChange('mostrarEnInicio', e.target.checked)}
                        />
                      }
                      label="Mostrar en Página de Inicio"
                    />
                  </Stack>
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>

        {/* Tab 3: Ofertas y Promociones */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Ofertas */}
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={600}>
                      Configurar Oferta
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.enOferta}
                          onChange={(e) => handleInputChange('enOferta', e.target.checked)}
                          disabled={!canEditPricing}
                        />
                      }
                      label="Activar Oferta"
                    />
                  </Stack>
                  
                  {formData.enOferta && (
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <TextField
                          fullWidth
                          label="Precio de Oferta"
                          type="number"
                          value={formData.precioOferta}
                          onChange={(e) => handleInputChange('precioOferta', e.target.value)}
                          disabled={!canEditPricing}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                          }}
                        />
                      </Grid>
                      <Grid size={3}>
                        <TextField
                          fullWidth
                          label="Fecha Inicio"
                          type="date"
                          value={formData.fechaInicioOferta}
                          onChange={(e) => handleInputChange('fechaInicioOferta', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={3}>
                        <TextField
                          fullWidth
                          label="Fecha Fin"
                          type="date"
                          value={formData.fechaFinOferta}
                          onChange={(e) => handleInputChange('fechaFinOferta', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Promociones */}
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={600}>
                      Configurar Promoción
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.enPromocion}
                          onChange={(e) => handleInputChange('enPromocion', e.target.checked)}
                        />
                      }
                      label="Activar Promoción"
                    />
                  </Stack>
                  
                  {formData.enPromocion && (
                    <Grid container spacing={2}>
                      <Grid size={4}>
                        <FormControl fullWidth>
                          <InputLabel>Tipo de Promoción</InputLabel>
                          <Select
                            value={formData.tipoPromocion}
                            onChange={(e) => handleInputChange('tipoPromocion', e.target.value)}
                            label="Tipo de Promoción"
                          >
                            <MenuItem value="2x1">2x1</MenuItem>
                            <MenuItem value="descuento">Descuento %</MenuItem>
                            <MenuItem value="regalo">Producto de Regalo</MenuItem>
                            <MenuItem value="envio">Envío Gratis</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={2}>
                        <TextField
                          fullWidth
                          label="Descuento %"
                          type="number"
                          value={formData.descuentoPromocion}
                          onChange={(e) => handleInputChange('descuentoPromocion', e.target.value)}
                          disabled={formData.tipoPromocion !== 'descuento'}
                        />
                      </Grid>
                      <Grid size={3}>
                        <TextField
                          fullWidth
                          label="Fecha Inicio"
                          type="date"
                          value={formData.fechaInicioPromocion}
                          onChange={(e) => handleInputChange('fechaInicioPromocion', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={3}>
                        <TextField
                          fullWidth
                          label="Fecha Fin"
                          type="date"
                          value={formData.fechaFinPromocion}
                          onChange={(e) => handleInputChange('fechaFinPromocion', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Configuración Visual */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Imágenes del Producto
              </Typography>
            </Grid>
            
            {/* Imagen Principal */}
            <Grid size={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Imagen Principal
                </Typography>
                {formData.imagenPrincipal ? (
                  <Box>
                    <Avatar
                      src={URL.createObjectURL(formData.imagenPrincipal)}
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                      variant="rounded"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formData.imagenPrincipal.name}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ py: 4 }}>
                    <IconPhoto size={48} color="#ccc" />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      No hay imagen seleccionada
                    </Typography>
                  </Box>
                )}
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<IconUpload />}
                  sx={{ mt: 2 }}
                >
                  Subir Imagen
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'principal')}
                  />
                </Button>
              </Card>
            </Grid>
            
            {/* Imágenes Secundarias */}
            <Grid size={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Imágenes Adicionales
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 2 }}>
                  {formData.imagenesSecundarias.map((img, index) => (
                    <Avatar
                      key={index}
                      src={URL.createObjectURL(img)}
                      sx={{ width: 60, height: 60 }}
                      variant="rounded"
                    />
                  ))}
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<IconUpload />}
                >
                  Agregar Imágenes
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'secundarias')}
                  />
                </Button>
              </Card>
            </Grid>
            
            {/* Configuración de Color */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Configuración Visual" />
              </Divider>
            </Grid>
            
            <Grid size={6}>
              <TextField
                fullWidth
                label="Color Principal"
                type="color"
                value={formData.colorPrincipal}
                onChange={(e) => handleInputChange('colorPrincipal', e.target.value)}
                helperText="Color que representa el producto en la tienda"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            backgroundColor: 'success.main',
            '&:hover': { backgroundColor: 'success.dark' }
          }}
        >
          Crear Artículo
        </Button>
          </DialogActions>
        </Box>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalNuevoArticulo;
