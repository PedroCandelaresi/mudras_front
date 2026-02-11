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
  IconButton,
  Tooltip,
  Chip
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
import { AJUSTAR_STOCK } from '@/components/stock/graphql/mutations';
import { usePermisos } from '@/lib/permisos';

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

  const { tienePermiso } = usePermisos();
  const canEditInfo = tienePermiso('productos:update:info');
  const canEditPrecios = tienePermiso('productos:update:precios');
  const canEditCostos = tienePermiso('productos:update:costos');
  const canEditStock = tienePermiso('productos:update:stock');

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
  const [ajustarStock] = useMutation(AJUSTAR_STOCK);

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
      return rubros.find((r) => Number(r.id) === id);
    }
    return undefined;
  }, [form.rubroId, rubros]);

  const selectedProveedor = useMemo(() => {
    const id = Number(form.idProveedor);
    if (Number.isFinite(id) && id > 0) {
      return proveedores.find((p) => Number(p.IdProveedor) === id);
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
          let sumaTotal = 0;

          results.forEach(res => {
            if (res) {
              nuevoStockPorPunto[res.puntoId] = String(res.cantidad);
              sumaTotal += res.cantidad;
            }
          });

          setForm(prev => ({
            ...prev,
            stock: String(sumaTotal), // Actualizamos el stock global con la suma real
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
      const idProveedor = form.idProveedor !== '' && !Number.isNaN(Number(form.idProveedor))
        ? Number(form.idProveedor)
        : (editando ? null : undefined);
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
        ...(typeof idProveedor === 'number' || idProveedor === null ? { idProveedor } : {}),
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
            await ajustarStock({
              variables: {
                input: {
                  puntoMudrasId: Number(puntoId),
                  articuloId: Number(articuloGuardadoId),
                  nuevaCantidad: cant,
                  motivo: 'Stock Inicial nuevo artículo'
                }
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

  const botonHabilitado = useMemo(() => {
    // Validaciones básicas
    if (!form.descripcion.trim()) return false;
    if (!form.costo.trim()) return false;
    if (saving) return false;

    // Validación de STOCK
    const stockTotal = parseNumericInput(form.stock);
    if (stockTotal > 0) {
      const asignadoTotal = Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
      // Debe estar completamente asignado (con margen de error por float)
      if (Math.abs(stockTotal - asignadoTotal) > 0.01) {
        return false;
      }
    }

    return true;
  }, [form, saving]);

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

            <TextField
              label="Stock Mínimo (Alerta crítica)"
              name="stockMinimo"
              value={form.stockMinimo}
              onChange={handleNumericChange}
              inputMode="decimal"
              fullWidth
              helperText="Se mostrará una alerta cuando el stock global sea menor o igual a este valor"
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

            {/* STOCK DISTRIBUTION UI */}
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' }, mt: 2, p: 3, bgcolor: '#f9fafb', border: `1px solid ${alpha(COLORS.primary, 0.1)}`, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} color={COLORS.textStrong} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="mdi:dolly" />
                DISTRIBUCIÓN DE STOCK INICIAL
              </Typography>

              {/* Global Input */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Paso 1: Definir Total a Ingresar
                </Typography>
                <TextField
                  fullWidth
                  name="stock"
                  value={form.stock}
                  onChange={handleNumericChange}
                  placeholder="0"
                  disabled={!canEditStock}
                  InputProps={{
                    sx: { fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary, bgcolor: '#fff', textAlign: 'center' }
                  }}
                  sx={{ mb: 1 }}
                />

                {/* Metrics */}
                <Box display="flex" justifyContent="space-between" mt={1} px={1}>
                  <Box>
                    <Typography variant="caption" display="block" fontWeight={600} color="text.secondary">ASIGNADO</Typography>
                    <Typography variant="h6" fontWeight={700} color={
                      (() => {
                        const total = parseNumericInput(form.stock);
                        const asignado = Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
                        return asignado > total ? 'error.main' : 'text.primary';
                      })()
                    }>
                      {Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" display="block" fontWeight={600} color="text.secondary">RESTANTE</Typography>
                    <Typography variant="h6" fontWeight={700} color={
                      (() => {
                        const total = parseNumericInput(form.stock);
                        const asignado = Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
                        const restante = Math.max(0, total - asignado);
                        return restante === 0 && total > 0 ? 'success.main' : 'text.primary';
                      })()
                    }>
                      {Math.max(0, parseNumericInput(form.stock) - Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0))}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Points List */}
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Paso 2: Distribuir por Punto
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loadingStock ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  puntosMudras
                    .filter((p: any) => p.activo)
                    .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre))
                    .map((punto: any) => {
                      const valStr = form.stockPorPunto[punto.id] || '';
                      const stockTotal = parseNumericInput(form.stock);
                      const asignadoTotal = Object.values(form.stockPorPunto).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
                      const currentVal = parseFloat(valStr || '0');
                      const restante = Math.max(0, stockTotal - asignadoTotal);

                      // Stock actual en DB (si editamos)
                      // Nota: stockPorPunto NO tiene el stock actual, tiene la asignación NUEVA.
                      // Deberíamos mostrar el stock actual visualmente pero no sumarlo a la asignación de ingreso.
                      // El requerimiento original era "asignar el stock global... a los distintos puntos".
                      // En creación: stock global es lo que entra.
                      // En edición: stock global podría ser aumentar stock?
                      // El modal original tenía "Stock" que mapeaba a `stock` field.
                      // Asumiremos que este input "stockPorPunto" es para ASIGNAR EL VALOR INGRESADO EN "STOCK TOTAL".

                      return (
                        <Paper key={punto.id} elevation={0} sx={{ p: 2, border: `1px solid ${COLORS.inputBorder}`, bgcolor: '#fff', borderRadius: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Icon icon={punto.tipo === 'deposito' ? 'mdi:warehouse' : 'mdi:store'} width={20} color={COLORS.primary} />
                                <Typography variant="subtitle2" fontWeight={700}>{punto.nombre}</Typography>
                              </Box>
                              {editando && (
                                <Typography variant="caption" color="text.secondary">
                                  {/* Aquí idealmente mostraríamos el stock actual que trajimos en useEffect */}
                                  Stock actual: {
                                    // Recuperar valor original si lo tenemos, o fallback a lo que sea
                                    // Como no tenemos el stock 'original' por punto guardado en state separado fácilmente accesible aquí sin recorrer,
                                    // simplificamos. En el useEffect de carga poblamos `stockPorPunto` con el actual? 
                                    // Si poblamos `stockPorPunto` con el actual, entonces `form.stock` debería ser la SUMA de stocks actuales?
                                    // REVISAR LOGICA DE CARGA:
                                    // En useEffect: setForm(.. stockPorPunto: { ...nuevoStockPorPunto } ..)
                                    // O sea que stockPorPunto YA trae valores.
                                    // Entonces `stock` (global) debería reflejar la suma de esos valores al abrir modal editar.
                                    // Ver abajo corrección en useEffect.

                                    // Si es edición, el usuario puede querer sumar o corregir.
                                    // Si corregimos, el input es el valor final.
                                    "Consultar"
                                  }
                                </Typography>
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {restante > 0 && (
                                <Tooltip title="Asignar restante">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      color: COLORS.primary,
                                      bgcolor: alpha(COLORS.primary, 0.1),
                                      '&:hover': { bgcolor: alpha(COLORS.primary, 0.2) },
                                      width: 28, // Smaller
                                      height: 28
                                    }}
                                    onClick={() => {
                                      const nuevoValor = currentVal + restante;
                                      setForm(prev => ({
                                        ...prev,
                                        stockPorPunto: { ...prev.stockPorPunto, [punto.id]: String(nuevoValor) }
                                      }));
                                    }}
                                  >
                                    <Icon icon="mdi:arrow-up-bold" width={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <TextField
                                size="small"
                                value={valStr}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (/^\d*\.?\d*$/.test(v)) {
                                    const newVal = parseFloat(v || '0');
                                    const currentExcluding = asignadoTotal - currentVal;
                                    // Validamos que no se pase del total
                                    if (currentExcluding + newVal <= stockTotal + 0.01) { // +0.01 margen float
                                      setForm(prev => ({
                                        ...prev,
                                        stockPorPunto: { ...prev.stockPorPunto, [punto.id]: v }
                                      }));
                                    }
                                  }
                                }}
                                placeholder="0"
                                disabled={stockTotal <= 0}
                                sx={{ width: 90 }}
                                InputProps={{ sx: { textAlign: 'right', fontWeight: 700 } }}
                              />
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })
                )}
              </Box>
            </Box>
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
    </Dialog>
  );
};

export default ModalNuevoArticulo;
