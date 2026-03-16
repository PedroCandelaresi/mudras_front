import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Card,
  CardContent
} from "@mui/material";
import {
  IconEye,
  IconReceipt,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconCurrencyDollar,
  IconShoppingBag,
  IconCashBanknote,
  IconTrendingUp,
  IconSearch
} from "@tabler/icons-react";
import { grisRojizo } from "@/ui/colores";
import { alpha } from '@mui/material/styles';
import { ApexOptions } from "apexcharts";
import { useQuery, useApolloClient } from "@apollo/client/react";
import type { ApolloClient } from "@apollo/client";
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  OBTENER_HISTORIAL_VENTAS,
  type FiltrosHistorialInput,
  type HistorialVentaItem,
  type ObtenerHistorialVentasResponse,
} from "@/components/ventas/caja-registradora/graphql/queries";
import { USUARIOS_CAJA_AUTH_QUERY } from "@/components/usuarios/graphql/queries";
import PaginacionMudras from "@/components/ui/PaginacionMudras";
import ModalDetalleVenta from "./ModalDetalleVenta";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface VentaListado {
  id: string;
  fecha: string; // ISO
  nro: string;
  cliente: string;
  usuario: string; // Vendedor
  mediosPago: string[];
  total: number;
  estado: "PAGADA" | "PENDIENTE" | "CANCELADA";
}

type TablaVentasUiState = {
  page: number;
  rowsPerPage: number;
  busqueda: string;
  busquedaArticulo: string;
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  usuarioId: string;
  medioPago: string;
};

interface UsuarioCajaAuth {
  id: string;
  username?: string | null;
  email?: string | null;
  displayName?: string | null;
}

interface UsuariosCajaAuthResponse {
  usuariosCajaAuth?: UsuarioCajaAuth[];
}

type HistorialVentasSnapshot = {
  ventas: HistorialVentaItem[];
  total: number;
  loading: boolean;
  error: string | null;
};

const tablaVentasUiStateCache = new Map<string, TablaVentasUiState>();
const HISTORIAL_BATCH_SIZE = 500;
const METODOS_PAGO_CAJA = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'QR_MODO', label: 'QR MODO' },
  { value: 'QR_MERCADOPAGO', label: 'QR MercadoPago' },
  { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente' },
] as const;
const CHART_COLORS = {
  line: '#102f5c',
  lineFill: '#295fa8',
  lineMarker: '#0c2343',
  axisText: '#314560',
  grid: '#d4e1f2',
  donut: ['#123c7c', '#8b1e2d', '#c56a0a', '#1f5a37', '#4d257f'],
  donutCenter: '#26364d',
  donutLegend: '#34495e',
};

const ARG_TIMEZONE = "America/Argentina/Buenos_Aires";
const formatInArgentina = (
  valor?: string | Date | null,
  opciones?: Intl.DateTimeFormatOptions
) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  const formatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: ARG_TIMEZONE,
    ...opciones,
  });
  return formatter.format(fecha);
};

const mapMetodoPagoFiltroToQuery = (metodoPago: string): string => {
  switch (metodoPago) {
    case 'TARJETA_DEBITO':
      return 'DEBITO';
    case 'TARJETA_CREDITO':
      return 'CREDITO';
    case 'QR_MODO':
    case 'QR_MERCADOPAGO':
      return 'QR';
    default:
      return metodoPago;
  }
};

const mapSubmedioPagoFiltroToQuery = (metodoPago: string): string | undefined => {
  switch (metodoPago) {
    case 'QR_MODO':
      return 'QR_MODO';
    case 'QR_MERCADOPAGO':
      return 'QR_MERCADOPAGO';
    default:
      return undefined;
  }
};

const getMetodoPagoLabel = (metodoPago: string): string => {
  const normalizado = String(metodoPago || '').toUpperCase();
  return {
    EFECTIVO: 'Efectivo',
    TARJETA_DEBITO: 'Tarjeta de Débito',
    TARJETA_CREDITO: 'Tarjeta de Crédito',
    TRANSFERENCIA: 'Transferencia',
    DEBITO: 'Tarjeta de Débito',
    CREDITO: 'Tarjeta de Crédito',
    QR_MODO: 'QR MODO',
    QR_MERCADOPAGO: 'QR MercadoPago',
    QR: 'QR MercadoPago',
    CUENTA_CORRIENTE: 'Cuenta Corriente',
  }[normalizado] || metodoPago;
};

const formatMediosPago = (mediosPago?: string[] | null): string => {
  if (!mediosPago || mediosPago.length === 0) return '—';
  const labels = mediosPago
    .map((m) => getMetodoPagoLabel(m))
    .filter(Boolean)
    .filter((label, index, array) => array.indexOf(label) === index);
  return labels.length > 0 ? labels.join(', ') : '—';
};

const getEstadoChipSx = (estado: VentaListado["estado"]) => {
  if (estado === 'PAGADA') {
    return {
      bgcolor: '#e8f5e9',
      color: '#2e7d32',
      borderColor: alpha('#2e7d32', 0.25),
    };
  }
  if (estado === 'CANCELADA') {
    return {
      bgcolor: '#ffebee',
      color: '#c62828',
      borderColor: alpha('#c62828', 0.25),
    };
  }
  return {
    bgcolor: '#fff3e0',
    color: '#ef6c00',
    borderColor: alpha('#ef6c00', 0.25),
  };
};

