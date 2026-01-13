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
  Grid,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { alpha, darken } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { Icon } from '@iconify/react';
import { useMutation, useQuery } from '@apollo/client/react';

import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';
import { azul } from '@/ui/colores';
import { CREAR_PROVEEDOR, ACTUALIZAR_PROVEEDOR } from '@/components/proveedores/graphql/mutations';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
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
  const primary = base || azul.primary || '#1565c0';
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.35),
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
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
  const [checked, setChecked] = useState<number[]>([]);

  const left = allRubros.filter((r: any) => !selectedRubrosIds.includes(Number(r.id)));
  const right = allRubros.filter((r: any) => selectedRubrosIds.includes(Number(r.id)));

  const leftChecked = intersection(checked, left.map((r: any) => r.id));
  const rightChecked = intersection(checked, right.map((r: any) => r.id));

  const [filterLeft, setFilterLeft] = useState('');

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    const newSelected = right.map((r: any) => Number(r.id)).concat(leftChecked);
    onChange(newSelected);
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    const rightCheckedIds = rightChecked;
    const newSelected = right.filter((r: any) => !rightCheckedIds.includes(r.id)).map((r: any) => Number(r.id));
    onChange(newSelected);
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: React.ReactNode, items: readonly any[], filterValue: string, setFilterValue: (v: string) => void) => (
    <Box sx={{ border: `1px solid ${colors.inputBorder}`, borderRadius: 2, overflow: 'hidden', height: 300, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1, borderBottom: `1px solid ${colors.inputBorder}`, bgcolor: alpha(colors.primary, 0.05) }}>
        <Typography variant="subtitle2" align="center" fontWeight={600} gutterBottom>{title}</Typography>
        <TextField
          size="small"
          placeholder="Filtrar..."
          fullWidth
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { bgcolor: 'white' }
          }}
        />
      </Box>
      <List
        dense
        component="div"
        role="list"
        sx={{ flex: 1, overflow: 'auto' }}
      >
        {items.filter((item: any) => !filterValue || item.nombre.toLowerCase().includes(filterValue.toLowerCase())).map((value: any) => {
          const labelId = `transfer-list-all-item-${value.id}-label`;

          return (
            <ListItem
              key={value.id}
              role="listitem"
              onClick={handleToggle(Number(value.id))}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(Number(value.id)) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.nombre} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Box>
  );

  return (
    <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
      <Box flex={1}>{customList('Disponibles', left, filterLeft, setFilterLeft)}</Box>
      <Box display="flex" flexDirection="column" gap={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleCheckedRight}
          disabled={leftChecked.length === 0}
          aria-label="move selected right"
        >
          &gt;
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleCheckedLeft}
          disabled={rightChecked.length === 0}
          aria-label="move selected left"
        >
          &lt;
        </Button>
      </Box>
      <Box flex={1}>{customList('Asignados', right, '', () => { })}</Box>
    </Box>
  );
}

