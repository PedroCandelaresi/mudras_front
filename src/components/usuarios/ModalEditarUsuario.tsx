import React, { useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Grid,
  Divider,
  Switch,
  Typography,
  InputAdornment
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@apollo/client/react';
import { IconEdit, IconUser, IconMail, IconId, IconShieldLock } from '@tabler/icons-react';

import { grisNeutro, azul } from '@/ui/colores';
import { UsuarioListado } from './TablaUsuarios';
import { ACTUALIZAR_USUARIO_ADMIN_MUTATION, OBTENER_ROLES_QUERY } from './graphql/mutations';
import { USUARIOS_ADMIN_QUERY } from './graphql/queries';

export interface EditarUsuarioForm {
  email?: string | null;
  displayName?: string;
  isActive?: boolean;
  roles?: string[];
}

const schema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  displayName: z.string().trim().min(1, 'El nombre a mostrar es obligatorio').optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
});

interface Props {
  open: boolean;
  usuario: UsuarioListado | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarUsuario({ open, usuario, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<EditarUsuarioForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      displayName: '',
      isActive: true,
      roles: []
    }
  });

  const [updateUser, { loading }] = useMutation(ACTUALIZAR_USUARIO_ADMIN_MUTATION, {
    refetchQueries: [{ query: USUARIOS_ADMIN_QUERY }],
  });

  const { data: rolesData } = useQuery<{ roles: { id: string; nombre: string; slug: string }[] }>(OBTENER_ROLES_QUERY);

  useEffect(() => {
    if (usuario && open) {
      reset({
        email: usuario.email ?? '',
        displayName: usuario.displayName ?? '',
        isActive: usuario.isActive ?? true,
        roles: usuario.roles || []
      });
    }
  }, [usuario, reset, open]);

  const onSubmit = async (data: EditarUsuarioForm) => {
    if (!usuario) return;
    try {
      await updateUser({
        variables: {
          id: usuario.id,
          input: {
            email: data.email || null,
            displayName: data.displayName,
            isActive: data.isActive,
            roles: data.roles
          }
        }
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error editando usuario:', error);
      // alert('Error al editar usuario: ' + (error.message || 'Desconocido'));
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
        <IconEdit size={24} />
        <Box>
          Editar Usuario: {usuario?.username}
          <Typography variant="caption" display="block" sx={{ fontWeight: 400, opacity: 0.8, fontSize: '0.8rem' }}>
            Modifica los datos personales y permisos de acceso.
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#fafafa' }}>
        <Box component="form" p={3}>
          <Grid container spacing={3}>
            {/* Columna Izquierda */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: grisNeutro.textWeak, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>
                Información de la Cuenta
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Usuario (Login)"
                  value={usuario?.username || ''}
                  disabled
                  size="small"
                  fullWidth
                  InputProps={{
                    sx: { borderRadius: 0, bgcolor: '#f0f0f0' },
                    startAdornment: <InputAdornment position="start"><IconUser size={18} color="#999" /></InputAdornment>
                  }}
                />

                <TextField
                  label="Email"
                  {...register('email')}
                  size="small"
                  error={!!errors.email}
                  helperText={errors.email?.message || ''}
                  fullWidth
                  InputProps={{
                    sx: { borderRadius: 0, bgcolor: '#fff' },
                    startAdornment: <InputAdornment position="start"><IconMail size={18} color="#999" /></InputAdornment>
                  }}
                />

                <TextField
                  label="Nombre a mostrar"
                  {...register('displayName')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const finalVal = val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val;
                    setValue('displayName', finalVal, { shouldValidate: true });
                  }}
                  size="small"
                  error={!!errors.displayName}
                  helperText={errors.displayName?.message || ''}
                  fullWidth
                  InputProps={{
                    sx: { borderRadius: 0, bgcolor: '#fff' },
                    startAdornment: <InputAdornment position="start"><IconId size={18} color="#999" /></InputAdornment>
                  }}
                />
              </Box>
            </Grid>

            {/* Columna Derecha */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: grisNeutro.textWeak, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>
                Seguridad y Acceso
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Asignar Roles</InputLabel>
                  <Controller
                    control={control}
                    name="roles"
                    render={({ field }) => (
                      <Select
                        {...field}
                        multiple
                        input={<OutlinedInput label="Asignar Roles" sx={{ borderRadius: 0, bgcolor: '#fff' }} />}
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

                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: azul.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: azul.primary } }}
                        />
                      }
                      label={<Typography variant="body2" fontWeight={500}>Usuario Activo (Permitir ingreso)</Typography>}
                      sx={{ border: '1px solid #ddd', borderRadius: 0, px: 2, py: 1, bgcolor: '#fff', mr: 0 }}
                    />
                  )}
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
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
