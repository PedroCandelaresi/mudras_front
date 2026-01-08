// /src/components/proveedores/TablaProveedores.tsx
'use client';

import React, { useMemo, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  Box,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Avatar, Skeleton, TextField, InputAdornment, Button,
  IconButton, Tooltip, Menu, Divider, Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@apollo/client/react';

import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { Proveedor, ProveedoresResponse } from '@/interfaces/proveedores';

import {
  IconSearch, IconUsers, IconRefresh, IconPhone, IconMail,
  IconEdit, IconTrash, IconEye, IconPlus, IconDotsVertical
} from '@tabler/icons-react';

import { marron, azul, verde } from '@/ui/colores';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';
import SearchToolbar from '@/components/ui/SearchToolbar';

import {
  ModalDetallesProveedor,
  ModalEditarProveedor,
  ModalEliminarProveedor
} from '@/components/proveedores';

/* ======================== Tipos ======================== */
type ColKey = 'nombre' | 'codigo' | 'cuit';
type ColFilters = Partial<Record<ColKey, string>>;

export interface TablaProveedoresHandle {
  abrirCrearProveedor: () => void;
}

interface Props {
  onNuevoProveedor?: () => void;
  puedeCrear?: boolean;

  showViewModal?: boolean;
  showEditModal?: boolean;
  showDeleteModal?: boolean;

  onView?: (p: Proveedor) => void;
  onEdit?: (p: Proveedor) => void;
  onDelete?: (p: Proveedor) => void;

  hideViewAction?: boolean;
  hideEditAction?: boolean;
  hideDeleteAction?: boolean;
}

/* ======================== Estética (match Rubros) ======================== */
// Usamos el mismo marco con madera, pero “tint” más frío para respetar la temática azul.
const accentExterior = azul.primary;
const accentInterior = azul.borderInner ?? '#2f475f';
const woodTintExterior = '#b7c9dc';   // leve tinte frío sobre madera
const woodTintInterior = '#a9bfd7';

const tableBodyBg = 'rgba(236, 245, 255, 0.55)';
const tableBodyAlt = 'rgba(173, 208, 255, 0.20)';

const biselExteriorConfig = crearConfiguracionBisel(accentExterior, 1.5);
const estilosBiselExterior = crearEstilosBisel(biselExteriorConfig, { zContenido: 2 });

const WoodSection: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
      background: 'transparent',
      ...estilosBiselExterior,
    }}
  >
    <WoodBackdrop accent={woodTintExterior} radius={3} inset={0} strength={0.18} texture="tabla" />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundColor: alpha('#f5fbff', 0.78),
        zIndex: 0,
      }}
    />
    <Box sx={{ position: 'relative', zIndex: 2, p: 3 }}>{children}</Box>
  </Box>
);

