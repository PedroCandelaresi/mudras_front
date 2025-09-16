"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Stack, Chip, Tooltip, IconButton, Button } from "@mui/material";
import { IconSearch, IconDiscount2, IconCalendar, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { ModalBase } from "@/ui/ModalBase";
import { useMutation, useQuery } from "@apollo/client/react";
import { ACTUALIZAR_PROMOCION, CREAR_PROMOCION, ELIMINAR_PROMOCION, GET_PROMOCIONES } from "@/app/queries/mudras.queries";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export interface PromocionItem {
  id: string;
  nombre: string;
  inicio: string; // ISO
  fin: string; // ISO
  estado: "ACTIVA" | "PROGRAMADA" | "FINALIZADA";
  descuento: number; // 0-100
}

const esquemaPromocion = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  inicio: z.string().min(1, "Fecha inicio requerida"),
  fin: z.string().min(1, "Fecha fin requerida"),
  descuento: z
    .number()
    .min(0, "Mínimo 0")
    .max(100, "Máximo 100"),
});

type FormPromocion = z.infer<typeof esquemaPromocion>;

interface Props { puedeCrear?: boolean }

const TablaPromociones: React.FC<Props> = ({ puedeCrear = true }) => {
  const { data, loading, refetch } = useQuery<{ promociones: PromocionItem[] }>(GET_PROMOCIONES, { fetchPolicy: 'cache-and-network' });
  const [crearPromocion] = useMutation(CREAR_PROMOCION);
  const [actualizarPromocion] = useMutation(ACTUALIZAR_PROMOCION);
  const [eliminarPromocion] = useMutation(ELIMINAR_PROMOCION);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [busqueda, setBusqueda] = useState("");
  const [modalCrear, setModalCrear] = useState(false);
  const [editando, setEditando] = useState<PromocionItem | null>(null);

  const filtrados = useMemo<PromocionItem[]>(() => {
    const promociones: PromocionItem[] = data?.promociones ?? [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return promociones;
    return promociones.filter((p: PromocionItem) => p.nombre.toLowerCase().includes(q) || p.estado.toLowerCase().includes(q));
  }, [data?.promociones, busqueda]);

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return filtrados.slice(start, start + rowsPerPage);
  }, [filtrados, page, rowsPerPage]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormPromocion>({
    resolver: zodResolver(esquemaPromocion),
    defaultValues: { nombre: "", inicio: "", fin: "", descuento: 0 },
  });

  const abrirCrear = () => { reset({ nombre: "", inicio: "", fin: "", descuento: 0 }); setModalCrear(true); };
  const abrirEditar = (p: PromocionItem) => {
    reset({ nombre: p.nombre, inicio: p.inicio.slice(0,10), fin: p.fin.slice(0,10), descuento: p.descuento });
    setEditando(p);
  };

  const onSubmit = async (val: FormPromocion) => {
    if (editando) {
      await actualizarPromocion({ variables: { id: editando.id, input: { ...val } } });
      setEditando(null);
    } else {
      await crearPromocion({ variables: { input: { ...val } } });
      setModalCrear(false);
    }
    await refetch();
  };

  const onEliminar = async (p: PromocionItem) => {
    await eliminarPromocion({ variables: { id: p.id } });
    await refetch();
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="success.dark">
          <IconDiscount2 style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Promociones
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {puedeCrear && (
            <Button
              variant="contained"
              color="success"
              startIcon={<IconPlus size={18} />}
              onClick={abrirCrear}
              sx={{ textTransform: 'none' }}
            >
              Nueva Promoción
            </Button>
          )}
          <TextField
            size="small"
            placeholder="Buscar promociones (nombre, estado)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{ startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            )}}
            sx={{ minWidth: 280 }}
          />
        </Stack>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200', bgcolor: 'background.paper' }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-head': { bgcolor: '#2f3e2e', color: '#eef5ee' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Vigencia</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', textAlign: 'right' }}>% Desc.</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#eef5ee', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginados.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{p.nombre}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconCalendar size={16} />
                    <Typography variant="body2">{new Date(p.inicio).toLocaleDateString()} — {new Date(p.fin).toLocaleDateString()}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={p.estado} size="small" color={p.estado === 'ACTIVA' ? 'success' : p.estado === 'PROGRAMADA' ? 'info' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>{p.descuento}%</Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton size="small" color="warning" onClick={() => abrirEditar(p)}>
                      <IconEdit size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={() => onEliminar(p)}>
                      <IconTrash size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography align="center" color="text.secondary">{loading ? 'Cargando…' : 'Sin promociones'}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={filtrados.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        labelRowsPerPage="Filas por página:"
      />

      <ModalBase
        abierto={modalCrear || Boolean(editando)}
        titulo={editando ? `Editar Promoción #${editando.id}` : 'Nueva Promoción'}
        onCerrar={() => { setModalCrear(false); setEditando(null); }}
        onAceptar={handleSubmit(onSubmit)}
        aceptarTexto={editando ? 'Guardar' : 'Crear'}
        deshabilitarAceptar={isSubmitting}
        maxWidth="sm"
      >
        <Stack spacing={2}>
          <TextField label="Nombre" size="small" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Inicio" type="date" size="small" {...register('inicio')} error={!!errors.inicio} helperText={errors.inicio?.message} InputLabelProps={{ shrink: true }} />
            <TextField label="Fin" type="date" size="small" {...register('fin')} error={!!errors.fin} helperText={errors.fin?.message} InputLabelProps={{ shrink: true }} />
            <TextField label="% Desc." type="number" size="small" inputProps={{ min: 0, max: 100, step: 1 }} {...register('descuento', { valueAsNumber: true })} error={!!errors.descuento} helperText={errors.descuento?.message} />
          </Stack>
        </Stack>
      </ModalBase>
    </Paper>
  );
};

export { TablaPromociones };
