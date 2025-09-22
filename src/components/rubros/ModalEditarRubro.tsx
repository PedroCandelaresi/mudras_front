'use client';
import React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  IconButton,
  Button,
  Chip,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Tooltip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { IconSearch, IconEdit, IconPlus, IconTag, IconX, IconUsers, IconTrash } from '@tabler/icons-react';
import { azul } from '@/ui/colores';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

// Tipos locales (coinciden con los de TablaRubros)
export interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

export interface FormRubro {
  nombre: string;
  codigo: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onGuardar: () => void;
  rubroEditando: Rubro | null;
  formData: FormRubro;
  setFormData: (d: FormRubro) => void;
  error: string;
  validacionError: string;
  proveedoresRubro: any[];
  setProveedorAEliminar: (p: any | null) => void;
  setModalEliminarProveedorAbierto: (v: boolean) => void;
  articulosRubro: any[];
  filtroArticulos: string;
  setFiltroArticulos: (v: string) => void;
  articulosSeleccionados: number[];
  setArticulosSeleccionados: (ids: number[]) => void;
  pageArticulos: number;
  setPageArticulos: (p: number) => void;
  rowsPerPageArticulos: number;
  setRowsPerPageArticulos: (n: number) => void;
  setArticuloAEliminar: (a: any | null) => void;
  setModalEliminarArticuloAbierto: (v: boolean) => void;
}

