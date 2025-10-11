"use client";
import React, { useMemo, useState } from "react";
import {
  Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, TextField, InputAdornment, Stack, Chip, Tooltip, IconButton, Skeleton
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  IconSearch, IconReceipt, IconCalendar, IconUser, IconEye, IconPlus
} from "@tabler/icons-react";

import { azulOscuro } from "@/ui/colores";
import { crearConfiguracionBisel, crearEstilosBisel } from "@/components/ui/bevel";
import { WoodBackdrop } from "@/components/ui/TexturedFrame/WoodBackdrop";
import CrystalButton, { CrystalSoftButton } from "@/components/ui/CrystalButton";
import { ModalBase } from "@/ui/ModalBase";

/* ======================== Tipos ======================== */
export interface PedidoItem {
  id: number | string;
  fecha: string; // ISO
  cliente?: string | null;
  estado: "PENDIENTE" | "PREPARANDO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";
  total?: number | null;
}

interface Props {
  items?: PedidoItem[];
  puedeCrear?: boolean;
  onNuevoPedido?: () => void;
}

/* ======================== Estética (match Proveedores) ======================== */
const accentExterior = azulOscuro.primary;
const accentInterior = azulOscuro.borderInner ?? "#2a3a4a";
const woodTintExterior = "#9fb3c9";
const woodTintInterior = "#8fa7c2";

const tableBodyBg = azulOscuro.rowHover;      // fondo base body
const tableBodyAlt = azulOscuro.alternateRow; // zebra alt

const biselExteriorConfig = crearConfiguracionBisel(accentExterior, 1.5);
const estilosBiselExterior = crearEstilosBisel(biselExteriorConfig, { zContenido: 2 });

const WoodSection: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      position: "relative",
      borderRadius: 2,
      overflow: "hidden",
      boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
      background: "transparent",
      ...estilosBiselExterior,
    }}
  >
    <WoodBackdrop accent={woodTintExterior} radius={3} inset={0} strength={0.18} texture="tabla" />
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        backgroundColor: alpha("#f2f7fc", 0.78),
        zIndex: 0,
      }}
    />
    <Box sx={{ position: "relative", zIndex: 2, p: 3 }}>{children}</Box>
  </Box>
);

