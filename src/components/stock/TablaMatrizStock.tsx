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
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { alpha } from '@mui/material/styles';
import { useQuery, useApolloClient } from '@apollo/client/react';
import {
    IconSearch, IconRefresh, IconDotsVertical,
    IconFileTypePdf, IconFileSpreadsheet, IconArrowRight
} from '@tabler/icons-react';
import { Icon } from '@iconify/react';
import MudrasLoader from '@/components/ui/MudrasLoader';
import { OBTENER_MATRIZ_STOCK, OBTENER_PUNTOS_MUDRAS, type MatrizStockItem } from '@/components/puntos-mudras/graphql/queries';
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import { azulMarino, verde, azul } from '@/ui/colores';
import { exportToExcel, exportToPdf, ExportColumn } from '@/utils/exportUtils';
import TransferirStockModal from './TransferirStockModal';

/* ======================== Tipos ======================== */
type MatrizColumnKey = 'codigo' | 'descripcion' | 'rubro' | 'stockTotal' | 'acciones' | string;

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
    rubro?: string;
    proveedorId?: number;
    rubroIds?: number[];
    proveedorIds?: number[];
};

type TablaMatrizStockProps = {
    onTransferir?: (item: MatrizStockItem, puntoId?: number) => void;
};

/* ======================== Estética ======================== */
// Usamos Azul Marino como base para diferenciar de Artículos (Verde Militar)
const headerBg = azulMarino.primary;
const themeColor = azulMarino;

