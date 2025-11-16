"use client";
import React, { useMemo, useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, TextField, InputAdornment, Stack, Chip, Tooltip, IconButton, Button } from "@mui/material";
import { IconSearch, IconDiscount2, IconCalendar, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { ModalBase } from "@/ui/ModalBase";
import SearchToolbar from "@/components/ui/SearchToolbar";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_PROMOCIONES } from '@/components/promociones/graphql/queries';
import {
  ACTUALIZAR_PROMOCION,
  CREAR_PROMOCION,
  ELIMINAR_PROMOCION,
} from '@/components/promociones/graphql/mutations';
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
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [busqueda, setBusqueda] = useState("");
  const [modalCrear, setModalCrear] = useState(false);
  const [editando, setEditando] = useState<PromocionItem | null>(null);

  const filtrados = useMemo<PromocionItem[]>(() => {
    const promociones: PromocionItem[] = data?.promociones ?? [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return promociones;
    return promociones.filter((p: PromocionItem) => p.nombre.toLowerCase().includes(q) || p.estado.toLowerCase().includes(q));
  }, [data?.promociones, busqueda]);

  const totalPaginas = Math.ceil(filtrados.length / rowsPerPage);
  const paginaActual = page + 1;

  const generarNumerosPaginas = () => {
    const paginas = [];
    const maxVisible = 7; // Máximo de páginas visibles
    
    if (totalPaginas <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para truncar páginas
      if (paginaActual <= 4) {
        // Inicio: 1, 2, 3, 4, 5, ..., última
        for (let i = 1; i <= 5; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        // Final: 1, ..., n-4, n-3, n-2, n-1, n
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        // Medio: 1, ..., actual-1, actual, actual+1, ..., última
        paginas.push(1);
        paginas.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

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
    <Paper elevation={0} sx={{ p: 3, border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper' }}>
      <SearchToolbar
        title="Promociones"
        icon={<IconDiscount2 style={{ marginRight: 8, verticalAlign: 'middle' }} />}
        baseColor="#2e7d32"
        placeholder="Buscar promociones (nombre, estado)"
        searchValue={busqueda}
        onSearchValueChange={setBusqueda}
        onSubmitSearch={() => setPage(0)}
        onClear={() => { setBusqueda(""); setPage(0); }}
        canCreate={puedeCrear}
        createLabel="Nueva Promoción"
        onCreateClick={abrirCrear}
      />

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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Filas por página:
          </Typography>
          <TextField
            select
            size="small"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ minWidth: 80 }}
          >
            {[50, 100, 150].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filtrados.length)} de ${filtrados.length}`}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {generarNumerosPaginas().map((numeroPagina, index) => (
              <Box key={index}>
                {numeroPagina === '...' ? (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                    ...
                  </Typography>
                ) : (
                  <Button
                    size="small"
                    variant={paginaActual === numeroPagina ? 'contained' : 'text'}
                    onClick={() => setPage((numeroPagina as number) - 1)}
                    sx={{
                      minWidth: 32,
                      height: 32,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      ...(paginaActual === numeroPagina ? {
                        bgcolor: 'warning.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'warning.dark' }
                      } : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'warning.light', color: 'warning.dark' }
                      })
                    }}
                  >
                    {numeroPagina}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={() => setPage(0)}
              disabled={page === 0}
              sx={{ color: 'text.secondary' }}
              title="Primera página"
            >
              ⏮
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              sx={{ color: 'text.secondary' }}
              title="Página anterior"
            >
              ◀
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ color: 'text.secondary' }}
              title="Página siguiente"
            >
              ▶
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage(totalPaginas - 1)}
              disabled={page >= totalPaginas - 1}
              sx={{ color: 'text.secondary' }}
              title="Última página"
            >
              ⏭
            </IconButton>
          </Box>
        </Box>
      </Box>

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
