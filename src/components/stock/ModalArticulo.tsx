'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
  Alert,
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

import { CREAR_ARTICULO, ACTUALIZAR_ARTICULO } from '@/components/articulos/graphql/mutations';
import { Articulo, CrearArticuloDto, ActualizarArticuloDto, EstadoArticulo, UNIDADES_MEDIDA, TIPOS_EMPAQUE } from '@/interfaces/articulo';

interface ModalArticuloProps {
  abierto: boolean;
  articulo?: Articulo | null;
  onCerrar: () => void;
}

export default function ModalArticulo({ abierto, articulo, onCerrar }: ModalArticuloProps) {
  const [formData, setFormData] = useState<CrearArticuloDto>({
    Codigo: '',
    Descripcion: '',
    Marca: '',
    precioVenta: 0,
    PrecioCompra: 0,
    stock: 0,
    stockMinimo: 0,
    unidadMedida: 'unidad',
    cantidadPorEmpaque: 1,
    tipoEmpaque: 'unidad',
    descuentoPorcentaje: 0,
    descuentoMonto: 0,
    EnPromocion: false,
    publicadoEnTienda: false,
    manejaStock: true,
    estado: EstadoArticulo.ACTIVO
  });

  const [imagenesUrls, setImagenesUrls] = useState<string[]>([]);
  const [nuevaImagen, setNuevaImagen] = useState('');
  const [errores, setErrores] = useState<string[]>([]);

  const [crearArticulo, { loading: creando }] = useMutation(CREAR_ARTICULO);
  const [actualizarArticulo, { loading: actualizando }] = useMutation(ACTUALIZAR_ARTICULO);

  useEffect(() => {
    if (articulo) {
      setFormData({
        Codigo: articulo.Codigo,
        Descripcion: articulo.Descripcion,
        Marca: articulo.Marca || '',
        precioVenta: articulo.precioVenta,
        PrecioCompra: articulo.PrecioCompra || 0,
        stock: articulo.stock,
        stockMinimo: articulo.stockMinimo,
        unidadMedida: articulo.unidadMedida,
        cantidadPorEmpaque: articulo.cantidadPorEmpaque,
        tipoEmpaque: articulo.tipoEmpaque,
        descuentoPorcentaje: articulo.descuentoPorcentaje,
        descuentoMonto: articulo.descuentoMonto,
        EnPromocion: articulo.EnPromocion,
        fechaInicioPromocion: articulo.fechaInicioPromocion,
        fechaFinPromocion: articulo.fechaFinPromocion,
        publicadoEnTienda: articulo.publicadoEnTienda,
        descripcionTienda: articulo.descripcionTienda || '',
        codigoBarras: articulo.codigoBarras || '',
        manejaStock: articulo.manejaStock,
        idProveedor: articulo.idProveedor,
        rubroId: articulo.rubroId,
        estado: articulo.estado
      });
      setImagenesUrls(articulo.imagenesUrls || []);
    } else {
      // Reset form for new article
      setFormData({
        Codigo: '',
        Descripcion: '',
        Marca: '',
        precioVenta: 0,
        PrecioCompra: 0,
        stock: 0,
        stockMinimo: 0,
        unidadMedida: 'unidad',
        cantidadPorEmpaque: 1,
        tipoEmpaque: 'unidad',
        descuentoPorcentaje: 0,
        descuentoMonto: 0,
        EnPromocion: false,
        publicadoEnTienda: false,
        manejaStock: true,
        estado: EstadoArticulo.ACTIVO
      });
      setImagenesUrls([]);
    }
    setErrores([]);
  }, [articulo, abierto]);

  const validarFormulario = (): boolean => {
    const errores: string[] = [];

    if (!formData.Codigo?.trim()) {
      errores.push('El código es obligatorio');
    }

    if (!formData.Descripcion?.trim()) {
      errores.push('La descripción es obligatoria');
    }

    if (!(formData.precioVenta ?? 0) || (formData.precioVenta ?? 0) <= 0) {
      errores.push('El precio de venta debe ser mayor a 0');
    }

    if ((formData.cantidadPorEmpaque ?? 0) > 0 && (formData.cantidadPorEmpaque ?? 0) <= 0) {
      errores.push('La cantidad por empaque debe ser mayor a 0');
    }

    // Validar fechas de promoción
    if (formData.fechaInicioPromocion && formData.fechaFinPromocion) {
      const fechaInicio = new Date(formData.fechaInicioPromocion);
      const fechaFin = new Date(formData.fechaFinPromocion);
      if (fechaInicio >= fechaFin) {
        errores.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    setErrores(errores);
    return errores.length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    try {
      const datosEnvio = {
        ...formData,
        imagenesUrls: imagenesUrls.length > 0 ? imagenesUrls : undefined
      };

      if (articulo) {
        await actualizarArticulo({
          variables: {
            actualizarArticuloDto: {
              id: articulo.id,
              ...datosEnvio
            }
          }
        });
      } else {
        await crearArticulo({
          variables: {
            crearArticuloDto: datosEnvio
          }
        });
      }

      onCerrar();
    } catch (error) {
      console.error('Error al guardar artículo:', error);
      setErrores(['Error al guardar el artículo. Intente nuevamente.']);
    }
  };

  const agregarImagen = () => {
    if (nuevaImagen.trim() && !imagenesUrls.includes(nuevaImagen.trim())) {
      setImagenesUrls([...imagenesUrls, nuevaImagen.trim()]);
      setNuevaImagen('');
    }
  };

  const eliminarImagen = (index: number) => {
    setImagenesUrls(imagenesUrls.filter((_, i) => i !== index));
  };

  const calcularPrecioConDescuento = () => {
    let precioFinal = formData.precioVenta ?? 0;
    
    if ((formData.descuentoPorcentaje ?? 0) > 0) {
      precioFinal = precioFinal * (1 - (formData.descuentoPorcentaje ?? 0) / 100);
    }
    
    if ((formData.descuentoMonto ?? 0) > 0) {
      precioFinal = precioFinal - (formData.descuentoMonto ?? 0);
    }
    
    return Math.max(0, precioFinal);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog 
        open={abierto} 
        onClose={onCerrar} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {articulo ? 'Editar Artículo' : 'Nuevo Artículo'}
            </Typography>
            <IconButton onClick={onCerrar}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {errores.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {errores.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Información básica */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Código *"
                value={formData.Codigo}
                onChange={(e) => setFormData({ ...formData, Codigo: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small">
                        <QrCodeIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Descripción *"
                value={formData.Descripcion}
                onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Marca"
                value={formData.Marca}
                onChange={(e) => setFormData({ ...formData, Marca: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Código de Barras"
                value={formData.codigoBarras}
                onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoArticulo })}
                >
                  {Object.values(EstadoArticulo).map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Precios */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Precios
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Precio de Compra"
                type="number"
                value={formData.PrecioCompra}
                onChange={(e) => setFormData({ ...formData, PrecioCompra: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Precio de Venta *"
                type="number"
                value={formData.precioVenta}
                onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Precio Final
                </Typography>
                <Typography variant="h6" color="primary">
                  ${calcularPrecioConDescuento().toFixed(2)}
                </Typography>
              </Box>
            </Grid>

            {/* Unidades y empaque */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Unidades y Empaque
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Unidad de Medida</InputLabel>
                <Select
                  value={formData.unidadMedida}
                  label="Unidad de Medida"
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                >
                  {UNIDADES_MEDIDA.map((unidad) => (
                    <MenuItem key={unidad} value={unidad}>
                      {unidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Cantidad por Empaque"
                type="number"
                value={formData.cantidadPorEmpaque}
                onChange={(e) => setFormData({ ...formData, cantidadPorEmpaque: parseFloat(e.target.value) || 1 })}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Empaque</InputLabel>
                <Select
                  value={formData.tipoEmpaque}
                  label="Tipo de Empaque"
                  onChange={(e) => setFormData({ ...formData, tipoEmpaque: e.target.value })}
                >
                  {TIPOS_EMPAQUE.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Stock */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Control de Stock
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.manejaStock}
                    onChange={(e) => setFormData({ ...formData, manejaStock: e.target.checked })}
                  />
                }
                label="Maneja Stock"
              />
            </Grid>

            {formData.manejaStock && (
              <>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Stock Actual"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Stock Mínimo"
                    type="number"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Estado del Stock
                    </Typography>
                    {(formData.stock ?? 0) <= 0 ? (
                      <Chip label="Sin stock" color="error" />
                    ) : (formData.stock ?? 0) <= (formData.stockMinimo ?? 0) ? (
                      <Chip label="Stock bajo" color="warning" />
                    ) : (
                      <Chip label="Stock OK" color="success" />
                    )}
                  </Box>
                </Grid>
              </>
            )}

            {/* Descuentos y promociones */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Descuentos y Promociones
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Descuento (%)"
                type="number"
                value={formData.descuentoPorcentaje}
                onChange={(e) => setFormData({ ...formData, descuentoPorcentaje: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Descuento ($)"
                type="number"
                value={formData.descuentoMonto}
                onChange={(e) => setFormData({ ...formData, descuentoMonto: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.EnPromocion}
                    onChange={(e) => setFormData({ ...formData, EnPromocion: e.target.checked })}
                  />
                }
                label="En Promoción"
              />
            </Grid>

            {formData.EnPromocion && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Fecha Inicio Promoción"
                    value={formData.fechaInicioPromocion ? new Date(formData.fechaInicioPromocion) : null}
                    onChange={(date) => setFormData({ 
                      ...formData, 
                      fechaInicioPromocion: date?.toISOString() 
                    })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Fecha Fin Promoción"
                    value={formData.fechaFinPromocion ? new Date(formData.fechaFinPromocion) : null}
                    onChange={(date) => setFormData({ 
                      ...formData, 
                      fechaFinPromocion: date?.toISOString() 
                    })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </>
            )}

            {/* Tienda online */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Tienda Online
              </Typography>
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.publicadoEnTienda}
                    onChange={(e) => setFormData({ ...formData, publicadoEnTienda: e.target.checked })}
                  />
                }
                label="Publicar en Tienda Online"
              />
            </Grid>

            {formData.publicadoEnTienda && (
              <>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Descripción para Tienda"
                    multiline
                    rows={3}
                    value={formData.descripcionTienda}
                    onChange={(e) => setFormData({ ...formData, descripcionTienda: e.target.value })}
                  />
                </Grid>

                <Grid size={12}>
                  <Typography variant="body2" gutterBottom>
                    Imágenes del Producto
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="URL de la imagen"
                      value={nuevaImagen}
                      onChange={(e) => setNuevaImagen(e.target.value)}
                    />
                    <Button
                      variant="outlined"
                      onClick={agregarImagen}
                      startIcon={<AddIcon />}
                    >
                      Agregar
                    </Button>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {imagenesUrls.map((url, index) => (
                      <Chip
                        key={index}
                        label={`Imagen ${index + 1}`}
                        onDelete={() => eliminarImagen(index)}
                        deleteIcon={<DeleteIcon />}
                      />
                    ))}
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCerrar}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={creando || actualizando}
          >
            {creando || actualizando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
