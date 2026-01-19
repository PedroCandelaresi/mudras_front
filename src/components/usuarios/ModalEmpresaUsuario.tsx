"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Autocomplete,
  Button,
  IconButton,
} from '@mui/material';
import { apiFetch } from '@/lib/api';

export interface UpsertUserInput {
  id?: string;
  username: string;
  email?: string;
  displayName: string;
  passwordTemporal?: string;
  isActive: boolean;
  roles: string[]; // slugs
}

export interface UsuarioResumen {
  id: string;
  username: string | null;
  email: string | null;
  displayName: string;
  isActive: boolean;
  roles?: string[];
}

export interface RolItem { id: string; name: string; slug: string }

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  usuario?: UsuarioResumen | null;
  onClose: () => void;
  onSaved?: () => void;
}



import { IconEye, IconEyeOff } from '@tabler/icons-react';

export default function UpsertEmpresaUserModal({ open, mode, usuario, onClose, onSaved }: Props) {
  const editing = mode === 'edit' && Boolean(usuario?.id);
  const titulo = editing ? 'Editar usuario de Mudras' : 'Crear usuario de Mudras';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [rolesDisponibles, setRolesDisponibles] = useState<RolItem[]>([]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<RolItem[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const rolesVacios = rolesSeleccionados.length === 0;

  useEffect(() => {
    if (!open) return;
    setLoadingRoles(true);
    apiFetch<RolItem[]>('/roles')
      .then((roles) => setRolesDisponibles(roles))
      .catch(() => setRolesDisponibles([]))
      .finally(() => setLoadingRoles(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);
    if (editing && usuario) {
      setUsername(usuario.username || '');
      setEmail(usuario.email || '');
      setDisplayName(usuario.displayName || '');
      setIsActive(!!usuario.isActive);
      setPasswordTemporal('');
      if (usuario.roles && rolesDisponibles.length > 0) {
        const sel = rolesDisponibles.filter((r) => (usuario.roles || []).includes(r.slug));
        setRolesSeleccionados(sel);
      }
    } else {
      setUsername('');
      setEmail('');
      setDisplayName('');
      setIsActive(true);
      setPasswordTemporal('');
      setRolesSeleccionados([]);
    }
  }, [open, editing, usuario, rolesDisponibles]);

  const handleClose = useCallback(() => { if (!saving) onClose(); }, [saving, onClose]);

  const submit = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const rolesSlugs = rolesSeleccionados.map((r) => r.slug);

      if (!editing) {
        if (!username.trim() || !displayName.trim() || !passwordTemporal.trim()) {
          setError('Usuario, nombre y contraseña temporal son obligatorios.');
          setSaving(false);
          return;
        }
        const body = {
          username: username.trim(),
          email: email.trim() || undefined,
          displayName: displayName.trim(),
          passwordTemporal: passwordTemporal,
          isActive,
        };
        const creado = await apiFetch<{ id: string } & any>('/users', { method: 'POST', body });
        if (rolesSlugs.length > 0) {
          await apiFetch(`/users/${creado.id}/roles`, { method: 'POST', body: { roles: rolesSlugs } });
        }
      } else {
        if (!usuario?.id) throw new Error('Usuario inválido');
        const body: any = {
          email: email.trim() || null,
          displayName: displayName.trim(),
          isActive,
        };
        await apiFetch(`/users/${usuario.id}`, { method: 'PUT', body });
        await apiFetch(`/users/${usuario.id}/roles`, { method: 'POST', body: { roles: rolesSlugs } });
      }
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Ocurrió un error al guardar el usuario.');
    } finally {
      setSaving(false);
    }
  }, [editing, username, email, displayName, passwordTemporal, isActive, rolesSeleccionados, usuario, onSaved, onClose]);

  const botonHabilitado = (!editing && username.trim() && displayName.trim() && passwordTemporal.trim()) || (editing && displayName.trim());

  /* ======================== Render ======================== */
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', p: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700}>
              {titulo}
            </Typography>
            {editing && (
              <Typography variant="subtitle2" color="text.secondary">
                {usuario?.displayName}
              </Typography>
            )}
          </Box>
          {loadingRoles && <CircularProgress size={20} sx={{ ml: 'auto' }} />}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Datos del usuario
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usuario EMPRESA (Mudras). El usuario debe ser del tipo nombre.apellido.
            </Typography>
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
            <TextField
              label="Usuario (nombre.apellido)"
              required
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={saving || editing}
              size="small"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
            <TextField
              label="Email (opcional)"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              size="small"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
            <TextField
              label="Nombre a mostrar"
              required
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={saving}
              size="small"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
            {!editing && (
              <TextField
                label="Password temporal"
                type={mostrarPassword ? 'text' : 'password'}
                required
                fullWidth
                value={passwordTemporal}
                onChange={(e) => setPasswordTemporal(e.target.value)}
                disabled={saving}
                size="small"
                InputProps={{
                  sx: { borderRadius: 0 },
                  endAdornment: (
                    <IconButton aria-label="mostrar contraseña" onClick={() => setMostrarPassword((v) => !v)} edge="end" size="small">
                      {mostrarPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  )
                }}
              />
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={1.5}>
            <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Usuario activo" />
            <Autocomplete
              multiple
              options={rolesDisponibles}
              value={rolesSeleccionados}
              onChange={(_e, value) => setRolesSeleccionados(value)}
              getOptionLabel={(r) => `${r.name} (${r.slug})`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              sx={{ width: '100%' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Roles"
                  placeholder="Selecciona roles"
                  size="small"
                  fullWidth
                  InputProps={{ ...params.InputProps, sx: { borderRadius: 0 } }}
                />
              )}
            />
          </Box>

          {error && (
            <Typography variant="body2" color="error">{error}</Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={handleClose} disabled={saving} sx={{ borderRadius: 0, fontWeight: 600 }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!botonHabilitado || saving}
          disableElevation
          sx={{ borderRadius: 0, fontWeight: 700, bgcolor: '#8d6e63', '&:hover': { bgcolor: '#6d4c41' } }}
        >
          {saving ? 'Guardando…' : (editing ? 'Actualizar Usuario' : 'Crear Usuario')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
