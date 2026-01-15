'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Chip,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { Icon } from '@iconify/react';
import { useMutation, useQuery } from '@apollo/client/react';

import { CREAR_PROVEEDOR, ACTUALIZAR_PROVEEDOR } from '@/components/proveedores/graphql/mutations';
import { GET_PROVEEDORES, GET_PROVEEDOR } from '@/components/proveedores/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
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
  Pais: string;
  Fax: string;
  PorcentajeRecargoProveedor: string;
  PorcentajeDescuentoProveedor: string;
  rubrosIds: number[];
}

const VH_MAX = 85;

const TIPO_IVA_OPTIONS = [
  { value: '1', label: 'Responsable Inscripto' },
  { value: '2', label: 'Monotributo' },
  { value: '3', label: 'Exento' },
  { value: '4', label: 'Consumidor Final' },
  { value: '5', label: 'Responsable No Inscripto' },
] as const;

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

const RubrosTransferList = ({ allRubros, selectedRubrosIds, onChange }: any) => {
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
        border: '1px solid #e0e0e0',
        borderBottom: 0,
        bgcolor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary" align="center">
          {title} ({items.length})
        </Typography>
        <TextField
          size="small"
          placeholder={`Buscar...`}
          fullWidth
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 0 },
            '& .MuiOutlinedInput-input': { py: 0.8, fontSize: '0.875rem' }
          }}
        />
      </Box>

      {/* Content Area */}
      <Box sx={{
        flex: 1,
        border: '1px solid #e0e0e0',
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
          .filter((item: any) => !filterValue || (item.nombre || item.Rubro || '').toLowerCase().includes(filterValue.toLowerCase()))
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
                bgcolor: isAssigned ? '#efebe9' : '#f3f4f6', // Light brown for assigned
                color: isAssigned ? '#5d4037' : '#374151',
                border: `1px solid ${isAssigned ? '#d7ccc8' : '#e5e7eb'}`,
                borderRadius: 0,
                '&:hover': {
                  bgcolor: isAssigned ? '#d7ccc8' : '#e5e7eb',
                },
                '& .MuiChip-icon': {
                  color: 'inherit',
                  ml: '4px',
                  mr: '-4px',
                  order: 1
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
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} width="100%">
      {customList('Disponibles', left, filterLeft, setFilterLeft, handleMoveRight, false)}

      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', color: '#bdbdbd' }}>
        <Icon icon="mdi:chevron-double-right" width={24} />
      </Box>

      {customList('Asignados', right, filterRight, setFilterRight, handleMoveLeft, true)}
    </Box>
  );
};

