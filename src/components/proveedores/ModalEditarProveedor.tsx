'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { alpha, darken, lighten } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { Icon } from '@iconify/react';
import { useMutation, useQuery } from '@apollo/client/react';

import { azul } from '@/ui/colores';
import { CREAR_PROVEEDOR, ACTUALIZAR_PROVEEDOR } from '@/components/proveedores/graphql/mutations';
import { GET_PROVEEDORES, GET_PROVEEDOR } from '@/components/proveedores/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { Proveedor, CreateProveedorInput, UpdateProveedorInput } from '@/interfaces/proveedores';

// ... (previous imports)

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
  Pais: string;
  Fax: string;
  PorcentajeRecargoProveedor: string;
  PorcentajeDescuentoProveedor: string;
  rubrosIds: number[];
}

const VH_MAX = 78;
const HEADER_H = 88;
const FOOTER_H = 96;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

const TIPO_IVA_OPTIONS = [
  { value: '1', label: 'Responsable Inscripto' },
  { value: '2', label: 'Monotributo' },
  { value: '3', label: 'Exento' },
  { value: '4', label: 'Consumidor Final' },
  { value: '5', label: 'Responsable No Inscripto' },
] as const;

const makeColors = (base?: string) => {
  const primary = '#2c3e50'; // Serious dark blue/grey
  const secondary = '#34495e';
  return {
    primary,
    secondary,
    primaryHover: '#1a252f',
    textStrong: '#2c3e50',
    inputBorder: '#bdc3c7',
    inputBorderHover: '#7f8c8d',
    background: '#f8f9fa',
    paper: '#ffffff',
    chipBorder: '#bdc3c7' // Compatibility with RubrosTransferList
  };
};

const createEmptyFormData = (): FormData => ({
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
  Pais: '',
  Fax: '',
  PorcentajeRecargoProveedor: '',
  PorcentajeDescuentoProveedor: '',
  rubrosIds: [],
});

const UPPERCASE_FIELDS = new Set<keyof FormData>(['Nombre', 'Contacto', 'Direccion', 'Localidad', 'Provincia', 'Pais']);

