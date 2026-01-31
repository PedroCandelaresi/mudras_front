import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Grid,
  Divider,
  Switch
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { IconEye, IconEyeOff, IconUserPlus, IconId, IconMail, IconLock, IconShieldLock } from '@tabler/icons-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { grisNeutro, azul } from '@/ui/colores';
import { CREAR_USUARIO_ADMIN_MUTATION, OBTENER_ROLES_QUERY } from './graphql/mutations';
import { USUARIOS_ADMIN_QUERY } from './graphql/queries';
import { useQuery } from '@apollo/client/react';

export interface CrearUsuarioForm {
  username: string;
  email?: string;
  displayName: string;
  passwordTemporal: string;
  isActive: boolean;
  roles?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schema = z.object({
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  displayName: z.string().trim().min(1, 'El nombre a mostrar es obligatorio'),
  passwordTemporal: z
    .string()
    .min(8, 'Min. 8 caracteres')
    .regex(/[A-Z]/, '1 mayúscula')
    .regex(/[a-z]/, '1 minúscula')
    .regex(/\d/, '1 número')
    .regex(/[^A-Za-z0-9]/, '1 símbolo'),
  isActive: z.boolean(),
  roles: z.array(z.string()).optional(),
});

export default function ModalNuevoUsuario({ open, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<CrearUsuarioForm>({
    defaultValues: { isActive: true, roles: [] },
    resolver: zodResolver(schema),
  });
  const [mostrarPassword, setMostrarPassword] = React.useState(false);

  const [crearUsuario, { loading }] = useMutation(CREAR_USUARIO_ADMIN_MUTATION, {
    refetchQueries: [{ query: USUARIOS_ADMIN_QUERY }],
  });

  const { data: rolesData } = useQuery<{ roles: { id: string; nombre: string; slug: string }[] }>(OBTENER_ROLES_QUERY);

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      reset({ isActive: true, username: '', email: '', displayName: '', passwordTemporal: '', roles: [] });
    }
  }, [open, reset]);

  const onSubmit = async (data: CrearUsuarioForm) => {
    try {
      await crearUsuario({
        variables: {
          input: {
            username: data.username,
            email: data.email || null,
            displayName: data.displayName,
            passwordTemporal: data.passwordTemporal,
            isActive: data.isActive,
            roles: data.roles
          }
        }
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      // alert('Error al crear usuario: ' + (error.message || 'Desconocido')); // Mejor manejo por UI
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: `1px solid ${grisNeutro.borderOuter}`,
          boxShadow: 'none'
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: grisNeutro.headerBg,
          color: grisNeutro.headerText,
          borderBottom: `1px solid ${grisNeutro.headerBorder}`,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 2
        }}
      >
        <IconUserPlus size={24} />
        <Box>
          Crear Nuevo Usuario
          <Typography variant="caption" display="block" sx={{ fontWeight: 400, opacity: 0.8, fontSize: '0.8rem' }}>
            Registra un nuevo usuario en el sistema.
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#fafafa' }}>
        <Box component="form" p={3}>

          <Grid container spacing={3}>
            {/* Columna Izquierda: Información Básica */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: grisNeutro.textWeak, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>
                Información Personal
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Nombre a mostrar (Display Name)"
                  placeholder="Ej: Juan Perez"
                  {...register('displayName')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const finalVal = val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val;
                    setValue('displayName', finalVal, { shouldValidate: true });
                  }}
                  size="small"
                  error={!!errors.displayName}
                  helperText={errors.displayName?.message}
                  fullWidth
                  InputProps={{
                    sx: { borderRadius: 0, bgcolor: '#fff' },
                    startAdornment: <InputAdornment position="start"><IconId size={18} color="#999" /></InputAdornment>
                  }}
                />

                <TextField
                  label="Email"
                  placeholder="juan@ejemplo.com"
                  {...register('email')}
                  size="small"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                  InputProps={{
                    sx: { borderRadius: 0, bgcolor: '#fff' },
                    startAdornment: <InputAdornment position="start"><IconMail size={18} color="#999" /></InputAdornment>
                  }}
                />
              </Box>
            </Grid>

            {/* Columna Derecha: Cuenta y Seguridad */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: grisNeutro.textWeak, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>
                Cuenta y Seguridad
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Usuario (Login)"
                  placeholder="juanperez"
                  {...register('username')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const finalVal = val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val;
                    setValue('username', finalVal, { shouldValidate: true });
                  }}
                  size="small"
                  error={!!errors.username}
                  helperText={errors.username?.message || "Usado para iniciar sesión"}
                  fullWidth
                  InputProps={{
                    sx: { borderRadius: 0, bgcolor: '#fff' },
                    startAdornment: <InputAdornment position="start"><IconUserPlus size={18} color="#999" /></InputAdornment>
                  }}
                />

                <TextField
                  label="Contraseña Temporal"
                  type={mostrarPassword ? 'text' : 'password'}
                  {...register('passwordTemporal')}
                  size="small"
                  error={!!errors.passwordTemporal}
                  helperText={errors.passwordTemporal?.message}
                  fullWidth
                  InputProps={{
                    sx: { borderRadius: 0, bgcolor: '#fff' },
                    startAdornment: <InputAdornment position="start"><IconLock size={18} color="#999" /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setMostrarPassword((v) => !v)} edge="end" size="small">
                          {mostrarPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Roles y Estado */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: grisNeutro.textWeak, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>
                Permisos y Estado
              </Typography>

              <Box display="flex" alignItems="center" gap={3}>
                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                  <InputLabel>Asignar Roles Iniciales</InputLabel>
                  <Controller
                    control={control}
                    name="roles"
                    render={({ field }) => (
                      <Select
                        {...field}
                        multiple
                        input={<OutlinedInput label="Asignar Roles Iniciales" sx={{ borderRadius: 0, bgcolor: '#fff' }} />}
                        startAdornment={<InputAdornment position="start" sx={{ ml: 1, mr: -0.5 }}><IconShieldLock size={18} color="#999" /></InputAdornment>}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                              <Chip key={value} label={value} size="small" sx={{ borderRadius: 0, height: 24 }} />
                            ))}
                          </Box>
                        )}
                      >
                        {rolesData?.roles?.map((r: any) => (
                          <MenuItem key={r.id} value={r.slug}>
                            {r.nombre} ({r.slug})
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      defaultChecked
                      {...register('isActive')}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: azul.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: azul.primary } }}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={500}>Usuario Activo</Typography>}
                  sx={{ border: '1px solid #ddd', borderRadius: 0, px: 2, py: 0.5, bgcolor: '#fff', mr: 0, height: 40 }}
                />
              </Box>
            </Grid>
          </Grid>

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: grisNeutro.toolbarBg, borderTop: `1px solid ${grisNeutro.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: grisNeutro.textStrong }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disableElevation
          disabled={loading}
          sx={{
            borderRadius: 0,
            fontWeight: 600,
            bgcolor: grisNeutro.primary,
            '&:hover': { bgcolor: grisNeutro.primaryHover }
          }}
        >
          {loading ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
