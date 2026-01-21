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
  MenuItem,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';

import { verdeMilitar } from '@/ui/colores';
import { ACTUALIZAR_RUBRO, CREAR_RUBRO } from '@/components/rubros/graphql/mutations';
import { GET_RUBROS, BUSCAR_RUBROS } from '@/components/rubros/graphql/queries';

interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  unidadMedida?: string;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

interface ModalEditarRubroProps {
  open: boolean;
  onClose: () => void;
  rubro?: Rubro | null;
  onSuccess?: () => void;
  accentColor?: string;
}

const VH_MAX = 78;

const makeColors = (base?: string) => {
  const primary = base || verdeMilitar.primary;
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.35),
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
  };
};

const UNIDADES_MEDIDA = ['Unidad', 'Gramo', 'Mililitro', 'Centímetro', 'Pack', 'Docena'];

const ModalEditarRubro = ({ open, onClose, rubro, onSuccess, accentColor }: ModalEditarRubroProps) => {
  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [porcentajeRecargo, setPorcentajeRecargo] = useState<string>('0');
  const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>('0');
  const [unidadMedida, setUnidadMedida] = useState<string>('Unidad');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [actualizarRubroMutation] = useMutation(ACTUALIZAR_RUBRO, {
    refetchQueries: [{ query: GET_RUBROS }, { query: BUSCAR_RUBROS }],
  });
  const [crearRubroMutation] = useMutation(CREAR_RUBRO, {
    refetchQueries: [{ query: GET_RUBROS }, { query: BUSCAR_RUBROS }],
  });

  const rubroEditando = Boolean(rubro?.id);
  const titulo = rubroEditando ? 'Editar rubro' : 'Nuevo rubro';

  useEffect(() => {
    if (!open) {
      setSaving(false);
      setError('');
      return;
    }

    setNombre(rubro?.nombre ?? '');
    setCodigo(rubro?.codigo ?? '');
    setPorcentajeRecargo(rubro?.porcentajeRecargo != null ? String(rubro.porcentajeRecargo) : '0');
    setPorcentajeDescuento(rubro?.porcentajeDescuento != null ? String(rubro.porcentajeDescuento) : '0');
    setUnidadMedida(rubro?.unidadMedida ?? 'Unidad');
    setError('');
    setSaving(false);
  }, [open, rubro]);

  const handleClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [saving, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const input = {
        nombre: nombre.trim(),
        codigo: codigo.trim() || null,
        porcentajeRecargo: parseFloat(porcentajeRecargo) || 0,
        porcentajeDescuento: parseFloat(porcentajeDescuento) || 0,
        unidadMedida: unidadMedida || 'Unidad',
      };

      if (rubroEditando && rubro?.id) {
        await actualizarRubroMutation({ variables: { id: rubro.id, ...input } });
      } else {
        await crearRubroMutation({ variables: input });
      }

      onSuccess?.();
      onClose();
    } catch (e) {
      setError('Ocurrió un error al guardar el rubro.');
    } finally {
      setSaving(false);
    }
  }, [nombre, codigo, porcentajeRecargo, porcentajeDescuento, unidadMedida, rubroEditando, rubro, actualizarRubroMutation, crearRubroMutation, onSuccess, onClose]);

  const botonHabilitado = nombre.trim().length > 0 && !saving;

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
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
        {/* HEADER FLAT */}
        <DialogTitle sx={{ p: 2, m: 0, minHeight: 64, display: 'flex', alignItems: 'center', bgcolor: COLORS.primary, color: '#fff' }}>
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="h6" fontWeight={700}>
                {titulo}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ p: 3, bgcolor: '#ffffff', overflowY: 'auto' }}>
          <Box display="grid" gap={3}>
            {/* Nombre y Código */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
              <Box>
                <Typography variant="caption" fontWeight={600} mb={0.5} display="block">
                  Nombre del Rubro <span style={{ color: '#d32f2f' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={nombre}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNombre(val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val);
                  }}
                  placeholder="Ej: Bebidas, Limpieza..."
                  error={Boolean(error && !nombre.trim())}
                  size="small"
                  InputProps={{ sx: { borderRadius: 0 } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={600} mb={0.5} display="block">
                  Código (Opcional)
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="Ej: BO-001"
                  size="small"
                  InputProps={{ sx: { borderRadius: 0 } }}
                />
              </Box>
            </Box>

            {/* Recargo y Descuento */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
              <Box>
                <Typography variant="caption" fontWeight={600} mb={0.5} display="block">
                  % Recargo
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={porcentajeRecargo}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*[.,]?\d*$/.test(val)) setPorcentajeRecargo(val);
                  }}
                  size="small"
                  InputProps={{ endAdornment: '%', sx: { borderRadius: 0 } }}
                  inputMode="decimal"
                />
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={600} mb={0.5} display="block">
                  % Descuento
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={porcentajeDescuento}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*[.,]?\d*$/.test(val)) setPorcentajeDescuento(val);
                  }}
                  size="small"
                  InputProps={{ endAdornment: '%', sx: { borderRadius: 0 } }}
                  inputMode="decimal"
                />
              </Box>
            </Box>

            {/* Unidad */}
            <Box>
              <Typography variant="caption" fontWeight={600} mb={0.5} display="block">
                Unidad de Medida
              </Typography>
              <TextField
                select
                fullWidth
                variant="outlined"
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
                size="small"
                InputProps={{ sx: { borderRadius: 0 } }}
              >
                {UNIDADES_MEDIDA.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {error && (
              <Box p={2} bgcolor={alpha('#d32f2f', 0.1)} border="1px solid #d32f2f">
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <Divider />

        <DialogActions sx={{ p: 2, bgcolor: '#f9fafb' }}>
          <Box display="flex" width="100%" justifyContent="flex-end" gap={2}>
            <Box
              component="button"
              onClick={handleClose}
              sx={{
                px: 3, py: 1,
                border: '1px solid #ccc',
                bgcolor: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.secondary',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              Cancelar
            </Box>

            <Box
              component="button"
              disabled={!botonHabilitado}
              onClick={handleSubmit}
              sx={{
                px: 3, py: 1,
                border: 'none',
                bgcolor: botonHabilitado ? COLORS.primary : '#e0e0e0',
                color: '#fff',
                cursor: botonHabilitado ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                '&:hover': botonHabilitado ? { bgcolor: COLORS.primaryHover, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } : {}
              }}
            >
              {saving ? 'Guardando...' : (rubroEditando ? 'Guardar Cambios' : 'Crear Rubro')}
            </Box>
          </Box>
        </DialogActions>

      </Box>
    </Dialog>
  );
};

export default ModalEditarRubro;
