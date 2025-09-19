'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import {
  IconShoppingBag,
  IconBuilding,
  IconX,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import {
  CREAR_PUNTO_MUDRAS,
  ACTUALIZAR_PUNTO_MUDRAS,
  PuntoMudras,
  CrearPuntoMudrasInput,
  ActualizarPuntoMudrasInput,
} from '../../queries/puntos-mudras';

export enum TipoPuntoMudras {
  VENTA = 'venta',
  DEPOSITO = 'deposito'
}

interface ModalPuntoMudrasProps {
  abierto: boolean;
  onCerrar: () => void;
  onExito: () => void;
  punto?: PuntoMudras;
  tipo: 'venta' | 'deposito';
}

interface FormularioPunto {
  nombre: string;
  direccion: string;
  descripcion: string;
  telefono: string;
  email: string;
  activo: boolean;
  configuracionEspecial: {
    ventasOnline: boolean;
    requiereAutorizacion: boolean;
  };
}

interface ErroresFormulario {
  nombre?: string;
  direccion?: string;
  descripcion?: string;
  email?: string;
  general?: string;
}

const formularioInicial: FormularioPunto = {
  nombre: '',
  direccion: '',
  descripcion: '',
  telefono: '',
  email: '',
  activo: true,
  configuracionEspecial: {
    ventasOnline: false,
    requiereAutorizacion: false,
  },
};

export const ModalPuntoMudras = ({
  abierto,
  onCerrar,
  onExito,
  punto,
  tipo,
}: ModalPuntoMudrasProps) => {
  const [formulario, setFormulario] = useState<FormularioPunto>(formularioInicial);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [guardando, setGuardando] = useState(false);

  const [crearPunto] = useMutation(CREAR_PUNTO_MUDRAS);
  const [actualizarPunto] = useMutation(ACTUALIZAR_PUNTO_MUDRAS);

  const esEdicion = Boolean(punto);
  const titulo = esEdicion 
    ? `Editar ${tipo === 'venta' ? 'Punto de Venta' : 'Depósito'}`
    : `Crear ${tipo === 'venta' ? 'Punto de Venta' : 'Depósito'}`;
  
  const color = tipo === 'venta' ? 'primary' : 'secondary';
  const icono = tipo === 'venta' 
    ? <IconShoppingBag size={24} />
    : <IconBuilding size={24} />;

  useEffect(() => {
    if (punto) {
      setFormulario({
        nombre: punto.nombre,
        direccion: punto.direccion || '',
        descripcion: punto.descripcion || '',
        telefono: punto.telefono || '',
        email: punto.email || '',
        activo: punto.activo,
        configuracionEspecial: {
          ventasOnline: punto.permiteVentasOnline || false,
          requiereAutorizacion: punto.requiereAutorizacion || false,
        },
      });
    } else {
      setFormulario(formularioInicial);
    }
    setErrores({});
  }, [punto, abierto]);

  const handleChange = (campo: keyof FormularioPunto) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement;
    const valor = target.type === 'checkbox' 
      ? target.checked
      : target.value;

    setFormulario(prev => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpiar error del campo
    if (errores[campo as keyof ErroresFormulario]) {
      setErrores(prev => ({
        ...prev,
        [campo]: undefined,
      }));
    }
  };

  const handleConfiguracionChange = (campo: keyof FormularioPunto['configuracionEspecial']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormulario(prev => ({
      ...prev,
      configuracionEspecial: {
        ...prev.configuracionEspecial,
        [campo]: event.target.checked,
      },
    }));
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria';
    }

    if (formulario.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      nuevosErrores.email = 'El email no tiene un formato válido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);
    setErrores({});

    try {
      const input = {
        nombre: formulario.nombre.trim(),
        tipo: tipo === 'venta' ? 'VENTA' : 'DEPOSITO',
        direccion: formulario.direccion.trim(),
        descripcion: formulario.descripcion.trim() || null,
        telefono: formulario.telefono.trim() || null,
        email: formulario.email.trim() || null,
        activo: formulario.activo,
        permiteVentasOnline: formulario.configuracionEspecial.ventasOnline,
        requiereAutorizacion: formulario.configuracionEspecial.requiereAutorizacion,
      };

      if (esEdicion && punto) {
        await actualizarPunto({
          variables: {
            id: punto.id,
            input: {
              id: punto.id,
              ...input,
            } as ActualizarPuntoMudrasInput,
          },
        });
      } else {
        await crearPunto({
          variables: {
            input: input as CrearPuntoMudrasInput,
          },
        });
      }

      onExito();
      handleCerrar();
    } catch (error: any) {
      console.error('Error al guardar punto:', error);
      setErrores({
        general: error.message || 'Error al guardar el punto. Intenta nuevamente.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrar = () => {
    if (!guardando) {
      setFormulario(formularioInicial);
      setErrores({});
      onCerrar();
    }
  };

  return (
    <Dialog
      open={abierto}
      onClose={handleCerrar}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icono}
          </Box>
          <Typography variant="h6" component="div">
            {titulo}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Información básica */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Información Básica
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Nombre del punto"
                value={formulario.nombre}
                onChange={handleChange('nombre')}
                error={Boolean(errores.nombre)}
                helperText={errores.nombre}
                placeholder={tipo === 'venta' ? 'ej. Tienda Centro' : 'ej. Depósito Principal'}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Dirección"
                value={formulario.direccion}
                onChange={handleChange('direccion')}
                error={Boolean(errores.direccion)}
                helperText={errores.direccion}
                placeholder="Dirección física o 'Virtual' para online"
              />
            </Box>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Descripción"
              value={formulario.descripcion}
              onChange={handleChange('descripcion')}
              error={Boolean(errores.descripcion)}
              helperText={errores.descripcion}
              multiline
              rows={3}
              placeholder="Describe las características y propósito de este punto"
            />
          </Box>

          {/* Información de contacto */}
          <Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Información de Contacto
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formulario.telefono}
                onChange={handleChange('telefono')}
                placeholder="+54 11 1234-5678"
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formulario.email}
                onChange={handleChange('email')}
                error={Boolean(errores.email)}
                helperText={errores.email}
                placeholder="contacto@mudras.com"
              />
            </Box>
          </Box>

          {/* Configuración especial */}
          <Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Configuración Especial
            </Typography>
          </Box>

          <Box>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formulario.activo}
                    onChange={handleChange('activo')}
                    color={color}
                  />
                }
                label="Punto activo"
              />

              {tipo === 'venta' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formulario.configuracionEspecial.ventasOnline}
                      onChange={handleConfiguracionChange('ventasOnline')}
                      color={color}
                    />
                  }
                  label="Habilitar ventas online"
                />
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={formulario.configuracionEspecial.requiereAutorizacion}
                    onChange={handleConfiguracionChange('requiereAutorizacion')}
                    color={color}
                  />
                }
                label="Requiere autorización para movimientos de stock"
              />
            </Stack>
          </Box>

          {/* Error general */}
          {errores.general && (
            <Box>
              <Alert severity="error">
                {errores.general}
              </Alert>
            </Box>
          )}

          {/* Información importante */}
          <Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Al crear este {tipo === 'venta' ? 'punto de venta' : 'depósito'}, 
                se generará automáticamente una tabla de inventario asociada para gestionar el stock 
                específico de este punto.
              </Typography>
            </Alert>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleCerrar}
          variant="outlined"
          startIcon={<IconX size={16} />}
          disabled={guardando}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          color={color}
          startIcon={<IconDeviceFloppy size={16} />}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalPuntoMudras;
