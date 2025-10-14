'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Chip, IconButton, Tooltip,
  TextField, InputAdornment, Skeleton, Stack, MenuItem
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { Icon } from '@iconify/react';

import { PuntoMudras } from '@/interfaces/puntos-mudras';
import { grisVerdoso } from '@/ui/colores';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import CrystalButton, { CrystalSoftButton, CrystalIconButton } from '@/components/ui/CrystalButton';

interface ArticuloStock {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stockAsignado: number;
  stockTotal: number;
  rubro?: { id: number; nombre: string } | null;
}

interface Props {
  puntoVenta: PuntoMudras;
  onModificarStock: (articulo: any) => void;
  onNuevaAsignacion: () => void;
  refetchTrigger: number;
}

/* ======================== Estética (match Artículos / grisVerdoso) ======================== */
const accentExterior = grisVerdoso.primary;
const accentInterior = grisVerdoso.borderInner ?? darken(grisVerdoso.primary, 0.35);

const woodTintExterior = '#bcd4c2';
const woodTintInterior = '#a9c7b3';

const panelBg = 'rgba(234, 243, 234, 0.72)';
const tableBodyBg = 'rgba(241, 248, 233, 0.58)';
const tableBodyAlt = 'rgba(187, 207, 178, 0.24)';

const headerBg = '#2f3e2e';
const headerText = alpha('#ffffff', 0.94);

const biselExteriorConfig = crearConfiguracionBisel(accentExterior, 1.45);
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
    <WoodBackdrop accent={woodTintExterior} radius={3} inset={0} strength={0.16} texture="tabla" />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundColor: alpha('#eef6ef', 0.78),
        zIndex: 0,
      }}
    />
    <Box sx={{ position: 'relative', zIndex: 2, p: 2.5 }}>{children}</Box>
  </Box>
);

