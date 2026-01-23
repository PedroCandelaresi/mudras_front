'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  CircularProgress,
  Typography,
  Chip
} from '@mui/material';
import { IconUserShield } from '@tabler/icons-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { azul } from '@/ui/colores';
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
      alert('Error al asignar roles: ' + (err.message || 'Desconocido'));
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
          border: `1px solid ${azul.borderOuter}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: azul.headerBg,
          color: azul.headerText,
          borderBottom: `1px solid ${azul.headerBorder}`,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <IconUserShield size={24} />
        Asignar Roles
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Usuario: <strong>{usuario?.username || usuario?.email}</strong>
          </Typography>
        </Box>

        {rolesLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} sx={{ color: azul.primary }} />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            {rolesData?.roles?.map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  border: '1px solid #eee',
                  bgcolor: seleccion[r.slug] ? '#f5f5f5' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                <Checkbox
                  checked={!!seleccion[r.slug]}
                  onChange={() => toggle(r.slug)}
                  sx={{
                    color: azul.primary,
                    '&.Mui-checked': { color: azul.primary }
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={600}>{r.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{r.slug}</Typography>
                </Box>
                {seleccion[r.slug] && (
                  <Chip label="Asignado" size="small" sx={{ ml: 'auto', bgcolor: azul.chipBg, color: azul.chipText, fontWeight: 700, borderRadius: 0 }} />
                )}
              </Box>
            ))}
            {rolesData?.roles?.length === 0 && (
              <Typography variant="body2" color="text.secondary">No hay roles disponibles.</Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: azul.toolbarBg, borderTop: `1px solid ${azul.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: azul.textStrong }}>
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
            bgcolor: azul.primary,
            '&:hover': { bgcolor: azul.primaryHover }
          }}
        >
          {saving ? 'Guardando...' : 'Guardar Roles'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
