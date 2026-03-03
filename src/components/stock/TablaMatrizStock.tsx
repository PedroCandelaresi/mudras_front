'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Autocomplete,
    Checkbox,
    LinearProgress,
    TablePagination,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { alpha, darken } from '@mui/material/styles';
import { useQuery, useApolloClient } from '@apollo/client/react';
import {
    IconSearch, IconRefresh, IconDotsVertical,
    IconFileTypePdf, IconFileSpreadsheet, IconArrowRight, IconPlus,
    IconChevronLeft, IconChevronRight
} from '@tabler/icons-react';
import { Icon } from '@iconify/react';
import MudrasLoader from '@/components/ui/MudrasLoader';
import PaginacionMudras from '@/components/ui/PaginacionMudras';
import { OBTENER_MATRIZ_STOCK, OBTENER_PUNTOS_MUDRAS, type MatrizStockItem } from '@/components/puntos-mudras/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { GET_ARTICULOS } from '@/components/articulos/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';
import { azulMarino, verde, azul, verdeMilitar } from '@/ui/colores';
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';
import TransferirStockModal from './TransferirStockModal';

/* ======================== Tipos ======================== */
type MatrizColumnKey = 'codigo' | 'descripcion' | 'rubro' | 'proveedor' | 'stockTotal' | 'acciones' | string;

export type ColumnDef = {
    key: MatrizColumnKey;
    header?: string;
    width?: string | number;
    render?: (item: MatrizStockItem) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    isDynamic?: boolean;
};

/* ======================== Filtros ======================== */
type FiltrosServidor = {
    busqueda?: string;
    autor?: string;
    rubroIds?: number[];
    proveedorIds?: number[];
};

type TablaMatrizStockProps = {
    onTransferir?: (item: MatrizStockItem, puntoId?: number) => void;
};

/* ======================== Estética ======================== */
// Usamos Azul Marino como base para diferenciar de Artículos (Verde Militar)
const headerBg = verdeMilitar.primary;
const themeColor = verdeMilitar;

type TablaMatrizStockUiState = {
    globalSearch: string;
    globalSearchDraft: string;
    filtrosAutores: string[];
    filtrosMarcas: string[];
    filtros: FiltrosServidor;
    page: number;
    rowsPerPage: number;
};

const tablaMatrizStockUiStateCache = new Map<string, TablaMatrizStockUiState>();

