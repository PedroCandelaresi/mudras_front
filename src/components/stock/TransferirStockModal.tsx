import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Typography,
    Alert,
    Box,
    Divider,
    IconButton,
    Paper,
    Autocomplete,
    InputAdornment,
    Chip,
    Snackbar
} from '@mui/material';
import { Icon } from '@iconify/react';
import { verde, azul } from '@/ui/colores';
import { alpha, darken } from '@mui/material/styles';

// Components
import { TablaArticulos } from '@/components/articulos';

// Queries & Mutations
import { GET_RUBROS } from '@/components/rubros/graphql/queries';
import { GET_PROVEEDORES } from '@/components/proveedores/graphql/queries';
import {
    BUSCAR_ARTICULOS_PARA_ASIGNACION,
    type BuscarArticulosParaAsignacionResponse
} from '@/components/puntos-mudras/graphql/queries';

const TRANSFERIR_STOCK = gql`
  mutation TransferirStock($input: TransferirStockInput!) {
    transferirStock(input: $input)
}
`;

interface TransferirStockModalProps {
    open: boolean;
    onClose: () => void;
    puntos: any[];
    onTransferenciaRealizada?: () => void;
    articuloPreseleccionado?: any;
    origenPreseleccionado?: number | null;
}

const VH_MAX = 90;

