"use client";

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    CircularProgress,
    Alert,
    Stack,
    IconButton,
    Chip
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { IconArrowsLeftRight, IconPlus, IconRefresh, IconSearch, IconClipboardList } from '@tabler/icons-react';

import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/app/panel/layout/shared/breadcrumb/Breadcrumb';
import TransferirStockModal from '@/components/stock/TransferirStockModal';
import IngresoStockModal from '@/components/stock/IngresoStockModal';

// UI Components
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalIconButton } from '@/components/ui/CrystalButton';
import SearchToolbar from '@/components/ui/SearchToolbar';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { borgoña, verde } from '@/ui/colores';

// GraphQL
const GET_MATRIZ_STOCK = gql`
  query ObtenerMatrizStock($busqueda: String, $rubro: String, $proveedorId: Int) {
    obtenerMatrizStock(busqueda: $busqueda, rubro: $rubro, proveedorId: $proveedorId) {
      id
      codigo
      nombre
      rubro
      stockTotal
      stockPorPunto {
        puntoId
        puntoNombre
        cantidad
      }
    }
  }
`;

const GET_PUNTOS_MUDRAS = gql`
  query ObtenerPuntosMudras {
    obtenerPuntosMudras {
      id
      nombre
      tipo
      activo
    }
  }
`;

// --- Estilos y Configuración Visual (Clonado y adaptado de TablaArticulos) ---
const PALETTE = borgoña; // Usamos borgoña para logística/stock
const accentExterior = PALETTE.primary;
const accentInterior = darken(PALETTE.primary, 0.3);
const tableBodyBg = 'rgba(247, 234, 234, 0.58)'; // Tono rojizo muy suave
const tableBodyAlt = 'rgba(226, 198, 198, 0.32)';
const woodTintExterior = '#d8c6c6';
const woodTintInterior = '#c6b2b2';
const headerBg = darken(PALETTE.primary, 0.12);

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
                backgroundColor: alpha('#f7f4f4', 0.78),
                zIndex: 0,
            }}
        />
        <Box sx={{ position: 'relative', zIndex: 2, p: 2.75 }}>{children}</Box>
    </Box>
);