const TablaMatrizStock: React.FC<TablaMatrizStockProps> = ({ onTransferir }) => {
    // --- Estados de Filtros ---
    const [globalSearch, setGlobalSearch] = useState('');
    const [globalSearchDraft, setGlobalSearchDraft] = useState('');
    const [filtros, setFiltros] = useState<FiltrosServidor>({});

    // --- Modal Transferencia ---
    const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false);
    const [transferItem, setTransferItem] = useState<MatrizStockItem | null>(null);
    const [transferOrigen, setTransferOrigen] = useState<number | null>(null);

    // --- Data Fetching ---
    const { data: puntosData } = useQuery(OBTENER_PUNTOS_MUDRAS, { fetchPolicy: 'cache-first' });
    const puntos = (puntosData as any)?.obtenerPuntosMudras?.filter((p: any) => p.activo) || [];

    const { data, loading, error, refetch } = useQuery<{ obtenerMatrizStock: MatrizStockItem[] }>(
        OBTENER_MATRIZ_STOCK,
        {
            variables: {
                busqueda: globalSearch || undefined,
                rubro: filtros.rubro || undefined,
                proveedorId: filtros.proveedorId || undefined,
                // Nota: El backend de matriz podría necesitar actualizarse para soportar arrays de IDs si queremos filtro múltiple real en la query
                // Por ahora mapeamos el primero si existe o usamos lógica de cliente si el backend no soporta múltiple
            },
            fetchPolicy: 'cache-and-network',
        }
    );

    const matrizData = data?.obtenerMatrizStock || [];

    // --- Filtros Bidireccionales (Rubros/Proveedores) ---
    const { data: rubrosData } = useQuery(GET_RUBROS, { fetchPolicy: 'cache-first' });
    const { data: proveedoresData } = useQuery(GET_PROVEEDORES, { fetchPolicy: 'cache-first' });

    const { rubrosDisponibles, proveedoresDisponibles } = useMemo(() => {
        const allProvs: any[] = (proveedoresData as any)?.proveedores || [];
        const allRubros: any[] = (rubrosData as any)?.obtenerRubros || [];

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

        const activeProvIds = filtros.proveedorIds || [];
        const activeRubroIds = filtros.rubroIds || [];

        let filteredProvs = allProvs;
        if (activeRubroIds.length > 0) {
            const allowedProvs = new Set<number>();
            activeRubroIds.forEach((rId: number) => {
                rubroToProvs.get(rId)?.forEach(pId => allowedProvs.add(pId));
            });
            filteredProvs = allProvs.filter(p => allowedProvs.has(Number(p.IdProveedor)));
        }

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
            { key: 'rubro', header: 'Rubro', width: 150 },
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
                    <Typography variant="body2" fontWeight={stock > 0 ? 600 : 400} color={stock > 0 ? 'text.primary' : 'text.disabled'}>
                        {stock}
                    </Typography>
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
    }, [puntosUnicos, themeColor]);


    // --- Handlers ---
    const handleOpenTransfer = (item: MatrizStockItem, origenId?: number) => {
        setTransferItem(item);
        setTransferOrigen(origenId || null);
        setModalTransferenciaOpen(true);
    };

    const ejecutarBusqueda = () => {
        setGlobalSearch(globalSearchDraft);
    };

    const limpiarFiltros = () => {
        setGlobalSearch('');
        setGlobalSearchDraft('');
        setFiltros({});
    };

    // --- Render Cell ---
    const renderCell = (col: ColumnDef, item: MatrizStockItem) => {
        if (col.render) return col.render(item);

        switch (col.key) {
            case 'codigo':
                return <Chip label={item.codigo} size="small" sx={{ borderRadius: 1, bgcolor: '#f5f5f5', fontWeight: 600 }} />;
            case 'descripcion':
                return <Typography variant="body2" fontWeight={600} color={headerBg}>{item.nombre}</Typography>;
            case 'rubro':
                return item.rubro ? (
                    <Chip label={item.rubro} size="small" variant="outlined" sx={{ color: themeColor.primary, borderColor: alpha(themeColor.primary, 0.3) }} />
                ) : null;
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
                { header: 'Rubro', key: 'rubro', width: 20 },
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
                    {/* Left: Title or Actions */}
                    <Typography variant="h6" color={themeColor.primary} fontWeight={700}>
                        Matriz de Stock
                    </Typography>

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
                            sx={{ borderRadius: 0, textTransform: 'none', color: '#757575', borderColor: '#e0e0e0', height: 40 }}
                        >
                            Limpiar
                        </Button>
                    </Box>
                </Box>

                <Divider />

                {/* --- Filters Row --- */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="nowrap" gap={2}>
                    {/* Export */}
                    <Box display="flex" gap={2}>
                        <Button variant="outlined" startIcon={<IconFileSpreadsheet size={18} />} onClick={() => handleExportar('excel')} sx={{ borderRadius: 0, color: '#1D6F42', borderColor: '#1D6F42' }}>Excel</Button>
                        <Button variant="outlined" startIcon={<IconFileTypePdf size={18} />} onClick={() => handleExportar('pdf')} sx={{ borderRadius: 0, color: '#B71C1C', borderColor: '#B71C1C' }}>PDF</Button>
                    </Box>

                    {/* Combos */}
                    <Box display="flex" gap={2} sx={{ flexGrow: 1 }}>
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={proveedoresDisponibles}
                            getOptionLabel={(option: any) => option.Nombre || ''}
                            value={proveedoresDisponibles.filter((p: any) => (filtros.proveedorIds || []).includes(Number(p.IdProveedor)))}
                            onChange={(_, newValue) => {
                                const ids = newValue.map((v: any) => Number(v.IdProveedor));
                                setFiltros(prev => ({ ...prev, proveedorIds: ids, proveedorId: ids[0] })); // Set single ID too for compat
                            }}
                            renderOption={(props, option: any, { selected }) => (
                                <li {...props}>
                                    <Checkbox icon={<CheckBoxOutlineBlankIcon fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={selected} style={{ marginRight: 8 }} />
                                    {option.Nombre}
                                </li>
                            )}
                            renderInput={(params) => <TextField {...params} label="Proveedores" size="small" />}
                            fullWidth
                        />
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={rubrosDisponibles}
                            getOptionLabel={(option: any) => option.nombre || option.Rubro || ''}
                            value={rubrosDisponibles.filter((r: any) => (filtros.rubroIds || []).includes(Number(r.id)))}
                            onChange={(_, newValue) => {
                                const ids = newValue.map((v: any) => Number(v.id));
                                const names = newValue.map((v: any) => v.nombre || v.Rubro).join(','); // Hack if query uses string
                                setFiltros(prev => ({ ...prev, rubroIds: ids, rubro: names }));
                            }}
                            renderOption={(props, option: any, { selected }) => (
                                <li {...props}>
                                    <Checkbox icon={<CheckBoxOutlineBlankIcon fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={selected} style={{ marginRight: 8 }} />
                                    {option.nombre || option.Rubro}
                                </li>
                            )}
                            renderInput={(params) => <TextField {...params} label="Rubros" size="small" />}
                            fullWidth
                        />
                    </Box>
                </Box>
            </Box>

            {/* --- Table --- */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: '1px solid #e0e0e0', maxHeight: 'calc(100vh - 300px)' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
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
                            <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}><MudrasLoader /></TableCell></TableRow>
                        ) : matrizData.length === 0 ? (
                            <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}><Typography>No hay datos</Typography></TableCell></TableRow>
                        ) : (
                            matrizData.map(item => (
                                <TableRow key={item.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: themeColor.alternateRow } }}>
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

            {/* --- Modales --- */}
            {transferItem && (
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
                        refetch();
                        window.dispatchEvent(new CustomEvent('stockGlobalActualizado'));
                    }}
                />
            )}
        </Box>
    );
};

export default TablaMatrizStock;
