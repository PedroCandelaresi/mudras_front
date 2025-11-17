'use client';

import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import {
  Alert,
  Box,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { IconClipboardList, IconEdit, IconEye } from '@tabler/icons-react';
import { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import type { ArticuloConStockPuntoMudras } from '@/components/puntos-mudras/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';
import { verde, azul } from '@/ui/colores';
import SearchToolbar from '@/components/ui/SearchToolbar';

type TablaStockTheme = {
  accent?: string;
  accentInterior?: string;
  woodTintExterior?: string;
  woodTintInterior?: string;
  tableBodyBg?: string;
  tableBodyAlt?: string;
  headerBg?: string;
  panelOverlay?: string;
  buttonColor?: string;
};

const DEFAULT_THEME: Required<Omit<TablaStockTheme, 'buttonColor'>> & { buttonColor: string } = {
  // Verde primaveral para puntos de venta
  accent: '#66BB6A',
  accentInterior: darken('#66BB6A', 0.28),
  woodTintExterior: '#c8e6c9',
  woodTintInterior: '#b2dfbd',
  tableBodyBg: 'rgba(225, 245, 229, 0.78)',
  tableBodyAlt: 'rgba(200, 230, 205, 0.42)',
  headerBg: darken('#66BB6A', 0.32),
  panelOverlay: '#f1fbf2',
  buttonColor: '#66BB6A',
};

const numberFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

type Props = {
  articulos: ArticuloConStockPuntoMudras[];
  loading?: boolean;
  error?: Error;
  puntoNombre?: string | null;
  onEditStock?: (articulo: ArticuloConStockPuntoMudras) => void;
  onViewDetails?: (articulo: ArticuloConStockPuntoMudras) => void;
  onNewAssignment?: () => void;
  themeOverride?: TablaStockTheme;
};

const TablaStockPuntoVenta: React.FC<Props> = ({
  articulos,
  loading = false,
  error,
  puntoNombre,
  onEditStock,
  onViewDetails,
  onNewAssignment,
  themeOverride,
}) => {
  const accent = themeOverride?.accent ?? DEFAULT_THEME.accent;
  const accentExterior = accent;
  const accentInterior = themeOverride?.accentInterior ?? (themeOverride?.accent ? darken(themeOverride.accent, 0.3) : DEFAULT_THEME.accentInterior);
  const woodTintExterior = themeOverride?.woodTintExterior ?? DEFAULT_THEME.woodTintExterior;
  const woodTintInterior = themeOverride?.woodTintInterior ?? DEFAULT_THEME.woodTintInterior;
  const tableBodyBg = themeOverride?.tableBodyBg ?? DEFAULT_THEME.tableBodyBg;
  const tableBodyAlt = themeOverride?.tableBodyAlt ?? DEFAULT_THEME.tableBodyAlt;
  const headerBg = themeOverride?.headerBg ?? (themeOverride?.accent ? darken(themeOverride.accent, 0.12) : DEFAULT_THEME.headerBg);
  const panelOverlay = themeOverride?.panelOverlay ?? DEFAULT_THEME.panelOverlay;
  const buttonColor = themeOverride?.buttonColor ?? accent;
  const textStrong = darken(accent, 0.15);
  const chipText = darken(accent, 0.35);

  const biselExteriorConfig = crearConfiguracionBisel(accent, 1.45);
  const estilosBiselExterior = crearEstilosBisel(biselExteriorConfig, { zContenido: 2 });

  const WoodSection: React.FC<PropsWithChildren> = ({ children }) => (
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
          backgroundColor: alpha(panelOverlay, 0.78),
          zIndex: 0,
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 2, p: 2.75 }}>{children}</Box>
    </Box>
  );
  const [busquedaDraft, setBusquedaDraft] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const articulosFiltrados = useMemo(() => {
    if (!busquedaAplicada) return articulos;
    const term = busquedaAplicada.toLowerCase();
    return articulos.filter((item) =>
      [item.codigo, item.nombre, item.rubro?.nombre]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [articulos, busquedaAplicada]);

  const ejecutarBusqueda = useCallback(() => {
    setBusquedaAplicada((busquedaDraft || '').trim());
  }, [busquedaDraft]);

  const limpiarFiltros = useCallback(() => {
    setBusquedaDraft('');
    setBusquedaAplicada('');
  }, []);

  const obtenerPrecioUnitario = useCallback((item: ArticuloConStockPuntoMudras) => {
    if (item.articulo) {
      const calculado = calcularPrecioDesdeArticulo(item.articulo as Articulo);
      if (calculado && calculado > 0) {
        return calculado;
      }
    }
    return Number(item.precio ?? 0);
  }, []);

  const totalUnidades = useMemo(
    () => articulosFiltrados.reduce((acc, item) => acc + (Number(item.stockAsignado) || 0), 0),
    [articulosFiltrados]
  );

  const valorEstimado = useMemo(
    () =>
      articulosFiltrados.reduce(
        (acc, item) => acc + obtenerPrecioUnitario(item) * (Number(item.stockAsignado) || 0),
        0
      ),
    [articulosFiltrados, obtenerPrecioUnitario]
  );

  const resumenInventario = `${articulosFiltrados.length} artículos visibles • ${numberFormatter.format(
    totalUnidades
  )} unidades • ${currencyFormatter.format(valorEstimado)} estimados`;
  const showActions = Boolean(onEditStock || onViewDetails);

  const totalPaginas = Math.ceil(articulosFiltrados.length / rowsPerPage) || 1;
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

  // Memoizar el toolbar para que no se remonte en cada render.
  // Solo depende de valores básicos, no de derivados como articulosFiltrados o resumenInventario.
  const toolbar = useMemo(
    () => (
      <SearchToolbar
        title={puntoNombre ? `Stock en ${puntoNombre}` : 'Stock del punto de venta'}
        icon={<IconClipboardList size={20} />}
        baseColor={buttonColor}
        placeholder="Buscar por código, descripción o rubro"
        searchValue={busquedaDraft}
        onSearchValueChange={setBusquedaDraft}
        onSubmitSearch={() => {
          // Aplicar búsqueda y resetear página sin tocar valores derivados.
          setBusquedaAplicada((busquedaDraft || '').trim());
          setPage(0);
        }}
        onClear={() => {
          setBusquedaDraft('');
          setBusquedaAplicada('');
          setPage(0);
        }}
        canCreate={Boolean(onNewAssignment)}
        createLabel="Nueva asignación"
        onCreateClick={onNewAssignment}
        searchDisabled={loading}
      />
    ),
    [puntoNombre, buttonColor, busquedaDraft, loading, onNewAssignment]
  );

  const tabla = (
    <TableContainer
      sx={{
        position: 'relative',
        borderRadius: 0,
        border: '1px solid',
        borderColor: alpha(accentInterior, 0.38),
        bgcolor: 'rgba(255, 250, 242, 0.94)',
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
          backgroundColor: alpha('#fffaf3', 0.82),
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
            bgcolor: alpha('#d9b18a', 0.42),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: headerBg,
            color: alpha('#FFFFFF', 0.94),
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.12)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          },
          '& .MuiTableHead-root .MuiTableCell-head:not(:last-of-type)': {
            borderRight: `3px solid ${alpha(darken(headerBg, 0.25), 0.5)}`,
          },
        }}
      >
        <TableHead>
          <TableRow>
            {(['Código', 'Descripción', 'Precio', 'Stock del punto', 'Rubro', ...(showActions ? ['Acciones'] : [])] as const).map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  {Array.from({ length: 5 }).map((__, cellIdx) => (
                    <TableCell key={cellIdx}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : articulosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    {busquedaAplicada
                      ? 'No hay resultados que coincidan con la búsqueda.'
                      : 'Este punto aún no tiene stock cargado.'}
                  </TableCell>
                </TableRow>
              ) : (
                articulosPaginados.map((item) => {
                  const precioUnitario = obtenerPrecioUnitario(item);
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Chip
                          label={item.codigo ?? 'Sin código'}
                          size="small"
                          sx={{
                            bgcolor: alpha(accentExterior, 0.14),
                            color: chipText,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell align="right">
                        {Number.isFinite(precioUnitario)
                          ? currencyFormatter.format(precioUnitario)
                          : '—'}
                      </TableCell>
                      <TableCell align="right">{numberFormatter.format(Number(item.stockAsignado) || 0)}</TableCell>
                      <TableCell>
                        {item.rubro?.nombre ? (
                          <Chip
                            label={item.rubro.nombre}
                            size="small"
                            sx={{
                              bgcolor: alpha(accentExterior, 0.18),
                              color: '#12331f',
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Chip label="Sin rubro" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      {showActions && (
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" gap={0.75}>
                            {onViewDetails && (
                              <Tooltip title="Ver detalles">
                                <span>
                                  <CrystalIconButton
                                    baseColor={azul.primary}
                                    onClick={() => onViewDetails?.(item)}
                                    disabled={!onViewDetails}
                                  >
                                    <IconEye size={16} />
                                  </CrystalIconButton>
                                </span>
                              </Tooltip>
                            )}

                            {onEditStock && (
                              <Tooltip title="Editar stock">
                                <span>
                                  <CrystalIconButton
                                    baseColor={buttonColor}
                                    onClick={() => onEditStock?.(item)}
                                    disabled={!onEditStock}
                                  >
                                    <IconEdit size={16} />
                                  </CrystalIconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const paginador = (
    <Box
      sx={{
        mt: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Mostrando {articulosPaginados.length} de {articulosFiltrados.length} artículos
      </Typography>
      <Stack direction="row" spacing={1}>
        {generarNumerosPaginas().map((num, idx) =>
          num === '...' ? (
            <Typography key={`ellipsis-${idx}`} variant="body2" color="text.secondary" sx={{ px: 1 }}>
              ...
            </Typography>
          ) : (
            <CrystalSoftButton
              key={num}
              baseColor={buttonColor}
              sx={{
                minWidth: 32,
                minHeight: 32,
                px: 1,
                fontSize: '0.775rem',
                textTransform: 'none',
                fontWeight: Number(num) === paginaActual ? 800 : 600,
                boxShadow: 'none',
              }}
              onClick={() => setPage(Number(num) - 1)}
              disabled={num === paginaActual}
            >
              {num}
            </CrystalSoftButton>
          )
        )}
      </Stack>
    </Box>
  );

  return (
    <WoodSection>
      {toolbar}
      {error && !loading ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'No se pudo cargar el stock del punto seleccionado.'}
        </Alert>
      ) : (
        tabla
      )}
    </WoodSection>
  );
};

export default TablaStockPuntoVenta;
