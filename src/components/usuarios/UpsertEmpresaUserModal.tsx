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
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';
import { marron } from '@/ui/colores';
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

const NBSP = '\u00A0';
const VH_MAX = 78;
const HEADER_H = 88;
const FOOTER_H = 96;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

const makeColors = (base?: string) => {
  const primary = base || marron.primary || '#6D4C41';
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.35),
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
  };
};

export default function UpsertEmpresaUserModal({ open, mode, usuario, onClose, onSaved }: Props) {
  const COLORS = useMemo(() => makeColors(marron.primary), []);
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
                <Icon icon={editing ? 'mdi:account-edit' : 'mdi:account-plus'} width={22} height={22} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" fontWeight={700} color="white" sx={{ textShadow: '0 4px 12px rgba(0,0,0,0.88), 0 0 2px rgba(0,0,0,0.72)' }}>
                  {titulo}
                </Typography>
                {editing && (
                  <Typography variant="subtitle2" color="rgba(255,255,255,0.85)" fontWeight={700} sx={{ textShadow: '0 3px 9px rgba(0,0,0,0.82), 0 0 1px rgba(0,0,0,0.7)' }}>
                    {usuario?.displayName}
                  </Typography>
                )}
              </Box>

              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {loadingRoles && <CircularProgress size={20} sx={{ color: '#fff' }} />}
                <CrystalIconButton baseColor={COLORS.primary} onClick={handleClose} sx={{ minWidth: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.28)', color: '#fff', '&:hover': { background: 'rgba(0,0,0,0.4)' } }}>
                  <Icon icon="mdi:close" width={20} height={20} />
                </CrystalIconButton>
              </Box>
            </Box>
          </DialogTitle>

          <Divider sx={{ height: DIV_H, border: 0, backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)), linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)), linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))`, backgroundRepeat: 'no-repeat, no-repeat, repeat', backgroundSize: '100% 1px, 100% 1px, 100% 100%', backgroundPosition: 'top left, bottom left, center', flex: '0 0 auto' }} />

          <DialogContent sx={{ p: 0, borderRadius: 0, overflow: 'auto', maxHeight: CONTENT_MAX, flex: '0 1 auto' }}>
            <Box sx={{ position: 'relative', borderRadius: 0, overflow: 'hidden' }}>
              <WoodBackdrop accent={COLORS.primary} radius={0} inset={0} strength={0.55} texture="wide" />
              <Box component="form" onSubmit={(e) => { e.preventDefault(); submit(); }} sx={{ position: 'relative', zIndex: 1, p: 3, borderRadius: 0, backdropFilter: 'saturate(118%) blur(0.4px)', background: 'rgba(255,255,255,0.88)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} gutterBottom>
                    Datos del usuario
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuario EMPRESA (Mudras). El usuario debe ser del tipo nombre.apellido.
                  </Typography>
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField label="Usuario (nombre.apellido)" required fullWidth value={username} onChange={(e) => setUsername(e.target.value)} disabled={saving || editing} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#ffffff', '& fieldset': { borderColor: COLORS.inputBorder }, '&:hover fieldset': { borderColor: COLORS.inputBorderHover }, '&.Mui-focused fieldset': { borderColor: COLORS.primary }, }, }} />
                  <TextField label="Email (opcional)" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} disabled={saving} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#ffffff', '& fieldset': { borderColor: COLORS.inputBorder }, '&:hover fieldset': { borderColor: COLORS.inputBorderHover }, '&.Mui-focused fieldset': { borderColor: COLORS.primary }, }, }} />
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField label="Nombre a mostrar" required fullWidth value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={saving} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#ffffff', '& fieldset': { borderColor: COLORS.inputBorder }, '&:hover fieldset': { borderColor: COLORS.inputBorderHover }, '&.Mui-focused fieldset': { borderColor: COLORS.primary }, }, }} />
                  {!editing && (
                    <TextField label="Password temporal" type={mostrarPassword ? 'text' : 'password'} required fullWidth value={passwordTemporal} onChange={(e) => setPasswordTemporal(e.target.value)} disabled={saving} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#ffffff', '& fieldset': { borderColor: COLORS.inputBorder }, '&:hover fieldset': { borderColor: COLORS.inputBorderHover }, '&.Mui-focused fieldset': { borderColor: COLORS.primary }, }, }}
                      InputProps={{ endAdornment: (<span role="button" aria-label="mostrar contraseña" onClick={() => setMostrarPassword((v) => !v)} style={{ cursor: 'pointer', color: '#666' }}>{mostrarPassword ? '🙈' : '👁️'}</span>) }}
                    />
                  )}
                </Box>

                {/* Estado y roles */}
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box>
                    <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Usuario activo" />
                  </Box>
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
                        size={rolesVacios ? 'medium' : 'small'}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: '#ffffff',
                            minHeight: rolesVacios ? 64 : 42,
                            '& fieldset': { borderColor: COLORS.inputBorder },
                            '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                            '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                {error && (
                  <Typography variant="body2" color="error">{error}</Typography>
                )}

              </Box>
            </Box>
          </DialogContent>

          <Divider sx={{ height: DIV_H, border: 0, backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)), linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)), linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))`, backgroundRepeat: 'no-repeat, no-repeat, repeat', backgroundSize: '100% 1px, 100% 1px, 100% 100%', backgroundPosition: 'top left, bottom left, center', flex: '0 0 auto' }} />

          <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 3, py: 2.5, gap: 1.5 }}>
              <CrystalSoftButton baseColor={COLORS.primary} onClick={handleClose} disabled={saving} sx={{ minHeight: 44, px: 3, fontWeight: 600 }}>Cancelar</CrystalSoftButton>
              <CrystalButton baseColor={COLORS.primary} onClick={submit} disabled={!botonHabilitado || saving} sx={{ minHeight: 44, px: 3, fontWeight: 700, '&:disabled': { opacity: 0.55, boxShadow: 'none' } }}>{saving ? 'Guardando…' : (editing ? 'Actualizar Usuario' : 'Crear Usuario')}</CrystalButton>
            </Box>
          </DialogActions>
        </Box>
      </TexturedPanel>
    </Dialog>
  );
}
