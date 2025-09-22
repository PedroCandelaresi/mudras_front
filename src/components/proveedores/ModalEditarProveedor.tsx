'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { azul } from '@/ui/colores';
import { useMutation } from '@apollo/client/react';
import { CREAR_PROVEEDOR, ACTUALIZAR_PROVEEDOR } from '@/queries/proveedores';
import { Proveedor, CreateProveedorInput, UpdateProveedorInput } from '@/interfaces/proveedores';

interface ModalEditarProveedorProps {
  open: boolean;
  onClose: () => void;
  proveedor?: Proveedor | null;
  onProveedorGuardado: () => void;
}

interface FormData {
  Codigo: string;
  Nombre: string;
  Contacto: string;
  Direccion: string;
  Localidad: string;
  Provincia: string;
  CP: string;
  Telefono: string;
  Celular: string;
  TipoIva: string;
  CUIT: string;
  Observaciones: string;
  Web: string;
  Mail: string;
  Rubro: string;
  Saldo: string;
  Pais: string;
  Fax: string;
}

const ModalEditarProveedor = ({ open, onClose, proveedor, onProveedorGuardado }: ModalEditarProveedorProps) => {
  const [formData, setFormData] = useState<FormData>({
    Codigo: '',
    Nombre: '',
    Contacto: '',
    Direccion: '',
    Localidad: '',
    Provincia: '',
    CP: '',
    Telefono: '',
    Celular: '',
    TipoIva: '',
    CUIT: '',
    Observaciones: '',
    Web: '',
    Mail: '',
    Rubro: '',
    Saldo: '',
    Pais: '',
    Fax: ''
  });

  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [crearProveedor] = useMutation(CREAR_PROVEEDOR);
  const [actualizarProveedor] = useMutation(ACTUALIZAR_PROVEEDOR);

  const esEdicion = !!proveedor;

  // Cargar datos del proveedor si es edición
  useEffect(() => {
    if (proveedor) {
      setFormData({
        Codigo: proveedor.Codigo?.toString() || '',
        Nombre: proveedor.Nombre || '',
        Contacto: proveedor.Contacto || '',
        Direccion: proveedor.Direccion || '',
        Localidad: proveedor.Localidad || '',
        Provincia: proveedor.Provincia || '',
        CP: proveedor.CP || '',
        Telefono: proveedor.Telefono || '',
        Celular: proveedor.Celular || '',
        TipoIva: proveedor.TipoIva?.toString() || '',
        CUIT: proveedor.CUIT || '',
        Observaciones: proveedor.Observaciones || '',
        Web: proveedor.Web || '',
        Mail: proveedor.Mail || '',
        Rubro: proveedor.Rubro || '',
        Saldo: proveedor.Saldo?.toString() || '',
        Pais: proveedor.Pais || '',
        Fax: proveedor.Fax || ''
      });
    } else {
      // Limpiar formulario para nuevo proveedor
      setFormData({
        Codigo: '',
        Nombre: '',
        Contacto: '',
        Direccion: '',
        Localidad: '',
        Provincia: '',
        CP: '',
        Telefono: '',
        Celular: '',
        TipoIva: '',
        CUIT: '',
        Observaciones: '',
        Web: '',
        Mail: '',
        Rubro: '',
        Saldo: '',
        Pais: '',
        Fax: ''
      });
    }
    setError('');
    setValidationErrors([]);
  }, [proveedor, open]);

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    
    // Convertir a mayúsculas para campos específicos
    if (field === 'Nombre' || field === 'Contacto' || field === 'Direccion' || field === 'Localidad' || field === 'Provincia') {
      value = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const validarFormulario = (): boolean => {
    const errores: string[] = [];

    // Validaciones obligatorias
    if (!formData.Nombre.trim()) {
      errores.push('El nombre del proveedor es obligatorio');
    }

    // Validación de email
    if (formData.Mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Mail)) {
      errores.push('El formato del email no es válido');
    }

    // Validación de CUIT
    if (formData.CUIT && !/^\d{2}-\d{8}-\d{1}$/.test(formData.CUIT)) {
      errores.push('El formato del CUIT debe ser XX-XXXXXXXX-X');
    }

    // Validación de código postal
    if (formData.CP && !/^\d{4}$/.test(formData.CP)) {
      errores.push('El código postal debe tener 4 dígitos');
    }

    // Validación de números
    if (formData.Codigo && isNaN(Number(formData.Codigo))) {
      errores.push('El código debe ser un número válido');
    }

    if (formData.TipoIva && isNaN(Number(formData.TipoIva))) {
      errores.push('El tipo de IVA debe ser un número válido');
    }

    if (formData.Saldo && isNaN(Number(formData.Saldo))) {
      errores.push('El saldo debe ser un número válido');
    }

    setValidationErrors(errores);
    return errores.length === 0;
  };

  const guardarProveedor = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      const proveedorData: CreateProveedorInput | UpdateProveedorInput = {
        Codigo: formData.Codigo ? parseInt(formData.Codigo) : undefined,
        Nombre: formData.Nombre.trim() || undefined,
        Contacto: formData.Contacto.trim() || undefined,
        Direccion: formData.Direccion.trim() || undefined,
        Localidad: formData.Localidad.trim() || undefined,
        Provincia: formData.Provincia.trim() || undefined,
        CP: formData.CP.trim() || undefined,
        Telefono: formData.Telefono.trim() || undefined,
        Celular: formData.Celular.trim() || undefined,
        TipoIva: formData.TipoIva ? parseInt(formData.TipoIva) : undefined,
        CUIT: formData.CUIT.trim() || undefined,
        Observaciones: formData.Observaciones.trim() || undefined,
        Web: formData.Web.trim() || undefined,
        Mail: formData.Mail.trim() || undefined,
        Rubro: formData.Rubro.trim() || undefined,
        Saldo: formData.Saldo ? parseFloat(formData.Saldo) : undefined,
        Pais: formData.Pais.trim() || undefined,
        Fax: formData.Fax.trim() || undefined
      };

      if (esEdicion && proveedor) {
        await actualizarProveedor({
          variables: {
            updateProveedorInput: {
              IdProveedor: proveedor.IdProveedor,
              ...proveedorData
            }
          },
          refetchQueries: ['GetProveedores']
        });
      } else {
        await crearProveedor({
          variables: {
            createProveedorInput: proveedorData
          },
          refetchQueries: ['GetProveedores']
        });
      }

      onProveedorGuardado();
      cerrarModal();
    } catch (error: any) {
      console.error('Error al guardar proveedor:', error);
      setError(error.message || 'Error al guardar el proveedor');
    }
  };

  const cerrarModal = () => {
    setFormData({
      Codigo: '',
      Nombre: '',
      Contacto: '',
      Direccion: '',
      Localidad: '',
      Provincia: '',
      CP: '',
      Telefono: '',
      Celular: '',
      TipoIva: '',
      CUIT: '',
      Observaciones: '',
      Web: '',
      Mail: '',
      Rubro: '',
      Saldo: '',
      Pais: '',
      Fax: ''
    });
    setError('');
    setValidationErrors([]);
    onClose();
  };

  const tiposIva = [
    { value: 1, label: 'Responsable Inscripto' },
    { value: 2, label: 'Monotributo' },
    { value: 3, label: 'Exento' },
    { value: 4, label: 'Consumidor Final' },
    { value: 5, label: 'Responsable No Inscripto' }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={cerrarModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        backgroundColor: azul.headerBg,
        color: azul.headerText,
        borderBottom: '3px solid',
        borderColor: azul.headerBorder
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600} color={azul.headerText}>
            {esEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </Typography>
          <IconButton onClick={cerrarModal} size="small" sx={{ color: azul.headerText }}>
            <IconX size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 3, px: 3, pt: 2, pb: 3 }}>
        {/* Alertas de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Box>
              {validationErrors.map((err, index) => (
                <Typography key={index} variant="body2">
                  • {err}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Información básica */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600} color={azul.primary} mb={2}>
              Información Básica
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Código"
              value={formData.Codigo}
              onChange={handleInputChange('Codigo')}
              type="number"
              helperText="Código único para códigos de barras"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              label="Nombre *"
              value={formData.Nombre}
              onChange={handleInputChange('Nombre')}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contacto"
              value={formData.Contacto}
              onChange={handleInputChange('Contacto')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Rubro"
              value={formData.Rubro}
              onChange={handleInputChange('Rubro')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          {/* Información de contacto */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600} color={azul.primary} mb={2} mt={2}>
              Información de Contacto
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.Telefono}
              onChange={handleInputChange('Telefono')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Celular"
              value={formData.Celular}
              onChange={handleInputChange('Celular')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={formData.Mail}
              onChange={handleInputChange('Mail')}
              type="email"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sitio Web"
              value={formData.Web}
              onChange={handleInputChange('Web')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fax"
              value={formData.Fax}
              onChange={handleInputChange('Fax')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          {/* Información fiscal */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600} color={azul.primary} mb={2} mt={2}>
              Información Fiscal
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CUIT"
              value={formData.CUIT}
              onChange={handleInputChange('CUIT')}
              placeholder="XX-XXXXXXXX-X"
              helperText="Formato: XX-XXXXXXXX-X"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ '&.Mui-focused': { color: azul.primary } }}>Tipo IVA</InputLabel>
              <Select
                value={formData.TipoIva}
                label="Tipo IVA"
                onChange={(e) => setFormData(prev => ({ ...prev, TipoIva: e.target.value }))}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: azul.primary,
                  },
                }}
              >
                {tiposIva.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value.toString()}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Saldo"
              value={formData.Saldo}
              onChange={handleInputChange('Saldo')}
              type="number"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          {/* Ubicación */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600} color={azul.primary} mb={2} mt={2}>
              Ubicación
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección"
              value={formData.Direccion}
              onChange={handleInputChange('Direccion')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Localidad"
              value={formData.Localidad}
              onChange={handleInputChange('Localidad')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Provincia"
              value={formData.Provincia}
              onChange={handleInputChange('Provincia')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Código Postal"
              value={formData.CP}
              onChange={handleInputChange('CP')}
              helperText="4 dígitos"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="País"
              value={formData.Pais}
              onChange={handleInputChange('Pais')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>

          {/* Observaciones */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones"
              value={formData.Observaciones}
              onChange={handleInputChange('Observaciones')}
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: azul.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: azul.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: azul.primary,
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 2,
        gap: 2
      }}>
        <Button 
          onClick={cerrarModal} 
          variant="outlined"
          sx={{
            borderColor: 'grey.400',
            color: 'grey.600',
            '&:hover': {
              borderColor: 'grey.600',
              backgroundColor: 'grey.50'
            }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={guardarProveedor}
          variant="contained"
          sx={{
            backgroundColor: azul.primary,
            '&:hover': {
              backgroundColor: azul.primaryHover
            }
          }}
        >
          {esEdicion ? 'Actualizar' : 'Crear'} Proveedor
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEditarProveedor;
