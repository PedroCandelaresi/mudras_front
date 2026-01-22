'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useMutation, useQuery, useApolloClient } from '@apollo/client/react';

import { Icon } from '@iconify/react';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { CREAR_ARTICULO, ACTUALIZAR_ARTICULO } from '@/components/articulos/graphql/mutations';
import { BUSCAR_ARTICULOS } from '@/components/articulos/graphql/queries';
import ModalSubirImagen from './ModalSubirImagen';
import { verdeMilitar } from '@/ui/colores';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import MenuItem from '@mui/material/MenuItem';
import { calcularPrecioVenta, obtenerCostoReferencia } from '@/utils/precioVenta';
import { OBTENER_PUNTOS_MUDRAS, OBTENER_STOCK_PUNTO_MUDRAS, BUSCAR_ARTICULOS_PARA_ASIGNACION } from '@/components/puntos-mudras/graphql/queries';
import { MODIFICAR_STOCK_PUNTO } from '@/components/puntos-mudras/graphql/mutations';

type FormState = {
  descripcion: string;
  codigo: string;
  imagenUrl: string; // Nuevo
  costo: string;
  porcentajeGanancia: string;
  rubroId: string; // soportado por ID
  idProveedor: string; // soportado por ID
  stock: string;
  stockMinimo: string;
  stockPorPunto: Record<string, string>; // { [puntoId]: stock }
};

interface ModalNuevoArticuloProps {
  open: boolean;
  onClose: () => void;
  articulo?: (
    Pick<
      Articulo,
      'id' | 'Descripcion' | 'Codigo' | 'PrecioVenta' | 'PrecioCompra' | 'PorcentajeGanancia' | 'AlicuotaIva' | 'StockMinimo' | 'Stock' | 'totalStock' | 'ImagenUrl'
    > & {
      rubro?: any;
      idProveedor?: number;
    }
  ) | null;
  onSuccess?: () => void;
  accentColor?: string;
}

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

const INITIAL_STATE: FormState = {
  descripcion: '',
  codigo: '',
  imagenUrl: '',
  costo: '',
  porcentajeGanancia: '0',
  rubroId: '',
  idProveedor: '',
  stock: '0',
  stockMinimo: '0',
  stockPorPunto: {},
};

// Medidas y layout heredados de ModalDetallesArticulo
const VH_MAX = 78;
const HEADER_H = 60;
const FOOTER_H = 60;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;