/* ======================== Componente ======================== */
export default function TablaStockPuntoVenta({
  puntoVenta,
  onModificarStock,
  onNuevaAsignacion,
  refetchTrigger,
}: Props) {
  const [articulos, setArticulos] = useState<ArticuloStock[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroInput, setFiltroInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Cargar datos reales de stock del punto
  useEffect(() => {
    const cargarStock = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query ObtenerStockPuntoMudras($puntoMudrasId: Int!) {
                obtenerStockPuntoMudras(puntoMudrasId: $puntoMudrasId) {
                  id
                  nombre
                  codigo
                  precio
                  stockAsignado
                  stockTotal
                  rubro { id nombre }
                }
              }
            `,
            variables: { puntoMudrasId: puntoVenta.id },
          }),
        });

        const result = await response.json();
        setArticulos(Array.isArray(result.data?.obtenerStockPuntoMudras) ? result.data.obtenerStockPuntoMudras : []);
      } catch {
        setArticulos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarStock();
  }, [puntoVenta.id, refetchTrigger]);

  const handleModificar = (art: ArticuloStock) => {
    onModificarStock({ ...art, puntoVentaId: puntoVenta.id, puntoVentaNombre: puntoVenta.nombre });
  };

  const handleBuscar = () => setFiltro(filtroInput.trim());
  const handleLimpiarFiltros = () => { setFiltro(''); setFiltroInput(''); setPage(0); };
  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleBuscar(); };

  const articulosFiltrados = useMemo(() => {
    if (!filtro) return articulos;
    const term = filtro.toLowerCase();
    return articulos.filter((a) =>
      a.nombre.toLowerCase().includes(term) ||
      a.codigo.toLowerCase().includes(term) ||
      (a.rubro?.nombre?.toLowerCase() ?? '').includes(term)
    );
  }, [articulos, filtro]);

  const totalPaginas = Math.ceil(articulosFiltrados.length / rowsPerPage);
  const paginaActual = page + 1;

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

  const articulosPaginados = useMemo(
    () => articulosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [articulosFiltrados, page, rowsPerPage]
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  /* ======================== Loading ======================== */
  if (loading) {
    return (
      <WoodSection>
        <Box sx={{ px: 1, py: 1, mb: 2 }}>
          <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2 }} />
      </WoodSection>
    );
  }

  /* ======================== Render ======================== */
  return (
    <WoodSection>
      {/* Toolbar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 1, py: 1, mb: 2, borderRadius: 0, border: 0 }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          color={grisVerdoso.textStrong}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Icon icon="mdi:store" width={20} height={20} />
          Stock en {puntoVenta.nombre}
        </Typography>

        <Box display="flex" alignItems="center" gap={1.25}>
          <CrystalButton
            baseColor={grisVerdoso.primary}
            startIcon={<Icon icon="mdi:plus" />}
            onClick={onNuevaAsignacion}
          >
            Nueva Asignación
          </CrystalButton>
          <TextField
            size="small"
            placeholder="Buscar por código, nombre o rubro…"
            value={filtroInput}
            onChange={(e) => setFiltroInput(e.target.value)}
            onKeyDown={onKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="mdi:magnify" width={18} height={18} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 260,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(241, 248, 241, 0.6)',
                backdropFilter: 'saturate(125%) blur(0.5px)',
                borderRadius: 2,
              },
              '& .MuiOutlinedInput-root fieldset': { borderColor: alpha(accentExterior, 0.35) },
              '& .MuiOutlinedInput-root:hover fieldset': { borderColor: alpha(accentExterior, 0.5) },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: grisVerdoso.primary },
            }}
          />

          <Tooltip title="Buscar (Enter)">
            <span>
              <CrystalButton
                baseColor={grisVerdoso.primary}
                startIcon={<Icon icon="mdi:magnify" />}
                onClick={handleBuscar}
              >
                Buscar
              </CrystalButton>
            </span>
          </Tooltip>

          <CrystalSoftButton
            baseColor={grisVerdoso.primary}
            startIcon={<Icon icon="mdi:filter-off" />}
            onClick={handleLimpiarFiltros}
          >
            Limpiar filtros
          </CrystalSoftButton>

        </Box>
      </Box>

      {/* Tabla */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          position: 'relative',
          borderRadius: 0,
          border: '1px solid',
          borderColor: alpha(accentInterior, 0.38),
          bgcolor: 'rgba(245, 252, 245, 0.94)',
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
            backgroundColor: alpha('#f3fff3', 0.82),
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

            // Alternadas + hover
            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
              bgcolor: tableBodyBg,
            },
            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
              bgcolor: tableBodyAlt,
            },
            '& .MuiTableBody-root .MuiTableRow-root.MuiTableRow-hover:hover .MuiTableCell-root': {
              bgcolor: alpha(grisVerdoso.actionHover, 0.60),
            },

            // Header consistente
            '& .MuiTableCell-head': {
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: headerBg,
              color: headerText,
              boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.12)',
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            },
            // divisores sutiles
            '& .MuiTableHead-root .MuiTableCell-head:not(:last-of-type)': {
              borderRight: `3px solid ${alpha(grisVerdoso.headerBorder, 0.5)}`,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Artículo</TableCell>
              <TableCell>Rubro</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="center">Asignado</TableCell>
              <TableCell align="center">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {articulosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Icon icon="mdi:package-variant-closed" width={48} height={48} color="#ccc" />
                    <Typography variant="body2" color="text.secondary">
                      {articulos.length === 0
                        ? 'No hay artículos asignados a este punto de venta'
                        : 'No se encontraron artículos con los filtros aplicados'}
                    </Typography>
                    {articulos.length === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Usá el botón &quot;Nueva Asignación&quot; para agregar artículos
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              articulosPaginados.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {a.codigo}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color={darken(headerBg, 0.1)}>
                      {a.nombre}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {a.rubro ? (
                      <Chip
                        label={a.rubro.nombre}
                        size="small"
                        sx={{
                          bgcolor: alpha(accentExterior, 0.18),
                          color: headerBg,
                          fontWeight: 600,
                          height: 22,
                          '& .MuiChip-label': { px: 0.8 },
                        }}
                      />
                    ) : (
                      <Chip label="Sin rubro" size="small" variant="outlined" />
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700} color={headerBg}>
                      ${a.precio.toLocaleString('es-AR')}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={a.stockAsignado > 0 ? grisVerdoso.textStrong : 'text.secondary'}
                    >
                      {a.stockAsignado}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {a.stockTotal}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    {a.stockAsignado === 0 ? (
                      <Chip label="Sin stock" size="small" color="error" variant="outlined" />
                    ) : a.stockAsignado <= 5 ? (
                      <Chip label="Stock bajo" size="small" color="warning" />
                    ) : (
                      <Chip label="Disponible" size="small" color="success" variant="outlined" />
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Modificar stock">
                      <span>
                        <CrystalIconButton baseColor={grisVerdoso.primary} onClick={() => handleModificar(a)}>
                          <Icon icon="mdi:package-variant" width={16} height={16} />
                        </CrystalIconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación personalizada (crystal) */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Mostrando {Math.min(rowsPerPage, articulosPaginados.length)} de {articulosFiltrados.length} artículos
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            select
            size="small"
            value={String(rowsPerPage)}
            onChange={handleChangeRowsPerPage}
            sx={{ minWidth: 80 }}
          >
            {[50, 100, 150].map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <Typography variant="body2" color="text.secondary">
            Página {paginaActual} de {Math.max(1, totalPaginas)}
          </Typography>

          {generarNumerosPaginas().map((num, idx) =>
            num === '...' ? (
              <CrystalSoftButton
                key={`ellipsis-${idx}`}
                baseColor={grisVerdoso.primary}
                disabled
                sx={{ minWidth: 32, minHeight: 30, px: 1, py: 0.25, borderRadius: 2, color: grisVerdoso.textStrong }}
              >
                …
              </CrystalSoftButton>
            ) : (
              <CrystalButton
                key={`page-${num}`}
                baseColor={grisVerdoso.primary}
                sx={{
                  minWidth: 32,
                  minHeight: 30,
                  px: 1,
                  py: 0.25,
                  borderRadius: 2,
                  fontWeight: Number(num) === paginaActual ? 800 : 600,
                  boxShadow: 'none',
                }}
                onClick={() => handleChangePage(null as any, Number(num) - 1)}
                disabled={num === paginaActual}
              >
                {num}
              </CrystalButton>
            )
          )}
        </Stack>
      </Box>
    </WoodSection>
  );
}
