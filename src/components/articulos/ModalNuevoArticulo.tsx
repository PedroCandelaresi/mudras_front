'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useMutation, useQuery } from '@apollo/client/react';

import type { Articulo } from '@/app/interfaces/mudras.types';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { CREAR_ARTICULO, ACTUALIZAR_ARTICULO } from '@/components/articulos/graphql/mutations';
import { verde as verdePalette } from '@/ui/colores';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import MenuItem from '@mui/material/MenuItem';
import { Icon } from '@iconify/react';
import { calcularPrecioVenta, obtenerCostoReferencia } from '@/utils/precioVenta';

type FormState = {
  descripcion: string;
  codigo: string;
  costo: string;
  porcentajeGanancia: string;
  rubroId: string; // soportado por ID
  idProveedor: string; // soportado por ID
  stock: string;
  stockMinimo: string;
};

interface ModalNuevoArticuloProps {
  open: boolean;
  onClose: () => void;
  articulo?: (
    Pick<Articulo, 'id' | 'Descripcion' | 'Codigo' | 'PrecioVenta' | 'PrecioCompra' | 'PorcentajeGanancia' | 'AlicuotaIva'> & {
      rubro?: any;
      idProveedor?: number;
    }
  ) | null;
  onSuccess?: () => void;
  accentColor?: string;
}

const makeColors = (base?: string) => {
  const primary = base || verdePalette.primary || '#2b4735';
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.35),
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
  };
};

const INITIAL_STATE: FormState = {
  descripcion: '',
  codigo: '',
  costo: '',
  porcentajeGanancia: '0',
  rubroId: '',
  idProveedor: '',
  stock: '0',
  stockMinimo: '0',
};

// === Layout similar a ModalEditarRubro ===
const VH_MAX = 78;
const HEADER_H = 88;
const FOOTER_H = 96;
const DIV_H = 3;