/* ======================== Componente ======================== */
const TablaProveedores = forwardRef<TablaProveedoresHandle, Props>(({
  onNuevoProveedor,
  puedeCrear = true,

  showViewModal = true,
  showEditModal = true,
  showDeleteModal = true,

  onView,
  onEdit,
  onDelete,

  hideViewAction = false,
  hideEditAction = false,
  hideDeleteAction = false,
}, ref) => {
  const { data, loading, error, refetch } = useQuery<ProveedoresResponse>(GET_PROVEEDORES);

  // estado tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtro, setFiltro] = useState('');

  // filtros por columna
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | ColKey>(null);
  const [filtrosColumna, setFiltrosColumna] = useState<ColFilters>({});
  const [filtroColInput, setFiltroColInput] = useState('');

  // modales internos
  const [modalDetalles, setModalDetalles] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);

  // datos
  const proveedoresDataList = data?.proveedores;
  const proveedores: Proveedor[] = useMemo(
    () => (Array.isArray(proveedoresDataList) ? proveedoresDataList : []),
    [proveedoresDataList]
  );

  // filtrado
  const proveedoresFiltrados = useMemo(() => {
    const lower = filtro.trim().toLowerCase();
    return proveedores.filter((p) => {
      const cumpleGeneral =
        !lower ||
        p.Nombre?.toLowerCase().includes(lower) ||
        p.Codigo?.toString().toLowerCase().includes(lower) ||
        p.CUIT?.toLowerCase().includes(lower);

      const cumpleCols = (Object.entries(filtrosColumna) as [ColKey, string][])
        .every(([campo, valor]) => {
          if (!valor) return true;
          const v = (p as any)[campo === 'nombre' ? 'Nombre' : campo === 'codigo' ? 'Codigo' : 'CUIT'];
          return v?.toString().toLowerCase().includes(valor.toLowerCase());
        });

      return cumpleGeneral && cumpleCols;
    });
  }, [proveedores, filtro, filtrosColumna]);

  const totalPaginas = Math.ceil(proveedoresFiltrados.length / rowsPerPage);
  const paginaActual = page + 1;
  const proveedoresPaginados = useMemo(
    () => proveedoresFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [proveedoresFiltrados, page, rowsPerPage]
  );

  const generarNumerosPaginas = () => {
    const paginas: (number | '...')[] = [];
    const maxVisible = 7;
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else if (paginaActual <= 4) {
      for (let i = 1; i <= 5; i++) paginas.push(i);
      paginas.push('...', totalPaginas);
    } else if (paginaActual >= totalPaginas - 3) {
      paginas.push(1, '...');
      for (let i = totalPaginas - 4; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
    }
    return paginas;
  };

  // acciones
  const handleViewProveedor = (p: Proveedor) => {
    if (onView) return onView(p);
    if (showViewModal) {
      setProveedorSeleccionado(p);
      setModalDetalles(true);
    }
  };

  const handleEditProveedor = (p: Proveedor) => {
    if (onEdit) return onEdit(p);
    if (showEditModal) {
      setProveedorSeleccionado(p);
      setModalEditar(true);
    }
  };

  const handleDeleteProveedor = (p: Proveedor) => {
    if (onDelete) return onDelete(p);
    if (showDeleteModal) {
      setProveedorSeleccionado(p);
      setModalEliminar(true);
    }
  };

  const abrirModalCrear = useCallback(() => {
    setProveedorSeleccionado(null);
    setModalEditar(true);
  }, []);

  const handleNuevoProveedor = useCallback(() => {
    onNuevoProveedor?.();
    if (showEditModal) {
      abrirModalCrear();
    }
  }, [onNuevoProveedor, showEditModal, abrirModalCrear]);

  const handleProveedorGuardado = () => {
    refetch();
    setModalEditar(false);
    setProveedorSeleccionado(null);
  };

  const handleProveedorEliminado = () => {
    refetch();
    setModalEliminar(false);
    setProveedorSeleccionado(null);
  };

  const cerrarModales = () => {
    setModalDetalles(false);
    setModalEditar(false);
    setModalEliminar(false);
    setProveedorSeleccionado(null);
  };

  useImperativeHandle(ref, () => ({
    abrirCrearProveedor: () => {
      abrirModalCrear();
    },
  }), [abrirModalCrear]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  /* ======================== Loading / Error ======================== */

  /* ======================== Toolbar ======================== */
  const toolbar = (
    <SearchToolbar
      title="Proveedores"
      icon={<IconUsers style={{ marginRight: 8, verticalAlign: 'middle' }} />}
      baseColor={azul.primary}
      placeholder="Buscar proveedores..."
      searchValue={filtro}
      onSearchValueChange={setFiltro}
      onSubmitSearch={() => setPage(0)}
      onClear={() => { setFiltro(''); setFiltrosColumna({}); setPage(0); }}
      canCreate={puedeCrear}
      createLabel="Nuevo Proveedor"
      onCreateClick={handleNuevoProveedor}
    />
  );

  if (loading) {
    return (
      <WoodSection>
        {/* Skeleton de toolbar */}
        <Box sx={{ px: 1, py: 1, mb: 2 }}>
          <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
        </Box>
        {/* Skeleton de tabla */}
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2 }} />
      </WoodSection>
    );
  }

  if (error) {
    return (
      <WoodSection>
        {toolbar}
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6" mb={2}>
            Error al cargar proveedores
          </Typography>
          <Typography color="text.secondary" mb={2}>
            {error.message}
          </Typography>
          <CrystalButton
            baseColor={azul.primary}
            startIcon={<IconRefresh />}
            onClick={() => refetch()}
          >
            Reintentar
          </CrystalButton>
        </Box>
      </WoodSection>
    );
  }

  /* ======================== Components (Tabla) ======================== */

  /* ======================== Tabla ======================== */
  const tabla = (
    <TableContainer
      sx={{
        position: 'relative',
        borderRadius: 0,
        border: '1px solid',
        borderColor: alpha(accentInterior, 0.38),
        bgcolor: 'rgba(245, 251, 255, 0.94)',
        backdropFilter: 'saturate(110%) blur(0.85px)',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      }}
    >
      <WoodBackdrop accent={woodTintInterior} radius={0} inset={0} strength={0.12} texture="tabla" />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: alpha('#f5fbff', 0.82),
          zIndex: 0,
        }}
      />
      <Table
        stickyHeader
        size="small"
        sx={{
          borderRadius: 0,
          position: 'relative',
          zIndex: 2,
          bgcolor: tableBodyBg,
          '& .MuiTableRow-root': { minHeight: 62 },
          '& .MuiTableCell-root': {
            fontSize: '0.75rem',
            px: 1,
            py: 1.1,
            borderBottomColor: alpha(accentInterior, 0.35),
            bgcolor: 'transparent',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
            bgcolor: tableBodyBg,
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
            bgcolor: tableBodyAlt,
          },
          '& .MuiTableBody-root .MuiTableRow-root.MuiTableRow-hover:hover .MuiTableCell-root': {
            bgcolor: alpha('#a9c7e6', 0.50),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: '#0D47A1',
            color: alpha('#FFFFFF', 0.94),
            boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.12)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          },
          // ✅ divisores sutiles entre columnas del header
          '& .MuiTableHead-root .MuiTableCell-head:not(:last-of-type)': {
            borderRight: `3px solid ${alpha(azul.headerBorder, 0.5)}`,
          },
        }}
      >
        <TableHead>
          <TableRow>
            {/* Proveedor */}
            <TableCell align="center">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                Proveedor
                <Tooltip title="Filtrar columna">
                  <IconButton
                    size="small" color="inherit"
                    aria-label="Filtrar columna proveedor"
                    aria-haspopup="menu"
                    onClick={(e) => { setColumnaActiva('nombre'); setFiltroColInput(filtrosColumna.nombre || ''); setMenuAnchor(e.currentTarget); }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            {/* Código */}
            <TableCell align="center">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                Código
                <Tooltip title="Filtrar columna">
                  <IconButton
                    size="small" color="inherit"
                    aria-label="Filtrar columna código"
                    aria-haspopup="menu"
                    onClick={(e) => { setColumnaActiva('codigo'); setFiltroColInput(filtrosColumna.codigo || ''); setMenuAnchor(e.currentTarget); }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            <TableCell align="center">Teléfono</TableCell>
            <TableCell align="center">Email</TableCell>

            {/* CUIT */}
            <TableCell align="center">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                CUIT
                <Tooltip title="Filtrar columna">
                  <IconButton
                    size="small" color="inherit"
                    aria-label="Filtrar columna CUIT"
                    aria-haspopup="menu"
                    onClick={(e) => { setColumnaActiva('cuit'); setFiltroColInput(filtrosColumna.cuit || ''); setMenuAnchor(e.currentTarget); }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>

            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {proveedoresPaginados.map((proveedor, idx) => (
            <TableRow key={proveedor.IdProveedor} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{ bgcolor: azul.primary, width: 40, height: 40, fontSize: '1rem' }}
                  >
                    {proveedor.Nombre?.charAt(0) || 'P'}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    {proveedor.Nombre || 'Sin nombre'}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                  {proveedor.Codigo || 'N/A'}
                </Typography>
              </TableCell>

              <TableCell>
                {!!proveedor.Telefono && (
                  <Box display="flex" alignItems="center">
                    <IconPhone size={16} style={{ marginRight: 4, color: '#666' }} />
                    <Typography variant="body2">{proveedor.Telefono}</Typography>
                  </Box>
                )}
              </TableCell>

              <TableCell>
                {!!proveedor.Mail && (
                  <Box display="flex" alignItems="center">
                    <IconMail size={16} style={{ marginRight: 4, color: '#666' }} />
                    <Typography variant="body2">{proveedor.Mail}</Typography>
                  </Box>
                )}
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {proveedor.CUIT || 'Sin CUIT'}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={0.5}>
                  {!hideViewAction && (onView || showViewModal) && (
                    <Tooltip title="Ver detalles">
                      <CrystalIconButton
                        baseColor={azul.primary}
                        onClick={() => handleViewProveedor(proveedor)}
                      >
                        <IconEye size={16} />
                      </CrystalIconButton>
                    </Tooltip>
                  )}

                  {!hideEditAction && (onEdit || showEditModal) && (
                    <Tooltip title="Editar proveedor">
                      <CrystalIconButton
                        baseColor={verde.primary}
                        onClick={() => handleEditProveedor(proveedor)}
                      >
                        <IconEdit size={16} />
                      </CrystalIconButton>
                    </Tooltip>
                  )}

                  {!hideDeleteAction && (onDelete || showDeleteModal) && (
                    <Tooltip title="Eliminar proveedor">
                      <CrystalIconButton
                        baseColor="#c62828"
                        onClick={() => handleDeleteProveedor(proveedor)}
                      >
                        <IconTrash size={16} />
                      </CrystalIconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  /* ======================== Paginador ======================== */
  const paginador = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
      <Typography variant="caption" color="text.secondary">
        Mostrando {Math.min(rowsPerPage, proveedoresPaginados.length)} de {proveedoresFiltrados.length} proveedores
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField select size="small" value={String(rowsPerPage)} onChange={handleChangeRowsPerPage} sx={{ minWidth: 80 }}>
          {[50, 100, 150].map((option) => (<option key={option} value={option}>{option}</option>))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          Página {paginaActual} de {Math.max(1, totalPaginas)}
        </Typography>
        {generarNumerosPaginas().map((num, idx) =>
          num === '...' ? (
            <CrystalSoftButton
              key={idx}
              baseColor={azul.primary}
              disabled
              sx={{ minWidth: 32, minHeight: 30, px: 1, py: 0.25, borderRadius: 2, color: azul.textStrong }}
            >
              ...
            </CrystalSoftButton>
          ) : (
            <CrystalButton
              key={num}
              baseColor={azul.primary}
              sx={{
                minWidth: 32,
                minHeight: 30,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                fontWeight: Number(num) === paginaActual ? 800 : 600,
                boxShadow: 'none',
              }}
              onClick={() => setPage(Number(num) - 1)}
              disabled={num === paginaActual}
            >
              {num}
            </CrystalButton>
          )
        )}
      </Stack>
    </Box>
  );

  /* ======================== Render ======================== */
  return (
    <>
      <WoodSection>
        {toolbar}
        {tabla}
        {paginador}
      </WoodSection>

      {/* Menú de filtros por columna */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setColumnaActiva(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 260 } } } as any}
      >
        <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>
          {columnaActiva === 'nombre' && 'Filtrar por Proveedor'}
          {columnaActiva === 'codigo' && 'Filtrar por Código'}
          {columnaActiva === 'cuit' && 'Filtrar por CUIT'}
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
                if (e.key === 'Enter') {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                  setPage(0);
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button
                size="small"
                onClick={() => {
                  setFiltroColInput('');
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: '' }));
                }}
              >
                Limpiar
              </Button>
              <CrystalButton
                size="small"
                baseColor={azul.primary}
                onClick={() => {
                  setFiltrosColumna((prev) => ({ ...prev, [columnaActiva!]: filtroColInput }));
                  setPage(0);
                  setMenuAnchor(null);
                  setColumnaActiva(null);
                }}
              >
                Aplicar
              </CrystalButton>
            </Stack>
          </Box>
        )}
      </Menu>

      {/* MODALES internos */}
      {showViewModal && (
        <ModalDetallesProveedor
          open={modalDetalles}
          onClose={cerrarModales}
          proveedor={proveedorSeleccionado}
        />
      )}

      {showEditModal && (
        <ModalEditarProveedor
          open={modalEditar}
          onClose={cerrarModales}
          proveedor={proveedorSeleccionado ?? undefined}
          onProveedorGuardado={handleProveedorGuardado}
        />
      )}

      {showDeleteModal && (
        <ModalEliminarProveedor
          open={modalEliminar}
          onClose={cerrarModales}
          proveedor={proveedorSeleccionado}
          onProveedorEliminado={handleProveedorEliminado}
        />
      )}
    </>
  );
});

TablaProveedores.displayName = 'TablaProveedores';

export default TablaProveedores;