/* ======================== Componente ======================== */
export function TablaPedidos({ items = [], puedeCrear = false, onNuevoPedido }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState("");
  const [pedidoSel, setPedidoSel] = useState<PedidoItem | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      `${p.id}`.toLowerCase().includes(q) ||
      p.cliente?.toLowerCase().includes(q) ||
      p.estado.toLowerCase().includes(q)
    );
  }, [items, busqueda]);

  const totalPaginas = Math.ceil(filtrados.length / rowsPerPage) || 1;
  const paginaActual = Math.min(page + 1, totalPaginas);

  const generarNumerosPaginas = () => {
    const paginas: (number | "...")[] = [];
    const maxVisible = 7;

    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else if (paginaActual <= 4) {
      for (let i = 1; i <= 5; i++) paginas.push(i);
      paginas.push("...", totalPaginas);
    } else if (paginaActual >= totalPaginas - 3) {
      paginas.push(1, "...");
      for (let i = totalPaginas - 4; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1, "...", paginaActual - 1, paginaActual, paginaActual + 1, "...", totalPaginas);
    }
    return paginas;
  };

  const start = (paginaActual - 1) * rowsPerPage;
  const paginados = useMemo(() => filtrados.slice(start, start + rowsPerPage), [filtrados, start, rowsPerPage]);

  /* ======================== Toolbar ======================== */
  const toolbar = (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ px: 1, py: 1, mb: 2, borderRadius: 0, border: "0px" }}
    >
      <Typography variant="h6" fontWeight={700} color={azulOscuro.textStrong}>
        <IconReceipt style={{ marginRight: 8, verticalAlign: "middle" }} />
        Pedidos
      </Typography>

      <Box display="flex" alignItems="center" gap={1.5}>
        {puedeCrear && (
          <CrystalButton
            baseColor={azulOscuro.primary}
            startIcon={<IconPlus size={18} />}
            onClick={onNuevoPedido}
          >
            Nuevo Pedido
          </CrystalButton>
        )}

        <TextField
          size="small"
          placeholder="Buscar pedidos (ID, cliente, estado)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 280,
            "& .MuiOutlinedInput-root": {
              backgroundColor: alpha(azulOscuro.toolbarBg, 0.6),
              backdropFilter: "saturate(125%) blur(0.5px)",
              borderRadius: 2,
            },
            "& .MuiOutlinedInput-root fieldset": { borderColor: alpha(accentExterior, 0.35) },
            "& .MuiOutlinedInput-root:hover fieldset": { borderColor: alpha(accentExterior, 0.5) },
            "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: azulOscuro.primary },
          }}
        />

        <CrystalSoftButton
          baseColor={azulOscuro.primary}
          onClick={() => { setBusqueda(""); setPage(0); }}
        >
          Limpiar
        </CrystalSoftButton>
      </Box>
    </Box>
  );

  /* ======================== Tabla ======================== */
  const tabla = (
    <TableContainer
      sx={{
        position: "relative",
        borderRadius: 0,
        border: "1px solid",
        borderColor: alpha(accentInterior, 0.5),
        bgcolor: alpha("#fff", 0.94),
        backdropFilter: "saturate(110%) blur(0.85px)",
        overflow: "hidden",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
    >
      <WoodBackdrop accent={woodTintInterior} radius={0} inset={0} strength={0.12} texture="tabla" />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: alpha("#f2f7fc", 0.82),
          zIndex: 0,
        }}
      />
      <Table
        stickyHeader
        size="small"
        sx={{
          borderRadius: 0,
          position: "relative",
          zIndex: 2,
          "& .MuiTableRow-root": { minHeight: 62 },

          "& .MuiTableCell-root": {
            fontSize: "0.75rem",
            px: 1,
            py: 1.1,
            borderBottomColor: alpha(accentInterior, 0.35),
            bgcolor: "transparent",
          },

          // Zebra + hover
          "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root": {
            bgcolor: tableBodyBg,
          },
          "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root": {
            bgcolor: tableBodyAlt,
          },
          "& .MuiTableBody-root .MuiTableRow-root.MuiTableRow-hover:hover .MuiTableCell-root": {
            bgcolor: alpha(azulOscuro.actionHover, 0.7),
          },
          "& .MuiTableCell-head": {
            fontSize: "0.75rem",
            fontWeight: 600,
            color: azulOscuro.headerText,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            borderBottom: "none",
            backgroundColor: azulOscuro.headerBg,
            backgroundImage: `linear-gradient(180deg, ${alpha(azulOscuro.headerBg, 0.9)} 0%, ${azulOscuro.headerBg} 100%)`,
            boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.12)",
          },
          "& .MuiTableHead-root .MuiTableCell-head:not(:last-of-type)": {
            borderRight: `3px solid ${alpha(azulOscuro.headerBorder, 0.5)}`,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Proveedor</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginados.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell>{p.id}</TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCalendar size={16} />
                  <Typography variant="body2">
                    {new Date(p.fecha).toLocaleString()}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconUser size={16} />
                  <Typography variant="body2">{p.cliente || "—"}</Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={p.estado}
                  size="small"
                  color={
                    p.estado === "ENTREGADO"
                      ? "success"
                      : p.estado === "PENDIENTE"
                      ? "warning"
                      : p.estado === "CANCELADO"
                      ? "error"
                      : "default"
                  }
                />
              </TableCell>

              <TableCell align="right">
                <Typography variant="body2" fontWeight={700}>
                  ${(p.total ?? 0).toLocaleString()}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Ver detalle">
                  <IconButton
                    size="small"
                    onClick={() => setPedidoSel(p)}
                    sx={{
                      color: azulOscuro.primary,
                      "&:hover": {
                        color: azulOscuro.primaryHover,
                        bgcolor: alpha(azulOscuro.primary, 0.08),
                      },
                    }}
                  >
                    <IconEye size={18} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}

          {paginados.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography align="center" color="text.secondary">
                  Sin datos
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  /* ======================== Paginador ======================== */
  const paginador = (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 3 }}>
      <Typography variant="caption" color="text.secondary">
        {`${Math.min(rowsPerPage, paginados.length)} de ${filtrados.length} pedidos`}
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          select
          size="small"
          value={rowsPerPage}
          onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ minWidth: 80 }}
        >
          {[50, 100, 150].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </TextField>

        <Typography variant="body2" color="text.secondary">
          Página {paginaActual} de {Math.max(1, totalPaginas)}
        </Typography>

        {generarNumerosPaginas().map((num, idx) =>
          num === "..." ? (
            <CrystalSoftButton
              key={`ellipsis-${idx}`}
              baseColor={azulOscuro.primary}
              disabled
              sx={{
                minWidth: 32,
                minHeight: 30,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                color: azulOscuro.textStrong,
              }}
            >
              …
            </CrystalSoftButton>
          ) : (
            <CrystalButton
              key={`page-${num}`}
              baseColor={azulOscuro.primary}
              onClick={() => setPage(Number(num) - 1)}
              disabled={num === paginaActual}
              sx={{
                minWidth: 32,
                minHeight: 30,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                fontWeight: Number(num) === paginaActual ? 800 : 600,
                boxShadow: "none",
              }}
            >
              {num}
            </CrystalButton>
          )
        )}
      </Stack>
    </Box>
  );

  /* ======================== Loading “match” ======================== */
  // (Opcional) Si tu tabla carga async, podés mostrar el mismo esqueleto visual:
  // if (isLoading) {
  //   return (
  //     <WoodSection>
  //       <Box sx={{ px: 1, py: 1, mb: 2 }}>
  //         <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
  //       </Box>
  //       <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2 }} />
  //     </WoodSection>
  //   );
  // }

  /* ======================== Render ======================== */
  return (
    <WoodSection>
      {toolbar}
      {tabla}
      {paginador}

      <ModalBase
        abierto={Boolean(pedidoSel)}
        titulo={`Pedido #${pedidoSel?.id ?? ""}`}
        onCerrar={() => setPedidoSel(null)}
        cancelarTexto="Cerrar"
      >
        <Typography variant="body2" color="text.secondary">
          Detalle a implementar (líneas, envíos, pagos, etc.).
        </Typography>
      </ModalBase>
    </WoodSection>
  );
}

export default TablaPedidos;