const parseNumericInput = (value: string) => {
  if (!value) return 0;
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const obtenerStockEditable = (articulo?: Articulo | null): number | null => {
  if (!articulo) return null;
  if (typeof articulo.totalStock === 'number' && Number.isFinite(articulo.totalStock)) {
    return articulo.totalStock;
  }
  const stockBase = (articulo as Articulo & { Stock?: number }).Stock;
  if (typeof stockBase === 'number' && Number.isFinite(stockBase)) {
    return stockBase;
  }
  const deposito = (articulo as Articulo & { Deposito?: number }).Deposito;
  if (typeof deposito === 'number' && Number.isFinite(deposito)) {
    return deposito;
  }
  return null;
};

const obtenerStockMinimoEditable = (articulo?: Articulo | null): number | null => {
  if (!articulo) return null;
  if (typeof articulo.StockMinimo === 'number' && Number.isFinite(articulo.StockMinimo)) {
    return articulo.StockMinimo;
  }
  const legacy = (articulo as Articulo & { stockMinimo?: number }).stockMinimo;
  if (typeof legacy === 'number' && Number.isFinite(legacy)) {
    return legacy;
  }
  return null;
};

type IvaOption = '0' | '10.5' | '21';
const IVA_OPTIONS: IvaOption[] = ['0', '10.5', '21'];

const ModalNuevoArticulo = ({ open, onClose, articulo, onSuccess, accentColor }: ModalNuevoArticuloProps) => {
  const COLORS = useMemo(() => makeColors(accentColor), [accentColor]);

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingStock, setLoadingStock] = useState(false);
  const client = useApolloClient();
  const [iva, setIva] = useState<IvaOption>('21');
  const [rubroInput, setRubroInput] = useState('');
  const [proveedorInput, setProveedorInput] = useState('');
  const costo = useMemo(() => parseNumericInput(form.costo), [form.costo]);
  const porcentajeGananciaValor = useMemo(() => parseNumericInput(form.porcentajeGanancia), [form.porcentajeGanancia]);

  const [crearArticulo] = useMutation(CREAR_ARTICULO, {
    refetchQueries: [{ query: BUSCAR_ARTICULOS }],
  });
  const [actualizarArticulo] = useMutation(ACTUALIZAR_ARTICULO, {
    refetchQueries: [{ query: BUSCAR_ARTICULOS }],
  });
  const [modificarStockPunto] = useMutation(MODIFICAR_STOCK_PUNTO);

  // Consultar puntos mudras
  const { data: dataPuntos } = useQuery(OBTENER_PUNTOS_MUDRAS);
  const puntosMudras = useMemo(() => (dataPuntos as any)?.obtenerPuntosMudras || [], [dataPuntos]);

  // Consultar stock actual por punto si estamos editando
  // Nota: Idealmente deberíamos tener una query que traiga el stock de UN artículo en TODOS los puntos.
  // Como no la tenemos a mano (y para evitar waterfalls complejos), inicializamos en 0 o necesitamos
  // iterar consultas. Para simplificar en este paso, si es nuevo artículo, stockPorPunto inicia en 0.
  // Si es edición, DEBERIAMOS cargar el stock actual.
  // Vamos a usar OBTENER_STOCK_PUNTO_MUDRAS para cargar, pero requiere iterar.
  // Como mejora UX inmediata, permitiremos asignar stock "addicional" o "setear" stock solo si el usuario lo toca.
  // Pero el requerimiento es "asignar el stock que corresponda". 
  // Si estamos en "Nuevo", todo es 0. Si es "Editar", mostrar lo que tiene es complejo sin la query adecuada.
  // Asumiremos que el usuario quiere ver los inputs vacíos o en 0 para *asignar* (sobrescribir) o *sumar*?
  // El modal original tenía un solo campo "Stock" que mapeaba a "TotalStock" o "Deposito".
  // Vamos a implementar la carga lazy o asumir 0 por ahora para desbloquear la UI, 
  // ya que la query OBTENER_STOCK_PUNTO_MUDRAS pide puntoId y devuelve TODOS los artículos. No es eficiente para 1 artículo.
  // PROPUESTA: Usar el campo `stock` global como "stock total" informativo, y los inputs por punto como overrides/asignaciones.

  // Opciones para selects (rubros y proveedores)
  const { data: rubrosData, loading: loadingRubros } = useQuery(GET_RUBROS, { fetchPolicy: 'cache-and-network' });
  const { data: proveedoresData, loading: loadingProveedores } = useQuery(GET_PROVEEDORES, { fetchPolicy: 'cache-and-network' });
  const rubros: Array<{ id: number; nombre: string; codigo?: string; porcentajeRecargo?: number; porcentajeDescuento?: number }> = useMemo(
    () => ((rubrosData as any)?.obtenerRubros ?? []) as Array<{ id: number; nombre: string; codigo?: string; porcentajeRecargo?: number; porcentajeDescuento?: number }>,
    [rubrosData]
  );
  const proveedores: Array<{ IdProveedor: number; Nombre?: string; PorcentajeRecargoProveedor?: number; PorcentajeDescuentoProveedor?: number }> = useMemo(
    () => ((proveedoresData as any)?.proveedores ?? []) as Array<{ IdProveedor: number; Nombre?: string; PorcentajeRecargoProveedor?: number; PorcentajeDescuentoProveedor?: number }>,
    [proveedoresData]
  );
  const selectedRubro = useMemo(() => {
    const id = Number(form.rubroId);
    if (Number.isFinite(id) && id > 0) {
      return rubros.find((r) => r.id === id);
    }
    return undefined;
  }, [form.rubroId, rubros]);

  const selectedProveedor = useMemo(() => {
    const id = Number(form.idProveedor);
    if (Number.isFinite(id) && id > 0) {
      return proveedores.find((p) => p.IdProveedor === id);
    }
    return undefined;
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
    setRubroInput((articulo as any)?.rubro?.Rubro || (articulo as any)?.Rubro || '');
    setProveedorInput((articulo as any)?.proveedor?.Nombre || '');
    if (!articulo) {
      setForm(INITIAL_STATE);
      setIva('21');
      return;
    }

    const costoReferencia = obtenerCostoReferencia(articulo);
    const stockActual = obtenerStockEditable(articulo);
    const stockMinimoActual = obtenerStockMinimoEditable(articulo);
    setForm({
      descripcion: (articulo.Descripcion ?? '').toString(),
      codigo: (articulo.Codigo ?? '').toString(),
      imagenUrl: (articulo.ImagenUrl ?? '').toString(),
      costo: costoReferencia ? String(costoReferencia) : '',
      porcentajeGanancia: articulo.PorcentajeGanancia != null ? String(articulo.PorcentajeGanancia) : '0',
      rubroId: (() => {
        if ((articulo as any)?.rubro?.Id != null) return String((articulo as any).rubro.Id);
        if ((articulo as any)?.rubroId != null) return String((articulo as any).rubroId);
        // Fallback name lookup
        const nombreR = (articulo as any)?.rubro?.Rubro || (articulo as any)?.Rubro;
        if (nombreR && rubros.length > 0) {
          const match = rubros.find(r => r.nombre.toLowerCase() === nombreR.toString().toLowerCase());
          if (match) return String(match.id);
        }
        return '';
      })(),
      idProveedor: (() => {
        if (articulo.idProveedor != null) return String(articulo.idProveedor);
        if ((articulo as any)?.proveedor?.IdProveedor != null) return String((articulo as any).proveedor.IdProveedor);
        // Fallback name lookup
        const nombreP = (articulo as any)?.proveedor?.Nombre;
        if (nombreP && proveedores.length > 0) {
          const match = proveedores.find(p => (p.Nombre || '').toLowerCase() === nombreP.toString().toLowerCase());
          if (match) return String(match.IdProveedor);
        }
        return '';
      })(),
      stock: stockActual != null ? String(stockActual) : '0',
      stockMinimo: stockMinimoActual != null ? String(stockMinimoActual) : '0',
      stockPorPunto: {}, // TODO: Cargar stock real por punto si es edición
    });
    const alic = articulo.AlicuotaIva;
    if (alic === 10.5 || alic === 21 || alic === 0) {
      setIva(String(alic) as IvaOption);
    } else {
      setIva('21');
    }

    // Cargar stock por punto si es edición
    if (articulo.id && puntosMudras.length > 0) {
      setLoadingStock(true);
      const buscarStockEnPuntos = async () => {
        try {
          const promises = puntosMudras.map(async (punto: any) => {
            // Usamos BUSCAR_ARTICULOS_PARA_ASIGNACION filtrando por punto y buscando por código o nombre
            // Esto es más eficiente que traer todo el stock del punto
            const busqueda = articulo.Codigo || articulo.Descripcion;
            if (!busqueda) return null;

            const { data } = await client.query<any>({
              query: BUSCAR_ARTICULOS_PARA_ASIGNACION,
              variables: {
                destinoId: Number(punto.id),
                busqueda: busqueda.toString(),
                rubro: '',
                proveedorId: null
              },
              fetchPolicy: 'network-only' // Para asegurar dato fresco
            });

            const encontrados = data?.buscarArticulosParaAsignacion || [];
            // Buscamos el artículo exacto por ID
            const match = encontrados.find((a: any) => Number(a.id) === Number(articulo.id));

            if (match) {
              return { puntoId: punto.id, cantidad: match.stockEnDestino ?? 0 };
            }
            return null;
          });

          const results = await Promise.all(promises);

          const nuevoStockPorPunto: Record<string, string> = {};
          results.forEach(res => {
            if (res) {
              nuevoStockPorPunto[res.puntoId] = String(res.cantidad);
            }
          });

          setForm(prev => ({
            ...prev,
            stockPorPunto: { ...prev.stockPorPunto, ...nuevoStockPorPunto }
          }));

        } catch (err) {
          console.error("Error cargando stock por punto:", err);
        } finally {
          setLoadingStock(false);
        }
      };
      buscarStockEnPuntos();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, articulo?.id, puntosMudras, rubros, proveedores]); // Agregamos puntosMudras, rubros, proveedores a la dependencia

  useEffect(() => {
    if (!open) return;
    if (selectedRubro) {
      const label = `${selectedRubro.nombre}${selectedRubro.codigo ? ` (${selectedRubro.codigo})` : ''}`;
      if (label && label !== rubroInput) setRubroInput(label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedRubro?.id, selectedRubro?.nombre, selectedRubro?.codigo]);

  useEffect(() => {
    if (!open) return;
    if (selectedProveedor) {
      const label = selectedProveedor.Nombre || `Proveedor #${selectedProveedor.IdProveedor}`;
      if (label && label !== proveedorInput) setProveedorInput(label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedProveedor?.IdProveedor, selectedProveedor?.Nombre]);

  const rubroOptions = useMemo(() => {
    const min = rubroInput.trim().length >= 1;
    const filtered = min
      ? rubros.filter((r) => `${r.nombre} ${r.codigo ?? ''}`.toLowerCase().includes(rubroInput.trim().toLowerCase()))
      : rubros;
    const alreadyIn = filtered.some((r) => r.id === selectedRubro?.id);
    if (selectedRubro && !alreadyIn) return [selectedRubro, ...filtered];
    if (selectedRubro && !filtered.length) return [selectedRubro];
    return filtered;
  }, [rubroInput, rubros, selectedRubro]);

  const proveedorOptions = useMemo(() => {
    const min = proveedorInput.trim().length >= 1;
    const filtered = min
      ? proveedores.filter((p) => `${p.Nombre ?? ''} ${p.IdProveedor}`.toLowerCase().includes(proveedorInput.trim().toLowerCase()))
      : proveedores;
    const alreadyIn = filtered.some((p) => p.IdProveedor === selectedProveedor?.IdProveedor);
    if (selectedProveedor && !alreadyIn) return [selectedProveedor, ...filtered];
    if (selectedProveedor && !filtered.length) return [selectedProveedor];
    return filtered;
  }, [proveedorInput, proveedores, selectedProveedor]);

  const handleNumericChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Permitir solo números y un punto o coma decimal
    if (value === '' || /^\d+[.,]?\d*$/.test(value)) {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = event.target;

    if (name === 'codigo') {
      value = value.toUpperCase();
    } else if (name === 'descripcion') {
      if (value.length > 0) {
        value = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }

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
      const idProveedor = form.idProveedor !== '' && !Number.isNaN(Number(form.idProveedor)) ? Number(form.idProveedor) : undefined;
      const stock = form.stock !== '' && !Number.isNaN(Number(form.stock)) ? Number(form.stock) : 0;
      const stockMinimo = form.stockMinimo !== '' && !Number.isNaN(Number(form.stockMinimo)) ? Number(form.stockMinimo) : 0;
      const rubroIdNumber = form.rubroId !== '' && !Number.isNaN(Number(form.rubroId)) ? Number(form.rubroId) : undefined;
      const precioVentaCalculado = precioCalculado > 0 ? precioCalculado : costo;

      const shouldSendPrecioCompra = !editando || Math.abs(costo - costoReferenciaOriginal) > 0.0001;
      const rubroNombre =
        (selectedRubro?.nombre ? selectedRubro.nombre.trim() : undefined) ||
        (articulo?.rubro?.Rubro ? articulo.rubro.Rubro.trim() : undefined);

      const common = {
        Codigo: form.codigo.trim(),
        Descripcion: form.descripcion.trim(),
        ImagenUrl: form.imagenUrl,
        precioVenta: precioVentaCalculado,
        ...(shouldSendPrecioCompra ? { PrecioCompra: costo } : {}),
        PorcentajeGanancia: porcentajeGananciaValor,
        stock, // Este es el stock global legacy, se mantiene por compatibilidad
        stockMinimo,
        AlicuotaIva: Number(iva),
        ImpuestoPorcentual: true,
        ...(rubroNombre ? { Rubro: rubroNombre } : {}),
        ...(typeof rubroIdNumber === 'number' ? { rubroId: rubroIdNumber } : {}),
        ...(typeof idProveedor === 'number' ? { idProveedor } : {}),
      } as const;

      let articuloGuardadoId = articulo?.id;

      if (editando && articulo?.id) {
        await actualizarArticulo({ variables: { actualizarArticuloDto: { id: Number(articulo.id), ...common } } });
      } else {
        const { data } = await crearArticulo({ variables: { crearArticuloDto: common } });
        articuloGuardadoId = (data as any)?.crearArticulo?.id;
      }

      // ASIGNACIÓN DE STOCK POR PUNTO
      if (articuloGuardadoId) {
        const promesasTicket = Object.entries(form.stockPorPunto).map(async ([puntoId, cantidadStr]) => {
          const cant = parseFloat(cantidadStr);
          if (!isNaN(cant) && cant > 0) { // Solo enviamos si hay cantidad positiva explícita
            await modificarStockPunto({
              variables: {
                puntoMudrasId: Number(puntoId),
                articuloId: Number(articuloGuardadoId),
                nuevaCantidad: cant
              }
            });
          }
        });
        await Promise.all(promesasTicket);
      }

      onSuccess?.();
      onClose();
    } catch (e: any) {
      console.error(e);
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
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 0,
          bgcolor: '#ffffff',
          boxShadow: 'none',
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
        <DialogTitle sx={{
          p: 2,
          m: 0,
          minHeight: HEADER_H,
          display: 'flex',
          alignItems: 'center',
          bgcolor: COLORS.primary,
          color: '#fff'
        }}>
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="h6" fontWeight={700}>
                {titulo}
              </Typography>
              {articulo?.Descripcion && (
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  {articulo.Descripcion}
                </Typography>
              )}
            </Box>

            <Box sx={{ ml: 'auto' }}>
              <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
                <Icon icon="mdi:close" width={24} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            p: 0,
            overflow: 'auto',
            maxHeight: CONTENT_MAX,
            background: '#f8fafb',
          }}
        >
          <Box sx={{ p: { xs: 3, md: 4 }, display: 'grid', gap: 2 }}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
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
                  borderRadius: 0,
                  background: '#ffffff',
                  '& fieldset': { borderColor: COLORS.inputBorder },
                  '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                },
              }}
            />

            <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' }, display: 'flex', alignItems: 'center', gap: 2 }}>
              {form.imagenUrl ? (
                <Box sx={{ position: 'relative', width: 80, height: 80, borderRadius: 0, overflow: 'hidden', border: '1px solid #ddd' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(() => {
                      const url = form.imagenUrl;
                      if (!url) return '';
                      if (url.startsWith('http') || url.startsWith('data:')) return url;
                      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
                      return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
                    })()}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'; // Ocultar si falla
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ width: 80, height: 80, borderRadius: 0, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon="mdi:image-off-outline" color="#aaa" width={24} />
                </Box>
              )}
              <Button
                variant="outlined"
                onClick={() => setModalUploadOpen(true)}
                startIcon={<Icon icon="mdi:camera" />}
                sx={{ borderRadius: 0, textTransform: 'none' }}
              >
                {form.imagenUrl ? 'Cambiar Imagen' : 'Agregar Imagen'}
              </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              <Autocomplete
                options={rubroOptions}
                loading={loadingRubros}
                value={selectedRubro ?? null}
                inputValue={rubroInput}
                onInputChange={(_, val) => {
                  if (val === rubroInput) return;
                  setRubroInput(val);
                }}
                onChange={(_, val) => {
                  setForm((prev) => ({ ...prev, rubroId: val ? String(val.id) : '' }));
                  setRubroInput(val ? `${val.nombre}${val.codigo ? ` (${val.codigo})` : ''}` : '');
                }}
                getOptionLabel={(option) => `${option.nombre}${option.codigo ? ` (${option.codigo})` : ''}`}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                disableClearable={false}
                fullWidth
                renderOption={(props, option) => (
                  <li {...props} key={`rubro-${option.id}`}>
                    {`${option.nombre}${option.codigo ? ` (${option.codigo})` : ''}`}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rubro"
                    placeholder="Empezá a escribir para buscar"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        background: '#ffffff',
                        '& fieldset': { borderColor: COLORS.inputBorder },
                        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                      },
                    }}
                  />
                )}
              />

              <Autocomplete
                options={proveedorOptions}
                loading={loadingProveedores}
                value={selectedProveedor ?? null}
                inputValue={proveedorInput}
                onInputChange={(_, val) => {
                  if (val === proveedorInput) return;
                  setProveedorInput(val);
                }}
                onChange={(_, val) => {
                  setForm((prev) => ({ ...prev, idProveedor: val ? String(val.IdProveedor) : '' }));
                  setProveedorInput(val ? (val.Nombre || `Proveedor #${val.IdProveedor}`) : '');
                }}
                getOptionLabel={(option) => option.Nombre || `Proveedor #${option.IdProveedor}`}
                isOptionEqualToValue={(opt, val) => opt.IdProveedor === val.IdProveedor}
                disableClearable={false}
                fullWidth
                renderOption={(props, option) => (
                  <li {...props} key={`prov-${option.IdProveedor}`}>
                    {option.Nombre || `Proveedor #${option.IdProveedor}`}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Proveedor"
                    placeholder="Empezá a escribir para buscar"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        background: '#ffffff',
                        '& fieldset': { borderColor: COLORS.inputBorder },
                        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                      },
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              <TextField
                label="Costo / Precio compra"
                name="costo"
                value={form.costo}
                onChange={handleNumericChange}
                inputMode="decimal"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
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
                onChange={handleNumericChange}
                inputMode="decimal"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
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
                    borderRadius: 0,
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
                  borderRadius: 0,
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
                label="Stock total / Inicial"
                name="stock"
                value={form.stock}
                onChange={handleNumericChange}
                inputMode="decimal"
                fullWidth
                // Si se quiere bloquear en edición, usar: disabled={editando}
                // El usuario pidió ingresar cantidad inicial, así que lo habilitamos.
                helperText="Stock global inicial"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
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
                onChange={handleNumericChange}
                inputMode="decimal"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    background: '#ffffff',
                    '& fieldset': { borderColor: COLORS.inputBorder },
                    '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
                    '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                  },
                }}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color={COLORS.textStrong}>
                  Distribución de Stock
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Global: <strong>{form.stock || 0}</strong>
                  </Typography>
                  <Typography variant="caption" color={
                    (Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0) > (parseFloat(form.stock) || 0))
                      ? 'error.main'
                      : 'success.main'
                  }>
                    Asignado: <strong>{Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Restante: <strong>{Math.max(0, (parseFloat(form.stock) || 0) - Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0))}</strong>
                  </Typography>
                </Box>
              </Box>

              {(!puntosMudras || puntosMudras.length === 0) ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No hay puntos de venta/depósitos disponibles para asignar stock.
                </Typography>
              ) : loadingStock ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${COLORS.inputBorder}`, borderRadius: 0 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(COLORS.primary, 0.05) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: COLORS.textStrong }}>Punto / Depósito</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: COLORS.textStrong, width: 150 }}>Cantidad Asignada</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {puntosMudras.map((punto: any) => {
                        const stockGlobal = parseFloat(form.stock) || 0;
                        const asignadoTotal = Object.entries(form.stockPorPunto).reduce((acc, [id, val]) => acc + (parseFloat(val) || 0), 0);
                        const asignadoEstePunto = parseFloat(form.stockPorPunto[punto.id] || '0');
                        const restanteGlobal = Math.max(0, stockGlobal - (asignadoTotal - asignadoEstePunto));

                        return (
                          <TableRow key={punto.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                              <Typography variant="body2" color="text.primary">
                                {punto.nombre}
                              </Typography>
                              {punto.esDeposito && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  (Depósito)
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                value={form.stockPorPunto[punto.id] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;

                                  // Check regex before updating
                                  if (val !== '' && !/^\d+[.,]?\d*$/.test(val)) return;

                                  const numVal = parseFloat(val);

                                  // Validación: No permitir ingresar más de lo restante
                                  if (!isNaN(numVal) && numVal > restanteGlobal) {
                                    // Implementación: Bloquear si excede.
                                    return;
                                  }

                                  setForm(prev => ({
                                    ...prev,
                                    stockPorPunto: {
                                      ...prev.stockPorPunto,
                                      [punto.id]: val
                                    }
                                  }));
                                }}
                                inputMode="decimal"
                                size="small"
                                placeholder="0"
                                InputProps={{
                                  sx: {
                                    borderRadius: 1,
                                    '& input': { textAlign: 'right', py: 0.5 }
                                  }
                                }}
                                disabled={stockGlobal <= 0} // Deshabilitar si no hay stock global
                                sx={{ width: '100%' }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    {/* Fila de resumen si se desea, por ahora el header tiene los totales */}
                  </Table>
                </TableContainer>
              )}
            </Box>

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, bgcolor: '#ffffff' }}>
          <Button onClick={handleClose} disabled={saving} sx={{ color: 'text.secondary' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!botonHabilitado}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Icon icon="mdi:content-save" />}
            sx={{
              px: 4,
              bgcolor: COLORS.primary,
              color: '#fff',
              '&:hover': { bgcolor: COLORS.primaryHover }
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
      <ModalSubirImagen
        open={modalUploadOpen}
        onClose={() => setModalUploadOpen(false)}
        onUploadSuccess={(url) => setForm(prev => ({ ...prev, imagenUrl: url }))}
      />
    </Dialog >
  );
};

export default ModalNuevoArticulo;