export default function GlobalStockAssignmentPage() {
    const [busqueda, setBusqueda] = useState('');
    const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false);
    const [modalIngresoOpen, setModalIngresoOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [selectedPuntoOrigen, setSelectedPuntoOrigen] = useState<number | null>(null);

    const { data: dataPuntos, loading: loadingPuntos } = useQuery(GET_PUNTOS_MUDRAS);
    const { data: dataMatriz, loading: loadingMatriz, error, refetch } = useQuery(GET_MATRIZ_STOCK, {
        variables: { busqueda: busqueda || undefined },
        fetchPolicy: 'network-only'
    });

    const puntos = (dataPuntos as any)?.obtenerPuntosMudras?.filter((p: any) => p.activo) || [];
    const articulos = (dataMatriz as any)?.obtenerMatrizStock || [];

    const handleOpenTransferencia = (articulo: any, puntoOrigenId?: number) => {
        setSelectedArticle(articulo);
        setSelectedPuntoOrigen(puntoOrigenId || null);
        setModalTransferenciaOpen(true);
    };

    const handleOpenIngreso = (articulo?: any) => {
        setSelectedArticle(articulo || null);
        setModalIngresoOpen(true);
    };

    const handleCloseModals = () => {
        setModalTransferenciaOpen(false);
        setModalIngresoOpen(false);
        setSelectedArticle(null);
        setSelectedPuntoOrigen(null);
        refetch();
    };

    return (
        <PageContainer title="Asignación Global de Stock" description="Gestiona el stock de todos los puntos">
            <Breadcrumb title="Asignación Global" items={[{ to: '/panel', title: 'Inicio' }, { title: 'Stock' }]} />

            <WoodSection>
                <Stack spacing={3}>
                    {/* Toolbar */}
                    <SearchToolbar
                        title="Matriz de Stock"
                        icon={<IconClipboardList size={30} />}
                        baseColor={PALETTE.primary}
                        placeholder="Buscar artículo por nombre o código..."
                        searchValue={busqueda}
                        onSearchValueChange={setBusqueda}
                        onSubmitSearch={() => refetch()}
                        onClear={() => { setBusqueda(''); refetch(); }}
                        canCreate={true}
                        createLabel="Ingreso Rápido"
                        onCreateClick={() => handleOpenIngreso()}
                        searchDisabled={loadingMatriz}
                        customActions={
                            <CrystalButton
                                baseColor={PALETTE.primary}
                                onClick={() => refetch()}
                                startIcon={<IconRefresh size={18} />}
                            >
                                Actualizar
                            </CrystalButton>
                        }
                    />

                    {error && <Alert severity="error">Error al cargar datos: {error.message}</Alert>}

                    {loadingMatriz || loadingPuntos ? (
                        <Box display="flex" justifyContent="center" p={5}>
                            <CircularProgress sx={{ color: PALETTE.primary }} />
                        </Box>
                    ) : (
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
                                        fontSize: '0.85rem', // Fuente un poco más grande para legibilidad
                                        px: 1,
                                        py: 1.5, // Más padding vertical
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
                                        bgcolor: alpha(PALETTE.primary, 0.15),
                                    },
                                    '& .MuiTableCell-head': {
                                        fontSize: '0.80rem',
                                        fontWeight: 700,
                                        bgcolor: headerBg,
                                        color: alpha('#FFFFFF', 0.94),
                                        boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.12)',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.4,
                                    },
                                    '& .MuiTableHead-root .MuiTableCell-head:not(:last-of-type)': {
                                        borderRight: `3px solid ${alpha(PALETTE.headerBorder, 0.5)}`,
                                    },
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Código</TableCell>
                                        <TableCell>Artículo</TableCell>
                                        <TableCell align="center">Total Global</TableCell>
                                        {puntos.map((punto: any) => (
                                            <TableCell key={punto.id} align="center">
                                                <Box display="flex" flexDirection="column" alignItems="center">
                                                    <span>{punto.nombre}</span>
                                                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 400, textTransform: 'none' }}>
                                                        {punto.tipo === 'deposito' ? '(Depósito)' : '(Venta)'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        ))}
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {articulos.map((articulo: any) => (
                                        <TableRow key={articulo.id} hover>
                                            <TableCell>
                                                <Chip
                                                    label={articulo.codigo ?? 'Sin código'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(accentExterior, 0.14),
                                                        color: darken(PALETTE.primary, 0.35),
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} sx={{ color: darken(PALETTE.primary, 0.2), fontSize: '0.9rem' }}>
                                                    {articulo.nombre}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight={800} color={PALETTE.textStrong} sx={{ fontSize: '0.95rem' }}>
                                                    {articulo.stockTotal}
                                                </Typography>
                                            </TableCell>
                                            {puntos.map((punto: any) => {
                                                const stockPunto = articulo.stockPorPunto.find((s: any) => s.puntoId === punto.id);
                                                const cantidad = stockPunto?.cantidad || 0;
                                                return (
                                                    <TableCell key={punto.id} align="center">
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: 1
                                                            }}
                                                        >
                                                            <Typography
                                                                color={cantidad > 0 ? 'textPrimary' : 'textSecondary'}
                                                                fontWeight={cantidad > 0 ? 700 : 400}
                                                                sx={{ fontSize: '0.9rem' }}
                                                            >
                                                                {cantidad}
                                                            </Typography>
                                                            {cantidad > 0 && (
                                                                <Tooltip title={`Transferir desde ${punto.nombre}`}>
                                                                    <CrystalIconButton
                                                                        baseColor={PALETTE.primary}
                                                                        size="small"
                                                                        onClick={() => handleOpenTransferencia(articulo, punto.id)}
                                                                        sx={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
                                                                    >
                                                                        <IconArrowsLeftRight size={16} />
                                                                    </CrystalIconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell align="center">
                                                <Tooltip title="Transferir Stock (Origen a elección)">
                                                    <CrystalIconButton
                                                        baseColor={verde.primary} // Verde para acción positiva
                                                        onClick={() => handleOpenTransferencia(articulo)}
                                                    >
                                                        <IconArrowsLeftRight size={20} />
                                                    </CrystalIconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {articulos.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4 + puntos.length} align="center" sx={{ py: 6 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    No se encontraron artículos.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Stack>
            </WoodSection>

            {/* Modales */}
            <TransferirStockModal
                open={modalTransferenciaOpen}
                onClose={handleCloseModals}
                articuloPreseleccionado={selectedArticle}
                origenPreseleccionado={selectedPuntoOrigen}
                puntos={puntos}
            />

            <IngresoStockModal
                open={modalIngresoOpen}
                onClose={handleCloseModals}
                articuloPreseleccionado={selectedArticle}
                puntos={puntos}
            />
        </PageContainer>
    );
}
