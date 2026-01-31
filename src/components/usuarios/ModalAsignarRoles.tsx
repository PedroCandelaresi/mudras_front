'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Typography,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { IconUserShield, IconCircleCheck } from '@tabler/icons-react';
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

export default function ModalAsignarRoles({ open, usuario, onClose, onSuccess }: Props) {
  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({});

  // Queries & Mutations
  const { data: rolesData, loading: rolesLoading } = useQuery<{ roles: RolItem[] }>(OBTENER_ROLES_QUERY, {
    skip: !open, // Solo cargar si está abierto
  });

  const [asignarRoles, { loading: saving }] = useMutation(ASIGNAR_ROLES_USUARIO_ADMIN_MUTATION);

  // Inicializar selección cuando abre el modal o carga data
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
      // alert('Error al asignar roles: ' + (err.message || 'Desconocido')); // Mejor manejo por snackbar externo o UI state
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
        <IconUserShield size={24} />
        <Box>
          Asignar Roles
          <Typography variant="caption" display="block" sx={{ fontWeight: 400, opacity: 0.8, fontSize: '0.8rem' }}>
            Define qué funciones puede realizar este usuario.
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#fafafa' }}>
        <Box sx={{ p: 2, mb: 1, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
          <Typography variant="body2" color="text.secondary">
            Usuario seleccionado:
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} color={grisNeutro.textStrong}>
            {usuario?.displayName || usuario?.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {usuario?.email}
          </Typography>
        </Box>

        <Box sx={{ p: 2, maxHeight: 400, overflowY: 'auto' }}>
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
                        <Typography variant="subtitle2" fontWeight={700} color={active ? azul.primary : 'text.primary'}>
                          {r.nombre}
                        </Typography>
                        <Chip
                          label={r.slug}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            borderRadius: 0,
                            bgcolor: '#eee',
                            color: '#666'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        Permite acceso a funciones de {r.nombre.toLowerCase()}.
                      </Typography>
                    </Box>
                    <Switch checked={!!active} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: azul.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: azul.primary } }} />
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
          {saving ? 'Guardando...' : 'Confirmar Roles'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