const TablaMatrizStock: React.FC<TablaMatrizStockProps> = ({ onTransferir }) => {
    const cacheKey = 'tabla-matriz-stock';
    const cachedState = tablaMatrizStockUiStateCache.get(cacheKey);
    // --- Estados de Filtros ---
    const [globalSearch, setGlobalSearch] = useState(cachedState?.globalSearch ?? '');
    const tableTopRef = React.useRef<HTMLDivElement>(null);
    const tableContainerRef = React.useRef<HTMLDivElement>(null);
    const pendingRestoreScrollTopRef = React.useRef<number | null>(null);
    const [globalSearchDraft, setGlobalSearchDraft] = useState(cachedState?.globalSearchDraft ?? '');
    const [filtrosAutores, setFiltrosAutores] = useState<string[]>(cachedState?.filtrosAutores ?? []);
    const [filtrosMarcas, setFiltrosMarcas] = useState<string[]>(cachedState?.filtrosMarcas ?? []);
    const [filtros, setFiltros] = useState<FiltrosServidor>(cachedState?.filtros ?? {});
    const [page, setPage] = useState(cachedState?.page ?? 0);
    const [rowsPerPage, setRowsPerPage] = useState(cachedState?.rowsPerPage ?? 150);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        tableTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- Modal Transferencia ---
    const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false);
    const [transferItem, setTransferItem] = useState<MatrizStockItem | null>(null);
    const [transferOrigen, setTransferOrigen] = useState<number | null>(null);

    useEffect(() => {
        tablaMatrizStockUiStateCache.set(cacheKey, {
            globalSearch,
            globalSearchDraft,
            filtrosAutores,
            filtrosMarcas,
            filtros,
            page,
            rowsPerPage,
        });
    }, [cacheKey, globalSearch, globalSearchDraft, filtrosAutores, filtrosMarcas, filtros, page, rowsPerPage]);

    // --- Data Fetching ---
    const { data: puntosData } = useQuery(OBTENER_PUNTOS_MUDRAS, { fetchPolicy: 'cache-first' });
    const puntos = (puntosData as any)?.obtenerPuntosMudras?.filter((p: any) => p.activo) || [];

    const { data, loading, error, refetch } = useQuery<{ obtenerMatrizStock: MatrizStockItem[] }>(
        OBTENER_MATRIZ_STOCK,
        {
            variables: {
                busqueda: globalSearch || undefined,
            },
            fetchPolicy: 'cache-and-network',
        }
    );

    const refetchKeepingScroll = useCallback(() => {
        const current = tableContainerRef.current;
        if (current) pendingRestoreScrollTopRef.current = current.scrollTop;
        return refetch();
    }, [refetch]);

    const matrizData = useMemo(() => data?.obtenerMatrizStock || [], [data]);

    useEffect(() => {
        if (loading) return;
        const prevTop = pendingRestoreScrollTopRef.current;
        if (prevTop == null) return;
        pendingRestoreScrollTopRef.current = null;
        requestAnimationFrame(() => {
            if (tableContainerRef.current) tableContainerRef.current.scrollTop = prevTop;
        });
    }, [loading, matrizData.length]);



    // --- Filtros Bidireccionales (Rubros/Proveedores) ---
    const { data: rubrosData } = useQuery(GET_RUBROS, { fetchPolicy: 'cache-first' });
    const { data: proveedoresData } = useQuery(GET_PROVEEDORES, { fetchPolicy: 'cache-first' });
    const { data: articulosData } = useQuery(GET_ARTICULOS, { fetchPolicy: 'cache-first' });

    // Mapa de ArticuloID -> ProveedorID para "unir" los datos en el cliente
    const articleProviderMap = useMemo(() => {
        const map = new Map<string, number>();
        const arts = (articulosData as any)?.articulos || [];
        arts.forEach((a: Articulo) => {
            if (a.id && a.idProveedor) {
                map.set(String(a.id), a.idProveedor);
            }
        });
        return map;
    }, [articulosData]);

    const articleAuthorMap = useMemo(() => {
        const map = new Map<string, string>();
        const arts = (articulosData as any)?.articulos || [];
        arts.forEach((a: Articulo) => {
            if (a.id && a.Autor) {
                map.set(String(a.id), String(a.Autor));
            }
        });
        return map;
    }, [articulosData]);
    const articleBrandMap = useMemo(() => {
        const map = new Map<string, string>();
        const arts = (articulosData as any)?.articulos || [];
        arts.forEach((a: Articulo) => {
            if (a.id && a.Marca) {
                map.set(String(a.id), String(a.Marca));
            }
        });
        return map;
    }, [articulosData]);

    // Mapa de ProveedorID -> Info para mostrar el Chip
    const proveedorInfoMap = useMemo(() => {
        const map = new Map<number, string>();
        const provs = (proveedoresData as any)?.proveedores || [];
        provs.forEach((p: any) => {
            map.set(Number(p.IdProveedor), p.Nombre);
        });
        return map;
    }, [proveedoresData]);

    const { rubrosDisponibles, proveedoresDisponibles } = useMemo(() => {
        const allProvs: any[] = (proveedoresData as any)?.proveedores || [];
        const allRubros: any[] = (rubrosData as any)?.obtenerRubros || [];

        // Mapas de relaciones (copiado de TablaArticulos)
        const provToRubros = new Map<number, Set<number>>();
        const rubroToProvs = new Map<number, Set<number>>();

        allProvs.forEach((p) => {
            const pId = Number(p.IdProveedor);
            const pRubros = (p.proveedorRubros || []).map((pr: any) => Number(pr.rubro?.Id));

            if (p.rubroId) pRubros.push(Number(p.rubroId));

            const rubroSet = new Set<number>(pRubros);
            provToRubros.set(pId, rubroSet);

            rubroSet.forEach(rId => {
                if (!rubroToProvs.has(rId)) rubroToProvs.set(rId, new Set());
                rubroToProvs.get(rId)?.add(pId);
            });
        });

        // Filtros activos
        const activeProvIds = filtros.proveedorIds || [];
        const activeRubroIds = filtros.rubroIds || [];

        // Calcular proveedores disponibles
        let filteredProvs = allProvs;
        if (activeRubroIds.length > 0) {
            const allowedProvs = new Set<number>();
            activeRubroIds.forEach((rId: number) => {
                rubroToProvs.get(rId)?.forEach(pId => allowedProvs.add(pId));
            });
            filteredProvs = allProvs.filter(p => allowedProvs.has(Number(p.IdProveedor)));
        }

        // Calcular rubros disponibles
        let filteredRubros = allRubros;
        if (activeProvIds.length > 0) {
            const allowedRubros = new Set<number>();
            activeProvIds.forEach((pId: number) => {
                provToRubros.get(pId)?.forEach(rId => allowedRubros.add(rId));
            });
            filteredRubros = allRubros.filter(r => allowedRubros.has(Number(r.id)));
        }

        return { rubrosDisponibles: filteredRubros, proveedoresDisponibles: filteredProvs };
    }, [proveedoresData, rubrosData, filtros.proveedorIds, filtros.rubroIds]);

    const mostrarFiltroAutor = useMemo(() => {
        const rubroIdsActivos = filtros.rubroIds || [];
        if (!rubroIdsActivos.length) return false;
        const rubros = (rubrosData as any)?.obtenerRubros || [];
        return rubros.some((r: any) =>
            rubroIdsActivos.includes(Number(r.id)) &&
            String(r.nombre || r.Rubro || '').trim().toLowerCase() === 'libros'
        );
    }, [filtros.rubroIds, rubrosData]);
    const autoresDisponibles = useMemo(() => {
        const autoresSet = new Set<string>();
        matrizData.forEach((item) => {
            if (String(item.rubro || '').trim().toLowerCase() !== 'libros') return;
            const autor = String(articleAuthorMap.get(String(item.id)) || '').trim();
            if (autor) autoresSet.add(autor);
        });
        filtrosAutores.forEach((autor) => {
            if (autor?.trim()) autoresSet.add(autor.trim());
        });
        return Array.from(autoresSet).sort((a, b) => a.localeCompare(b, 'es'));
    }, [matrizData, articleAuthorMap, filtrosAutores]);
    const marcasDisponibles = useMemo(() => {
        const marcasSet = new Set<string>();
        matrizData.forEach((item) => {
            const marca = String(articleBrandMap.get(String(item.id)) || '').trim();
            if (marca) marcasSet.add(marca);
        });
        filtrosMarcas.forEach((marca) => {
            if (marca?.trim()) marcasSet.add(marca.trim());
        });
        return Array.from(marcasSet).sort((a, b) => a.localeCompare(b, 'es'));
    }, [matrizData, articleBrandMap, filtrosMarcas]);

    useEffect(() => {
        if (mostrarFiltroAutor) return;
        if (filtrosAutores.length === 0) return;
        setFiltrosAutores([]);
    }, [mostrarFiltroAutor, filtrosAutores]);

    // --- Filtering & Pagination Logic (Moved here to access maps) ---
    const filteredData = useMemo(() => {
        let result = [...matrizData];

        // 1. Busqueda Global
        if (globalSearch) {
            const search = globalSearch.toLowerCase();
            result = result.filter(item =>
                (item.nombre || '').toLowerCase().includes(search) ||
                (item.codigo || '').toLowerCase().includes(search) ||
                (item.rubro || '').toLowerCase().includes(search)
            );
        }

        // 2. Filtro por Proveedores (Client-side join)
        if (filtros.proveedorIds && filtros.proveedorIds.length > 0) {
            const allowedProvs = new Set(filtros.proveedorIds);
            result = result.filter(item => {
                const provId = articleProviderMap.get(String(item.id));
                return provId && allowedProvs.has(provId);
            });
        }

        // 3. Filtro por Rubros (Name matching)
        if (filtros.rubroIds && filtros.rubroIds.length > 0) {
            const allRubros: any[] = (rubrosData as any)?.obtenerRubros || [];
            const allowedRubroNames = new Set(
                allRubros
                    .filter((r: any) => filtros.rubroIds?.includes(Number(r.id)))
                    .map((r: any) => (r.nombre || '').toLowerCase())
            );

            if (allowedRubroNames.size > 0) {
                result = result.filter(item =>
                    item.rubro && allowedRubroNames.has(item.rubro.toLowerCase())
                );
            }
        }

        if (filtrosAutores.length > 0) {
            const autoresSet = new Set(filtrosAutores.map((a) => a.trim().toLowerCase()));
            result = result.filter((item) => {
                const autor = articleAuthorMap.get(String(item.id)) || '';
                return autoresSet.has(String(autor).trim().toLowerCase());
            });
        }
        if (filtrosMarcas.length > 0) {
            const marcasSet = new Set(filtrosMarcas.map((m) => m.trim().toLowerCase()));
            result = result.filter((item) => {
                const marca = articleBrandMap.get(String(item.id)) || '';
                return marcasSet.has(String(marca).trim().toLowerCase());
            });
        }

        return result;
    }, [matrizData, globalSearch, filtros.proveedorIds, filtros.rubroIds, filtrosAutores, filtrosMarcas, articleProviderMap, articleAuthorMap, articleBrandMap, rubrosData]);

    const paginatedData = useMemo(() => {
        return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredData, page, rowsPerPage]);

    const totalPaginas = Math.ceil(filteredData.length / rowsPerPage);
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

    // --- Columnas Dinámicas ---
    const puntosUnicos = useMemo(() => {
        const puntosMap = new Map<string, string>(); // id -> nombre
        matrizData.forEach(item => {
            item.stockPorPunto.forEach(sp => {
                puntosMap.set(sp.puntoId, sp.puntoNombre);
            });
        });
        return Array.from(puntosMap.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [matrizData]);

    const columns = useMemo<ColumnDef[]>(() => {
        const baseCols: ColumnDef[] = [
            { key: 'codigo', header: 'Código', width: 100 },
            { key: 'descripcion', header: 'Descripción', width: 300 },
            { key: 'stockTotal', header: 'Total', width: 100, align: 'center' },
        ];

        const dynamicCols: ColumnDef[] = puntosUnicos.map(p => ({
            key: `punto_${p.id}`,
            header: p.nombre,
            width: 100,
            align: 'center',
            isDynamic: true,
            render: (item) => {
                const stock = item.stockPorPunto.find(sp => sp.puntoId === p.id)?.cantidad || 0;
                return (
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Typography variant="body2" fontWeight={stock > 0 ? 600 : 400} color={stock > 0 ? 'text.primary' : 'text.disabled'}>
                            {stock}
                        </Typography>
                        {stock > 0 && (
                            <Tooltip title={`Transferir desde ${p.nombre}`}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenTransfer(item, Number(p.id))}
                                    sx={{
                                        opacity: 0.6,
                                        '&:hover': { opacity: 1, color: themeColor.primary },
                                        width: 24,
                                        height: 24
                                    }}
                                >
                                    <IconArrowRight size={16} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        }));

        const actionCol: ColumnDef = {
            key: 'acciones',
            header: 'Acciones',
            width: 100,
            align: 'center',
            render: (item) => (
                <Tooltip title="Transferir stock">
                    <IconButton
                        size="small"
                        onClick={() => handleOpenTransfer(item)}
                        sx={{ color: themeColor.primary }}
                    >
                        <IconArrowRight size={20} />
                    </IconButton>
                </Tooltip>
            )
        };

        return [...baseCols, ...dynamicCols, actionCol];
    }, [puntosUnicos]);


    // --- Handlers ---
    const handleOpenTransfer = (item: MatrizStockItem, origenId?: number) => {
        setTransferItem(item);
        setTransferOrigen(origenId || null);
        setModalTransferenciaOpen(true);
    };

    const handleNuevaAsignacion = () => {
        setTransferItem(null);
        setTransferOrigen(null);
        setModalTransferenciaOpen(true);
    };

    const ejecutarBusqueda = () => {
        setGlobalSearch(globalSearchDraft);
        setPage(0);
    };

    const limpiarFiltros = () => {
        setGlobalSearch('');
        setGlobalSearchDraft('');
        setFiltrosAutores([]);
        setFiltrosMarcas([]);
        setFiltros({});
        setPage(0);
    };

    // --- Render Cell ---
    const renderCell = (col: ColumnDef, item: MatrizStockItem) => {
        if (col.render) return col.render(item);

        switch (col.key) {
            case 'codigo':
                return <Chip label={item.codigo} size="small" sx={{ borderRadius: 1, bgcolor: '#f5f5f5', fontWeight: 600 }} />;
            case 'descripcion':
                return (
                    <Box display="flex" flexDirection="column" gap={0.5}>
                        <Typography variant="body2" fontWeight={600} color={headerBg}>
                            {item.nombre}
                        </Typography>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                            {item.rubro && (
                                <Chip
                                    label={item.rubro}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        color: verdeMilitar.primary,
                                        borderColor: alpha(verdeMilitar.primary, 0.3),
                                        height: 20,
                                        fontSize: '0.7rem'
                                    }}
                                />
                            )}
                            {(() => {
                                const provId = articleProviderMap.get(String(item.id));
                                const provName = provId ? proveedorInfoMap.get(provId) : null;
                                return provName ? (
                                    <Chip
                                        label={provName}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            color: darken(verdeMilitar.primary, 0.4),
                                            borderColor: alpha(darken(verdeMilitar.primary, 0.4), 0.3),
                                            height: 20,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                ) : null;
                            })()}
                            {(() => {
                                const marca = articleBrandMap.get(String(item.id));
                                return marca ? (
                                    <Chip
                                        label={`Marca: ${marca}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            color: '#455a64',
                                            borderColor: alpha('#455a64', 0.3),
                                            height: 20,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                ) : null;
                            })()}
                            {(() => {
                                const autor = articleAuthorMap.get(String(item.id));
                                return autor && String(item.rubro || '').trim().toLowerCase() === 'libros' ? (
                                    <Chip
                                        label={`Autor: ${autor}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            color: '#6a1b9a',
                                            borderColor: alpha('#6a1b9a', 0.3),
                                            height: 20,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                ) : null;
                            })()}
                        </Box>
                    </Box>
                );
            case 'stockTotal':
                return <Typography variant="body2" fontWeight={700}>{item.stockTotal}</Typography>;
            default:
                return null;
        }
    };

    // --- Export ---
    const client = useApolloClient();
    const [exporting, setExporting] = useState(false);

    const handleExportar = async (type: 'pdf' | 'excel') => {
        try {
            setExporting(true);
            // Re-fetch all data for export if needed, or use current data
            // For simplicity using current data
            const exportData = matrizData;

            const exportCols: ExportColumn<MatrizStockItem>[] = [
                { header: 'Código', key: 'codigo', width: 15 },
                { header: 'Descripción', key: 'nombre', width: 40 },
                { header: 'Autor', key: (item) => String(item.rubro || '').trim().toLowerCase() === 'libros' ? (articleAuthorMap.get(String(item.id)) || '') : '', width: 28 },
                { header: 'Rubro', key: 'rubro', width: 20 },
                // { header: 'Proveedor', key: 'proveedor', width: 20 },
                { header: 'Total', key: 'stockTotal', width: 10 },
            ];

            puntosUnicos.forEach(p => {
                exportCols.push({
                    header: p.nombre,
                    key: (item) => item.stockPorPunto.find(sp => sp.puntoId === p.id)?.cantidad || 0,
                    width: 15
                });
            });

            const timestamp = new Date().toISOString().split('T')[0];
            if (type === 'excel') {
                exportToExcel(exportData, exportCols, `Stock_Global_${timestamp}`, 'Matriz de Stock');
            } else {
                await exportToPdf(exportData, exportCols, `Stock_Global_${timestamp}`, 'Matriz de Stock Global', 'Filtros aplicados');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setExporting(false);
        }
    };


    return (
        <Box sx={{ width: '100%' }}>
            {/* --- Toolbar (Clone of TablaArticulos) --- */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, p: 2, bgcolor: '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    {/* Left: Actions (Title removed as it's in the Tab) */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <Button
                            variant="contained"
                            startIcon={<IconPlus size={18} />}
                            onClick={handleNuevaAsignacion}
                            disableElevation
                            sx={{
                                bgcolor: themeColor.primary,
                                '&:hover': { bgcolor: alpha(themeColor.primary, 0.9) },
                                textTransform: 'none',
                                borderRadius: 0,
                                fontWeight: 600,
                                px: 3
                            }}
                        >
                            Nueva Asignación
                        </Button>
                    </Box>

                    {/* Right: Search + Limpiar */}
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <TextField
                            placeholder="Buscar descripción o código..."
                            size="small"
                            value={globalSearchDraft}
                            onChange={(e) => setGlobalSearchDraft(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && ejecutarBusqueda()}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><IconSearch size={18} color="#757575" /></InputAdornment>
                            }}
                            sx={{ minWidth: 350, '& .MuiOutlinedInput-root': { bgcolor: '#f9f9f9' } }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<IconRefresh size={18} />}
                            onClick={limpiarFiltros}
                            sx={{ borderRadius: 0, textTransform: 'none', color: '#757575', borderColor: '#e0e0e0', height: 40, fontWeight: 600 }}
                        >
                            Limpiar
                        </Button>
                    </Box>
                </Box>

                <Divider />

                {/* --- Filters Row --- */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="nowrap" gap={2}>
                    <Box display="flex" gap={2}>
                        <Button variant="outlined" startIcon={<IconFileSpreadsheet size={18} />} onClick={() => handleExportar('excel')} sx={{ borderRadius: 0, color: '#1D6F42', borderColor: '#1D6F42', fontWeight: 600, textTransform: 'none' }}>Excel</Button>
                        <Button variant="outlined" startIcon={<IconFileTypePdf size={18} />} onClick={() => handleExportar('pdf')} sx={{ borderRadius: 0, color: '#B71C1C', borderColor: '#B71C1C', fontWeight: 600, textTransform: 'none' }}>PDF</Button>
                    </Box>

                    {/* Combos */}
                    <Box display="flex" flexDirection="column" gap={2} sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box display="flex" gap={2} flexWrap="nowrap" sx={{ minWidth: 0 }}>
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={proveedoresDisponibles}
                                getOptionLabel={(option: any) => option.Nombre || ''}
                                value={proveedoresDisponibles.filter((p: any) => (filtros.proveedorIds || []).includes(Number(p.IdProveedor)))}
                                onChange={(_, newValue) => {
                                    const ids = newValue.map((v: any) => Number(v.IdProveedor));
                                    setFiltros(prev => ({ ...prev, proveedorIds: ids, proveedorId: ids[0] })); // Set single ID too for compat
                                    setPage(0);
                                }}
                                renderOption={(props, option: any, { selected }) => (
                                    <li {...props}>
                                        <Checkbox icon={<CheckBoxOutlineBlankIcon fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={selected} style={{ marginRight: 8 }} />
                                        {option.Nombre}
                                    </li>
                                )}
                                renderInput={(params) => <TextField {...params} label="Proveedores" size="small" />}
                                fullWidth
                                sx={{ flex: '1 1 0', minWidth: 0 }}
                            />
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={rubrosDisponibles}
                                getOptionLabel={(option: any) => option.nombre || option.Rubro || ''}
                                value={rubrosDisponibles.filter((r: any) => (filtros.rubroIds || []).includes(Number(r.id)))}
                                onChange={(_, newValue) => {
                                    const ids = newValue.map((v: any) => Number(v.id));
                                    setFiltros(prev => ({ ...prev, rubroIds: ids }));
                                    setPage(0);
                                }}
                                renderOption={(props, option: any, { selected }) => (
                                    <li {...props}>
                                        <Checkbox icon={<CheckBoxOutlineBlankIcon fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={selected} style={{ marginRight: 8 }} />
                                        {option.nombre || option.Rubro}
                                    </li>
                                )}
                                renderInput={(params) => <TextField {...params} label="Rubros" size="small" />}
                                fullWidth
                                sx={{ flex: '1 1 0', minWidth: 0 }}
                            />
                        </Box>
                        <Box display="flex" gap={2} flexWrap="nowrap" sx={{ minWidth: 0 }}>
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={marcasDisponibles}
                                value={filtrosMarcas}
                                onChange={(_, newValue) => {
                                    setFiltrosMarcas(newValue);
                                    setPage(0);
                                }}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox icon={<CheckBoxOutlineBlankIcon fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={selected} style={{ marginRight: 8 }} />
                                        {option}
                                    </li>
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            key={option}
                                            variant="outlined"
                                            label={option}
                                            size="small"
                                            {...getTagProps({ index })}
                                            sx={{
                                                borderColor: alpha('#455a64', 0.3),
                                                color: '#455a64',
                                                bgcolor: alpha('#455a64', 0.05),
                                                borderRadius: 1,
                                            }}
                                        />
                                    ))
                                }
                                renderInput={(params) => <TextField {...params} label="Marcas" size="small" />}
                                fullWidth
                                sx={{ flex: '1 1 0', minWidth: 0 }}
                            />
                            {mostrarFiltroAutor ? (
                                <Autocomplete
                                    multiple
                                    disableCloseOnSelect
                                    options={autoresDisponibles}
                                    value={filtrosAutores}
                                    onChange={(_, newValue) => {
                                        setFiltrosAutores(newValue);
                                        setPage(0);
                                    }}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox icon={<CheckBoxOutlineBlankIcon fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={selected} style={{ marginRight: 8 }} />
                                            {option}
                                        </li>
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                key={option}
                                                variant="outlined"
                                                label={option}
                                                size="small"
                                                {...getTagProps({ index })}
                                                sx={{
                                                    borderColor: alpha('#6a1b9a', 0.3),
                                                    color: '#6a1b9a',
                                                    bgcolor: alpha('#6a1b9a', 0.05),
                                                    borderRadius: 1,
                                                }}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => <TextField {...params} label="Autores (Libros)" size="small" />}
                                    fullWidth
                                    sx={{ flex: '1 1 0', minWidth: 0 }}
                                />
                            ) : (
                                <Box sx={{ flex: '1 1 0', minWidth: 0 }} />
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box ref={tableTopRef} />

            {/* --- Top Pagination --- */}
            <PaginacionMudras
                page={page}
                rowsPerPage={rowsPerPage}
                total={filteredData.length}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                accentColor={azulMarino.primary}
            />

            {/* --- Table --- */}
            <TableContainer ref={tableContainerRef} component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>N°</TableCell>
                            {columns.map(col => (
                                <TableCell
                                    key={col.key}
                                    align={col.align}
                                    sx={{
                                        bgcolor: themeColor.headerBg,
                                        color: themeColor.headerText,
                                        fontWeight: 700,
                                        minWidth: col.width
                                    }}
                                >
                                    {col.header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={columns.length + 1} align="center" sx={{ py: 5 }}><MudrasLoader /></TableCell></TableRow>
                        ) : matrizData.length === 0 ? (
                            <TableRow><TableCell colSpan={columns.length + 1} align="center" sx={{ py: 5 }}><Typography>No hay datos</Typography></TableCell></TableRow>
                        ) : (
                            paginatedData.map((item, idx) => (
                                <TableRow key={item.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: themeColor.alternateRow } }}>
                                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                                    {columns.map(col => (
                                        <TableCell key={col.key} align={col.align}>
                                            {renderCell(col, item)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* --- Pagination --- */}
            <PaginacionMudras
                page={page}
                rowsPerPage={rowsPerPage}
                total={filteredData.length}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                accentColor={azulMarino.primary}
            />

            {/* --- Modales --- */}
            {modalTransferenciaOpen && (
                <TransferirStockModal
                    open={modalTransferenciaOpen}
                    onClose={() => {
                        setModalTransferenciaOpen(false);
                        setTransferItem(null);
                    }}
                    puntos={puntos}
                    articuloPreseleccionado={transferItem}
                    origenPreseleccionado={transferOrigen}
                    onTransferenciaRealizada={() => {
                        refetchKeepingScroll();
                        window.dispatchEvent(new CustomEvent('stockGlobalActualizado'));
                    }}
                />
            )}
        </Box>
    );
};

export default TablaMatrizStock;
