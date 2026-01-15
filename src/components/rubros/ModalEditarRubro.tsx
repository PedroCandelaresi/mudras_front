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
  MenuItem,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useMutation } from '@apollo/client/react';

import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import { marron } from '@/components/rubros/colores-marron';
import { ACTUALIZAR_RUBRO, CREAR_RUBRO } from '@/components/rubros/graphql/mutations';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';

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

const NBSP = '\u00A0';
const formatCount = (n: number | undefined, singular: string, plural?: string) => {
  const value = typeof n === 'number' ? n : 0;
  const label = value === 1 ? singular : (plural ?? `${singular}s`);
  return `${value.toLocaleString('es-AR')}${NBSP}${label}`;
};

const VH_MAX = 78;
const HEADER_H = 88;
const FOOTER_H = 96;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

const makeColors = (base?: string) => {
  const primary = base || marron.primary || '#5D4037';
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.35),
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
  };
};

const UNIDADES_MEDIDA = ['Unidad', 'Kilogramo', 'Gramo', 'Litro', 'Mililitro', 'Metro', 'Pack', 'Docena'];

const ModalEditarRubro = ({ open, onClose, rubro, onSuccess, accentColor }: ModalEditarRubroProps) => {
  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [porcentajeRecargo, setPorcentajeRecargo] = useState<number>(0);
  const [porcentajeDescuento, setPorcentajeDescuento] = useState<number>(0);
  const [unidadMedida, setUnidadMedida] = useState<string>('Unidad');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [actualizarRubroMutation] = useMutation(ACTUALIZAR_RUBRO);
  const [crearRubroMutation] = useMutation(CREAR_RUBRO);

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
    setPorcentajeRecargo(rubro?.porcentajeRecargo != null ? Number(rubro.porcentajeRecargo) : 0);
    setPorcentajeDescuento(rubro?.porcentajeDescuento != null ? Number(rubro.porcentajeDescuento) : 0);
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
        porcentajeRecargo: Number.isFinite(Number(porcentajeRecargo)) ? Number(porcentajeRecargo) : 0,
        porcentajeDescuento: Number.isFinite(Number(porcentajeDescuento)) ? Number(porcentajeDescuento) : 0,
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
                <Icon icon={rubroEditando ? 'mdi:tag-edit-outline' : 'mdi:plus-circle-outline'} width={22} height={22} />
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
                {rubroEditando && (
                  <Typography
                    variant="subtitle2"
                    color="rgba(255,255,255,0.85)"
                    fontWeight={700}
                    sx={{ textShadow: '0 3px 9px rgba(0,0,0,0.82), 0 0 1px rgba(0,0,0,0.7)' }}
                  >
                    {rubro?.nombre}
                  </Typography>
                )}
              </Box>

              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {rubroEditando && (
                  <>
                    <Chip
                      label={formatCount(rubro?.cantidadArticulos, 'artículo', 'artículos')}
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
                    <Chip
                      label={formatCount(rubro?.cantidadProveedores, 'proveedor', 'proveedores')}
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
                    Datos del rubro
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completá la información básica. Podrás actualizarla en cualquier momento.
                  </Typography>
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Nombre del rubro"
                    required
                    fullWidth
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={saving}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: '#ffffff',
                        '& fieldset': { borderColor: COLORS.inputBorder },
                        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                      },
                    }}
                  />
                  <TextField
                    label="Código"
                    fullWidth
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    disabled={saving}
                    placeholder="Opcional"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: '#ffffff',
                        '& fieldset': { borderColor: COLORS.inputBorder },
                        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                      },
                    }}
                  />
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2.5}>
                  <TextField
                    label="Recargo por rubro (%)"
                    type="number"
                    fullWidth
                    value={porcentajeRecargo}
                    onChange={(e) => setPorcentajeRecargo(Number(e.target.value) || 0)}
                    disabled={saving}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: '#ffffff',
                        '& fieldset': { borderColor: COLORS.inputBorder },
                        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                      },
                    }}
                  />
                  <TextField
                    label="Descuento por rubro (%)"
                    type="number"
                    fullWidth
                    value={porcentajeDescuento}
                    onChange={(e) => setPorcentajeDescuento(Number(e.target.value) || 0)}
                    disabled={saving}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: '#ffffff',
                        '& fieldset': { borderColor: COLORS.inputBorder },
                        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                      },
                    }}
                  />
                  <TextField
                    select
                    label="Unidad de Medida"
                    fullWidth
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    disabled={saving}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: '#ffffff',
                        '& fieldset': { borderColor: COLORS.inputBorder },
                        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                      },
                    }}
                  >
                    {UNIDADES_MEDIDA.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {error && (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
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
                {saving ? 'Guardando…' : rubroEditando ? 'Actualizar Rubro' : 'Crear Rubro'}
              </CrystalButton>
            </Box>
          </DialogActions>
        </Box>
      </TexturedPanel >
    </Dialog >
  );
};

export default ModalEditarRubro;
