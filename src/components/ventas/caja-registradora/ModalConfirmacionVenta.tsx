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
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Button,
  InputAdornment,
} from '@mui/material';
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
import { USUARIOS_CAJA_AUTH_QUERY } from '@/components/usuarios/graphql/queries';
import { grisRojizo } from '@/ui/colores';

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
  const [pagos, setPagos] = useState<PagoVenta[]>([]);
  const [nuevoPago, setNuevoPago] = useState<{ metodoPago: MetodoPago; monto: string }>({
    metodoPago: 'EFECTIVO',
    monto: '0',
  });
  const [dniCuit, setDniCuit] = useState<string>('');
  const [nombreCliente, setNombreCliente] = useState<string>('');
  const [razonSocialCliente, setRazonSocialCliente] = useState<string>('');
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState<boolean>(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioOption | null>(null);
  const [perfilUsuarioId, setPerfilUsuarioId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' }>({ open: false, msg: '', sev: 'success' });

  // Determine input type based on length (simplistic but effective for UX)
  const esCuit = dniCuit.length === 11;
  const showNombre = dniCuit.length > 0 && !esCuit;
  const showRazonSocial = esCuit;

  const [obtenerUsuarios, { called: usuariosCalled, loading: usuariosLoading, data: usuariosData, error: usuariosError }] =
    useLazyQuery<UsuariosCajaRespuesta>(USUARIOS_CAJA_AUTH_QUERY, {
      fetchPolicy: 'network-only',
    });

  const puestoVentaIdSeleccionado = presetPuestoVentaId ?? 0; // compat
  const puntoMudrasIdSeleccionado = presetPuntoMudrasId ?? null;
  const puntoValido = Boolean(puntoMudrasIdSeleccionado);
  const descripcionPunto = descripcionPuntoSeleccionado ||
    (puntoMudrasIdSeleccionado ? `Punto ${puntoMudrasIdSeleccionado}` : 'Sin punto asignado');

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargandoUsuarios(true);
      setErrorUsuarios(null);

      const { data } = await obtenerUsuarios();
      const opciones = (data?.usuariosCajaAuth || [])
        .map((item) => {
          const etiqueta = item.displayName?.trim() || item.username?.trim() || item.email?.trim() || `Usuario ${item.id.substring(0, 6)}`;
          return {
            id: item.id,
            label: etiqueta,
          } as UsuarioOption;
        })
        .filter((opcion): opcion is UsuarioOption => Boolean(opcion));

      setUsuarios(opciones);
    } catch (error: any) {
      console.error('🧾 [ModalConfirmacionVenta] cargarUsuarios:error', error);
      setErrorUsuarios(error?.message ?? 'No se pudo cargar la lista de usuarios');
    } finally {
      setCargandoUsuarios(false);
    }
  }, [obtenerUsuarios]);

  const cargarPerfilUsuario = useCallback(async () => {
    try {
      const respuesta = await apiFetch<{ perfil?: { sub?: string | number; uid?: number } }>('/auth/perfil');
      const uid = respuesta?.perfil?.uid;
      if (typeof uid === 'number' && Number.isFinite(uid)) {
        setPerfilUsuarioId(String(uid));
      } else {
        const sub = respuesta?.perfil?.sub;
        if (typeof sub === 'string' && sub) {
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
    if (!open) return;
    setPagos([]);
    setNuevoPago({
      metodoPago: 'EFECTIVO',
      monto: String(subtotal),
    });
    setDniCuit('');
    setNombreCliente('');
    setRazonSocialCliente('');
    setUsuarioSeleccionado(null);
    setErrorUsuarios(null);
  }, [open, subtotal]);

  useEffect(() => {
    if (!open) return;
    void cargarPerfilUsuario();
  }, [open, cargarPerfilUsuario]);

  useEffect(() => {
    if (!open) return;
    if (usuarios.length === 0 && !cargandoUsuarios) {
      void cargarUsuarios();
    }
  }, [open, usuarios.length, cargandoUsuarios, cargarUsuarios, usuarios]);

  useEffect(() => {
    if (!open) return;
    if (usuarioSeleccionado || usuarios.length === 0) return;

    const preferidoId = (presetUsuarioId ? String(presetUsuarioId) : null) ?? perfilUsuarioId ?? usuarios[0]?.id;
    if (preferidoId == null) return;
    const encontrado = usuarios.find((usuario) => usuario.id === preferidoId) ?? usuarios[0];
    setUsuarioSeleccionado(encontrado);
  }, [open, usuarios, presetUsuarioId, perfilUsuarioId, usuarioSeleccionado]);


  const handleClose = () => {
    onClose();
  };

  const handleAgregarPago = () => {
    const montoNum = parseFloat(nuevoPago.monto) || 0;
    if (montoNum > 0) {
      setPagos(prev => [...prev, { metodoPago: nuevoPago.metodoPago, monto: montoNum }]);
      setNuevoPago({
        metodoPago: 'EFECTIVO',
        monto: String(Math.max(0, subtotal - totalPagos - montoNum)),
      });
    }
  };

  const handleEliminarPago = (index: number) => {
    setPagos(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmarVenta = () => {
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

    const input: CrearVentaCajaInput & { nombreCliente?: string; razonSocialCliente?: string } = {
      tipoVenta: 'MOSTRADOR',
      usuarioAuthId: usuarioSeleccionado.id,
      puntoMudrasId: puntoMudrasIdSeleccionado!,
      cuitCliente: dniCuit ? dniCuit.trim() : undefined,
      nombreCliente: showNombre ? nombreCliente.trim() : undefined,
      razonSocialCliente: showRazonSocial ? razonSocialCliente.trim() : undefined,
      detalles: articulos.map(art => ({
        articuloId: Number(art.id),
        cantidad: Number(art.cantidad),
        precioUnitario: Number(art.precioUnitario),
      })),
      pagos: pagosTransformados,
    };

    crearVenta({ variables: { input } });
  };

  const puedeConfirmar =
    pagos.length > 0 &&
    Math.abs(diferencia) < 0.01 &&
    Boolean(usuarioSeleccionado) &&
    puntoValido;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{
        bgcolor: grisRojizo.headerBg,
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${grisRojizo.headerBorder}`,
        minHeight: 64,
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: grisRojizo.primary,
              color: '#fff',
            }}
          >
            <Icon icon="mdi:cash-register" width={22} height={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color={grisRojizo.headerText}>
              Confirmar Venta
            </Typography>
            {descripcionPunto && (
              <Typography variant="caption" color={grisRojizo.headerText} fontWeight={500} sx={{ opacity: 0.8 }}>
                Punto de venta: {descripcionPunto}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: grisRojizo.headerText, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff', overflowY: 'auto' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Icon icon="mdi:cog-outline" width={20} height={20} color={grisRojizo.primary} />
                  <Typography variant="h6" fontWeight={700} color={grisRojizo.textStrong}>
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
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            sx: { borderRadius: 0 },
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
                      size="small"
                      label="DNI o CUIT del cliente (requerido si no es efectivo)"
                      value={dniCuit}
                      onChange={(e) => setDniCuit(e.target.value)}
                      required={requiereDni}
                      InputProps={{ sx: { borderRadius: 0 } }}
                    />
                    {showNombre && (
                      <TextField
                        label="Nombre / Apellido"
                        value={nombreCliente}
                        onChange={(e) => setNombreCliente(e.target.value)}
                        placeholder="Nombre del cliente"
                        size="small"
                        fullWidth
                        sx={{ mt: 2 }}
                        InputProps={{ sx: { borderRadius: 0 } }}
                      />
                    )}
                    {showRazonSocial && (
                      <TextField
                        label="Razón Social"
                        value={razonSocialCliente}
                        onChange={(e) => setRazonSocialCliente(e.target.value)}
                        placeholder="Razón Social de la empresa"
                        size="small"
                        fullWidth
                        sx={{ mt: 2 }}
                        InputProps={{ sx: { borderRadius: 0 } }}
                      />
                    )}
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {esCuit ? 'Identificado como Empresa/Responsable' : (dniCuit.length > 0 ? 'Identificado como Consumidor/Persona' : 'Consumidor Final (Anónimo)')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0 }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Icon icon="mdi:clipboard-list-outline" width={20} height={20} color={grisRojizo.primary} />
                  <Typography variant="h6" fontWeight={700} color={grisRojizo.textStrong}>
                    Artículos ({articulos.length})
                  </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: 200, border: '1px solid #eeeeee' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: grisRojizo.headerBg }}>
                        <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText, bgcolor: grisRojizo.headerBg }}>Artículo</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: grisRojizo.headerText, bgcolor: grisRojizo.headerBg }}>Cant.</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: grisRojizo.headerText, bgcolor: grisRojizo.headerBg }}>Precio</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: grisRojizo.headerText, bgcolor: grisRojizo.headerBg }}>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {articulos.map((articulo, idx) => (
                        <TableRow key={articulo.id} hover sx={{ bgcolor: idx % 2 === 1 ? grisRojizo.alternateRow : 'inherit' }}>
                          <TableCell>
                            <Typography variant="body2">
                              {articulo.Codigo} - {articulo.Descripcion}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{articulo.cantidad}</TableCell>
                          <TableCell align="right">${articulo.precioUnitario.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold">
                              ${articulo.subtotal.toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={700}>
                    TOTAL DE ARTÍCULOS
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color={grisRojizo.primary}>
                    ${subtotal.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, height: '100%' }}>
              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Icon icon="mdi:credit-card-check" width={20} height={20} color={grisRojizo.primary} />
                  <Typography variant="h6" fontWeight={700} color={grisRojizo.textStrong}>
                    Métodos de Pago
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#fafafa',
                    border: '1px solid #e0e0e0',
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
                          sx={{ borderRadius: 0, bgcolor: '#fff' }}
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
                        label="Monto"
                        value={nuevoPago.monto}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*[.,]?\d*$/.test(val)) {
                            setNuevoPago((prev) => ({ ...prev, monto: val }));
                          }
                        }}
                        InputProps={{ sx: { borderRadius: 0, bgcolor: '#fff' }, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputMode="decimal"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleAgregarPago}
                        disabled={(parseFloat(nuevoPago.monto) || 0) <= 0}
                        sx={{ width: '100%', minHeight: 40, borderRadius: 0, bgcolor: grisRojizo.primary, '&:hover': { bgcolor: grisRojizo.primaryHover } }}
                      >
                        <IconPlus size={16} />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {pagos.length > 0 && (
                  <TableContainer sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: grisRojizo.headerBg }}>
                          <TableCell sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Método</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Monto</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: grisRojizo.headerText }}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagos.map((pago, index) => {
                          const metodo = METODOS_PAGO.find((m) => m.value === pago.metodoPago);
                          return (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  {metodo && (
                                    <Icon icon={metodo.icon} width={16} height={16} color={grisRojizo.primary} />
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
                                  sx={{ color: '#d32f2f' }}
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
                    <Typography color="text.secondary">Total a Pagar</Typography>
                    <Typography fontWeight={600}>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Pagado</Typography>
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
                  <Alert severity="error" sx={{ mt: 1.5, borderRadius: 0 }}>
                    Falta <strong>${Math.abs(diferencia).toFixed(2)}</strong> para completar el pago
                  </Alert>
                )}
                {diferencia > 0.01 && (
                  <Alert severity="info" sx={{ mt: 1.5, borderRadius: 0 }}>
                    Cambio a entregar: <strong>${cambio.toFixed(2)}</strong>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={handleClose}
          disabled={creandoVenta}
          color="inherit"
          sx={{ fontWeight: 600, borderRadius: 0 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleConfirmarVenta}
          disabled={!puedeConfirmar || creandoVenta}
          sx={{
            bgcolor: grisRojizo.primary,
            borderRadius: 0,
            px: 3,
            fontWeight: 700,
            '&:hover': { bgcolor: grisRojizo.primaryHover },
            '&:disabled': { opacity: 0.6 }
          }}
        >
          {creandoVenta ? 'Procesando...' : 'Confirmar Venta'}
        </Button>
      </DialogActions>

      {/* Snackbar para feedback de errores */}
      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.sev} variant="filled" sx={{ width: '100%', borderRadius: 0 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
