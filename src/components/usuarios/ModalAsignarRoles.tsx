import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Switch,
  Box,
  CircularProgress,
  Typography,
  Chip,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { IconUserShield, IconX, IconShieldCheck } from '@tabler/icons-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { grisNeutro, azul } from '@/ui/colores';
import { UsuarioListado } from './TablaUsuarios';
import { ASIGNAR_ROLES_USUARIO_ADMIN_MUTATION, OBTENER_ROLES_QUERY } from './graphql/mutations';

interface RolItem {
  id: string;
  nombre: string;
  slug: string;
}

interface Props {
  open: boolean;
  usuario: UsuarioListado | null;
  onClose: () => void;
  onSuccess: () => void;
}

const HEADER_H = 60;
const VH_MAX = 78;

export default function ModalAsignarRoles({ open, usuario, onClose, onSuccess }: Props) {
  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({});

  // Queries & Mutations
  const { data: rolesData, loading: rolesLoading } = useQuery<{ roles: RolItem[] }>(OBTENER_ROLES_QUERY, {
    skip: !open,
  });

  const [asignarRoles, { loading: saving }] = useMutation(ASIGNAR_ROLES_USUARIO_ADMIN_MUTATION);

  // Inicializar selección
  useEffect(() => {
    if (open && usuario && rolesData?.roles) {
      const inicial: Record<string, boolean> = {};
      rolesData.roles.forEach((r) => {
        inicial[r.slug] = (usuario.roles || []).includes(r.slug);
      });
      setSeleccion(inicial);
    }
  }, [open, usuario, rolesData]);

  const toggle = (slug: string) => {
    setSeleccion((s) => ({ ...s, [slug]: !s[slug] }));
  };

  const handleSubmit = async () => {
    if (!usuario) return;
    const rolesActivos = Object.entries(seleccion)
      .filter(([, active]) => active)
      .map(([slug]) => slug);

    try {
      await asignarRoles({
        variables: {
          id: usuario.id,
          roles: rolesActivos
        }
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error asignando roles:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 0,
          bgcolor: '#ffffff',
          boxShadow: 'none',
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
          border: `1px solid ${grisNeutro.borderOuter}`,
        }
      }}
    >
      <DialogTitle sx={{
        p: 2,
        m: 0,
        minHeight: HEADER_H,
        display: 'flex',
        alignItems: 'center',
        bgcolor: grisNeutro.primary,
        color: '#fff'
      }}>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h6" fontWeight={700}>
              Asignar Roles
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Gestiona los permisos y accesos del usuario
            </Typography>
          </Box>

          <Box sx={{ ml: 'auto' }}>
            <IconButton onClick={onClose} sx={{ color: '#fff' }}>
              <IconX size={24} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#f8fafb', overflowY: 'auto' }}>

        {/* User Info Card */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 0,
              bgcolor: '#fff',
              border: `1px dashed ${grisNeutro.borderInner}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(grisNeutro.primary, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: grisNeutro.primary
            }}>
              <IconUserShield size={28} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>
                Usuario Seleccionado
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: grisNeutro.textStrong }}>
                {usuario?.displayName || usuario?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {usuario?.email}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Divider />

        <Box sx={{ p: 3, pt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: grisNeutro.textWeak, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>
            Roles Disponibles
          </Typography>

          {rolesLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} sx={{ color: grisNeutro.primary }} />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={1.5}>
              {rolesData?.roles?.map((r) => {
                const active = seleccion[r.slug];
                return (
                  <Paper
                    key={r.id}
                    variant="outlined"
                    onClick={() => toggle(r.slug)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 0,
                      cursor: 'pointer',
                      borderColor: active ? azul.primary : 'divider',
                      bgcolor: active ? alpha(azul.primary, 0.04) : '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: active ? azul.primary : '#ccc',
                        bgcolor: active ? alpha(azul.primary, 0.08) : '#f9f9f9',
                      }
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <IconShieldCheck size={18} color={active ? azul.primary : '#999'} />
                        <Typography variant="subtitle2" fontWeight={700} color={active ? azul.primary : 'text.primary'}>
                          {r.nombre}
                        </Typography>
                        {active && (
                          <Chip label="Activo" size="small" sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: alpha(azul.primary, 0.1),
                            color: azul.primary,
                            borderRadius: 0,
                            fontWeight: 600
                          }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', pl: 3.2 }}>
                        Acceso a funciones de {r.nombre.toLowerCase()}.
                      </Typography>
                    </Box>
                    <Switch
                      checked={!!active}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: azul.primary },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: azul.primary }
                      }}
                    />
                  </Paper>
                );
              })}
              {rolesData?.roles?.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">No hay roles disponibles.</Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: grisNeutro.toolbarBg, borderTop: `1px solid ${grisNeutro.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: grisNeutro.textStrong }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disableElevation
          disabled={saving || rolesLoading}
          sx={{
            borderRadius: 0,
            fontWeight: 600,
            bgcolor: grisNeutro.primary,
            '&:hover': { bgcolor: grisNeutro.primaryHover }
          }}
        >
          {saving ? 'Guardando...' : 'Confirmar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