export default function TransferirStockModal({
    open,
    onClose,
    puntos,
    onTransferenciaRealizada,
    articuloPreseleccionado,
    origenPreseleccionado
}: TransferirStockModalProps) {
    // Styles
    const COLORS = {
        primary: verde.primary,
        secondary: verde.headerBorder || '#2e7d32',
        textStrong: darken(verde.primary, 0.4),
        headerText: '#fff',
        bgLight: '#f8f9fa',
        border: '#e0e0e0',
        selectionBg: alpha(verde.primary, 0.08)
    };

    // --- States for Filters ---
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState<{ IdProveedor: number; Nombre?: string } | null>(null);
    const [rubroSeleccionado, setRubroSeleccionado] = useState<{ id: number; nombre: string } | null>(null);
    const [busqueda, setBusqueda] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    // --- States for Selection & Transfer ---
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<any | null>(null);
    const [origen, setOrigen] = useState<number | ''>('');
    const [destino, setDestino] = useState<number | ''>('');
    const [cantidad, setCantidad] = useState<string>('');
    const [motivo, setMotivo] = useState('');
    const [stockEnOrigen, setStockEnOrigen] = useState<number>(0);
    const [cargandoStock, setCargandoStock] = useState(false);

    // --- Create/Error State ---
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // --- Queries ---
    const { data: dataProveedores } = useQuery(GET_PROVEEDORES);
    const { data: dataRubros } = useQuery(GET_RUBROS);

    const [transferirStock, { loading: transferindo }] = useMutation(TRANSFERIR_STOCK, {
        refetchQueries: ['ObtenerStockPuntoMudras', 'BuscarArticulos']
    });

    const [buscarStockEnPunto] = useLazyQuery<BuscarArticulosParaAsignacionResponse>(BUSCAR_ARTICULOS_PARA_ASIGNACION, {
        fetchPolicy: 'network-only'
    });

    // --- Derived Data ---
    const proveedores = useMemo(() => (dataProveedores as any)?.proveedores || [], [dataProveedores]);

    const rubros = useMemo(() => {
        const allRubros = (dataRubros as any)?.obtenerRubros || [];
        if (!proveedorSeleccionado) return allRubros;
        const prov = proveedores.find((p: any) => Number(p.IdProveedor) === Number(proveedorSeleccionado.IdProveedor));
        if (prov && prov.proveedorRubros) {
            const rubrosIds = new Set(prov.proveedorRubros.map((pr: any) => Number(pr.rubro?.Id)));
            return allRubros.filter((r: any) => rubrosIds.has(Number(r.id)));
        }
        return allRubros;
    }, [dataRubros, proveedorSeleccionado, proveedores]);

    const puntosOrdenados = useMemo(() =>
        [...puntos].sort((a, b) => a.nombre.localeCompare(b.nombre)),
        [puntos]
    );

    // --- Effects ---
    const handleClearFilters = useCallback(() => {
        setProveedorSeleccionado(null);
        setRubroSeleccionado(null);
        setBusqueda('');
        setPage(0);
    }, []);

    const handleClearSelection = useCallback(() => {
        setArticuloSeleccionado(null);
        setOrigen('');
        setDestino('');
        setCantidad('');
        setMotivo('');
        setStockEnOrigen(0);
        setConfirmOpen(false);
    }, []);

    useEffect(() => {
        if (open) {
            handleClearFilters();
            handleClearSelection();

            if (articuloPreseleccionado) {
                setArticuloSeleccionado(articuloPreseleccionado);
            }
            if (origenPreseleccionado) {
                setOrigen(origenPreseleccionado);
            }
        }
    }, [open, articuloPreseleccionado, origenPreseleccionado, handleClearFilters, handleClearSelection]);

    // Auto-select destination only if simplified mode (articuloPreseleccionado exists)
    useEffect(() => {
        if (articuloPreseleccionado && origen && puntos.length === 2) {
            const other = puntos.find(p => p.id !== origen);
            if (other) setDestino(other.id);
        }
    }, [articuloPreseleccionado, origen, puntos]);


    useEffect(() => {
        setPage(0);
    }, [proveedorSeleccionado, rubroSeleccionado, busqueda]);

    const fetchStockOrigen = useCallback(async () => {
        if (!articuloSeleccionado?.codigo || !origen) return;
        setCargandoStock(true);
        try {
            const { data } = await buscarStockEnPunto({
                variables: {
                    busqueda: articuloSeleccionado.codigo,
                    destinoId: Number(origen)
                }
            });
            const found = data?.buscarArticulosParaAsignacion?.[0];
            setStockEnOrigen(found?.stockEnDestino ?? 0);
        } catch (error) {
            console.error('Error fetching stock:', error);
            setStockEnOrigen(0);
        } finally {
            setCargandoStock(false);
        }
    }, [articuloSeleccionado, origen, buscarStockEnPunto]);

    // Update stock when origin changes
    useEffect(() => {
        if (articuloSeleccionado && origen) {
            fetchStockOrigen();
        } else {
            setStockEnOrigen(0);
        }
    }, [articuloSeleccionado, origen, fetchStockOrigen]);

    // --- Handlers ---
    const handleSelectArticle = useCallback((art: any) => {
        if (articuloSeleccionado?.id === art.id) {
            handleClearSelection();
        } else {
            setArticuloSeleccionado(art);
            setOrigen(''); // Reset origin to force re-selection and stock check
            setDestino('');
            setCantidad('');
        }
    }, [articuloSeleccionado, handleClearSelection]);

    const handleSubmit = async () => {
        if (!articuloSeleccionado || !origen || !destino || !cantidad) return;

        try {
            await transferirStock({
                variables: {
                    input: {
                        puntoOrigenId: Number(origen),
                        puntoDestinoId: Number(destino),
                        articuloId: Number(articuloSeleccionado.id),
                        cantidad: Number(cantidad),
                        motivo: motivo || 'Transferencia desde panel global'
                    }
                }
            });

            setSnackbar({ open: true, message: 'Transferencia exitosa', severity: 'success' });
            if (onTransferenciaRealizada) onTransferenciaRealizada();
            window.dispatchEvent(new CustomEvent('stockGlobalActualizado'));

            handleCloseInternal();

        } catch (err: any) {
            console.error('Error transfer:', err);
            setSnackbar({ open: true, message: err.message || 'Error al transferir', severity: 'error' });
        } finally {
            setConfirmOpen(false);
        }
    };

    const handleCloseInternal = () => {
        setConfirmOpen(false);
        onClose();
    };

    // --- Table Configuration ---
    const columns = useMemo(() => [
        { key: 'codigo', header: 'Código', width: '20%' },
        { key: 'descripcion', header: 'Descripción', width: '50%' },
        { key: 'stock', header: 'Stock Global', width: '15%', align: 'center' },
        {
            key: 'acciones',
            header: '',
            width: '15%',
            align: 'center',
            render: (art: any) => (
                <Button
                    variant={articuloSeleccionado?.id === art.id ? "contained" : "outlined"}
                    size="small"
                    onClick={() => handleSelectArticle(art)}
                    startIcon={<Icon icon={articuloSeleccionado?.id === art.id ? "mdi:check" : "mdi:cursor-default-click"} />}
                    color={articuloSeleccionado?.id === art.id ? "primary" : "inherit"}
                    sx={{
                        borderRadius: 20,
                        textTransform: 'none',
                        borderColor: COLORS.border,
                        color: articuloSeleccionado?.id === art.id ? '#fff' : 'text.secondary'
                    }}
                >
                    {articuloSeleccionado?.id === art.id ? "Elegido" : "Elegir"}
                </Button>
            )
        }
    ], [articuloSeleccionado, COLORS.border, handleSelectArticle]);

    const controlledFilters = useMemo(() => {
        const filters: any = { pagina: page, limite: rowsPerPage };
        if (proveedorSeleccionado) filters.proveedorId = Number(proveedorSeleccionado.IdProveedor);
        if (rubroSeleccionado) filters.rubroId = Number(rubroSeleccionado.id);
        if (busqueda) filters.busqueda = busqueda;
        return filters;
    }, [proveedorSeleccionado, rubroSeleccionado, busqueda, page, rowsPerPage]);

    // --- Validation ---
    const cantidadNum = parseFloat(cantidad) || 0;
    const isValid =
        articuloSeleccionado &&
        origen &&
        destino &&
        origen !== destino &&
        cantidadNum > 0 &&
        cantidadNum <= stockEnOrigen;

    // --- Render Simplified View ---
    const isSimplified = !!articuloPreseleccionado;

    return (
        <>
            <Dialog
                open={open}
                onClose={handleCloseInternal}
                maxWidth={isSimplified ? "sm" : "xl"}
                fullWidth
                PaperProps={{
                    elevation: 4,
                    sx: {
                        borderRadius: 0,
                        bgcolor: '#ffffff',
                        height: isSimplified ? 'auto' : `${VH_MAX}vh`,
                        maxHeight: isSimplified ? 'auto' : `${VH_MAX}vh`,
                    },
                }}
            >
                {/* Header */}
                <Box sx={{
                    borderRadius: 0,
                    bgcolor: COLORS.primary,
                    color: COLORS.headerText,
                    px: isSimplified ? 3 : 5,
                    py: isSimplified ? 2 : 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `4px solid ${COLORS.secondary}`,
                }}>
                    <Box display="flex" alignItems="center" gap={3}>
                        <Icon icon="mdi:transfer" width={isSimplified ? 24 : 32} height={isSimplified ? 24 : 32} />
                        <Box>
                            <Typography variant={isSimplified ? "h6" : "h5"} fontWeight={700} letterSpacing={1}>
                                TRANSFERENCIA DE STOCK
                            </Typography>
                            {!isSimplified && (
                                <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 400, mt: 0.5 }}>
                                    Mueve stock entre depósitos y puntos de venta.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <IconButton onClick={handleCloseInternal} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                        <Icon icon="mdi:close" width={isSimplified ? 24 : 32} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 0, display: 'flex', bgcolor: COLORS.bgLight, overflow: 'hidden', flexDirection: isSimplified ? 'column' : 'row' }}>

                    {/* LEFT: Selection Panel (Only visible if NOT simplified) */}
                    {!isSimplified && (
                        <Box sx={{ flex: 65, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${COLORS.border}`, bgcolor: '#fff' }}>
                            <Box sx={{ p: 4, borderBottom: `1px solid ${COLORS.border}` }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textStrong, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icon icon="mdi:magnify" />
                                        1. BUSCAR ARTÍCULO
                                    </Typography>
                                    {(proveedorSeleccionado || rubroSeleccionado || busqueda) && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleClearFilters}
                                            startIcon={<Icon icon="mdi:refresh" />}
                                            sx={{ textTransform: 'none', color: 'text.secondary', borderColor: COLORS.border }}
                                        >
                                            Limpiar
                                        </Button>
                                    )}
                                </Box>
                                <Box display="flex" gap={2} flexWrap="wrap">
                                    <Autocomplete
                                        options={proveedores}
                                        getOptionLabel={(o: any) => o.Nombre || ''}
                                        value={proveedorSeleccionado}
                                        onChange={(_, v) => { setProveedorSeleccionado(v); setRubroSeleccionado(null); }}
                                        renderInput={(params) => <TextField {...params} label="Proveedor" size="small" />}
                                        sx={{ flex: 1, minWidth: 200 }}
                                    />
                                    <Autocomplete
                                        options={rubros}
                                        getOptionLabel={(o: any) => o.nombre || ''}
                                        value={rubroSeleccionado}
                                        onChange={(_, v) => setRubroSeleccionado(v)}
                                        renderInput={(params) => <TextField {...params} label="Rubro" size="small" />}
                                        disabled={!proveedorSeleccionado}
                                        sx={{ flex: 1, minWidth: 200 }}
                                    />
                                    <TextField
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        placeholder="Código o descripción..."
                                        size="small"
                                        sx={{ flex: 1.5, minWidth: 250 }}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Icon icon="mdi:barcode-scan" /></InputAdornment>
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ flex: 1, p: 4, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                <TablaArticulos
                                    columns={columns as any}
                                    controlledFilters={controlledFilters}
                                    onFiltersChange={(newFilters) => {
                                        if (newFilters.pagina !== undefined) setPage(newFilters.pagina);
                                        if (newFilters.limite !== undefined) setRowsPerPage(newFilters.limite);
                                    }}
                                    showToolbar={false}
                                    allowCreate={false}
                                    defaultPageSize={50}
                                    rowsPerPageOptions={[20, 50, 100]}
                                    dense
                                    rootSx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                    tableContainerSx={{ flex: 1, minHeight: 0, border: 'none' }}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* RIGHT: Action Panel (Always visible, but larger if simplified) */}
                    <Box sx={{ flex: isSimplified ? 1 : 35, display: 'flex', flexDirection: 'column', bgcolor: '#f9fafb', borderLeft: !isSimplified ? `1px solid ${COLORS.border}` : 'none', minHeight: 0, overflowY: 'auto' }}>
                        <Box sx={{ p: 4, flex: 1 }}>
                            {!isSimplified && (
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: COLORS.textStrong, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Icon icon="mdi:dolly" />
                                    2. TRANSFERIR
                                </Typography>
                            )}

                            {!articuloSeleccionado ? (
                                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60%" color="text.secondary" sx={{ opacity: 0.6 }}>
                                    <Icon icon="mdi:cursor-default-click-outline" width={80} style={{ marginBottom: 24, opacity: 0.5 }} />
                                    <Typography align="center" variant="h6" fontWeight={500}>
                                        Seleccione un artículo
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Paper elevation={0} variant="outlined" sx={{ p: 2.5, mb: 4, bgcolor: '#fff', borderColor: COLORS.secondary, borderRadius: 2 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                                    ARTÍCULO
                                                </Typography>
                                                <Typography variant="subtitle1" fontWeight={700} color={COLORS.textStrong}>
                                                    {articuloSeleccionado.nombre || articuloSeleccionado.Descripcion}
                                                </Typography>
                                                <Chip label={articuloSeleccionado.codigo || articuloSeleccionado.Codigo} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                                            </Box>
                                            {!isSimplified && (
                                                <IconButton size="small" onClick={handleClearSelection}><Icon icon="mdi:close" /></IconButton>
                                            )}
                                        </Box>
                                    </Paper>

                                    <Box display="flex" flexDirection="column" gap={3}>
                                        {/* Origen */}
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>DESDE (ORIGEN)</Typography>
                                            <TextField
                                                select
                                                fullWidth
                                                value={origen}
                                                onChange={(e) => {
                                                    setOrigen(Number(e.target.value));
                                                    setDestino(''); // Clear destination if origin changes
                                                }}
                                                size="small"
                                                sx={{ bgcolor: '#fff' }}
                                            >
                                                {puntosOrdenados.map(p => (
                                                    <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                                                ))}
                                            </TextField>
                                            {origen !== '' && (
                                                <Box display="flex" alignItems="center" gap={1} mt={1} p={1} bgcolor={alpha(COLORS.primary, 0.1)} borderRadius={1}>
                                                    <Icon icon="mdi:package-variant" color={COLORS.primary} />
                                                    <Typography variant="body2" fontWeight={600} color="primary.main">
                                                        {cargandoStock ? 'Consultando stock...' : `Stock disponible: ${stockEnOrigen}`}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Destino */}
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>HACIA (DESTINO)</Typography>
                                            <TextField
                                                select
                                                fullWidth
                                                value={destino}
                                                onChange={(e) => setDestino(Number(e.target.value))}
                                                size="small"
                                                sx={{ bgcolor: '#fff' }}
                                                disabled={!origen}
                                            >
                                                {puntosOrdenados.map(p => (
                                                    <MenuItem key={p.id} value={p.id} disabled={p.id === origen}>
                                                        {p.nombre}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>

                                        {/* Cantidad */}
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>CANTIDAD</Typography>
                                            <TextField
                                                fullWidth
                                                value={cantidad}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (/^\d*\.?\d*$/.test(v)) setCantidad(v);
                                                }}
                                                placeholder="0"
                                                size="small"
                                                sx={{ bgcolor: '#fff' }}
                                                disabled={!origen || !destino}
                                                InputProps={{
                                                    endAdornment: origen && cantidadNum > stockEnOrigen ? <Icon icon="mdi:alert-circle" color="error" /> : null
                                                }}
                                                error={origen !== '' && cantidadNum > stockEnOrigen}
                                                helperText={origen !== '' && cantidadNum > stockEnOrigen ? "No hay suficiente stock en origen" : ""}
                                            />
                                        </Box>

                                        {/* Motivo */}
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>MOTIVO (OPCIONAL)</Typography>
                                            <TextField
                                                fullWidth
                                                value={motivo}
                                                onChange={(e) => setMotivo(e.target.value)}
                                                multiline
                                                rows={2}
                                                size="small"
                                                sx={{ bgcolor: '#fff' }}
                                                placeholder="Razón de la transferencia..."
                                            />
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>

                        <Box sx={{ p: 4, borderTop: `1px solid ${COLORS.border}`, bgcolor: '#fff' }}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => setConfirmOpen(true)}
                                disabled={!isValid || transferindo}
                                startIcon={transferindo ? <Icon icon="mdi:loading" className="spin" /> : <Icon icon="mdi:transfer" />}
                                sx={{
                                    bgcolor: COLORS.primary,
                                    fontWeight: 700,
                                    py: 1.5,
                                    mb: 1.5,
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    boxShadow: 2
                                }}
                            >
                                {transferindo ? 'Procesando...' : 'Confirmar Transferencia'}
                            </Button>
                            <Button
                                fullWidth
                                onClick={handleCloseInternal}
                                sx={{ textTransform: 'none', color: 'text.secondary' }}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </Box>

                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogContent sx={{ pb: 1, pt: 3, px: 4, maxWidth: 400 }}>
                    <Typography variant="h6" fontWeight={700} color={COLORS.textStrong} align="center" gutterBottom>
                        ¿Confirmar?
                    </Typography>
                    <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
                        Se transferirán <strong>{cantidad}</strong> unidades.
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={2} my={2}>
                        <Box textAlign="right">
                            <Typography variant="caption" display="block">De</Typography>
                            <Typography variant="subtitle2" fontWeight={700}>{puntosOrdenados.find(p => p.id === origen)?.nombre}</Typography>
                        </Box>
                        <Icon icon="mdi:arrow-right" />
                        <Box>
                            <Typography variant="caption" display="block">A</Typography>
                            <Typography variant="subtitle2" fontWeight={700}>{puntosOrdenados.find(p => p.id === destino)?.nombre}</Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 2, gap: 2 }}>
                    <Button onClick={() => setConfirmOpen(false)} variant="outlined" color="inherit">Cancelar</Button>
                    <Button onClick={handleSubmit} autoFocus variant="contained" sx={{ bgcolor: COLORS.primary }}>
                        Sí, Transferir
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