const ModalEditarProveedor = ({ open, onClose, proveedor, onProveedorGuardado }: ModalEditarProveedorProps) => {
  const [formData, setFormData] = useState<FormData>(() => createEmptyFormData());
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: rubrosData } = useQuery<{ obtenerRubros: any[] }>(GET_RUBROS);
  const allRubros = useMemo(() => rubrosData?.obtenerRubros || [], [rubrosData]);

  // Fetch fresh provider data when modal is open and we have an ID
  const { data: freshProveedorData } = useQuery<{ proveedor: Proveedor }>(GET_PROVEEDOR, {
    variables: { id: proveedor?.IdProveedor ? Number(proveedor.IdProveedor) : 0 },
    skip: !open || !proveedor?.IdProveedor,
    fetchPolicy: 'network-only'
  });

  const datosProveedor = useMemo(() => {
    if (!proveedor) return null;
    return freshProveedorData?.proveedor || proveedor;
  }, [proveedor, freshProveedorData]);

  const [crearProveedor] = useMutation(CREAR_PROVEEDOR);
  const [actualizarProveedor] = useMutation(ACTUALIZAR_PROVEEDOR);

  const esEdicion = Boolean(proveedor?.IdProveedor);
  const titulo = esEdicion ? 'Editar proveedor' : 'Nuevo proveedor';

  useEffect(() => {
    if (!open) {
      setSaving(false);
      return;
    }

    if (datosProveedor) {
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

  const handleCuitChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 11) value = value.slice(0, 11);

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

  const fieldProps = {
    size: 'medium' as const,
    fullWidth: true,
    disabled: saving,
    InputProps: { sx: { borderRadius: 0 } },
    sx: { '& .MuiOutlinedInput-root': { borderRadius: 0 } }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
          maxHeight: `${VH_MAX}vh`,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: `${VH_MAX}vh` }}>
        {/* Header */}
        <Box sx={{
          bgcolor: '#f5f5f5',
          color: '#000',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0',
          borderRadius: 0,
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon icon={esEdicion ? 'mdi:pencil' : 'mdi:plus'} width={24} height={24} color="#546e7a" />
            <Box>
              <Typography variant="h6" fontWeight={700} letterSpacing={0}>
                {titulo}
              </Typography>
              {esEdicion && proveedor?.Nombre && (
                <Typography variant="caption" color="text.secondary">
                  {proveedor.Nombre}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
            <Icon icon="mdi:close" width={24} />
          </IconButton>
        </Box>

        <DialogContent
          dividers
          sx={{
            p: 3,
            bgcolor: '#ffffff',
            borderTop: 0,
            borderBottom: 0,
          }}
        >
          <Box display="flex" flexDirection="column" gap={3}>

            {/* General Data */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Datos Generales
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: '#f8f9fa' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: '20%' }}>
                    <TextField
                      label="Código"
                      value={formData.Codigo}
                      onChange={handleInputChange('Codigo')}
                      {...fieldProps}
                      InputProps={{ ...fieldProps.InputProps, readOnly: esEdicion }}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(45% - 8px)' }}>
                    <TextField
                      label="Razón Social / Nombre"
                      value={formData.Nombre}
                      onChange={handleInputChange('Nombre')}
                      required
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(35% - 8px)' }}>
                    <TextField
                      label="Persona de Contacto"
                      value={formData.Contacto}
                      onChange={handleInputChange('Contacto')}
                      {...fieldProps}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Contact Info */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Información de Contacto
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: '#f8f9fa' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Teléfono"
                      value={formData.Telefono}
                      onChange={handleInputChange('Telefono')}
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Celular"
                      value={formData.Celular}
                      onChange={handleInputChange('Celular')}
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Email"
                      value={formData.Mail}
                      onChange={handleInputChange('Mail')}
                      type="email"
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Sitio Web"
                      value={formData.Web}
                      onChange={handleInputChange('Web')}
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Fax"
                      value={formData.Fax}
                      onChange={handleInputChange('Fax')}
                      {...fieldProps}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Location */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Ubicación
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: '#f8f9fa' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width="100%">
                    <TextField
                      label="Dirección"
                      value={formData.Direccion}
                      onChange={handleInputChange('Direccion')}
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33.33% - 11px)' }}>
                    <TextField
                      label="Localidad"
                      value={formData.Localidad}
                      onChange={handleInputChange('Localidad')}
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33.33% - 11px)' }}>
                    <TextField
                      label="Provincia"
                      value={formData.Provincia}
                      onChange={handleInputChange('Provincia')}
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(33.33% - 11px)' }}>
                    <TextField
                      label="Código Postal"
                      value={formData.CP}
                      onChange={handleInputChange('CP')}
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="País"
                      value={formData.Pais}
                      onChange={handleInputChange('Pais')}
                      {...fieldProps}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Fiscal Data */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Datos Fiscales
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: '#f8f9fa' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="CUIT"
                      value={formData.CUIT}
                      onChange={handleCuitChange}
                      placeholder="XX-XXXXXXXX-X"
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      select
                      label="Tipo IVA"
                      value={formData.TipoIva}
                      onChange={(e) => handleInputChange('TipoIva')(e as ChangeEvent<HTMLInputElement>)}
                      SelectProps={{ native: true }}
                      {...fieldProps}
                    >
                      <option value=""></option>
                      {TIPO_IVA_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Commercial */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Datos Comerciales
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, borderColor: '#e0e0e0', bgcolor: '#f8f9fa' }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Recargo Proveedor (%)"
                      value={formData.PorcentajeRecargoProveedor}
                      onChange={handleInputChange('PorcentajeRecargoProveedor')}
                      type="number"
                      {...fieldProps}
                    />
                  </Box>
                  <Box width={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                    <TextField
                      label="Descuento Proveedor (%)"
                      value={formData.PorcentajeDescuentoProveedor}
                      onChange={handleInputChange('PorcentajeDescuentoProveedor')}
                      type="number"
                      {...fieldProps}
                    />
                  </Box>
                  <Box width="100%">
                    <TextField
                      label="Observaciones"
                      value={formData.Observaciones}
                      onChange={handleInputChange('Observaciones')}
                      multiline
                      minRows={2}
                      {...fieldProps}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Rubros Selection */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Asignación de Rubros
              </Typography>
              <RubrosTransferList
                allRubros={allRubros}
                selectedRubrosIds={formData.rubrosIds}
                onChange={(newIds: number[]) => setFormData(prev => ({ ...prev, rubrosIds: newIds }))}
              />
            </Box>

            {/* Errors */}
            {validationErrors.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#ffebee', borderColor: '#ef9a9a', borderRadius: 0 }}>
                <Typography variant="subtitle2" color="#c62828" gutterBottom>
                  Por favor, corregí los siguientes errores:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {validationErrors.map((err, i) => (
                    <Typography component="li" key={i} variant="caption" color="#c62828">
                      {err}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            )}
            {error && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#ffebee', borderColor: '#ef9a9a', borderRadius: 0 }}>
                <Typography variant="body2" color="#c62828">
                  {error}
                </Typography>
              </Paper>
            )}

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', gap: 2, borderRadius: 0 }}>
          <Button
            onClick={handleClose}
            disabled={saving}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 0,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: '#5d4037', // Brown
              '&:hover': { bgcolor: '#4e342e' },
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 0
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ModalEditarProveedor;
