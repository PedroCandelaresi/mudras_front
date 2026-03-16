import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  IconTrendingUp
} from "@tabler/icons-react";
import { grisRojizo } from "@/ui/colores";
import { alpha } from '@mui/material/styles';
import { ApexOptions } from "apexcharts";
import { useQuery, useApolloClient } from "@apollo/client/react";
import type { ApolloClient } from "@apollo/client";
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';
import {
  OBTENER_HISTORIAL_VENTAS,
  type FiltrosHistorialInput,
  type HistorialVentaItem,
  type ObtenerHistorialVentasResponse,
} from "@/components/ventas/caja-registradora/graphql/queries";
import { USUARIOS_CAJA_AUTH_QUERY } from "@/components/usuarios/graphql/queries";
import SearchToolbar from "@/components/ui/SearchToolbar";
import PaginacionMudras from "@/components/ui/PaginacionMudras";
import ModalDetalleVenta from "./ModalDetalleVenta";
import { VentasFilterBar } from "./VentasFilterBar";
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
    QR: 'QR',
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
      type: 'line',
      toolbar: { show: false },
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: '#6d5d53',
    },
    stroke: {
      curve: 'straight',
      width: 4,
    },
    colors: ['#8D6E63'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: serieRecaudacion.map((item) => item.label),
      labels: { rotate: -35, trim: true },
      title: {
        text: agruparPorHora ? 'Hora' : 'Día',
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `$${value.toLocaleString("es-AR")}`,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `$${value.toLocaleString("es-AR")}`,
      },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: '#efe8e1' },
    markers: { size: 5, colors: ['#ffffff'], strokeColors: '#8D6E63', strokeWidth: 2 },
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
  const mediosPagoOptions = useMemo<ApexOptions>(() => ({
    chart: {
      type: 'donut',
      toolbar: { show: false },
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    labels: estadisticasVentas.mediosPagoOrdenados.slice(0, 5).map((item) => item.label),
    colors: ['#1976d2', '#d32f2f', '#f9a825', '#2e7d32', '#512da8'],
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
    },
    stroke: { width: 1, colors: ['#ffffff'] },
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} operaciones`,
      },
    },
  }), [estadisticasVentas.mediosPagoOrdenados]);
  const mediosPagoSeries = useMemo(
    () => estadisticasVentas.mediosPagoOrdenados.slice(0, 5).map((item) => item.cantidad),
    [estadisticasVentas.mediosPagoOrdenados]
  );

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

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
            <Card variant="outlined" sx={{ borderColor: '#bbdefb', borderRadius: 0, bgcolor: '#ffffff' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#0d47a1', mb: 1, fontWeight: 700 }}>
                  Recaudación en el tiempo ({agruparPorHora ? 'por hora' : 'por día'})
                </Typography>
                {loadingResumen ? (
                  <Skeleton variant="rounded" height={220} animation="wave" />
                ) : serieRecaudacion.length > 0 ? (
                  <Chart options={lineChartOptions} series={lineChartSeries} type="line" height={240} width="100%" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin datos para graficar con los filtros actuales.
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderColor: '#ffcdd2', borderRadius: 0, bgcolor: '#ffffff' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#b71c1c', mb: 1, fontWeight: 700 }}>
                  Medios de pago más usados
                </Typography>
                {loadingResumen ? (
                  <Skeleton variant="rounded" height={220} animation="wave" />
                ) : mediosPagoSeries.length > 0 ? (
                  <Chart options={mediosPagoOptions} series={mediosPagoSeries} type="donut" height={240} width="100%" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin datos de medios de pago.
                  </Typography>
                )}
                {!loadingResumen && estadisticasVentas.medioPrincipal && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#7b1fa2', fontWeight: 700 }}>
                    Medio principal: <strong>{estadisticasVentas.medioPrincipal.label}</strong> ({estadisticasVentas.medioPrincipal.cantidad} operaciones)
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

      <VentasFilterBar
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        usuarioId={usuarioId}
        medioPago={medioPago}
        busquedaArticulo={busquedaArticulo}
        usuarios={usuarios}
        onFechaDesdeChange={(d) => { setFechaDesde(d); setPage(0); }}
        onFechaHastaChange={(d) => { setFechaHasta(d); setPage(0); }}
        onUsuarioChange={(u) => { setUsuarioId(u); setPage(0); }}
        onMedioPagoChange={(m) => { setMedioPago(m); setPage(0); }}
        onBusquedaArticuloChange={(value) => { setBusquedaArticulo(value); setPage(0); }}
        onQuickDateChange={handleQuickDate}
        onClear={() => {
          setFechaDesde(null);
          setFechaHasta(null);
          setUsuarioId("");
          setMedioPago("");
          setBusqueda("");
          setBusquedaArticulo("");
          setPage(0);
        }}
        onFilter={() => refetch()}
      />

      <Paper elevation={0} variant="outlined" sx={{ p: 0, overflow: 'hidden', borderRadius: 0 }}>
        <SearchToolbar
          title="Listado de Detalle"
          icon={<IconReceipt style={{ marginRight: 8, verticalAlign: 'middle' }} />}
          baseColor={grisRojizo.primary}
          placeholder="Buscar por Nº comprobante..."
          searchValue={busqueda}
          onSearchValueChange={(v) => { setBusqueda(v); setPage(0); }}
          onSubmitSearch={() => setPage(0)}
          onClear={() => { setBusqueda(""); setPage(0); }}
          customActions={
            <Box display="flex" gap={1}>
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
          }
        />

        <Box ref={tableTopRef} />
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

        <ModalDetalleVenta
          open={Boolean(ventaSeleccionada)}
          ventaId={ventaSeleccionada?.id || null}
          onClose={() => setVentaSeleccionada(null)}
        />
      </Paper>
    </Box>
  );
}
