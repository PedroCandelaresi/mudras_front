import React, { useMemo, useState, useEffect } from "react";
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
  IconFileSpreadsheet
} from "@tabler/icons-react";
import { grisRojizo } from "@/ui/colores";
import { alpha } from '@mui/material/styles';
import { useQuery, useApolloClient } from "@apollo/client/react";
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';
import {
  OBTENER_HISTORIAL_VENTAS,
  type ObtenerHistorialVentasResponse,
} from "@/components/ventas/caja-registradora/graphql/queries";
import { USUARIOS_CAJA_AUTH_QUERY } from "@/components/usuarios/graphql/queries";
import SearchToolbar from "@/components/ui/SearchToolbar";
import PaginacionMudras from "@/components/ui/PaginacionMudras";
import ModalDetalleVenta from "./ModalDetalleVenta";
import { VentasFilterBar } from "./VentasFilterBar";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

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

const tablaVentasUiStateCache = new Map<string, TablaVentasUiState>();

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
  const labels = [...new Set(mediosPago.map((m) => getMetodoPagoLabel(m)).filter(Boolean))];
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
      const { data: exportData } = await client.query({
        query: OBTENER_HISTORIAL_VENTAS,
        variables: {
          filtros: {
            ...queryVariables.filtros,
            limite: 100000,
            offset: 0,
          }
        },
        fetchPolicy: 'network-only',
      });

      const ventasExport = (exportData as any)?.obtenerHistorialVentas?.ventas || [];
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
  const resumen = data?.obtenerHistorialVentas?.resumen;

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
      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Card variant="outlined" sx={{ bgcolor: grisRojizo.alternateRow, borderColor: grisRojizo.borderInner, borderRadius: 0 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="text.secondary">Total Periodo</Typography>
              <Typography variant="h4" color={grisRojizo.primary} fontWeight="bold">
                ${(resumen?.montoTotal || 0).toLocaleString("es-AR")}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Card variant="outlined" sx={{ borderColor: grisRojizo.borderInner, borderRadius: 0 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="text.secondary">Cantidad Ventas</Typography>
              <Typography variant="h4" fontWeight="bold">
                {resumen?.totalVentas || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <VentasFilterBar
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        usuarioId={usuarioId}
        medioPago={medioPago}
        busquedaArticulo={busquedaArticulo}
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