export const ModalEditarRubro: React.FC<Props> = (props) => {
  const {
    open, onClose, onGuardar,
    rubroEditando,
    formData, setFormData,
    error, validacionError,
    proveedoresRubro,
    setProveedorAEliminar, setModalEliminarProveedorAbierto,
    articulosRubro,
    filtroArticulos, setFiltroArticulos,
    articulosSeleccionados, setArticulosSeleccionados,
    pageArticulos, setPageArticulos,
    rowsPerPageArticulos, setRowsPerPageArticulos,
    setArticuloAEliminar, setModalEliminarArticuloAbierto,
  } = props;

  const articulosFiltrados = articulosRubro.filter((a) => {
    if (!filtroArticulos) return true;
    return (
      a.descripcion?.toLowerCase().includes(filtroArticulos.toLowerCase()) ||
      a.codigo?.toLowerCase().includes(filtroArticulos.toLowerCase()) ||
      a.proveedor?.nombre?.toLowerCase().includes(filtroArticulos.toLowerCase())
    );
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', bgcolor: 'transparent', overflow: 'hidden' } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <TexturedPanel
          accent={azul.primary}
          radius={12}
          contentPadding={0}
          bgTintPercent={10}
          bgAlpha={1}
          textureBaseOpacity={0.18}
          textureBoostOpacity={0.14}
          textureBrightness={1.1}
          tintOpacity={0.35}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}>
            <DialogTitle sx={{ p: 0, flex: '0 0 auto' }}>
              <Box sx={{ px: 4, pt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
                  <Box sx={{ bgcolor: azul.primary, borderRadius: '50%', p: 1.2, display: 'flex', color: 'white' }}>
                    {rubroEditando ? <IconEdit size={22} /> : <IconPlus size={22} />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: azul.textStrong }}>
                      {rubroEditando ? 'Editar Rubro' : 'Crear Nuevo Rubro'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {rubroEditando ? `Modificando: ${rubroEditando.nombre}` : 'Complete los datos del nuevo rubro'}
                    </Typography>
                  </Box>
                  <IconButton onClick={onClose} size="small" sx={{ color: azul.textStrong }}>
                    <IconX size={18} />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: 3, flex: 1, overflow: 'auto', minHeight: 0 }}>
              <Box display="flex" flexDirection="column" gap={4} pt={2}>
                <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: { xs: 1, md: 2 } }}>
                    <Typography variant="h6" fontWeight={600} color={azul.textStrong} mb={2} display="flex" alignItems="center" gap={1}>
                      <IconTag size={20} color={azul.primary} />
                      Nombre del Rubro
                    </Typography>
                    <TextField
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="Ingrese el nombre del rubro"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                    />
                  </Box>

                  <Box sx={{ flex: { xs: 1, md: 1 } }}>
                    <Typography variant="h6" fontWeight={600} color={azul.textStrong} mb={2} display="flex" alignItems="center" gap={1}>
                      <Icon icon="mdi:code-tags" style={{ color: azul.primary, fontSize: 20 }} />
                      Código (opcional)
                    </Typography>
                    <TextField
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                      fullWidth
                      variant="outlined"
                      placeholder="Ingrese el código del rubro"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={600} color={azul.textStrong} mb={2} display="flex" alignItems="center" gap={1}>
                    <IconUsers size={20} color={azul.primary} />
                    Proveedores Asociados
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {proveedoresRubro.map((proveedor: any) => (
                      <Chip
                        key={proveedor.id}
                        label={proveedor.nombre}
                        onDelete={() => { setProveedorAEliminar(proveedor); setModalEliminarProveedorAbierto(true); }}
                        deleteIcon={<IconX size={16} />}
                        sx={{ bgcolor: azul.primary, color: 'white', fontWeight: 500 }}
                      />
                    ))}
                    {proveedoresRubro.length === 0 && (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No hay proveedores asociados a este rubro
                      </Typography>
                    )}
                  </Box>
                </Box>

                {proveedoresRubro.length > 0 && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, bgcolor: azul.toolbarBg, border: '1px solid', borderColor: azul.toolbarBorder, borderRadius: 1, mb: 2 }}>
                      <Typography variant="h6" fontWeight={700} color={azul.textStrong}>
                        Artículos del Rubro ({articulosRubro.length})
                      </Typography>
                      <TextField
                        placeholder="Buscar artículos..."
                        value={filtroArticulos}
                        onChange={(e) => setFiltroArticulos(e.target.value)}
                        size="small"
                        sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={18} color={azul.primary} /></InputAdornment>) }}
                      />
                    </Box>

                    <Paper elevation={0} sx={{ border: 'none', boxShadow: 'none', borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox" sx={{ backgroundColor: azul.headerBg, borderBottom: '3px solid', borderColor: azul.headerBorder }}>
                              <input
                                type="checkbox"
                                checked={articulosSeleccionados.length === articulosRubro.length && articulosRubro.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) setArticulosSeleccionados(articulosRubro.map((a: any) => a.id));
                                  else setArticulosSeleccionados([]);
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: azul.headerText, backgroundColor: azul.headerBg, borderBottom: '3px solid', borderColor: azul.headerBorder, width: '15%' }}>Código</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: azul.headerText, backgroundColor: azul.headerBg, borderBottom: '3px solid', borderColor: azul.headerBorder, width: '35%' }}>Descripción</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: azul.headerText, backgroundColor: azul.headerBg, borderBottom: '3px solid', borderColor: azul.headerBorder, width: '23%' }}>Proveedor</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: azul.headerText, backgroundColor: azul.headerBg, borderBottom: '3px solid', borderColor: azul.headerBorder, width: '12%' }}>Stock</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: azul.headerText, backgroundColor: azul.headerBg, borderBottom: '3px solid', borderColor: azul.headerBorder, width: '15%', textAlign: 'center' }}>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                      </Table>
                      <TableContainer>
                        <Table>
                          <TableBody sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                            {articulosFiltrados
                              .slice(pageArticulos * rowsPerPageArticulos, (pageArticulos + 1) * rowsPerPageArticulos)
                              .map((articulo: any, idx: number) => (
                              <TableRow key={articulo.id} sx={{ bgcolor: idx % 2 === 1 ? 'grey.50' : 'inherit', '&:hover': { bgcolor: azul.toolbarBg }, transition: 'background-color 0.2s ease' }}>
                                <TableCell padding="checkbox">
                                  <input
                                    type="checkbox"
                                    checked={articulosSeleccionados.includes(articulo.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) setArticulosSeleccionados([...articulosSeleccionados, articulo.id]);
                                      else setArticulosSeleccionados(articulosSeleccionados.filter((id) => id !== articulo.id));
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={500} color="text.secondary">{articulo.codigo || '-'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{articulo.descripcion}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{articulo.proveedor?.nombre || 'Sin proveedor'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={articulo.stock > 0 ? `${articulo.stock} u.` : 'Sin stock'} color={articulo.stock > 0 ? (articulo.stock <= 5 ? 'warning' : 'success') : 'error'} size="small" variant="filled" sx={{ fontWeight: 600, minWidth: 80 }} />
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Eliminar artículo del rubro">
                                    <IconButton size="small" onClick={() => { setArticuloAEliminar(articulo); setModalEliminarArticuloAbierto(true); }} sx={{ bgcolor: '#d32f2f', color: 'white', borderRadius: 1.5, width: 28, height: 28, '&:hover': { bgcolor: '#c62828' } }}>
                                      <IconTrash size={14} />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                            {articulosRubro.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                  <Typography variant="body2" color="text.secondary">No hay artículos para mostrar</Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>

                    {articulosSeleccionados.length > 0 && (
                      <Box mt={2}>
                        <Button variant="contained" color="error" startIcon={<IconTrash />} onClick={() => setModalEliminarArticuloAbierto(true)} sx={{ textTransform: 'none' }}>
                          Eliminar {articulosSeleccionados.length} artículo(s) seleccionado(s)
                        </Button>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">Filas por página:</Typography>
                        <TextField select size="small" value={rowsPerPageArticulos} onChange={(e) => { setRowsPerPageArticulos(parseInt(e.target.value, 10)); setPageArticulos(0); }} sx={{ minWidth: 80 }}>
                          {[50, 100, 150].map((option) => (<option key={option} value={option}>{option}</option>))}
                        </TextField>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {Array.from({ length: Math.ceil(articulosFiltrados.length / rowsPerPageArticulos) }, (_, i) => i + 1).map((numeroPagina) => (
                          <Button key={numeroPagina} size="small" variant={pageArticulos + 1 === numeroPagina ? 'contained' : 'text'} onClick={() => setPageArticulos(numeroPagina - 1)} sx={{ minWidth: 32, height: 32, textTransform: 'none', fontSize: '0.875rem', ...(pageArticulos + 1 === numeroPagina ? { bgcolor: azul.primary, color: 'white', '&:hover': { bgcolor: azul.primaryHover } } : { color: 'text.secondary', '&:hover': { bgcolor: azul.toolbarBg } }) }}>
                            {numeroPagina}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
                {error && (<Typography variant="body2" color="error">{error}</Typography>)}
                {validacionError && (<Typography variant="body2" color="error">{validacionError}</Typography>)}
              </Box>
            </DialogContent>

            <DialogActions sx={{
              p: 2.5,
              pt: 1.5,
              gap: 2,
              bgcolor: 'transparent',
              borderTop: 'none',
              justifyContent: 'flex-end',
              flex: '0 0 auto',
              position: 'relative',
              '::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                top: -12,
                height: 12,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0))',
                pointerEvents: 'none'
              }
            }}>
              <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1, bgcolor: 'grey.100', color: 'text.primary', boxShadow: 'none', '&:hover': { bgcolor: 'grey.200', boxShadow: 'none' } }}>
                Cancelar
              </Button>
              <Button onClick={onGuardar} variant="contained" sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1, bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }}>
                {rubroEditando ? 'Actualizar Rubro' : 'Crear Rubro'}
              </Button>
            </DialogActions>
          </Box>
        </TexturedPanel>
      </Box>
    </Dialog>
  );
};

export default ModalEditarRubro;
