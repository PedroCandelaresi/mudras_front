'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardContent,
  Snackbar,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  CREAR_VENTA_CAJA,
  type MetodoPago,
  type MedioPagoCaja,
  type PagoVenta,
  type CrearVentaCajaResponse,
  type CrearVentaCajaInput,
} from '@/components/ventas/caja-registradora/graphql/mutations';
import { apiFetch } from '@/lib/api';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';
import { USUARIOS_CAJA_AUTH_QUERY } from '@/components/usuarios/graphql/queries';

interface ArticuloVenta {
  id: number;
  Codigo: string;
  Descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface UsuarioOption { id: string; label: string }

interface UsuarioCajaAuth { id: string; username?: string | null; email?: string | null; displayName: string }
interface UsuariosCajaRespuesta { usuariosCajaAuth?: UsuarioCajaAuth[] }


interface ModalConfirmacionVentaProps {
  open: boolean;
  onClose: () => void;
  articulos: ArticuloVenta[];
  onVentaCreada: (venta: any) => void;
  presetPuestoVentaId?: number | null;
  presetPuntoMudrasId?: number | null;
  presetUsuarioId?: number | null;
  descripcionPuntoSeleccionado?: string | null;
}

const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: 'mdi:cash' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito', icon: 'mdi:credit-card' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito', icon: 'mdi:credit-card-multiple' },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: 'mdi:bank-transfer' },
  { value: 'CHEQUE', label: 'Cheque', icon: 'mdi:checkbook' },
  { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente', icon: 'mdi:book-open-variant' },
  { value: 'OTRO', label: 'Otro', icon: 'mdi:dots-horizontal' },
] as const;

const VH_MAX = 85;
const HEADER_H = 88;
const FOOTER_H = 88;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;
const NBSP = '\u00A0';

const makeColors = (base?: string) => {
  const primary = base || verde.primary;
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.5),
    chipBorder: 'rgba(255,255,255,0.35)',
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
  };
};

const currency = (v: number) =>
  v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