const parseNumericInput = (value: string) => {
  if (!value) return 0;
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

type IvaOption = '0' | '10.5' | '21';
const IVA_OPTIONS: IvaOption[] = ['0', '10.5', '21'];

const ModalNuevoArticulo = ({ open, onClose, articulo, onSuccess, accentColor }: ModalNuevoArticuloProps) => {
  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [iva, setIva] = useState<IvaOption>('21');
  const costo = useMemo(() => parseNumericInput(form.costo), [form.costo]);
  const porcentajeGananciaValor = useMemo(() => parseNumericInput(form.porcentajeGanancia), [form.porcentajeGanancia]);

  const [crearArticulo] = useMutation(CREAR_ARTICULO);
  const [actualizarArticulo] = useMutation(ACTUALIZAR_ARTICULO);

  // Opciones para selects (rubros y proveedores)
  const { data: rubrosData, loading: loadingRubros } = useQuery(GET_RUBROS, { fetchPolicy: 'cache-and-network' });
  const { data: proveedoresData, loading: loadingProveedores } = useQuery(GET_PROVEEDORES, { fetchPolicy: 'cache-and-network' });
  const rubros: Array<{ id: number; nombre: string; codigo?: string; porcentajeRecargo?: number; porcentajeDescuento?: number }> = useMemo(
    () => ((rubrosData as any)?.obtenerRubros ?? []) as Array<{ id: number; nombre: string; codigo?: string; porcentajeRecargo?: number; porcentajeDescuento?: number }> ,
    [rubrosData]
  );
  const proveedores: Array<{ IdProveedor: number; Nombre?: string; PorcentajeRecargoProveedor?: number; PorcentajeDescuentoProveedor?: number }> = useMemo(
    () => ((proveedoresData as any)?.proveedores ?? []) as Array<{ IdProveedor: number; Nombre?: string; PorcentajeRecargoProveedor?: number; PorcentajeDescuentoProveedor?: number }>,
    [proveedoresData]
  );
  const selectedRubro = useMemo(() => {
    const id = Number(form.rubroId);
    if (!Number.isFinite(id)) return undefined;
    return rubros.find((r) => r.id === id);
  }, [form.rubroId, rubros]);
  const selectedProveedor = useMemo(() => {
    const id = Number(form.idProveedor);
    if (!Number.isFinite(id)) return undefined;
    return proveedores.find((p) => p.IdProveedor === id);
  }, [form.idProveedor, proveedores]);

  const precioCalculado = useMemo(
    () =>
      calcularPrecioVenta({
        costo,
        porcentajeGanancia: porcentajeGananciaValor,
        iva: Number(iva),
        rubroRecargo: selectedRubro?.porcentajeRecargo,
        rubroDescuento: selectedRubro?.porcentajeDescuento,
        proveedorRecargo: selectedProveedor?.PorcentajeRecargoProveedor,
        proveedorDescuento: selectedProveedor?.PorcentajeDescuentoProveedor,
      }),
    [costo, porcentajeGananciaValor, iva, selectedRubro, selectedProveedor]
  );

  const editando = Boolean(articulo?.id);
  const titulo = editando ? 'Editar artículo' : 'Nuevo artículo';

  const costoReferenciaOriginal = useMemo(() => (articulo ? obtenerCostoReferencia(articulo) : 0), [articulo]);

  useEffect(() => {
    if (!open) return;
    setError('');
    setSaving(false);
    const costoReferencia = articulo ? obtenerCostoReferencia(articulo) : 0;
    setForm({
      descripcion: (articulo?.Descripcion ?? '').toString(),
      codigo: (articulo?.Codigo ?? '').toString(),
      costo: costoReferencia ? String(costoReferencia) : '',
      porcentajeGanancia: articulo?.PorcentajeGanancia != null ? String(articulo.PorcentajeGanancia) : '0',
      rubroId: (articulo as any)?.rubro?.Id != null ? String((articulo as any).rubro.Id) : '',
      idProveedor: articulo?.idProveedor != null ? String(articulo.idProveedor) : '',
      stock: '0',
      stockMinimo: '0',
    });
    const alic = (articulo as any)?.AlicuotaIva;
    if (alic === 10.5 || alic === 21 || alic === 0) {
      setIva(String(alic) as IvaOption);
    } else {
      setIva('21');
    }
  }, [open, articulo]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [saving, onClose]);

  const handleSave = async () => {
    if (!form.descripcion.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Parseos numéricos seguros
      const rubroId = form.rubroId !== '' && !Number.isNaN(Number(form.rubroId)) ? Number(form.rubroId) : undefined;
      const idProveedor = form.idProveedor !== '' && !Number.isNaN(Number(form.idProveedor)) ? Number(form.idProveedor) : undefined;
      const stock = form.stock !== '' && !Number.isNaN(Number(form.stock)) ? Number(form.stock) : 0;
      const stockMinimo = form.stockMinimo !== '' && !Number.isNaN(Number(form.stockMinimo)) ? Number(form.stockMinimo) : 0;
      const precioVentaCalculado = precioCalculado > 0 ? precioCalculado : costo;

      const shouldSendPrecioCompra = !editando || Math.abs(costo - costoReferenciaOriginal) > 0.0001;
      const common = {
        Codigo: form.codigo.trim(),
        Descripcion: form.descripcion.trim(),
        precioVenta: precioVentaCalculado,
        ...(shouldSendPrecioCompra ? { PrecioCompra: costo } : {}),
        PorcentajeGanancia: porcentajeGananciaValor,
        stock,
        stockMinimo,
        AlicuotaIva: Number(iva),
        ImpuestoPorcentual: true,
        ...(typeof rubroId === 'number' ? { rubroId } : {}),
        ...(typeof idProveedor === 'number' ? { idProveedor } : {}),
      } as const;

      if (editando && articulo?.id) {
        await actualizarArticulo({ variables: { actualizarArticuloDto: { id: Number(articulo.id), ...common } } });
      } else {
        await crearArticulo({ variables: { crearArticuloDto: common } });
      }

      onSuccess?.();
      onClose();
    } catch (e) {
      setError('Ocurrió un error al guardar el artículo.');
    } finally {
      setSaving(false);
    }
  };

  const botonHabilitado = form.descripcion.trim().length > 0 && form.costo.trim().length > 0 && !saving;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', bgcolor: 'transparent', overflow: 'hidden' } }}
    >
      <TexturedPanel accent={COLORS.primary} radius={12} contentPadding={0}>
        <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', px: 3, py: 2.25, gap: 2 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)', color: '#fff'
            }}>
              <Icon icon={articulo ? 'mdi:cube-edit-outline' : 'mdi:cube-outline'} width={22} height={22} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography variant="h6" fontWeight={700} color="white" sx={{ textShadow: '0 4px 12px rgba(0,0,0,0.88), 0 0 2px rgba(0,0,0,0.72)' }}>
                {titulo}
              </Typography>
              {articulo?.Descripcion && (
                <Typography variant="subtitle2" color="rgba(255,255,255,0.85)" fontWeight={700} sx={{ textShadow: '0 3px 9px rgba(0,0,0,0.82), 0 0 1px rgba(0,0,0,0.7)' }}>
                  {articulo.Descripcion}
                </Typography>
              )}
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <CrystalSoftButton baseColor={COLORS.primary} onClick={handleClose} title="Cerrar" sx={{ width: 40, height: 40, minWidth: 40, p: 0, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <Icon icon="mdi:close" color="#fff" width={22} height={22} />
              </CrystalSoftButton>
            </Box>
          </Box>
        </DialogTitle>
        <Divider sx={{
          height: DIV_H,
          border: 0,
          backgroundImage: `
            linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
            linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
            linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
          `,
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          backgroundSize: '100% 1px, 100% 1px, 100% 100%',
          backgroundPosition: 'top left, bottom left, center'
        }} />
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 1 }}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              fullWidth
              required
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
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              fullWidth
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              <TextField
                select
                label="Rubro"
                name="rubroId"
                value={form.rubroId}
                onChange={handleChange}
                fullWidth
                placeholder="Seleccione un rubro"
                disabled={loadingRubros}
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
                <MenuItem value="">Sin rubro</MenuItem>
                {rubros.map((r) => (
                  <MenuItem key={r.id} value={String(r.id)}>
                    {r.nombre} {r.codigo ? `(${r.codigo})` : ''}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Proveedor"
                name="idProveedor"
                value={form.idProveedor}
                onChange={handleChange}
                fullWidth
                placeholder="Seleccione un proveedor"
                disabled={loadingProveedores}
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
                <MenuItem value="">Sin proveedor</MenuItem>
                {proveedores.map((p) => (
                  <MenuItem key={p.IdProveedor} value={String(p.IdProveedor)}>
                    {p.Nombre || `Proveedor #${p.IdProveedor}`}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              <TextField
                label="Costo / Precio compra"
                name="costo"
                value={form.costo}
                onChange={handleChange}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
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
                label="% de ganancia"
                name="porcentajeGanancia"
                value={form.porcentajeGanancia}
                onChange={handleChange}
                type="number"
                fullWidth
                inputProps={{ step: 0.1 }}
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 220px) 1fr' }, gap: 1.5, alignItems: 'stretch' }}>
              <TextField
                select
                label="IVA"
                value={iva}
                onChange={(e) => setIva(e.target.value as IvaOption)}
                fullWidth
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
                {IVA_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {Number(option).toString().replace('.', ',')}%
                  </MenuItem>
                ))}
              </TextField>
              <Box
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.9)',
                  border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.6)',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                <Typography variant="caption" color={COLORS.textStrong}>
                  Precio de venta estimado (IVA incl.)
                </Typography>
                <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
                  ${precioCalculado.toLocaleString('es-AR')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ganancia {porcentajeGananciaValor}% · IVA {Number(iva).toString().replace('.', ',')}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Rubro: +{selectedRubro?.porcentajeRecargo ?? 0}% / -{selectedRubro?.porcentajeDescuento ?? 0}% · Proveedor: +
              {selectedProveedor?.PorcentajeRecargoProveedor ?? 0}% / -
              {selectedProveedor?.PorcentajeDescuentoProveedor ?? 0}%
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              <TextField
                label="Stock"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
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
                label="Stock mínimo"
                name="stockMinimo"
                value={form.stockMinimo}
                onChange={handleChange}
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
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

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <Divider sx={{
          height: DIV_H,
          border: 0,
          backgroundImage: `
            linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
            linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
            linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
          `,
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          backgroundSize: '100% 1px, 100% 1px, 100% 100%',
          backgroundPosition: 'top left, bottom left, center'
        }} />
        <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 3, py: 2.5, gap: 1.5 }}>
            <CrystalSoftButton baseColor={COLORS.primary} onClick={handleClose} disabled={saving}>
              Cancelar
            </CrystalSoftButton>
            <CrystalButton baseColor={COLORS.primary} onClick={handleSave} disabled={!botonHabilitado}>
              {saving ? 'Guardando…' : editando ? 'Actualizar Artículo' : 'Crear Artículo'}
            </CrystalButton>
          </Box>
        </DialogActions>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalNuevoArticulo;
