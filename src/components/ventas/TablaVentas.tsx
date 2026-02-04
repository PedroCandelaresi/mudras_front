import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  Divider,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
  MenuItem,
  Card,
  CardContent
} from "@mui/material";
import {
  IconDotsVertical,
  IconEye,
  IconRefresh,
  IconSearch,
  IconEdit,
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
import SearchToolbar from "@/components/ui/SearchToolbar";
import ModalDetalleVenta from "./ModalDetalleVenta";
import { VentasFilterBar } from "./VentasFilterBar";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface VentaListado {
  id: string;
  fecha: string; // ISO
  nro: string;
  cliente: string;
  usuario: string; // Vendedor
  total: number;
  estado: "PAGADA" | "PENDIENTE" | "CANCELADA";
}

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

export function TablaVentas() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaListado | null>(null);
  const [exporting, setExporting] = useState(false);
  const client = useApolloClient();

  // Filters State
  const [fechaDesde, setFechaDesde] = useState<Date | null>(startOfMonth(new Date()));
  const [fechaHasta, setFechaHasta] = useState<Date | null>(endOfMonth(new Date()));
  const [usuarioId, setUsuarioId] = useState("");
  const [medioPago, setMedioPago] = useState("");

  // Query variables
  const queryVariables = useMemo(() => ({
    filtros: {
      limite: rowsPerPage,
      offset: page * rowsPerPage,
      fechaDesde: fechaDesde?.toISOString(),
      fechaHasta: fechaHasta?.toISOString(),
      usuarioAuthId: usuarioId || undefined,
      medioPago: medioPago || undefined,
      numeroVenta: busqueda || undefined, // Simple integration for search
    }
  }), [rowsPerPage, page, fechaDesde, fechaHasta, usuarioId, medioPago, busqueda]);

  const { data, loading, refetch } = useQuery<ObtenerHistorialVentasResponse>(
    OBTENER_HISTORIAL_VENTAS,
    {
      variables: queryVariables,
      fetchPolicy: "cache-and-network",
    }
  );

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
        total: Number(v.total || 0),
        estado: mapEstado(v.estado),
      }));

      const columns: ExportColumn<any>[] = [
        { header: 'Fecha', key: (item) => formatInArgentina(item.fecha, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), width: 20 },
        { header: 'Nº Comprobante', key: 'nro', width: 20 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Vendedor', key: 'usuario', width: 20 },
        { header: 'Total', key: (item) => `$${item.total.toLocaleString("es-AR")}`, width: 15 },
        { header: 'Estado', key: 'estado', width: 15 },
      ];

      const timestamp = new Date().toISOString().split('T')[0];

      const filterParts: string[] = [];
      const f = queryVariables.filtros as any;
      if (f.fechaDesde && f.fechaHasta) {
        filterParts.push(`Periodo: ${new Date(f.fechaDesde).toLocaleDateString()} - ${new Date(f.fechaHasta).toLocaleDateString()}`);
      }
      if (f.busqueda) filterParts.push(`Búsqueda: "${f.busqueda}"`);

      const filterSummary = filterParts.join(' | ');

      if (type === 'excel') {
        exportToExcel(ventasListado, columns, `Ventas_Mudras_${timestamp}`, filterSummary);
      } else {
        exportToPdf(ventasListado, columns, `Ventas_Mudras_${timestamp}`, 'Historial de Ventas', filterSummary);
      }

    } catch (error) {
      console.error('Error exportando:', error);
    } finally {
      setExporting(false);
    }
  };

  // Server-side pagination details
  const totalRegistros = data?.obtenerHistorialVentas?.total || 0;
  const totalPaginas = data?.obtenerHistorialVentas?.totalPaginas || 0;
  const resumen = data?.obtenerHistorialVentas?.resumen;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Card variant="outlined" sx={{ bgcolor: grisRojizo.alternateRow, borderColor: grisRojizo.borderInner }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="text.secondary">Total Periodo</Typography>
              <Typography variant="h4" color={grisRojizo.primary} fontWeight="bold">
                ${(resumen?.montoTotal || 0).toLocaleString("es-AR")}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Card variant="outlined" sx={{ borderColor: grisRojizo.borderInner }}>
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
        onFechaDesdeChange={(d) => { setFechaDesde(d); setPage(0); }}
        onFechaHastaChange={(d) => { setFechaHasta(d); setPage(0); }}
        onUsuarioChange={(u) => { setUsuarioId(u); setPage(0); }}
        onMedioPagoChange={(m) => { setMedioPago(m); setPage(0); }}
        onQuickDateChange={handleQuickDate}
        onClear={() => {
          setFechaDesde(null);
          setFechaHasta(null);
          setUsuarioId("");
          setMedioPago("");
          setBusqueda("");
          setPage(0);
        }}
        onFilter={() => refetch()}
      />

      <Paper elevation={0} variant="outlined" sx={{ p: 0, overflow: 'hidden', borderRadius: 2 }}>
        <SearchToolbar
          title="Listado de Detalle"
          icon={<IconReceipt style={{ marginRight: 8, verticalAlign: 'middle' }} />}
          baseColor={grisRojizo.primary}
          placeholder="Buscar por Nº comprobante..."
          searchValue={busqueda}
          onSearchValueChange={setBusqueda}
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

        <TableContainer sx={{ maxHeight: 650 }}>
          <Table stickyHeader size="small" sx={{ "& .MuiTableCell-head": { bgcolor: grisRojizo.headerBg, color: grisRojizo.headerText } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Nº Comprobante</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Vendedor</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText, textAlign: "center" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
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
                      <Chip
                        size="small"
                        label={v.estado}
                        sx={{
                          bgcolor: v.estado === 'PAGADA' ? '#e8f5e9' : v.estado === 'PENDIENTE' ? '#fff3e0' : '#ffebee',
                          color: v.estado === 'PAGADA' ? '#2e7d32' : v.estado === 'PENDIENTE' ? '#ef6c00' : '#c62828',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            sx={{ color: grisRojizo.primary, bgcolor: grisRojizo.rowHover }}
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
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No se encontraron ventas con los filtros seleccionados</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Filas por página:
            </Typography>
            <TextField
              select
              size="small"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              sx={{
                minWidth: 70,
                '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' }
              }}
            >
              {[50, 100, 150, 300, 500].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="body2" color="text.secondary">
              Total: {totalRegistros}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              variant="outlined"
            >
              Anterior
            </Button>
            <Typography variant="body2">
              Página {page + 1} de {totalPaginas}
            </Typography>
            <Button
              size="small"
              onClick={() => setPage(Math.min(totalPaginas - 1, page + 1))}
              disabled={page >= totalPaginas - 1}
              variant="outlined"
            >
              Siguiente
            </Button>
          </Box>
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
