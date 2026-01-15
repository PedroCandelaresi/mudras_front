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
  type CrearPuntoMudrasInput,
  type ActualizarPuntoMudrasInput,
} from '@/components/puntos-mudras/graphql/mutations';
import { type PuntoMudras } from '@/components/puntos-mudras/graphql/queries';

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
      const inputBase = {
        nombre: formulario.nombre.trim(),
        direccion: formulario.direccion.trim() || undefined,
        descripcion: formulario.descripcion.trim() || undefined,
        telefono: formulario.telefono.trim() || undefined,
        email: formulario.email.trim() || undefined,
        activo: formulario.activo,
        permiteVentasOnline: formulario.configuracionEspecial.ventasOnline,
        requiereAutorizacion: formulario.configuracionEspecial.requiereAutorizacion,
      };

      if (esEdicion && punto) {
        const inputActualizacion: ActualizarPuntoMudrasInput = {
          id: punto.id,
          ...inputBase,
        };

        await actualizarPunto({
          variables: {
            input: inputActualizacion,
          },
        });
      } else {
        const inputCreacion: CrearPuntoMudrasInput = {
          ...inputBase,
          tipo,
        };

        await crearPunto({
          variables: {
            input: inputCreacion,
          },
        });
      }

      onExito();
      // Disparar evento para actualizar tabs en otras páginas
      window.dispatchEvent(new CustomEvent('puntosVentaActualizados'));
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

  /* ======================== Render ======================== */
  return (
    <Dialog
      open={abierto}
      onClose={handleCerrar}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' }
      }}
    >
      <DialogTitle sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" gap={2}>
          {icono}
          <Typography variant="h6" fontWeight={700}>
            {titulo}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#fff' }}>
        <Stack spacing={3}>
          {/* Información básica */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase' }}>
              Información Básica
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <TextField
              fullWidth
              label="Nombre del punto"
              value={formulario.nombre}
              onChange={handleChange('nombre')}
              error={Boolean(errores.nombre)}
              helperText={errores.nombre}
              placeholder={tipo === 'venta' ? 'ej. Tienda Centro' : 'ej. Depósito Principal'}
              InputProps={{ sx: { borderRadius: 0 } }}
            />
            <TextField
              fullWidth
              label="Dirección"
              value={formulario.direccion}
              onChange={handleChange('direccion')}
              error={Boolean(errores.direccion)}
              helperText={errores.direccion}
              placeholder="Dirección física o 'Virtual' para online"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
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
              InputProps={{ sx: { borderRadius: 0 } }}
            />
          </Box>

          {/* Información de contacto */}
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase' }}>
              Información de Contacto
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formulario.telefono}
              onChange={handleChange('telefono')}
              placeholder="+54 11 1234-5678"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formulario.email}
              onChange={handleChange('email')}
              error={Boolean(errores.email)}
              helperText={errores.email}
              placeholder="contacto@mudras.com"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
          </Box>

          {/* Configuración especial */}
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase' }}>
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
              <Alert severity="error" sx={{ borderRadius: 0 }}>
                {errores.general}
              </Alert>
            </Box>
          )}

          {/* Información importante */}
          <Box>
            <Alert severity="info" sx={{ mt: 1, borderRadius: 0 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Al crear este {tipo === 'venta' ? 'punto de venta' : 'depósito'},
                se generará automáticamente una tabla de inventario asociada para gestionar el stock
                específico de este punto.
              </Typography>
            </Alert>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={handleCerrar}
          startIcon={<IconX size={16} />}
          disabled={guardando}
          sx={{ color: 'text.secondary', fontWeight: 600 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          color={color}
          disableElevation
          startIcon={<IconDeviceFloppy size={16} />}
          disabled={guardando}
          sx={{ borderRadius: 0, fontWeight: 700 }}
        >
          {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalPuntoMudras;