const ModalEditarProveedor = ({ open, onClose, proveedor, onProveedorGuardado }: ModalEditarProveedorProps) => {
  const COLORS = useMemo(() => makeColors(azul.primary), []);
  const [formData, setFormData] = useState<FormData>(() => createEmptyFormData());
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: rubrosData, loading: loadingRubros } = useQuery<{ obtenerRubros: any[] }>(GET_RUBROS);
  const allRubros = useMemo(() => rubrosData?.obtenerRubros || [], [rubrosData]);

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

    if (proveedor) {
      const rubrosAsignados = proveedor.rubros ? proveedor.rubros.map((r: any) => Number(r.Id)) : [];
      setFormData({
        Codigo: proveedor.Codigo?.toString() ?? '',
        Nombre: proveedor.Nombre ?? '',
        Contacto: proveedor.Contacto ?? '',
        Direccion: proveedor.Direccion ?? '',
        Localidad: proveedor.Localidad ?? '',
        Provincia: proveedor.Provincia ?? '',
        CP: proveedor.CP ?? '',
        Telefono: proveedor.Telefono ?? '',
        Celular: proveedor.Celular ?? '',
        TipoIva: proveedor.TipoIva != null ? proveedor.TipoIva.toString() : '',
        CUIT: proveedor.CUIT ?? '',
        Observaciones: proveedor.Observaciones ?? '',
        Web: proveedor.Web ?? '',
        Mail: proveedor.Mail ?? '',
        Rubro: proveedor.Rubro ?? '',
        Pais: proveedor.Pais ?? '',
        Fax: proveedor.Fax ?? '',
        PorcentajeRecargoProveedor:
          proveedor.PorcentajeRecargoProveedor != null ? proveedor.PorcentajeRecargoProveedor.toString() : '',
        PorcentajeDescuentoProveedor:
          proveedor.PorcentajeDescuentoProveedor != null
            ? proveedor.PorcentajeDescuentoProveedor.toString()
            : '',
        rubrosIds: rubrosAsignados,
      });
    } else {
      setFormData(createEmptyFormData());
    }

    setError('');
    setValidationErrors([]);
    setSaving(false);
  }, [open, proveedor]);

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
    [COLORS.inputBorder, COLORS.inputBorderHover, COLORS.primary],
  );

  const selectSx = useMemo(
    () => ({
      borderRadius: 2,
      background: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.inputBorder },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.inputBorderHover },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
      '& .MuiSelect-select': {
        borderRadius: 2,
        background: '#ffffff',
      },
    }),
    [COLORS.inputBorder, COLORS.inputBorderHover, COLORS.primary],
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

    if (formData.Codigo && Number.isNaN(Number(formData.Codigo))) {
      errores.push('El código debe ser un número válido.');
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
        Codigo: formData.Codigo ? parseInt(formData.Codigo, 10) : undefined,
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
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
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
        tintOpacity={0.4}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
          <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', px: 3, py: 2.25, gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
                  color: '#fff',
                }}
              >
                <Icon icon={esEdicion ? 'mdi:account-tie' : 'mdi:account-plus-outline'} width={22} height={22} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="white"
                  sx={{ textShadow: '0 4px 12px rgba(0,0,0,0.88), 0 0 2px rgba(0,0,0,0.72)' }}
                >
                  {titulo}
                </Typography>
                {esEdicion && (
                  <Typography
                    variant="subtitle2"
                    color="rgba(255,255,255,0.85)"
                    fontWeight={700}
                    sx={{ textShadow: '0 3px 9px rgba(0,0,0,0.82), 0 0 1px rgba(0,0,0,0.7)' }}
                  >
                    {proveedor?.Nombre ?? 'Proveedor sin nombre'}
                  </Typography>
                )}
              </Box>

              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {esEdicion && (
                  <>
                    {typeof proveedor?.Codigo === 'number' && (
                      <Chip
                        label={`Código ${proveedor.Codigo}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.35)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.32)',
                          fontWeight: 600,
                          px: 1.5,
                          height: 28,
                        }}
                      />
                    )}
                    {proveedor?.Rubro && (
                      <Chip
                        label={proveedor.Rubro}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.35)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.32)',
                          fontWeight: 600,
                          px: 1.5,
                          height: 28,
                        }}
                      />
                    )}
                    {headerTipoIvaLabel && (
                      <Chip
                        label={headerTipoIvaLabel}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.35)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.32)',
                          fontWeight: 600,
                          px: 1.5,
                          height: 28,
                        }}
                      />
                    )}
                  </>
                )}
                <CrystalIconButton
                  baseColor={COLORS.primary}
                  onClick={handleClose}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.28)',
                    color: '#fff',
                    '&:hover': { background: 'rgba(0,0,0,0.4)' },
                  }}
                >
                  <Icon icon="mdi:close" width={20} height={20} />
                </CrystalIconButton>
              </Box>
            </Box>
          </DialogTitle>

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
              <WoodBackdrop accent={COLORS.primary} radius={0} inset={0} strength={0.55} texture="wide" />
              <Box
                component="form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSubmit();
                }}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: 3,
                  borderRadius: 0,
                  backdropFilter: 'saturate(118%) blur(0.4px)',
                  background: 'rgba(255,255,255,0.84)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} gutterBottom>
                    Datos generales
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completá la información principal del proveedor. Podés actualizarla cuando quieras.
                  </Typography>
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Código"
                    value={formData.Codigo}
                    onChange={handleInputChange('Codigo')}
                    type="number"
                    helperText="Código interno único"
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Nombre del proveedor"
                    value={formData.Nombre}
                    onChange={handleInputChange('Nombre')}
                    required
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Contacto"
                    value={formData.Contacto}
                    onChange={handleInputChange('Contacto')}
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} gutterBottom>
                    Información de contacto
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Datos para ubicar y comunicarse con el proveedor.
                  </Typography>
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Teléfono"
                    value={formData.Telefono}
                    onChange={handleInputChange('Telefono')}
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Celular"
                    value={formData.Celular}
                    onChange={handleInputChange('Celular')}
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Email"
                    value={formData.Mail}
                    onChange={handleInputChange('Mail')}
                    type="email"
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Sitio web"
                    value={formData.Web}
                    onChange={handleInputChange('Web')}
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Fax"
                    value={formData.Fax}
                    onChange={handleInputChange('Fax')}
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Observaciones"
                    value={formData.Observaciones}
                    onChange={handleInputChange('Observaciones')}
                    fullWidth
                    disabled={saving}
                    multiline
                    minRows={2}
                    sx={fieldSx}
                  />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} gutterBottom>
                    Información fiscal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajustá los datos impositivos y financieros si es necesario.
                  </Typography>
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="CUIT"
                    value={formData.CUIT}
                    onChange={handleInputChange('CUIT')}
                    placeholder="XX-XXXXXXXX-X"
                    helperText="Formato requerido: XX-XXXXXXXX-X"
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                  <FormControl fullWidth disabled={saving} sx={{ '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary } }}>
                    <InputLabel>Tipo IVA</InputLabel>
                    <Select
                      label="Tipo IVA"
                      value={formData.TipoIva}
                      onChange={handleTipoIvaChange}
                      sx={selectSx}
                    >
                      {TIPO_IVA_OPTIONS.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {tipoIvaHelperLabel && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                        Seleccionado: {tipoIvaHelperLabel}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} gutterBottom>
                    Ajustes comerciales
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configurá los ajustes porcentuales que se aplicarán en los precios asociados a este proveedor.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 2.5,
                  }}
                >
                  <TextField
                    label="Recargo del proveedor (%)"
                    value={formData.PorcentajeRecargoProveedor}
                    onChange={handleInputChange('PorcentajeRecargoProveedor')}
                    type="number"
                    fullWidth
                    disabled={saving}
                    inputProps={{ step: 0.01, min: -100, max: 100 }}
                    helperText="Se suma al precio base en las ventas relacionadas"
                    sx={fieldSx}
                  />
                  <TextField
                    label="Descuento del proveedor (%)"
                    value={formData.PorcentajeDescuentoProveedor}
                    onChange={handleInputChange('PorcentajeDescuentoProveedor')}
                    type="number"
                    fullWidth
                    disabled={saving}
                    inputProps={{ step: 0.01, min: -100, max: 100 }}
                    helperText="Se aplica después de los recargos configurados"
                    sx={fieldSx}
                  />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} gutterBottom>
                    Ubicación
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Indicá la dirección para pedidos y facturación.
                  </Typography>
                </Box>

                <TextField
                  label="Dirección"
                  value={formData.Direccion}
                  onChange={handleInputChange('Direccion')}
                  fullWidth
                  disabled={saving}
                  sx={fieldSx}
                />

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Localidad"
                    value={formData.Localidad}
                    onChange={handleInputChange('Localidad')}
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Provincia"
                    value={formData.Provincia}
                    onChange={handleInputChange('Provincia')}
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                </Box>



                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Código postal"
                    value={formData.CP}
                    onChange={handleInputChange('CP')}
                    helperText="4 dígitos"
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                  <TextField
                    label="País"
                    value={formData.Pais}
                    onChange={handleInputChange('Pais')}
                    fullWidth
                    disabled={saving}
                    sx={fieldSx}
                  />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} gutterBottom>
                    Rubros Asociados
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Seleccioná los rubros que comercializa este proveedor.
                  </Typography>
                  <RubrosTransferList
                    allRubros={allRubros}
                    selectedRubrosIds={formData.rubrosIds || []}
                    onChange={(newIds: any) => {
                      setFormData((prev: any) => ({ ...prev, rubrosIds: newIds }));
                    }}
                    colors={COLORS}
                  />
                </Box>

                {(error || validationErrors.length > 0) && (
                  <Box display="flex" flexDirection="column" gap={1.25}>
                    {error && (
                      <Typography variant="body2" color="error" fontWeight={600}>
                        {error}
                      </Typography>
                    )}
                    {validationErrors.length > 0 && (
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        {validationErrors.map((err) => (
                          <Typography key={err} variant="body2" color="error">
                            • {err}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}


              </Box>
            </Box>
          </DialogContent>

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

          <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 3, py: 2.5, gap: 1.5 }}>
              <CrystalSoftButton
                baseColor={COLORS.primary}
                onClick={handleClose}
                disabled={saving}
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
                onClick={handleSubmit}
                disabled={!botonHabilitado}
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
                {saving ? 'Guardando…' : esEdicion ? 'Actualizar Proveedor' : 'Crear Proveedor'}
              </CrystalButton>
            </Box>
          </DialogActions>
        </Box >
      </TexturedPanel >
    </Dialog >
  );
};

export default ModalEditarProveedor;