export const ModalConfirmacionVenta: React.FC<ModalConfirmacionVentaProps> = ({
  open,
  onClose,
  articulos,
  onVentaCreada,
  presetPuestoVentaId,
  presetPuntoMudrasId,
  presetUsuarioId,
  descripcionPuntoSeleccionado,
}) => {
  const COLORS = useMemo(() => makeColors(), []);
  const [pagos, setPagos] = useState<PagoVenta[]>([]);
  const [nuevoPago, setNuevoPago] = useState<PagoVenta>({
    metodoPago: 'EFECTIVO',
    monto: 0,
  });
  const [dniCuit, setDniCuit] = useState<string>('');
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState<boolean>(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioOption | null>(null);
  const [perfilUsuarioId, setPerfilUsuarioId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success'|'error'|'info' }>({ open: false, msg: '', sev: 'success' });

  console.log('🧾 [ModalConfirmacionVenta] render', {
    open,
    usuariosCount: usuarios.length,
    cargandoUsuarios,
    errorUsuarios,
    usuarioSeleccionado,
    perfilUsuarioId,
    presetUsuarioId,
    presetPuestoVentaId,
    presetPuntoMudrasId,
    descripcionPuntoSeleccionado,
  });

  const [obtenerUsuarios, { called: usuariosCalled, loading: usuariosLoading, data: usuariosData, error: usuariosError }] =
    useLazyQuery<UsuariosCajaRespuesta>(USUARIOS_CAJA_AUTH_QUERY, {
      fetchPolicy: 'network-only',
    });

  useEffect(() => {
    if (!usuariosCalled && !usuariosLoading) return;
    console.log('🧾 [ModalConfirmacionVenta] useLazyQuery estado', {
      usuariosCalled,
      usuariosLoading,
      usuariosData,
      usuariosError,
    });
    if (usuariosError) {
      console.error('🧾 [ModalConfirmacionVenta] useLazyQuery:onError', usuariosError);
    }
    if (usuariosData) {
      console.log('🧾 [ModalConfirmacionVenta] useLazyQuery:onCompleted', usuariosData);
    }
  }, [usuariosCalled, usuariosLoading, usuariosData, usuariosError]);

  const puestoVentaIdSeleccionado = presetPuestoVentaId ?? 0; // compat
  const puntoMudrasIdSeleccionado = presetPuntoMudrasId ?? null;
  const puntoValido = Boolean(puntoMudrasIdSeleccionado);
  const descripcionPunto = descripcionPuntoSeleccionado ||
    (puntoMudrasIdSeleccionado ? `Punto ${puntoMudrasIdSeleccionado}` : 'Sin punto asignado');

  const cargarUsuarios = useCallback(async () => {
    try {
      console.log('🧾 [ModalConfirmacionVenta] cargarUsuarios:start', {
        open,
        presetUsuarioId,
        presetPuestoVentaId,
        presetPuntoMudrasId,
      });
      setCargandoUsuarios(true);
      setErrorUsuarios(null);

      const { data } = await obtenerUsuarios({ variables: { rolSlug: 'caja_registradora' } });
      console.log('🧾 [ModalConfirmacionVenta] cargarUsuarios:data', data);
      const opciones = (data?.usuariosCajaAuth || [])
        .map((item) => {
          const etiqueta = item.displayName?.trim() || item.username?.trim() || item.email?.trim() || `Usuario ${item.id.substring(0,6)}`;
          
          console.log('🧾 [ModalConfirmacionVenta] cargarUsuarios:opcion', {
            id: item.id,
            username: item.username,
            etiqueta,
          });
          return {
            id: item.id,
            label: etiqueta,
          } as UsuarioOption;
        })
        .filter((opcion): opcion is UsuarioOption => Boolean(opcion));

      console.log('🧾 [ModalConfirmacionVenta] cargarUsuarios:setUsuarios', opciones);
      setUsuarios(opciones);
    } catch (error: any) {
      console.error('🧾 [ModalConfirmacionVenta] cargarUsuarios:error', error);
      setErrorUsuarios(error?.message ?? 'No se pudo cargar la lista de usuarios');
    } finally {
      console.log('🧾 [ModalConfirmacionVenta] cargarUsuarios:finally');
      setCargandoUsuarios(false);
    }
  }, [obtenerUsuarios, open, presetUsuarioId, presetPuestoVentaId, presetPuntoMudrasId]);

  const cargarPerfilUsuario = useCallback(async () => {
    try {
      console.log('🧾 [ModalConfirmacionVenta] cargarPerfilUsuario:start');
      const respuesta = await apiFetch<{ perfil?: { sub?: string | number; uid?: number } }>('/auth/perfil');
      console.log('🧾 [ModalConfirmacionVenta] cargarPerfilUsuario:respuesta', respuesta);
      const uid = respuesta?.perfil?.uid;
      if (typeof uid === 'number' && Number.isFinite(uid)) {
        console.log('🧾 [ModalConfirmacionVenta] cargarPerfilUsuario:uid', uid);
        setPerfilUsuarioId(String(uid));
      } else {
      const sub = respuesta?.perfil?.sub;
      if (typeof sub === 'string' && sub) {
        console.log('🧾 [ModalConfirmacionVenta] cargarPerfilUsuario:sub', sub);
        setPerfilUsuarioId(sub);
      }
      }
    } catch (error) {
      console.error('🧾 [ModalConfirmacionVenta] cargarPerfilUsuario:error', error);
    }
  }, []);

  // Mutations
  const [crearVenta, { loading: creandoVenta }] = useMutation<CrearVentaCajaResponse>(CREAR_VENTA_CAJA, {
    onCompleted: (data) => {
      console.log('🧾 [ModalConfirmacionVenta] crearVenta:onCompleted', data);
      onVentaCreada(data.crearVentaCaja);
      handleClose();
    },
    onError: (error) => {
      console.error('🧾 [ModalConfirmacionVenta] crearVenta:onError', error);
      setSnack({ open: true, msg: error?.message || 'No se pudo completar la venta', sev: 'error' });
    },
  });

  // Calcular totales
  const subtotal = articulos.reduce((sum, art) => sum + art.subtotal, 0);
  const totalPagos = pagos.reduce((sum, pago) => sum + pago.monto, 0);
  const diferencia = totalPagos - subtotal;
  const cambio = diferencia > 0 ? diferencia : 0;
  const requiereDni = useMemo(() => pagos.some((p) => p.metodoPago !== 'EFECTIVO'), [pagos]);

  // Resetear formulario al abrir
  useEffect(() => {
    if (!open) {
      console.log('🧾 [ModalConfirmacionVenta] useEffect[open]: modal cerrado');
      return;
    }
    console.log('🧾 [ModalConfirmacionVenta] useEffect[open]: reset formulario');
    setPagos([]);
    setNuevoPago({
      metodoPago: 'EFECTIVO',
      monto: subtotal,
    });
    setDniCuit('');
    setUsuarioSeleccionado(null);
    setErrorUsuarios(null);
  }, [open, subtotal]);

  useEffect(() => {
    if (!open) {
      console.log('🧾 [ModalConfirmacionVenta] useEffect[cargarPerfilUsuario]: modal cerrado');
      return;
    }
    console.log('🧾 [ModalConfirmacionVenta] useEffect[cargarPerfilUsuario]: invocando');
    void cargarPerfilUsuario();
  }, [open, cargarPerfilUsuario]);

  useEffect(() => {
    if (!open) {
      console.log('🧾 [ModalConfirmacionVenta] useEffect[cargarUsuarios]: modal cerrado');
      return;
    }
    if (usuarios.length === 0 && !cargandoUsuarios) {
      console.log('🧾 [ModalConfirmacionVenta] useEffect[cargarUsuarios]: disparando carga');
      void cargarUsuarios();
    } else {
      console.log('🧾 [ModalConfirmacionVenta] useEffect[cargarUsuarios]: no se carga', {
        usuariosLength: usuarios.length,
        cargandoUsuarios,
      });
    }
  }, [open, usuarios.length, cargandoUsuarios, cargarUsuarios, usuarios]);

  useEffect(() => {
    if (!open) {
      console.log('🧾 [ModalConfirmacionVenta] useEffect[usuarioPreferido]: modal cerrado');
      return;
    }
    if (usuarioSeleccionado || usuarios.length === 0) {
      console.log('🧾 [ModalConfirmacionVenta] useEffect[usuarioPreferido]: no se selecciona', {
        usuarioSeleccionado,
        usuariosLength: usuarios.length,
      });
      return;
    }

    const preferidoId = (presetUsuarioId ? String(presetUsuarioId) : null) ?? perfilUsuarioId ?? usuarios[0]?.id;
    console.log('🧾 [ModalConfirmacionVenta] useEffect[usuarioPreferido]: calculado', {
      presetUsuarioId,
      perfilUsuarioId,
      primerUsuario: usuarios[0],
      preferidoId,
    });
    if (preferidoId == null) {
      return;
    }
    const encontrado = usuarios.find((usuario) => usuario.id === preferidoId) ?? usuarios[0];
    console.log('🧾 [ModalConfirmacionVenta] useEffect[usuarioPreferido]: seteando', encontrado);
    setUsuarioSeleccionado(encontrado);
  }, [open, usuarios, presetUsuarioId, perfilUsuarioId, usuarioSeleccionado]);

  useEffect(() => {
    if (!open) {
      console.log('🧾 [ModalConfirmacionVenta] useEffect[open-only]: modal cerrado');
      return;
    }
    console.log('🧾 [ModalConfirmacionVenta] useEffect[open-only]: modal abierto');
  }, [open]);

  const handleClose = () => {
    console.log('🧾 [ModalConfirmacionVenta] handleClose');
    onClose();
  };

  const handleAgregarPago = () => {
    console.log('🧾 [ModalConfirmacionVenta] handleAgregarPago', nuevoPago);
    if (nuevoPago.monto > 0) {
      setPagos(prev => [...prev, { ...nuevoPago }]);
      setNuevoPago({
        metodoPago: 'EFECTIVO',
        monto: Math.max(0, subtotal - totalPagos - nuevoPago.monto),
      });
    }
  };

  const handleEliminarPago = (index: number) => {
    console.log('🧾 [ModalConfirmacionVenta] handleEliminarPago', index);
    setPagos(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmarVenta = () => {
    console.log('🧾 [ModalConfirmacionVenta] handleConfirmarVenta', {
      puestoVentaIdSeleccionado,
      pagos,
      usuarioSeleccionado,
      puntoValido,
    });
    if (!puestoVentaIdSeleccionado || pagos.length === 0 || !usuarioSeleccionado) return;
    if (!puntoValido) return;
    if (requiereDni && (!dniCuit || dniCuit.trim().length < 7)) {
      alert('Para pagos no en efectivo se requiere DNI/CUIT del cliente');
      return;
    }

    const mapMetodoPago = (m: MetodoPago): MedioPagoCaja | null => {
      switch (m) {
        case 'EFECTIVO': return 'EFECTIVO';
        case 'TARJETA_DEBITO': return 'DEBITO';
        case 'TARJETA_CREDITO': return 'CREDITO';
        case 'TRANSFERENCIA': return 'TRANSFERENCIA';
        case 'CUENTA_CORRIENTE': return 'CUENTA_CORRIENTE';
        // Si en UI se selecciona un método no soportado por el backend, devolvemos null
        case 'CHEQUE':
        case 'OTRO':
        default:
          return null;
      }
    };

    const pagosTransformados = pagos.map((p) => ({
      medioPago: mapMetodoPago(p.metodoPago),
      monto: p.monto,
      marcaTarjeta: p.marcaTarjeta,
      ultimos4Digitos: p.ultimos4Digitos,
      cuotas: p.cuotas,
      numeroAutorizacion: p.numeroAutorizacion,
      numeroComprobante: p.numeroComprobante,
      observaciones: p.observaciones,
    })).filter((p) => p.medioPago !== null) as Array<{
      medioPago: MedioPagoCaja;
      monto: number;
      marcaTarjeta?: string;
      ultimos4Digitos?: string;
      cuotas?: number;
      numeroAutorizacion?: string;
      numeroComprobante?: string;
      observaciones?: string;
    }>;

    if (pagosTransformados.length !== pagos.length) {
      alert('Hay métodos de pago no soportados. Usa efectivo, débito, crédito, transferencia, QR o cuenta corriente.');
      return;
    }

    const input: CrearVentaCajaInput = {
      tipoVenta: 'MOSTRADOR',
      usuarioAuthId: usuarioSeleccionado.id,
      puntoMudrasId: puntoMudrasIdSeleccionado!,
      cuitCliente: requiereDni ? dniCuit.trim() : undefined,
      detalles: articulos.map(art => ({
        articuloId: Number(art.id),
        cantidad: Number(art.cantidad),
        precioUnitario: Number(art.precioUnitario),
      })),
      pagos: pagosTransformados,
    };

    console.log('🧾 [ModalConfirmacionVenta] handleConfirmarVenta:mutationInput', input);
    crearVenta({ variables: { input } });
  };

  const puedeConfirmar =
    pagos.length > 0 &&
    Math.abs(diferencia) < 0.01 &&
    Boolean(usuarioSeleccionado) &&
    puntoValido;

  const fieldSx = useMemo(
    () => ({
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        background: '#ffffff',
        '& fieldset': { borderColor: COLORS.inputBorder },
        '&:hover fieldset': { borderColor: COLORS.inputBorderHover },
        '&.Mui-focused fieldset': { borderColor: COLORS.primary },
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: COLORS.primary,
      },
    }),
    [COLORS]
  );

  const selectSx = useMemo(
    () => ({
      borderRadius: 2,
      background: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.inputBorder },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.inputBorderHover },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
    }),
    [COLORS]
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          bgcolor: 'transparent',
          overflow: 'hidden',
          maxHeight: `${VH_MAX}vh`,
        },
      }}
    >
      <TexturedPanel
        accent={COLORS.primary}
        radius={12}
        contentPadding={0}
        bgTintPercent={12}
        bgAlpha={1}
        textureBaseOpacity={0.22}
        textureBoostOpacity={0.19}
        textureBrightness={1.12}
        textureContrast={1.03}
        tintOpacity={0.38}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: `${VH_MAX}vh` }}>
          <DialogTitle sx={{ p: 0, m: 0, minHeight: HEADER_H, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', px: 3, py: 2.25, gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.25)',
                  color: '#fff',
                }}
              >
                <Icon icon="mdi:cash-register" width={22} height={22} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="white"
                  sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  Confirmar Venta
                </Typography>
                {descripcionPunto && (
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.92)"
                    sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)', fontWeight: 700 }}
                  >
                    Punto de venta: {descripcionPunto}
                  </Typography>
                )}
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                <CrystalSoftButton
                  baseColor={COLORS.primary}
                  onClick={handleClose}
                  title="Cerrar"
                  sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    p: 0,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    transform: 'none !important',
                    transition: 'none',
                    '&:hover': { transform: 'none !important' },
                  }}
                >
                  <Icon icon="mdi:close" color="#fff" width={22} height={22} />
                </CrystalSoftButton>
              </Box>
            </Box>
          </DialogTitle>

          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
                linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
                linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
              `,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto',
            }}
          />

          <DialogContent
            sx={{
              p: 0,
              borderRadius: 0,
              overflow: 'auto',
              maxHeight: CONTENT_MAX,
              flex: '0 1 auto',
            }}
          >
            <Box sx={{ position: 'relative', borderRadius: 0, overflow: 'hidden' }}>
              <WoodBackdrop accent={COLORS.primary} radius={0} inset={0} strength={0.7} texture="wide" />
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: 4,
                  borderRadius: 0,
                  backdropFilter: 'saturate(118%) blur(0.4px)',
                  background: 'rgba(255,255,255,0.86)',
                }}
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                        background: alpha(COLORS.primary, 0.05),
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                        mb: 2,
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Icon icon="mdi:cog-outline" width={20} height={20} color={COLORS.primary} />
                          <Typography variant="h6" fontWeight={700} color={COLORS.textStrong}>
                            Configuración de Venta
                          </Typography>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <Autocomplete
                              value={usuarioSeleccionado}
                              onChange={(_, value) => setUsuarioSeleccionado(value)}
                              options={usuarios}
                              loading={cargandoUsuarios}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              getOptionLabel={(option) => option?.label ?? ''}
                              noOptionsText={cargandoUsuarios ? 'Cargando usuarios...' : 'No se encontraron usuarios'}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Usuario que registra la venta"
                                  placeholder="Selecciona un usuario"
                                  error={Boolean(errorUsuarios)}
                                  helperText={errorUsuarios || undefined}
                                  sx={fieldSx}
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {cargandoUsuarios ? <CircularProgress color="inherit" size={16} /> : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                            />
                          </Grid>

                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="DNI o CUIT del cliente (requerido si no es efectivo)"
                              value={dniCuit}
                              onChange={(e) => setDniCuit(e.target.value)}
                              sx={fieldSx}
                              required={requiereDni}
                            />
                          </Grid>

                          {/* Punto de venta informativo eliminado del cuerpo; ahora se muestra en el header */}
                        </Grid>
                      </CardContent>
                    </Card>

                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                        background: alpha(COLORS.primary, 0.05),
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Icon icon="mdi:clipboard-list-outline" width={20} height={20} color={COLORS.primary} />
                          <Typography variant="h6" fontWeight={700} color={COLORS.textStrong}>
                            Artículos ({articulos.length})
                          </Typography>
                        </Box>

                        <TableContainer sx={{ maxHeight: 200 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Artículo</TableCell>
                                <TableCell align="right">Cant.</TableCell>
                                <TableCell align="right">Precio</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {articulos.map((articulo) => (
                                <TableRow key={articulo.id}>
                                  <TableCell>
                                    <Typography variant="body2" color={COLORS.textStrong}>
                                      {articulo.Codigo} - {articulo.Descripcion}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">{articulo.cantidad}</TableCell>
                                  <TableCell align="right">${articulo.precioUnitario.toFixed(2)}</TableCell>
                                  <TableCell align="right">
                                    <Typography fontWeight="bold" color={COLORS.primary}>
                                      ${articulo.subtotal.toFixed(2)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="subtitle1" fontWeight={700} color={COLORS.textStrong}>
                            Total
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={700} color={COLORS.primary}>
                            ${subtotal.toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                        background: alpha(COLORS.primary, 0.05),
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                        height: '100%',
                      }}
                    >
                      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Icon icon="mdi:credit-card-check" width={20} height={20} color={COLORS.primary} />
                          <Typography variant="h6" fontWeight={700} color={COLORS.textStrong}>
                            Métodos de Pago
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            mb: 1.5,
                            p: 2,
                            borderRadius: 2,
                            background: alpha(COLORS.primary, 0.08),
                            border: `1px solid ${alpha(COLORS.primary, 0.18)}`,
                          }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Método</InputLabel>
                                <Select
                                  value={nuevoPago.metodoPago}
                                  onChange={(e) =>
                                    setNuevoPago((prev) => ({ ...prev, metodoPago: e.target.value as MetodoPago }))
                                  }
                                  label="Método"
                                  sx={selectSx}
                                >
                                  {METODOS_PAGO.map((metodo) => (
                                    <MenuItem key={metodo.value} value={metodo.value}>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Icon icon={metodo.icon} width={16} height={16} />
                                        {metodo.label}
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Monto"
                                value={nuevoPago.monto}
                                onChange={(e) =>
                                  setNuevoPago((prev) => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))
                                }
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={fieldSx}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 2 }}>
                              <CrystalButton
                                baseColor={COLORS.primary}
                                size="small"
                                onClick={handleAgregarPago}
                                disabled={nuevoPago.monto <= 0}
                                sx={{ width: '100%', minHeight: 36 }}
                              >
                                <IconPlus size={16} />
                              </CrystalButton>
                            </Grid>
                          </Grid>
                        </Box>

                        {pagos.length > 0 && (
                          <TableContainer sx={{ mb: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Método</TableCell>
                                  <TableCell align="right">Monto</TableCell>
                                  <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {pagos.map((pago, index) => {
                                  const metodo = METODOS_PAGO.find((m) => m.value === pago.metodoPago);
                                  return (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                          {metodo && (
                                            <Icon icon={metodo.icon} width={16} height={16} color={COLORS.primary} />
                                          )}
                                          {metodo?.label}
                                        </Box>
                                      </TableCell>
                                      <TableCell align="right">
                                        ${pago.monto.toFixed(2)}
                                      </TableCell>
                                      <TableCell align="center">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleEliminarPago(index)}
                                          color="error"
                                        >
                                          <IconTrash size={16} />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}

                        <Divider sx={{ my: 1.5 }} />
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">Subtotal</Typography>
                            <Typography fontWeight={600}>${subtotal.toFixed(2)}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">Total Pagos</Typography>
                            <Typography fontWeight={600} color={totalPagos >= subtotal ? 'success.main' : 'error.main'}>
                              ${totalPagos.toFixed(2)}
                            </Typography>
                          </Box>
                          {diferencia !== 0 && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography fontWeight={700}>
                                {diferencia > 0 ? 'Cambio' : 'Faltante'}
                              </Typography>
                              <Typography fontWeight={700} color={diferencia > 0 ? 'success.main' : 'error.main'}>
                                ${Math.abs(diferencia).toFixed(2)}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {diferencia < -0.01 && (
                          <Alert severity="error" sx={{ mt: 1.5 }}>
                            Falta ${Math.abs(diferencia).toFixed(2)} para completar el pago
                          </Alert>
                        )}
                        {diferencia > 0.01 && (
                          <Alert severity="info" sx={{ mt: 1.5 }}>
                            Cambio a entregar: ${cambio.toFixed(2)}
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </DialogContent>

          <Divider
            sx={{
              height: DIV_H,
              border: 0,
              backgroundImage: `
                linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.22)),
                linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.70)),
                linear-gradient(90deg, rgba(255,255,255,0.05), ${COLORS.primary}, rgba(255,255,255,0.05))
              `,
              backgroundRepeat: 'no-repeat, no-repeat, repeat',
              backgroundSize: '100% 1px, 100% 1px, 100% 100%',
              backgroundPosition: 'top left, bottom left, center',
              flex: '0 0 auto',
            }}
          />

          <DialogActions sx={{ p: 0, m: 0, minHeight: FOOTER_H }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: 3, py: 2.5, gap: 1.5 }}>
              <CrystalSoftButton
                baseColor={COLORS.primary}
                onClick={handleClose}
                disabled={creandoVenta}
                sx={{ minHeight: 44, px: 3, fontWeight: 600 }}
              >
                Cancelar
              </CrystalSoftButton>
              <CrystalButton
                baseColor={COLORS.primary}
                onClick={handleConfirmarVenta}
                disabled={!puedeConfirmar || creandoVenta}
                sx={{ minHeight: 44, px: 3, fontWeight: 700, '&:disabled': { opacity: 0.55, boxShadow: 'none' } }}
              >
                {creandoVenta ? 'Procesando...' : 'Confirmar Venta'}
              </CrystalButton>
            </Box>
          </DialogActions>
        </Box>
      </TexturedPanel>
      {/* Snackbar para feedback de errores */}
      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
;
