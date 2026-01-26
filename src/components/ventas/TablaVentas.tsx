"use client";

import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import {
  IconDotsVertical,
  IconEye,
  IconRefresh,
  IconSearch,
  IconCurrencyDollar,
  IconTrash,
  IconEdit,
  IconReceipt
} from "@tabler/icons-react";
import { grisRojizo } from "@/ui/colores"; // Updated palette
import { useQuery } from "@apollo/client/react";
import {
  OBTENER_HISTORIAL_VENTAS,
  type ObtenerHistorialVentasResponse,
} from "@/components/ventas/caja-registradora/graphql/queries";
import SearchToolbar from "@/components/ui/SearchToolbar";
import ModalDetalleVenta from "./ModalDetalleVenta";

export interface VentaListado {
  id: string;
  fecha: string; // ISO
  nro: string;
  cliente: string;
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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<
    null | "cliente" | "estado" | "nro"
  >(null);
  const [filtrosColumna, setFiltrosColumna] = useState<{
    cliente?: string;
    estado?: string;
    nro?: string;
  }>({});
  const [filtroColInput, setFiltroColInput] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaListado | null>(null);

  const abrirMenu =
    (col: "cliente" | "estado" | "nro") => (e: React.MouseEvent<HTMLElement>) => {
      setColumnaActiva(col);
      setFiltroColInput((filtrosColumna as any)[col] || "");
      setMenuAnchor(e.currentTarget);
    };
  const cerrarMenu = () => {
    setMenuAnchor(null);
    setColumnaActiva(null);
  };

  // Consultar historial de ventas
  const { data, loading, refetch } = useQuery<ObtenerHistorialVentasResponse>(
    OBTENER_HISTORIAL_VENTAS,
    {
      variables: { filtros: { limite: 200, offset: 0 } },
      fetchPolicy: "cache-and-network",
    }
  );

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
      cliente: v.nombreUsuario || "-",
      total: Number(v.total || 0),
      estado: mapEstado(v.estado),
    }));
  }, [data]);

  const ventasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return rows.filter((v) => {
      const pasaTexto =
        !q ||
        v.nro.toLowerCase().includes(q) ||
        v.cliente.toLowerCase().includes(q) ||
        v.estado.toLowerCase().includes(q);
      const pasaCliente = filtrosColumna.cliente
        ? v.cliente.toLowerCase().includes(filtrosColumna.cliente.toLowerCase())
        : true;
      const pasaEstado = filtrosColumna.estado
        ? v.estado.toLowerCase().includes(filtrosColumna.estado.toLowerCase())
        : true;
      const pasaNro = filtrosColumna.nro
        ? v.nro.toLowerCase().includes(filtrosColumna.nro.toLowerCase())
        : true;
      return pasaTexto && pasaCliente && pasaEstado && pasaNro;
    });
  }, [busqueda, filtrosColumna, rows]);

  const totalPaginas = Math.ceil(ventasFiltradas.length / rowsPerPage);
  const paginaActual = page + 1;

  const generarNumerosPaginas = () => {
    const paginas = [];
    const maxVisible = 7;

    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      if (paginaActual <= 4) {
        for (let i = 1; i <= 5; i++) {
          paginas.push(i);
        }
        paginas.push("...");
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        paginas.push(1);
        paginas.push("...");
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        paginas.push(1);
        paginas.push("...");
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          paginas.push(i);
        }
        paginas.push("...");
        paginas.push(totalPaginas);
      }
    }
    return paginas;
  };

  const ventasPaginadas = ventasFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 0, overflow: 'hidden', borderRadius: 2 }}>
      <SearchToolbar
        title="Historial de Ventas"
        icon={<IconReceipt style={{ marginRight: 8, verticalAlign: 'middle' }} />}
        baseColor={grisRojizo.primary}
        placeholder="Buscar ventas (Nº, cliente, estado)"
        searchValue={busqueda}
        onSearchValueChange={setBusqueda}
        onSubmitSearch={() => setPage(0)}
        onClear={() => { setBusqueda(""); setPage(0); setFiltrosColumna({}); }}
      />

      <TableContainer sx={{ maxHeight: 650 }}>
        <Table stickyHeader size="small" sx={{ "& .MuiTableCell-head": { bgcolor: grisRojizo.headerBg, color: grisRojizo.headerText } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Nº Comprobante
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" sx={{ color: 'inherit' }} onClick={abrirMenu("nro")}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Usuario
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" sx={{ color: 'inherit' }} onClick={abrirMenu("cliente")}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Estado
                  <Tooltip title="Filtrar columna">
                    <IconButton size="small" sx={{ color: 'inherit' }} onClick={abrirMenu("estado")}>
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText, textAlign: "center" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Skeleton variant="rounded" height={48} animation="wave" />
                </TableCell>
              </TableRow>
            ) : (
              ventasPaginadas.map((v, idx) => (
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
            {!loading && ventasPaginadas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No se encontraron ventas</Typography>
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
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 1
              }
            }}
          >
            {[50, 100, 150].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setPage(0)}
            disabled={page === 0}
          >
            ⏮
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            ◀
          </IconButton>

          {generarNumerosPaginas().map((numeroPagina, index) => (
            <React.Fragment key={index}>
              {numeroPagina === '...' ? (
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>...</Typography>
              ) : (
                <Button
                  size="small"
                  variant={paginaActual === numeroPagina ? 'contained' : 'text'}
                  onClick={() => setPage((numeroPagina as number) - 1)}
                  sx={{
                    minWidth: 32,
                    height: 32,
                    p: 0,
                    bgcolor: paginaActual === numeroPagina ? grisRojizo.primary : 'transparent',
                    color: paginaActual === numeroPagina ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor: paginaActual === numeroPagina ? grisRojizo.primaryHover : grisRojizo.rowHover
                    }
                  }}
                >
                  {numeroPagina}
                </Button>
              )}
            </React.Fragment>
          ))}

          <IconButton
            size="small"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPaginas - 1}
          >
            ▶
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setPage(totalPaginas - 1)}
            disabled={page >= totalPaginas - 1}
          >
            ⏭
          </IconButton>
        </Box>
      </Box>

      {/* Menu for column filters */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === "cliente" && "Filtrar por Cliente"}
          {columnaActiva === "estado" && "Filtrar por Estado"}
          {columnaActiva === "nro" && "Filtrar por Nº Comprobante"}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {columnaActiva && (
          <Box px={1} pb={1}>
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Escribe para filtrar..."
              value={filtroColInput}
              onChange={(e) => setFiltroColInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && columnaActiva) {
                  setFiltrosColumna((prev) => ({
                    ...prev,
                    [columnaActiva]: filtroColInput,
                  }));
                  setPage(0);
                  cerrarMenu();
                }
              }}
            />
            <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
              <Button
                size="small"
                onClick={() => {
                  setFiltroColInput("");
                  if (columnaActiva)
                    setFiltrosColumna((p) => ({ ...p, [columnaActiva]: "" }));
                }}
              >
                Limpiar
              </Button>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: grisRojizo.primary, '&:hover': { bgcolor: grisRojizo.primaryHover } }}
                onClick={() => {
                  if (columnaActiva) {
                    setFiltrosColumna((p) => ({
                      ...p,
                      [columnaActiva]: filtroColInput,
                    }));
                    setPage(0);
                    cerrarMenu();
                  }
                }}
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        )}
      </Menu>

      <ModalDetalleVenta
        open={Boolean(ventaSeleccionada)}
        ventaId={ventaSeleccionada?.id || null}
        onClose={() => setVentaSeleccionada(null)}
      />
    </Paper>
  );
}