const fetchHistorialVentasCompleto = async (
  client: ApolloClient,
  filtros: FiltrosHistorialInput
): Promise<{ ventas: HistorialVentaItem[]; total: number }> => {
  const ventasAcumuladas: HistorialVentaItem[] = [];
  let total = 0;

  for (let offset = 0; ; offset += HISTORIAL_BATCH_SIZE) {
    const { data } = await client.query<ObtenerHistorialVentasResponse>({
      query: OBTENER_HISTORIAL_VENTAS,
      variables: {
        filtros: {
          ...filtros,
          limite: HISTORIAL_BATCH_SIZE,
          offset,
        },
      },
      fetchPolicy: "network-only",
    });

    const historial = data?.obtenerHistorialVentas;
    const lote = historial?.ventas || [];
    total = historial?.total || total;

    ventasAcumuladas.push(...lote);

    if (lote.length === 0 || ventasAcumuladas.length >= total) {
      break;
    }
  }

  return {
    ventas: ventasAcumuladas,
    total: total || ventasAcumuladas.length,
  };
};

export function TablaVentas() {
  const tableTopRef = React.useRef<HTMLDivElement>(null);
  const cacheKey = "tabla-ventas";
  const cachedState = tablaVentasUiStateCache.get(cacheKey);
  const [page, setPage] = useState(cachedState?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState(cachedState?.busqueda ?? "");
  const [busquedaArticulo, setBusquedaArticulo] = useState(cachedState?.busquedaArticulo ?? "");
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaListado | null>(null);
  const [exporting, setExporting] = useState(false);
  const client = useApolloClient();

  // Query para usuarios (misma fuente que caja)
  const { data: userData } = useQuery<UsuariosCajaAuthResponse>(USUARIOS_CAJA_AUTH_QUERY, {
    fetchPolicy: 'cache-and-network'
  });

  const usuarios = useMemo(() => {
    return (userData?.usuariosCajaAuth || []).map((u) => ({
      id: u.id,
      label: u.displayName?.trim() || u.username?.trim() || u.email?.trim() || `Usuario ${u.id.substring(0, 6)}`,
    }));
  }, [userData]);

  // Filters State
  const [fechaDesde, setFechaDesde] = useState<Date | null>(cachedState?.fechaDesde ?? startOfMonth(new Date()));
  const [fechaHasta, setFechaHasta] = useState<Date | null>(cachedState?.fechaHasta ?? endOfMonth(new Date()));
  const [usuarioId, setUsuarioId] = useState(cachedState?.usuarioId ?? "");
  const [medioPago, setMedioPago] = useState(cachedState?.medioPago ?? "");
  const [quickDateRange, setQuickDateRange] = useState<'hoy' | 'semana' | 'mes' | null>(null);

  // Query variables
  const queryVariables = useMemo(() => ({
    filtros: {
      limite: rowsPerPage,
      offset: page * rowsPerPage,
      fechaDesde: fechaDesde?.toISOString(),
      fechaHasta: fechaHasta?.toISOString(),
      usuarioAuthId: usuarioId || undefined,
      medioPago: (medioPago ? mapMetodoPagoFiltroToQuery(medioPago) : undefined),
      submedioPago: (medioPago ? mapSubmedioPagoFiltroToQuery(medioPago) : undefined),
      numeroVenta: busqueda || undefined,
      busquedaArticulo: busquedaArticulo || undefined,
    }
  }), [rowsPerPage, page, fechaDesde, fechaHasta, usuarioId, medioPago, busqueda, busquedaArticulo]);

  const { data, loading, refetch } = useQuery<ObtenerHistorialVentasResponse>(
    OBTENER_HISTORIAL_VENTAS,
    {
      variables: queryVariables,
      fetchPolicy: "cache-and-network",
    }
  );
  const rangoComparativo = useMemo(() => {
    if (!fechaDesde || !fechaHasta) return null;
    const msDesde = fechaDesde.getTime();
    const msHasta = fechaHasta.getTime();
    const duracion = Math.max(msHasta - msDesde, 0);
    const prevHasta = new Date(msDesde - 1);
    const prevDesde = new Date(msDesde - duracion - 1);
    return { prevDesde, prevHasta };
  }, [fechaDesde, fechaHasta]);
  const filtrosResumen = useMemo<FiltrosHistorialInput>(() => ({
    ...queryVariables.filtros,
    limite: HISTORIAL_BATCH_SIZE,
    offset: 0,
  }), [queryVariables]);
  const filtrosResumenPrevio = useMemo<FiltrosHistorialInput | null>(() => {
    if (!rangoComparativo) return null;
    return {
      ...queryVariables.filtros,
      limite: HISTORIAL_BATCH_SIZE,
      offset: 0,
      fechaDesde: rangoComparativo.prevDesde.toISOString(),
      fechaHasta: rangoComparativo.prevHasta.toISOString(),
    };
  }, [queryVariables, rangoComparativo]);
  const [resumenVentasState, setResumenVentasState] = useState<HistorialVentasSnapshot>({
    ventas: [],
    total: 0,
    loading: true,
    error: null,
  });
  const [resumenVentasPrevioState, setResumenVentasPrevioState] = useState<HistorialVentasSnapshot>({
    ventas: [],
    total: 0,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const cargarResumen = async () => {
      setResumenVentasState((prev) => ({
        ventas: prev.ventas,
        total: prev.total,
        loading: true,
        error: null,
      }));

      try {
        const resultado = await fetchHistorialVentasCompleto(client, filtrosResumen);
        if (cancelled) return;
        setResumenVentasState({
          ventas: resultado.ventas,
          total: resultado.total,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setResumenVentasState({
          ventas: [],
          total: 0,
          loading: false,
          error: error instanceof Error ? error.message : "No se pudo cargar el resumen de ventas",
        });
      }
    };

    cargarResumen();

    return () => {
      cancelled = true;
    };
  }, [client, filtrosResumen]);

  useEffect(() => {
    let cancelled = false;

    if (!filtrosResumenPrevio) {
      setResumenVentasPrevioState({
        ventas: [],
        total: 0,
        loading: false,
        error: null,
      });
      return () => {
        cancelled = true;
      };
    }

    const cargarResumenPrevio = async () => {
      setResumenVentasPrevioState((prev) => ({
        ventas: prev.ventas,
        total: prev.total,
        loading: true,
        error: null,
      }));

      try {
        const resultado = await fetchHistorialVentasCompleto(client, filtrosResumenPrevio);
        if (cancelled) return;
        setResumenVentasPrevioState({
          ventas: resultado.ventas,
          total: resultado.total,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setResumenVentasPrevioState({
          ventas: [],
          total: 0,
          loading: false,
          error: error instanceof Error ? error.message : "No se pudo cargar el resumen comparativo",
        });
      }
    };

    cargarResumenPrevio();

    return () => {
      cancelled = true;
    };
  }, [client, filtrosResumenPrevio]);

  useEffect(() => {
    tablaVentasUiStateCache.set(cacheKey, {
      page,
      rowsPerPage,
      busqueda,
      busquedaArticulo,
      fechaDesde,
      fechaHasta,
      usuarioId,
      medioPago,
    });
  }, [cacheKey, page, rowsPerPage, busqueda, busquedaArticulo, fechaDesde, fechaHasta, usuarioId, medioPago]);

  const handleQuickDate = (range: 'hoy' | 'semana' | 'mes' | null) => {
    const now = new Date();
    if (range === 'hoy') {
      setFechaDesde(startOfDay(now));
      setFechaHasta(endOfDay(now));
    } else if (range === 'semana') {
      setFechaDesde(startOfWeek(now, { weekStartsOn: 1 }));
      setFechaHasta(endOfWeek(now, { weekStartsOn: 1 }));
    } else if (range === 'mes') {
      setFechaDesde(startOfMonth(now));
      setFechaHasta(endOfMonth(now));
    } else {
      // Clear or Custom
      setFechaDesde(null);
      setFechaHasta(null);
    }
    setPage(0);
  };

  const handleClearHeaderFilters = () => {
    setQuickDateRange(null);
    setFechaDesde(null);
    setFechaHasta(null);
    setUsuarioId("");
    setMedioPago("");
    setBusqueda("");
    setBusquedaArticulo("");
    setPage(0);
  };

  const handleApplyHeaderFilters = () => {
    if (page === 0) {
      refetch();
      return;
    }
    setPage(0);
  };

  const mapEstado = (e?: string | null): "PAGADA" | "PENDIENTE" | "CANCELADA" => {
    const v = String(e || "").toLowerCase();
    if (v === "confirmada") return "PAGADA";
    if (v === "cancelada") return "CANCELADA";
    return "PENDIENTE";
  };

  const rows: VentaListado[] = useMemo(() => {
    const ventas = data?.obtenerHistorialVentas?.ventas || [];
    return ventas.map((v: any) => ({
      id: String(v.id),
      fecha: v.fecha,
      nro: v.numeroVenta,
      cliente: v.razonSocialCliente || v.nombreCliente || (v.cuitCliente ? `CUIT: ${v.cuitCliente}` : "Consumidor Final"),
      usuario: v.nombreUsuario || "-",
      mediosPago: Array.isArray(v.mediosPago) ? v.mediosPago : [],
      total: Number(v.total || 0),
      estado: mapEstado(v.estado),
    }));
  }, [data]);

  const handleExportar = async (type: 'pdf' | 'excel') => {
    try {
      setExporting(true);
      const { ventas: ventasExport } = await fetchHistorialVentasCompleto(client, filtrosResumen);
      // Mapear al formato listado
      const ventasListado = ventasExport.map((v: any) => ({
        id: String(v.id),
        fecha: v.fecha,
        nro: v.numeroVenta,
        cliente: v.razonSocialCliente || v.nombreCliente || (v.cuitCliente ? `CUIT: ${v.cuitCliente}` : "Consumidor Final"),
        usuario: v.nombreUsuario || "-",
        mediosPago: Array.isArray(v.mediosPago) ? v.mediosPago : [],
        formaPago: formatMediosPago(v.mediosPago),
        total: Number(v.total || 0),
        estado: mapEstado(v.estado),
      }));

      const columns: ExportColumn<any>[] = [
        { header: 'Fecha', key: (item) => formatInArgentina(item.fecha, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), width: 20 },
        { header: 'Nº Comprobante', key: 'nro', width: 20 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Vendedor', key: 'usuario', width: 20 },
        { header: 'Forma de Pago', key: 'formaPago', width: 24 },
        { header: 'Total', key: (item) => `$${item.total.toLocaleString("es-AR")}`, width: 15 },
        { header: 'Estado', key: 'estado', width: 15 },
      ];

      const timestamp = new Date().toISOString().split('T')[0];

      const filterParts: string[] = [];
      const f = queryVariables.filtros as any;
      if (f.fechaDesde && f.fechaHasta) {
        filterParts.push(`Período: ${new Date(f.fechaDesde).toLocaleDateString()} - ${new Date(f.fechaHasta).toLocaleDateString()}`);
      }
      if (f.numeroVenta) filterParts.push(`Comprobante: "${f.numeroVenta}"`);
      if (f.busquedaArticulo) filterParts.push(`Artículo: "${f.busquedaArticulo}"`);
      if (f.usuarioAuthId) {
        const usuarioSeleccionado = usuarios.find(u => u.id === f.usuarioAuthId);
        if (usuarioSeleccionado) {
          filterParts.push(`Vendedor: "${usuarioSeleccionado.label}"`);
        }
      }
      if (medioPago) {
        filterParts.push(`Medio Pago: "${getMetodoPagoLabel(medioPago)}"`);
      }

      const filterSummary = filterParts.join(' | ');

      if (type === 'excel') {
        exportToExcel(ventasListado, columns, `Ventas_Mudras_${timestamp}`, filterSummary);
      } else {
        await exportToPdf(ventasListado, columns, `Ventas_Mudras_${timestamp}`, 'Historial de Ventas', filterSummary);
      }

    } catch (error) {
      console.error('Error exportando:', error);
    } finally {
      setExporting(false);
    }
  };

  // Server-side pagination details
  const totalRegistros = data?.obtenerHistorialVentas?.total || 0;
  const loadingResumen = resumenVentasState.loading;
  const loadingResumenPrevio = resumenVentasPrevioState.loading;
  const ventasFiltradasResumen = resumenVentasState.ventas;
  const recaudacionFiltrada = useMemo(
    () => ventasFiltradasResumen.reduce((acc, venta) => acc + Number(venta?.total || 0), 0),
    [ventasFiltradasResumen]
  );
  const cantidadVentasFiltradas = resumenVentasState.total || ventasFiltradasResumen.length;
  const ticketPromedio = useMemo(
    () => (cantidadVentasFiltradas > 0 ? recaudacionFiltrada / cantidadVentasFiltradas : 0),
    [recaudacionFiltrada, cantidadVentasFiltradas]
  );
  const estadisticasVentas = useMemo(() => {
    const mediosPagoConteo = new Map<string, number>();
    let ventasPagadas = 0;
    let ventasCanceladas = 0;
    let ventaMaxima = 0;

    ventasFiltradasResumen.forEach((venta) => {
      const total = Number(venta?.total || 0);
      if (total > ventaMaxima) ventaMaxima = total;

      const estado = mapEstado(venta?.estado);
      if (estado === "PAGADA") ventasPagadas += 1;
      if (estado === "CANCELADA") ventasCanceladas += 1;

      const medios = Array.isArray(venta?.mediosPago) ? venta.mediosPago : [];
      medios.forEach((medio) => {
        const label = getMetodoPagoLabel(medio);
        mediosPagoConteo.set(label, (mediosPagoConteo.get(label) || 0) + 1);
      });
    });

    const mediosPagoOrdenados = Array.from(mediosPagoConteo.entries())
      .map(([label, cantidad]) => ({ label, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const medioPrincipal = mediosPagoOrdenados[0];
    const porcentajePagadas = cantidadVentasFiltradas > 0
      ? (ventasPagadas / cantidadVentasFiltradas) * 100
      : 0;
    const porcentajeCanceladas = cantidadVentasFiltradas > 0
      ? (ventasCanceladas / cantidadVentasFiltradas) * 100
      : 0;

    return {
      ventaMaxima,
      porcentajePagadas,
      porcentajeCanceladas,
      medioPrincipal,
      mediosPagoOrdenados,
    };
  }, [ventasFiltradasResumen, cantidadVentasFiltradas]);
  const agruparPorHora = useMemo(() => {
    if (!fechaDesde || !fechaHasta) return false;
    return isSameDay(fechaDesde, fechaHasta);
  }, [fechaDesde, fechaHasta]);

  const serieRecaudacion = useMemo(() => {
    const acumulado = new Map<string, { total: number; firstTs: number }>();
    ventasFiltradasResumen.forEach((venta) => {
      if (!venta?.fecha) return;
      const ts = new Date(venta.fecha).getTime();
      const key = agruparPorHora
        ? formatInArgentina(venta.fecha, {
            hour: "2-digit",
            hour12: false,
          })
        : formatInArgentina(venta.fecha, {
            day: "2-digit",
            month: "2-digit",
          });
      const existente = acumulado.get(key);
      const totalActual = Number(venta.total || 0);
      acumulado.set(key, {
        total: (existente?.total || 0) + totalActual,
        firstTs: existente ? Math.min(existente.firstTs, ts) : ts,
      });
    });
    return Array.from(acumulado.entries())
      .map(([label, item]) => ({ label, total: item.total, firstTs: item.firstTs }))
      .sort((a, b) => a.firstTs - b.firstTs);
  }, [ventasFiltradasResumen, agruparPorHora]);
  const lineChartOptions = useMemo<ApexOptions>(() => ({
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: CHART_COLORS.axisText,
      zoom: { enabled: false },
      animations: { easing: 'easeinout', speed: 450 },
      parentHeightOffset: 0,
    },
    stroke: {
      curve: 'smooth',
      width: 4,
      lineCap: 'round',
      colors: [CHART_COLORS.line],
    },
    colors: [CHART_COLORS.line],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.4,
        opacityFrom: 0.28,
        opacityTo: 0.02,
        stops: [0, 90, 100],
        colorStops: [
          [
            { offset: 0, color: CHART_COLORS.lineFill, opacity: 0.32 },
            { offset: 70, color: CHART_COLORS.lineFill, opacity: 0.12 },
            { offset: 100, color: '#ffffff', opacity: 0.02 },
          ],
        ],
      },
    },
    xaxis: {
      categories: serieRecaudacion.map((item) => item.label),
      axisBorder: { color: '#b9cbe2' },
      axisTicks: { color: '#b9cbe2' },
      labels: {
        rotate: -35,
        trim: true,
        style: {
          colors: serieRecaudacion.map(() => CHART_COLORS.axisText),
          fontSize: '12px',
          fontWeight: 600,
        },
      },
      title: {
        text: agruparPorHora ? 'Hora' : 'Día',
        style: {
          color: CHART_COLORS.axisText,
          fontSize: '13px',
          fontWeight: 700,
        },
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      tickAmount: 6,
      labels: {
        formatter: (value: number) => `$${value.toLocaleString("es-AR")}`,
        style: {
          colors: [CHART_COLORS.axisText],
          fontSize: '12px',
          fontWeight: 600,
        },
      },
    },
    tooltip: {
      theme: 'light',
      marker: { show: true },
      x: { show: true },
      y: {
        formatter: (value: number) => `$${value.toLocaleString("es-AR")}`,
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: CHART_COLORS.grid,
      strokeDashArray: 3,
      row: {
        colors: ['#f7faff', 'transparent'],
        opacity: 0.75,
      },
      padding: {
        top: 16,
        right: 16,
        bottom: 8,
        left: 10,
      },
    },
    markers: {
      size: 5,
      hover: { size: 7 },
      colors: [CHART_COLORS.lineMarker],
      strokeColors: '#ffffff',
      strokeWidth: 3,
    },
  }), [serieRecaudacion, agruparPorHora]);
  const lineChartSeries = useMemo(() => ([{
    name: 'Recaudación',
    data: serieRecaudacion.map((item) => Number(item.total.toFixed(2))),
  }]), [serieRecaudacion]);
  const ventasPrevias = resumenVentasPrevioState.ventas;
  const recaudacionPrevia = useMemo(
    () => ventasPrevias.reduce((acc, venta) => acc + Number(venta?.total || 0), 0),
    [ventasPrevias]
  );
  const cantidadVentasPrevias = resumenVentasPrevioState.total || ventasPrevias.length;
  const ticketPromedioPrevio = useMemo(
    () => (cantidadVentasPrevias > 0 ? recaudacionPrevia / cantidadVentasPrevias : 0),
    [recaudacionPrevia, cantidadVentasPrevias]
  );
  const variacionVsPeriodoAnterior = useMemo(() => {
    const calc = (actual: number, previo: number) => {
      if (previo === 0) return actual === 0 ? 0 : 100;
      return ((actual - previo) / previo) * 100;
    };
    return {
      recaudacion: calc(recaudacionFiltrada, recaudacionPrevia),
      cantidad: calc(cantidadVentasFiltradas, cantidadVentasPrevias),
      ticket: calc(ticketPromedio, ticketPromedioPrevio),
    };
  }, [recaudacionFiltrada, recaudacionPrevia, cantidadVentasFiltradas, cantidadVentasPrevias, ticketPromedio, ticketPromedioPrevio]);
  const formatVariacion = (valor: number) => `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
  const getVariacionColor = (valor: number) => (valor >= 0 ? '#2e7d32' : '#c62828');
  const mensajeErrorResumen = resumenVentasState.error || resumenVentasPrevioState.error;
  const kpiPalette = {
    recaudacion: { icon: '#1565c0', title: '#0d47a1', value: '#0b3d91', border: '#90caf9', bg: '#e3f2fd' },
    ventas: { icon: '#c62828', title: '#8e0000', value: '#b71c1c', border: '#ef9a9a', bg: '#ffebee' },
    ticket: { icon: '#f9a825', title: '#8d6e00', value: '#a66a00', border: '#ffe082', bg: '#fff8e1' },
    maxima: { icon: '#2e7d32', title: '#1b5e20', value: '#1b5e20', border: '#a5d6a7', bg: '#e8f5e9' },
  };
  const mediosPagoTop = useMemo(
    () => estadisticasVentas.mediosPagoOrdenados.slice(0, 5),
    [estadisticasVentas.mediosPagoOrdenados]
  );
  const totalOperacionesMediosPago = useMemo(
    () => mediosPagoTop.reduce((acc, item) => acc + item.cantidad, 0),
    [mediosPagoTop]
  );
  const mediosPagoSeries = useMemo(
    () => mediosPagoTop.map((item) => item.cantidad),
    [mediosPagoTop]
  );
  const mediosPagoLegendItems = useMemo(
    () =>
      mediosPagoTop.map((item, index) => ({
        ...item,
        color: CHART_COLORS.donut[index % CHART_COLORS.donut.length],
        porcentaje: totalOperacionesMediosPago > 0 ? (item.cantidad / totalOperacionesMediosPago) * 100 : 0,
      })),
    [mediosPagoTop, totalOperacionesMediosPago]
  );
  const mediosPagoOptions = useMemo<ApexOptions>(() => ({
    chart: {
      type: 'donut',
      toolbar: { show: false },
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    labels: mediosPagoTop.map((item) => item.label),
    colors: CHART_COLORS.donut,
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: { width: 5, colors: ['#ffffff'] },
    plotOptions: {
      pie: {
        expandOnClick: false,
        customScale: 0.82,
        offsetY: 0,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              offsetY: 18,
              color: CHART_COLORS.donutLegend,
              fontSize: '12px',
              fontWeight: 700,
            },
            value: {
              show: true,
              offsetY: -8,
              color: CHART_COLORS.donutCenter,
              fontSize: '28px',
              fontWeight: 800,
              formatter: (value: string) => value,
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Operaciones',
              color: CHART_COLORS.donutLegend,
              fontSize: '12px',
              fontWeight: 700,
              formatter: () => `${totalOperacionesMediosPago}`,
            },
          },
        },
      },
    },
    tooltip: {
      theme: 'light',
      fillSeriesColor: false,
      marker: { show: false },
      style: {
        fontSize: '12px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      },
      custom: ({ series, seriesIndex, w }) => {
        const label = String(w.globals.labels?.[seriesIndex] || '');
        const value = Number(series?.[seriesIndex] || 0);
        const porcentaje = totalOperacionesMediosPago > 0 ? (value / totalOperacionesMediosPago) * 100 : 0;
        const color = CHART_COLORS.donut[seriesIndex % CHART_COLORS.donut.length];

        return `
          <div style="min-width: 190px; border-radius: 12px; border: 1px solid rgba(196, 209, 226, 0.92); background: rgba(255, 255, 255, 0.97); box-shadow: 0 14px 28px rgba(17, 39, 71, 0.14); padding: 10px 12px; color: #24384f;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #20344b;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 999px; background: ${color}; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.85);"></span>
              <span>${label}</span>
            </div>
            <div style="margin-top: 7px; font-size: 12px; font-weight: 700; color: #607287;">
              ${value} operaciones
            </div>
            <div style="margin-top: 2px; font-size: 12px; font-weight: 800; color: #20344b;">
              ${porcentaje.toFixed(1)}%
            </div>
          </div>
        `;
      },
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.16,
        },
      },
      active: {
        filter: {
          type: 'none',
        },
      },
    },
  }), [mediosPagoTop, totalOperacionesMediosPago]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (_newRowsPerPage: number) => {
    setRowsPerPage(50);
    setPage(0);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 0,
          borderColor: '#90caf9',
          background: 'linear-gradient(140deg, #edf4ff 0%, #f8fbff 100%)',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ color: '#0d47a1', fontWeight: 800, mb: 0.5 }}>
            Panel de Recaudación del Período
          </Typography>
          <Typography variant="body2" sx={{ color: '#355a8a', mb: 2 }}>
            Lectura rápida para tomar decisiones comerciales con los filtros actuales.
          </Typography>
          {mensajeErrorResumen && (
            <Typography variant="caption" sx={{ display: 'block', color: '#b71c1c', mb: 1.5, fontWeight: 700 }}>
              No se pudo cargar completamente el resumen estadístico. {mensajeErrorResumen}
            </Typography>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2 }}>
            <Card
              variant="outlined"
              sx={{
                borderColor: kpiPalette.recaudacion.border,
                bgcolor: kpiPalette.recaudacion.bg,
                borderRadius: 0,
                borderLeft: `6px solid ${kpiPalette.recaudacion.icon}`,
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconCurrencyDollar size={18} color={kpiPalette.recaudacion.icon} />
                  <Typography variant="caption" sx={{ color: kpiPalette.recaudacion.title, fontWeight: 700 }}>Recaudación total</Typography>
                </Box>
                <Typography variant="h5" sx={{ mt: 0.5, color: kpiPalette.recaudacion.value, fontWeight: 800 }}>
                  {loadingResumen ? "..." : `$${recaudacionFiltrada.toLocaleString("es-AR")}`}
                </Typography>
                {!loadingResumen && !loadingResumenPrevio && rangoComparativo && (
                  <Typography variant="caption" sx={{ color: getVariacionColor(variacionVsPeriodoAnterior.recaudacion), fontWeight: 700 }}>
                    {formatVariacion(variacionVsPeriodoAnterior.recaudacion)} vs período anterior
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Card
              variant="outlined"
              sx={{
                borderColor: kpiPalette.ventas.border,
                bgcolor: kpiPalette.ventas.bg,
                borderRadius: 0,
                borderLeft: `6px solid ${kpiPalette.ventas.icon}`,
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconShoppingBag size={18} color={kpiPalette.ventas.icon} />
                  <Typography variant="caption" sx={{ color: kpiPalette.ventas.title, fontWeight: 700 }}>Cantidad de ventas</Typography>
                </Box>
                <Typography variant="h5" sx={{ mt: 0.5, color: kpiPalette.ventas.value, fontWeight: 800 }}>
                  {loadingResumen ? "..." : cantidadVentasFiltradas}
                </Typography>
                {!loadingResumen && !loadingResumenPrevio && rangoComparativo && (
                  <Typography variant="caption" sx={{ color: getVariacionColor(variacionVsPeriodoAnterior.cantidad), fontWeight: 700 }}>
                    {formatVariacion(variacionVsPeriodoAnterior.cantidad)} vs período anterior
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Card
              variant="outlined"
              sx={{
                borderColor: kpiPalette.ticket.border,
                bgcolor: kpiPalette.ticket.bg,
                borderRadius: 0,
                borderLeft: `6px solid ${kpiPalette.ticket.icon}`,
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconTrendingUp size={18} color={kpiPalette.ticket.icon} />
                  <Typography variant="caption" sx={{ color: kpiPalette.ticket.title, fontWeight: 700 }}>Ticket promedio</Typography>
                </Box>
                <Typography variant="h5" sx={{ mt: 0.5, color: kpiPalette.ticket.value, fontWeight: 800 }}>
                  {loadingResumen ? "..." : `$${ticketPromedio.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
                </Typography>
                {!loadingResumen && !loadingResumenPrevio && rangoComparativo && (
                  <Typography variant="caption" sx={{ color: getVariacionColor(variacionVsPeriodoAnterior.ticket), fontWeight: 700 }}>
                    {formatVariacion(variacionVsPeriodoAnterior.ticket)} vs período anterior
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Card
              variant="outlined"
              sx={{
                borderColor: kpiPalette.maxima.border,
                bgcolor: kpiPalette.maxima.bg,
                borderRadius: 0,
                borderLeft: `6px solid ${kpiPalette.maxima.icon}`,
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconCashBanknote size={18} color={kpiPalette.maxima.icon} />
                  <Typography variant="caption" sx={{ color: kpiPalette.maxima.title, fontWeight: 700 }}>Venta máxima</Typography>
                </Box>
                <Typography variant="h5" sx={{ mt: 0.5, color: kpiPalette.maxima.value, fontWeight: 800 }}>
                  {loadingResumen ? "..." : `$${estadisticasVentas.ventaMaxima.toLocaleString("es-AR")}`}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card variant="outlined" sx={{ borderColor: '#bbdefb', borderRadius: 0, bgcolor: '#fcfdff' }}>
              <CardContent sx={{ py: 2, px: { xs: 1.5, md: 2 } }}>
                <Typography variant="subtitle2" sx={{ color: '#0d47a1', mb: 1, fontWeight: 700 }}>
                  Recaudación en el tiempo ({agruparPorHora ? 'por hora' : 'por día'})
                </Typography>
                {loadingResumen ? (
                  <Skeleton variant="rounded" height={260} animation="wave" />
                ) : serieRecaudacion.length > 0 ? (
                  <Chart options={lineChartOptions} series={lineChartSeries} type="area" height={300} width="100%" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin datos para graficar con los filtros actuales.
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderColor: '#f0d7df', borderRadius: 0, bgcolor: '#fffdfd' }}>
              <CardContent sx={{ py: 2, px: { xs: 1.5, md: 2 } }}>
                <Typography variant="subtitle2" sx={{ color: '#b71c1c', mb: 1, fontWeight: 700 }}>
                  Medios de pago más usados
                </Typography>
                {loadingResumen ? (
                  <Skeleton variant="rounded" height={260} animation="wave" />
                ) : mediosPagoSeries.length > 0 ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' },
                      alignItems: 'center',
                      gap: { xs: 1.5, md: 2.5 },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', maxWidth: 250 }}>
                        <Chart options={mediosPagoOptions} series={mediosPagoSeries} type="donut" height={220} width="100%" />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                      {mediosPagoLegendItems.map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            px: 1.15,
                            py: 0.95,
                            borderRadius: 1.25,
                            border: '1px solid rgba(198, 210, 226, 0.92)',
                            borderLeft: `4px solid ${alpha(item.color, 0.85)}`,
                            bgcolor: alpha('#ffffff', 0.78),
                            boxShadow: '0 10px 22px rgba(24, 48, 79, 0.05)',
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto auto', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 11,
                                height: 11,
                                borderRadius: '50%',
                                bgcolor: item.color,
                                boxShadow: `0 0 0 3px ${alpha(item.color, 0.14)}`,
                              }}
                            />
                            <Typography variant="body2" sx={{ color: '#2d4059', fontWeight: 700 }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#607287', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {item.cantidad} ops
                            </Typography>
                            <Box
                              sx={{
                                px: 0.8,
                                py: 0.2,
                                borderRadius: 999,
                                bgcolor: alpha(item.color, 0.09),
                                border: `1px solid ${alpha(item.color, 0.16)}`,
                              }}
                            >
                              <Typography variant="caption" sx={{ color: '#23364d', fontWeight: 800, display: 'block' }}>
                                {item.porcentaje.toFixed(0)}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              mt: 0.8,
                              height: 6,
                              borderRadius: 999,
                              bgcolor: 'rgba(220, 230, 242, 0.72)',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${Math.max(item.porcentaje, 6)}%`,
                                height: '100%',
                                borderRadius: 999,
                                bgcolor: item.color,
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                      {!loadingResumen && estadisticasVentas.medioPrincipal && (
                        <Typography variant="caption" sx={{ display: 'block', pt: 0.5, color: '#7b1fa2', fontWeight: 700 }}>
                          Medio principal: <strong>{estadisticasVentas.medioPrincipal.label}</strong> ({estadisticasVentas.medioPrincipal.cantidad} operaciones)
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin datos de medios de pago.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          {!loadingResumen && cantidadVentasFiltradas > 0 && (
            <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={`Pagadas: ${estadisticasVentas.porcentajePagadas.toFixed(1)}%`}
                sx={{ borderRadius: 1, bgcolor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}
              />
              <Chip
                size="small"
                label={`Canceladas: ${estadisticasVentas.porcentajeCanceladas.toFixed(1)}%`}
                sx={{ borderRadius: 1, bgcolor: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2' }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Paper elevation={0} variant="outlined" sx={{ p: 0, overflow: 'hidden', borderRadius: 0 }}>
        <Box
          sx={{
            px: { xs: 1.5, md: 2 },
            py: 2,
            borderBottom: '1px solid #ead9d3',
            bgcolor: '#fffdfa',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
              flexWrap: 'wrap',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ display: 'flex', color: grisRojizo.primary }}>
                <IconReceipt style={{ verticalAlign: 'middle' }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#2d3f52' }}>
                Listado de Detalle
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconFileSpreadsheet size={18} />}
                onClick={() => handleExportar('excel')}
                disabled={exporting}
                sx={{ borderRadius: 0, textTransform: 'none', color: '#1D6F42', borderColor: '#1D6F42', '&:hover': { bgcolor: alpha('#1D6F42', 0.1), borderColor: '#1D6F42' } }}
              >
                {exporting ? '...' : 'Excel'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconFileTypePdf size={18} />}
                onClick={() => handleExportar('pdf')}
                disabled={exporting}
                sx={{ borderRadius: 0, textTransform: 'none', color: '#D32F2F', borderColor: '#D32F2F', '&:hover': { bgcolor: alpha('#D32F2F', 0.1), borderColor: '#D32F2F' } }}
              >
                {exporting ? '...' : 'PDF'}
              </Button>
            </Box>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(12, minmax(0, 1fr))' },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1', lg: 'span 2' } }}>
                <DatePicker
                  label="Desde"
                  format="dd/MM/yyyy"
                  value={fechaDesde}
                  onChange={(value) => {
                    setQuickDateRange(null);
                    setFechaDesde(value);
                    setPage(0);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: {
                        bgcolor: '#fff',
                        minWidth: 190,
                        '& .MuiInputBase-input': { fontWeight: 600 },
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1', lg: 'span 2' } }}>
                <DatePicker
                  label="Hasta"
                  format="dd/MM/yyyy"
                  value={fechaHasta}
                  onChange={(value) => {
                    setQuickDateRange(null);
                    setFechaHasta(value);
                    setPage(0);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: {
                        bgcolor: '#fff',
                        minWidth: 190,
                        '& .MuiInputBase-input': { fontWeight: 600 },
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2', lg: 'span 2' } }}>
                <ToggleButtonGroup
                  value={quickDateRange}
                  exclusive
                  onChange={(_event, value: 'hoy' | 'semana' | 'mes' | null) => {
                    setQuickDateRange(value);
                    handleQuickDate(value);
                  }}
                  size="small"
                  fullWidth
                  sx={{
                    width: '100%',
                    '& .MuiToggleButton-root': {
                      flex: 1,
                      color: grisRojizo.primary,
                      borderRadius: 0,
                      borderColor: alpha(grisRojizo.primary, 0.2),
                      bgcolor: '#fff',
                      textTransform: 'none',
                      '&.Mui-selected': {
                        bgcolor: alpha(grisRojizo.primary, 0.12),
                        color: grisRojizo.textStrong,
                      },
                    },
                  }}
                >
                  <ToggleButton value="hoy">Hoy</ToggleButton>
                  <ToggleButton value="semana">Semana</ToggleButton>
                  <ToggleButton value="mes">Mes</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TextField
                select
                label="Vendedor"
                size="small"
                value={usuarioId}
                onChange={(e) => {
                  setUsuarioId(e.target.value);
                  setPage(0);
                }}
                sx={{
                  gridColumn: { xs: '1 / -1', sm: 'span 1', lg: 'span 2' },
                  '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
                }}
              >
                <MenuItem value="">Todos los usuarios</MenuItem>
                {usuarios.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Medio de pago"
                size="small"
                value={medioPago}
                onChange={(e) => {
                  setMedioPago(e.target.value);
                  setPage(0);
                }}
                sx={{
                  gridColumn: { xs: '1 / -1', sm: 'span 1', lg: 'span 2' },
                  '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {METODOS_PAGO_CAJA.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="N° comprobante"
                size="small"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPage(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyHeaderFilters();
                  }
                }}
                sx={{
                  gridColumn: { xs: '1 / -1', sm: 'span 2', lg: 'span 6' },
                  '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Artículo: código o descripción"
                size="small"
                value={busquedaArticulo}
                onChange={(e) => {
                  setBusquedaArticulo(e.target.value);
                  setPage(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyHeaderFilters();
                  }
                }}
                sx={{
                  gridColumn: { xs: '1 / -1', sm: 'span 2', lg: 'span 6' },
                  '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: { xs: 'stretch', lg: 'flex-end' },
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleClearHeaderFilters}
                  sx={{
                    minWidth: 120,
                    color: grisRojizo.primary,
                    borderColor: grisRojizo.borderOuter,
                    borderRadius: 0,
                    textTransform: 'none',
                  }}
                >
                  Limpiar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconSearch size={16} />}
                  onClick={handleApplyHeaderFilters}
                  sx={{
                    minWidth: 150,
                    bgcolor: grisRojizo.primary,
                    borderRadius: 0,
                    textTransform: 'none',
                    '&:hover': { bgcolor: grisRojizo.primaryHover },
                  }}
                >
                  Filtrar
                </Button>
              </Box>
            </Box>
          </LocalizationProvider>
        </Box>

        <Box ref={tableTopRef} />
        <Box sx={{ px: { xs: 1.5, md: 2 } }}>
          <PaginacionMudras
            page={page}
            rowsPerPage={rowsPerPage}
            total={totalRegistros}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            itemLabel="ventas"
            accentColor={grisRojizo.primary}
            rowsPerPageOptions={[50]}
          />
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0', borderLeft: 'none', borderRight: 'none' }}>
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 900,
              '& .MuiTableRow-root': {
                minHeight: 56,
                transition: 'background-color 0.2s',
              },
              '& .MuiTableCell-root': {
                fontSize: '0.85rem',
                px: 2,
                py: 1.5,
                borderBottom: '1px solid #f0f0f0',
                color: '#37474f',
              },
              '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
                bgcolor: grisRojizo.alternateRow,
              },
              '& .MuiTableBody-root .MuiTableRow-root:hover': {
                bgcolor: alpha(grisRojizo.primary, 0.12),
              },
              '& .MuiTableCell-head': {
                fontSize: '0.8rem',
                fontWeight: 700,
                bgcolor: grisRojizo.headerBg,
                color: '#ffffff',
                letterSpacing: 0.5,
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: grisRojizo.headerBg, color: '#ffffff', fontWeight: 600, letterSpacing: 0.5 } }}>
                <TableCell sx={{ width: 60 }}>N°</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Nº Comprobante</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Vendedor</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Forma de Pago</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText, textAlign: "center" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Skeleton variant="rounded" height={48} animation="wave" />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((v, idx) => (
                  <TableRow
                    key={v.id}
                    hover
                    sx={{
                      bgcolor: idx % 2 === 1 ? grisRojizo.alternateRow : "inherit",
                      "&:hover": { bgcolor: grisRojizo.rowHover },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {page * rowsPerPage + idx + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatInArgentina(v.fecha, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatInArgentina(v.fecha, {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                        {v.nro}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {v.cliente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {v.usuario}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        ${v.total.toLocaleString("es-AR")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatMediosPago(v.mediosPago)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={v.estado}
                        sx={{
                          borderRadius: 1,
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '1px solid',
                          ...getEstadoChipSx(v.estado),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            sx={{
                              color: grisRojizo.primary,
                              '&:hover': { bgcolor: alpha(grisRojizo.primary, 0.1) }
                            }}
                            onClick={() => setVentaSeleccionada(v)}
                          >
                            <IconEye size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No se encontraron ventas con los filtros seleccionados</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: { xs: 1.5, md: 2 } }}>
          <PaginacionMudras
            page={page}
            rowsPerPage={rowsPerPage}
            total={totalRegistros}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            itemLabel="ventas"
            accentColor={grisRojizo.primary}
            rowsPerPageOptions={[50]}
          />
        </Box>

        <ModalDetalleVenta
          open={Boolean(ventaSeleccionada)}
          ventaId={ventaSeleccionada?.id || null}
          onClose={() => setVentaSeleccionada(null)}
        />
      </Paper>
    </Box>
  );
}