// Helper functions for intersection and difference
function not(a: any[], b: any[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: any[], b: any[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: any[], b: any[]) {
  return [...a, ...not(b, a)];
}

const RubrosTransferList = ({ allRubros, selectedRubrosIds, onChange, colors }: any) => {
  const left = allRubros.filter((r: any) => !selectedRubrosIds.includes(Number(r.id || r.Id)));
  const right = allRubros.filter((r: any) => selectedRubrosIds.includes(Number(r.id || r.Id)));

  const [filterLeft, setFilterLeft] = useState('');
  const [filterRight, setFilterRight] = useState('');

  const handleMoveRight = (id: number) => {
    const newSelected = [...selectedRubrosIds, Number(id)];
    onChange(newSelected);
  };

  const handleMoveLeft = (id: number) => {
    const newSelected = selectedRubrosIds.filter((sid: number) => sid !== Number(id));
    onChange(newSelected);
  };

  const customList = (title: string, items: any[], filterValue: string, setFilterValue: (v: string) => void, onChipClick: (id: number) => void, isAssigned: boolean) => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 250 }}>
      {/* Header */}
      <Box sx={{
        p: 1.5,
        border: `1px solid ${colors.inputBorder}`,
        borderBottom: 0,
        borderRadius: 0, // Sharp corners
        bgcolor: alpha(colors.primary, 0.04),
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Typography variant="subtitle2" fontWeight={700} color={colors.textStrong} align="center">
          {title} ({items.length})
        </Typography>
        <TextField
          size="small"
          placeholder={`Buscar en ${title.toLowerCase()}...`}
          fullWidth
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 0 }, // Sharp corners
            '& .MuiOutlinedInput-input': { py: 0.8, fontSize: '0.875rem' }
          }}
        />
      </Box>

      {/* Content Area */}
      <Box sx={{
        flex: 1,
        border: `1px solid ${colors.inputBorder}`,
        borderRadius: 0, // Sharp corners
        p: 1.5,
        bgcolor: '#fff',
        overflowY: 'auto',
        maxHeight: 250,
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        gap: 0.75,
        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.03)'
      }}>
        {items
          .filter((item: any) => !filterValue || item.nombre.toLowerCase().includes(filterValue.toLowerCase()))
          .map((item: any) => (
            <Chip
              key={item.id}
              label={item.nombre || item.Rubro}
              onClick={() => onChipClick(Number(item.id || item.Id))}
              size="small"
              icon={isAssigned ? <Icon icon="mdi:close-circle" width={16} /> : <Icon icon="mdi:plus-circle" width={16} />}
              sx={{
                fontWeight: 500,
                cursor: 'pointer',
                bgcolor: isAssigned ? alpha(colors.primary, 0.12) : '#f3f4f6',
                color: isAssigned ? colors.primary : '#374151',
                border: `1px solid ${isAssigned ? alpha(colors.primary, 0.25) : '#e5e7eb'}`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: isAssigned ? alpha(colors.primary, 0.22) : '#e5e7eb',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                },
                '& .MuiChip-icon': {
                  color: 'inherit',
                  ml: '4px',
                  mr: '-4px',
                  order: 1 // Icon on the right
                },
                '& .MuiChip-label': {
                  pl: 1.25,
                  pr: 1
                }
              }}
            />
          ))}
        {items.length === 0 && (
          <Box width="100%" display="flex" justifyContent="center" py={4} color="text.disabled">
            <Typography variant="caption" fontStyle="italic">Sin rubros</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} width="100%">
      {customList('Disponibles', left, filterLeft, setFilterLeft, handleMoveRight, false)}

      {/* Visual Separator for Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', color: colors.inputBorder }}>
        <Icon icon="mdi:chevron-double-right" width={24} style={{ opacity: 0.4 }} />
      </Box>

      {customList('Asignados', right, filterRight, setFilterRight, handleMoveLeft, true)}
    </Box>
  );
};

const ModalEditarProveedor = ({ open, onClose, proveedor, onProveedorGuardado }: ModalEditarProveedorProps) => {
  const COLORS = useMemo(() => makeColors(azul.primary), []);
  const [formData, setFormData] = useState<FormData>(() => createEmptyFormData());
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: rubrosData, loading: loadingRubros } = useQuery<{ obtenerRubros: any[] }>(GET_RUBROS);
  const allRubros = useMemo(() => rubrosData?.obtenerRubros || [], [rubrosData]);

  // Fetch fresh provider data when modal is open and we have an ID
  const { data: freshProveedorData, loading: loadingProveedor } = useQuery<{ proveedor: Proveedor }>(GET_PROVEEDOR, {
    variables: { id: proveedor?.IdProveedor ? Number(proveedor.IdProveedor) : 0 },
    skip: !open || !proveedor?.IdProveedor,
    fetchPolicy: 'network-only' // Ensure we get the latest state from backend
  });

  const datosProveedor = useMemo(() => {
    if (!proveedor) return null;
    // Prefer fetched data if available, otherwise fallback to prop
    return freshProveedorData?.proveedor || proveedor;
  }, [proveedor, freshProveedorData]);

  const [crearProveedor] = useMutation(CREAR_PROVEEDOR);
  const [actualizarProveedor] = useMutation(ACTUALIZAR_PROVEEDOR);

  const esEdicion = Boolean(proveedor?.IdProveedor);
  const titulo = esEdicion ? 'Editar proveedor' : 'Nuevo proveedor';

  const headerTipoIvaLabel = useMemo(() => {
    if (!proveedor?.TipoIva) return '';
    const match = TIPO_IVA_OPTIONS.find((tipo) => Number(tipo.value) === proveedor.TipoIva);
    return match?.label ?? '';
  }, [proveedor?.TipoIva]);

  useEffect(() => {
    if (!open) {
      setSaving(false);
      return;
    }

    if (datosProveedor) {
      // Fix: Check both casing possibilities for rubro ID
      const rubrosAsignados = datosProveedor.rubros
        ? datosProveedor.rubros.map((r: any) => Number(r.id || r.Id))
        : [];
      setFormData({
        Codigo: datosProveedor.Codigo?.toString() ?? '',
        Nombre: datosProveedor.Nombre ?? '',
        Contacto: datosProveedor.Contacto ?? '',
        Direccion: datosProveedor.Direccion ?? '',
        Localidad: datosProveedor.Localidad ?? '',
        Provincia: datosProveedor.Provincia ?? '',
        CP: datosProveedor.CP ?? '',
        Telefono: datosProveedor.Telefono ?? '',
        Celular: datosProveedor.Celular ?? '',
        TipoIva: datosProveedor.TipoIva != null ? datosProveedor.TipoIva.toString() : '',
        CUIT: datosProveedor.CUIT ?? '',
        Observaciones: datosProveedor.Observaciones ?? '',
        Web: datosProveedor.Web ?? '',
        Mail: datosProveedor.Mail ?? '',
        Rubro: datosProveedor.Rubro ?? '',
        Pais: datosProveedor.Pais ?? '',
        Fax: datosProveedor.Fax ?? '',
        PorcentajeRecargoProveedor:
          datosProveedor.PorcentajeRecargoProveedor != null ? datosProveedor.PorcentajeRecargoProveedor.toString() : '',
        PorcentajeDescuentoProveedor:
          datosProveedor.PorcentajeDescuentoProveedor != null
            ? datosProveedor.PorcentajeDescuentoProveedor.toString()
            : '',
        rubrosIds: rubrosAsignados,
      });
    } else {
      setFormData(createEmptyFormData());
    }

    setError('');
    setValidationErrors([]);
    setSaving(false);
  }, [open, datosProveedor]);

  const resetFormData = useCallback(() => {
    setFormData(createEmptyFormData());
    setError('');
    setValidationErrors([]);
  }, []);

  const handleClose = useCallback(() => {
    if (saving) return;
    resetFormData();
    onClose();
  }, [saving, resetFormData, onClose]);

  const fieldSx = useMemo(
    () => ({
      '& .MuiOutlinedInput-root': {
        borderRadius: 0, // Square aesthetic
        backgroundColor: '#fff',
        '& fieldset': { borderColor: COLORS.inputBorder },
        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
        '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 2 },
      },
      '& .MuiInputLabel-root': { color: '#546e7a' },
      '& .MuiInputLabel-root.Mui-focused': {
        color: COLORS.primary,
        fontWeight: 600
      },
    }),
    [COLORS],
  );

  const selectSx = useMemo(
    () => ({
      borderRadius: 0, // Square aesthetic
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.inputBorder },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.inputBorderHover },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 2 },
    }),
    [COLORS],
  );

  const handleInputChange = useCallback(
    (field: keyof FormData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let { value } = event.target;
      if (UPPERCASE_FIELDS.has(field)) {
        value = value.toUpperCase();
      }

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (error) setError('');
      if (validationErrors.length > 0) setValidationErrors([]);
    },
    [error, validationErrors],
  );

  const handleTipoIvaChange = useCallback(
    (event: SelectChangeEvent) => {
      setFormData((prev) => ({
        ...prev,
        TipoIva: event.target.value,
      }));

      if (error) setError('');
      if (validationErrors.length > 0) setValidationErrors([]);
    },
    [error, validationErrors],
  );

  const handleCuitChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 11 digits
    if (value.length > 11) value = value.slice(0, 11);

    // Format as XX-XXXXXXXX-X
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}-${value.slice(2)}`;
    }
    if (value.length > 10) {
      formatted = `${formatted.slice(0, 13)}-${value.slice(10)}`;
    }

    setFormData((prev) => ({
      ...prev,
      CUIT: formatted,
    }));

    if (error) setError('');
    if (validationErrors.length > 0) setValidationErrors([]);
  }, [error, validationErrors]);

  const validarFormulario = useCallback(() => {
    const errores: string[] = [];

    if (!formData.Nombre.trim()) {
      errores.push('El nombre del proveedor es obligatorio.');
    }

    if (formData.Mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Mail)) {
      errores.push('El formato del email no es válido.');
    }

    if (formData.CUIT && !/^\d{2}-\d{8}-\d{1}$/.test(formData.CUIT)) {
      errores.push('El formato del CUIT debe ser XX-XXXXXXXX-X.');
    }

    if (formData.CP && !/^\d{4}$/.test(formData.CP)) {
      errores.push('El código postal debe tener 4 dígitos.');
    }

    // Codigo is now a string, so strict number validation is removed.
    // However, we can still check if it's not empty if that was required, 
    // but the original code only checked isNaN if it existed.
    // if (formData.Codigo && ...) { ... }  <-- REMOVED

    if (formData.TipoIva && Number.isNaN(Number(formData.TipoIva))) {
      errores.push('El tipo de IVA debe ser un número válido.');
    }

    if (formData.PorcentajeRecargoProveedor && Number.isNaN(Number(formData.PorcentajeRecargoProveedor))) {
      errores.push('El recargo debe ser un número válido.');
    }

    if (formData.PorcentajeDescuentoProveedor && Number.isNaN(Number(formData.PorcentajeDescuentoProveedor))) {
      errores.push('El descuento debe ser un número válido.');
    }

    setValidationErrors(errores);
    return errores.length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validarFormulario()) {
      return;
    }

    const parsedProveedorId =
      esEdicion && proveedor?.IdProveedor != null ? Number(proveedor.IdProveedor) : undefined;

    if (esEdicion && (parsedProveedorId == null || Number.isNaN(parsedProveedorId))) {
      setError('No se pudo determinar el identificador del proveedor.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const proveedorData: CreateProveedorInput | UpdateProveedorInput = {
        Codigo: formData.Codigo ? formData.Codigo.trim() : undefined,
        Nombre: formData.Nombre.trim() || undefined,
        Contacto: formData.Contacto.trim() || undefined,
        Direccion: formData.Direccion.trim() || undefined,
        Localidad: formData.Localidad.trim() || undefined,
        Provincia: formData.Provincia.trim() || undefined,
        CP: formData.CP.trim() || undefined,
        Telefono: formData.Telefono.trim() || undefined,
        Celular: formData.Celular.trim() || undefined,
        TipoIva: formData.TipoIva ? parseInt(formData.TipoIva, 10) : undefined,
        CUIT: formData.CUIT.trim() || undefined,
        Observaciones: formData.Observaciones.trim() || undefined,
        Web: formData.Web.trim() || undefined,
        Mail: formData.Mail.trim() || undefined,
        Rubro: formData.Rubro.trim() || undefined,
        Pais: formData.Pais.trim() || undefined,
        Fax: formData.Fax.trim() || undefined,
        PorcentajeRecargoProveedor:
          formData.PorcentajeRecargoProveedor !== '' ? parseFloat(formData.PorcentajeRecargoProveedor) : undefined,
        PorcentajeDescuentoProveedor:
          formData.PorcentajeDescuentoProveedor !== '' ? parseFloat(formData.PorcentajeDescuentoProveedor) : undefined,
        rubrosIds: formData.rubrosIds,
      };

      if (esEdicion && proveedor && parsedProveedorId != null) {
        await actualizarProveedor({
          variables: {
            updateProveedorInput: {
              IdProveedor: parsedProveedorId,
              ...proveedorData,
            },
          },
          refetchQueries: [{ query: GET_PROVEEDORES }],
        });
      } else {
        await crearProveedor({
          variables: {
            createProveedorInput: proveedorData,
          },
          refetchQueries: [{ query: GET_PROVEEDORES }],
        });
      }

      onProveedorGuardado();
      resetFormData();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Ocurrió un error al guardar el proveedor.');
    } finally {
      setSaving(false);
    }
  }, [
    validarFormulario,
    formData,
    esEdicion,
    proveedor,
    actualizarProveedor,
    crearProveedor,
    onProveedorGuardado,
    resetFormData,
    onClose,
  ]);

  const botonHabilitado = formData.Nombre.trim().length > 0 && !saving;
  const tipoIvaHelperLabel = useMemo(
    () => {
      if (!formData.TipoIva) return '';
      const option = TIPO_IVA_OPTIONS.find((tipo) => tipo.value === formData.TipoIva);
      return option?.label ?? '';
    },
    [formData.TipoIva],
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 4,
        sx: {
          borderRadius: 0, // Zero border radius for strict square aesthetic
          bgcolor: '#ffffff',
          maxHeight: `${VH_MAX}vh`,
        },
        square: true, // Force square borders on the Paper component
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: `${VH_MAX}vh` }}>
        {/* Header - Serious & Modern */}
        <Box sx={{
          bgcolor: COLORS.primary,
          color: '#ffffff',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `4px solid ${COLORS.secondary}`,
          borderRadius: 0, // Explicitly enforce square corners
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon icon={esEdicion ? 'mdi:pencil' : 'mdi:plus'} width={24} height={24} />
            <Box>
              <Typography variant="h6" fontWeight={600} letterSpacing={0.5}>
                {titulo.toUpperCase()}
              </Typography>
              {esEdicion && proveedor?.Nombre && (
                <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
                  {proveedor.Nombre}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <Icon icon="mdi:close" width={24} />
          </IconButton>
        </Box>

        <DialogContent
          dividers
          sx={{
            p: 4,
            bgcolor: '#f8f9fa'
          }}
        >
          <Box p={3} bgcolor="#f8f9fa">
            {/* General Data Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Datos Generales
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e0e0e0' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: '25%' }}>
                    <TextField
                      label="Código"
                      value={formData.Codigo}
                      onChange={handleInputChange('Codigo')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                      InputProps={{ readOnly: esEdicion }}
                    // Removed type="number" or input props restrictions if any were present implicitly
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(75% - 16px)' }}>
                    <TextField
                      label="Razón Social / Nombre"
                      value={formData.Nombre}
                      onChange={handleInputChange('Nombre')}
                      fullWidth
                      required
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: '50%' }}>
                    <TextField
                      label="Persona de Contacto"
                      value={formData.Contacto}
                      onChange={handleInputChange('Contacto')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
            {/* Contact Info Section */}
            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Información de Contacto
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e0e0e0' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Teléfono"
                      value={formData.Telefono}
                      onChange={handleInputChange('Telefono')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Celular"
                      value={formData.Celular}
                      onChange={handleInputChange('Celular')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Email"
                      value={formData.Mail}
                      onChange={handleInputChange('Mail')}
                      type="email"
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Sitio Web"
                      value={formData.Web}
                      onChange={handleInputChange('Web')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Fax"
                      value={formData.Fax}
                      onChange={handleInputChange('Fax')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Location Section */}
            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Ubicación
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e0e0e0' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width="100%">
                    <TextField
                      label="Dirección"
                      value={formData.Direccion}
                      onChange={handleInputChange('Direccion')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33.33% - 11px)' }}>
                    <TextField
                      label="Localidad"
                      value={formData.Localidad}
                      onChange={handleInputChange('Localidad')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33.33% - 11px)' }}>
                    <TextField
                      label="Provincia"
                      value={formData.Provincia}
                      onChange={handleInputChange('Provincia')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33.33% - 11px)' }}>
                    <TextField
                      label="Código Postal"
                      value={formData.CP}
                      onChange={handleInputChange('CP')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="País"
                      value={formData.Pais}
                      onChange={handleInputChange('Pais')}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Fiscal Data Section */}
            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Datos Fiscales
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e0e0e0' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="CUIT"
                      value={formData.CUIT}
                      onChange={handleCuitChange}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                      placeholder="XX-XXXXXXXX-X"
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <FormControl fullWidth disabled={saving}>
                      <InputLabel sx={{ color: '#546e7a', '&.Mui-focused': { color: COLORS.primary } }}>Tipo IVA</InputLabel>
                      <Select
                        value={formData.TipoIva}
                        onChange={handleTipoIvaChange}
                        label="Tipo IVA"
                        sx={selectSx}
                      >
                        {TIPO_IVA_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Commercial & Rubros Section */}
            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight={700} color={COLORS.secondary} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Comercial y Rubros
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e0e0e0' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Recargo Proveedor (%)"
                      value={formData.PorcentajeRecargoProveedor}
                      onChange={handleInputChange('PorcentajeRecargoProveedor')}
                      type="number"
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Descuento Proveedor (%)"
                      value={formData.PorcentajeDescuentoProveedor}
                      onChange={handleInputChange('PorcentajeDescuentoProveedor')}
                      type="number"
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width="100%">
                    <TextField
                      label="Observaciones"
                      value={formData.Observaciones}
                      onChange={handleInputChange('Observaciones')}
                      multiline
                      rows={3}
                      fullWidth
                      disabled={saving}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box width="100%">
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#546e7a', fontWeight: 600 }}>
                      Rubros Asociados
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <RubrosTransferList
                      allRubros={allRubros}
                      selectedRubrosIds={formData.rubrosIds || []}
                      onChange={(newIds: any) => {
                        setFormData((prev: any) => ({ ...prev, rubrosIds: newIds }));
                      }}
                      colors={COLORS}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Error Messages */}
            {(error || validationErrors.length > 0) && (
              <Box mt={2}>
                <Paper sx={{ p: 2, bgcolor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: 1 }}>
                  {error && (
                    <Typography color="error" variant="body2" fontWeight={600}>{error}</Typography>
                  )}
                  {validationErrors.map((err, i) => (
                    <Typography key={i} color="error" variant="body2">• {err}</Typography>
                  ))}
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Footer - Generic & Modern */}
        {/* Footer - Generic & Modern */}
        <DialogActions sx={{ p: 2, bgcolor: '#f1f2f6', borderTop: '1px solid #e0e0e0', gap: 2, borderRadius: 0 }}>
          <Button
            onClick={handleClose}
            disabled={saving}
            variant="outlined"
            sx={{
              flex: 1, // Equal width
              color: '#546e7a',
              borderColor: '#b0bec5',
              fontWeight: 600,
              borderRadius: 0, // Sharp corners
              textTransform: 'none',
              py: 1,
              '&:hover': {
                borderColor: '#78909c',
                bgcolor: '#eceff1'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!botonHabilitado || saving}
            variant="contained"
            disableElevation
            sx={{
              flex: 1, // Equal width
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: COLORS.primaryHover },
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 0 // Sharp corners
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Datos'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ModalEditarProveedor;
