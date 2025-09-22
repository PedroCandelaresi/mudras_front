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
import { IconSearch, IconEdit, IconPlus, IconTag, IconX, IconUsers, IconTrash, IconEye } from '@tabler/icons-react';
import { rosa } from './colores-rosa';
import { azul, verde } from '@/ui/colores';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

// Tipos locales (coinciden con los de TablaRubros)
export interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

export interface FormRubro {
  nombre: string;
  codigo: string;
  porcentajeRecargo: number;
  porcentajeDescuento: number;
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
  setPageArticulos: React.Dispatch<React.SetStateAction<number>>;
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

  const handleClose = () => {
    setFiltroArticulos('');
    setPageArticulos(0);
    onClose();
  };

  // Verificar si los campos principales han cambiado
  const camposModificados = rubroEditando && (
    formData.nombre !== rubroEditando.nombre ||
    formData.codigo !== rubroEditando.codigo ||
    formData.porcentajeRecargo !== (rubroEditando.porcentajeRecargo || 0) ||
    formData.porcentajeDescuento !== (rubroEditando.porcentajeDescuento || 0)
  );

  const botonActualizarHabilitado = !rubroEditando || camposModificados;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      scroll="body"
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxHeight: '85vh', bgcolor: 'transparent', overflow: 'hidden' } }}
    >
      <TexturedPanel
        accent={rosa.primary}
        radius={12}
        contentPadding={0}
        bgTintPercent={10}
        bgAlpha={1}
        textureBaseOpacity={0.18}
        textureBoostOpacity={0.14}
        textureBrightness={1.1}
        tintOpacity={0.35}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '85vh' }}>
        <DialogTitle sx={{
          p: 0,
          flex: '0 0 auto',
          position: 'relative',
          '::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -8,
            height: 8,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0))',
            pointerEvents: 'none'
          }
        }}>
          <Box sx={{ px: 3, pt: 2, pb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{bgcolor: rosa.primary, borderRadius: '50%', p:1, display:'flex', color: 'white'}}>
                {rubroEditando ? <IconEdit size={20} /> : <IconPlus size={20} />}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{fontWeight:600, mb:0.25, color: rosa.textStrong}}>
                  {rubroEditando ? 'Editar Rubro' : 'Crear Nuevo Rubro'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.875rem' }}>
                  {rubroEditando ? `Modificando: ${rubroEditando.nombre}` : 'Complete los datos del nuevo rubro'}
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small" sx={{color: rosa.textStrong}}>
                <IconX size={18} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 0, overflowY: 'scroll', overflowX: 'hidden', height: 'calc(85vh - 140px)' }}>
          <Box display="flex" flexDirection="column" gap={2.5} py={2}>
            <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: { xs: 1, md: 2 } }}>
                <Typography variant="body1" fontWeight={600} color={rosa.textStrong} mb={1} display="flex" alignItems="center" gap={1}>
                  <IconTag size={18} color={rosa.primary} />
                  Nombre del Rubro
                </Typography>
                <TextField
                  size="small"
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
                <Typography variant="body1" fontWeight={600} color={rosa.textStrong} mb={1} display="flex" alignItems="center" gap={1}>
                  <Icon icon="mdi:code-tags" style={{color: rosa.primary, fontSize: 18}} />
                  Código (opcional)
                </Typography>
                <TextField
                  size="small"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  fullWidth
                  variant="outlined"
                  placeholder="Ingrese el código del rubro"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                />
              </Box>
            </Box>

            <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: { xs: 1, md: 1 } }}>
                <Typography variant="body1" fontWeight={600} color={rosa.textStrong} mb={1} display="flex" alignItems="center" gap={1}>
                  <Icon icon="mdi:account-cash" style={{color: rosa.primary, fontSize: 18}} />
                  Recargo Proveedor (%)
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={formData.porcentajeRecargo}
                  onChange={(e) => setFormData({ ...formData, porcentajeRecargo: parseFloat(e.target.value) || 0 })}
                  fullWidth
                  variant="outlined"
                  placeholder="0.00"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                  helperText="Sobre precio final del proveedor (incluye sus recargos)"
                />
              </Box>

              <Box sx={{ flex: { xs: 1, md: 1 } }}>
                <Typography variant="body1" fontWeight={600} color={rosa.textStrong} mb={1} display="flex" alignItems="center" gap={1}>
                  <Icon icon="mdi:tag-percent" style={{color: rosa.primary, fontSize: 18}} />
                  Descuento Venta (%)
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={formData.porcentajeDescuento}
                  onChange={(e) => setFormData({ ...formData, porcentajeDescuento: parseFloat(e.target.value) || 0 })}
                  fullWidth
                  variant="outlined"
                  placeholder="0.00"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                  helperText="Sobre precio final de venta (después de todos los recargos)"
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" fontWeight={600} color={rosa.textStrong} mb={1} display="flex" alignItems="center" gap={1}>
                <IconUsers size={18} color={rosa.primary} />
                Proveedores Asociados
              </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {proveedoresRubro.map((proveedor: any) => (
                      <Chip 
                        key={proveedor.id} 
                        label={proveedor.nombre} 
                        onDelete={() => { setProveedorAEliminar(proveedor); setModalEliminarProveedorAbierto(true); }} 
                        deleteIcon={<IconX size={16} color="rgba(255,255,255,0.8)" />} 
                        sx={{ bgcolor: azul.primary, color: 'white', fontWeight: 500, border: `1px solid ${azul.primary}` }} 
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
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.25, bgcolor: verde.alternateRow, border: '1px solid', borderColor: verde.borderInner, borderRadius: 1, mb: 1.5 }}>
                  <Typography variant="body1" fontWeight={700} color={verde.textStrong}>
                    Artículos del Rubro ({articulosRubro.length})
                  </Typography>
                      <TextField
                        placeholder="Buscar artículos..."
                        value={filtroArticulos}
                        onChange={(e) => {
                          setFiltroArticulos(e.target.value);
                          setPageArticulos(0);
                        }}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'white',
                            '& fieldset': { borderColor: verde.borderInner },
                            '&:hover fieldset': { borderColor: verde.primary },
                            '&.Mui-focused fieldset': { borderColor: verde.primary }
                          }
                        }}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><Icon icon="mdi:magnify" style={{color: verde.primary, fontSize: 20}} /></InputAdornment>) }}
                      />
                    </Box>

                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: verde.borderInner, borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' }}>
                      <TableContainer>
                        <Table size="small" sx={{
                          '& .MuiTableHead-root': {
                            '& .MuiTableCell-head': {
                              bgcolor: verde.headerBg,
                              color: verde.headerText,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              borderBottom: `2px solid ${verde.borderOuter}`,
                              '&:first-of-type': { borderTopLeftRadius: 8 },
                              '&:last-of-type': { borderTopRightRadius: 8 }
                            }
                          },
                          '& .MuiTableRow-root:hover': {
                            bgcolor: verde.rowHover
                          },
                          '& .MuiTableCell-root': {
                            borderBottom: `1px solid ${verde.borderInner}`,
                            fontSize: '0.875rem'
                          }
                        }}>
                          <TableHead>
                            <TableRow>
                              <TableCell padding="checkbox" sx={{ backgroundColor: verde.chipBg, borderBottom: '2px solid', borderColor: verde.borderOuter, py: 0.75 }}>
                                <input
                                  type="checkbox"
                                  checked={articulosSeleccionados.length === articulosRubro.length && articulosRubro.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) setArticulosSeleccionados(articulosRubro.map((a: any) => a.id));
                                    else setArticulosSeleccionados([]);
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: verde.chipText, backgroundColor: verde.chipBg, borderBottom: '2px solid', borderColor: verde.borderOuter, width: '15%', py: 0.75 }}>Código</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: verde.chipText, backgroundColor: verde.chipBg, borderBottom: '2px solid', borderColor: verde.borderOuter, width: '35%', py: 0.75 }}>Descripción</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: verde.chipText, backgroundColor: verde.chipBg, borderBottom: '2px solid', borderColor: verde.borderOuter, width: '23%', py: 0.75 }}>Proveedor</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: verde.chipText, backgroundColor: verde.chipBg, borderBottom: '2px solid', borderColor: verde.borderOuter, width: '12%', py: 0.75 }}>Stock</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: verde.chipText, backgroundColor: verde.chipBg, borderBottom: '2px solid', borderColor: verde.borderOuter, width: '15%', textAlign: 'center', py: 0.75 }}>Acciones</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {articulosFiltrados
                              .slice(pageArticulos * rowsPerPageArticulos, (pageArticulos + 1) * rowsPerPageArticulos)
                              .map((articulo: any, idx: number) => (
                              <TableRow key={articulo.id} sx={{ bgcolor: idx % 2 === 1 ? verde.alternateRow : 'inherit', '&:hover': { bgcolor: verde.rowHover }, transition: 'background-color 0.2s ease' }}>
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
                                  <Typography variant="caption" fontWeight={500} color="text.secondary">{articulo.codigo || '-'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="caption" fontWeight={600} sx={{ whiteSpace: 'normal', lineHeight: 1.3 }}>{articulo.descripcion}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'normal', lineHeight: 1.3 }}>{articulo.proveedor?.nombre || 'Sin proveedor'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={articulo.stock > 0 ? `${articulo.stock} u.` : 'Sin stock'} color={articulo.stock > 0 ? (articulo.stock <= 5 ? 'warning' : 'success') : 'error'} size="small" variant="filled" sx={{ fontWeight: 600, minWidth: 70, fontSize: '0.7rem', height: 20 }} />
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Eliminar artículo del rubro">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => { setArticuloAEliminar(articulo); setModalEliminarArticuloAbierto(true); }}
                                      sx={{
                                        bgcolor: '#d32f2f',
                                        color: 'white',
                                        borderRadius: 1.5,
                                        width: 32,
                                        height: 32,
                                        '&:hover': {
                                          bgcolor: '#c62828'
                                        }
                                      }}
                                    >
                                      <IconTrash size={18} />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                            {articulosRubro.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                  <Typography variant="caption" color="text.secondary">No hay artículos para mostrar</Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>

                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.25 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography variant="body2" color="text.secondary">Filas por página:</Typography>
                        <TextField select size="small" value={rowsPerPageArticulos} onChange={(e) => { setRowsPerPageArticulos(parseInt(e.target.value, 10)); setPageArticulos(0); }} sx={{ minWidth: 70 }}>
                          {[50, 100, 150].map((option) => (<option key={option} value={option}>{option}</option>))}
                        </TextField>
                      </Box>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => setPageArticulos(prev => Math.max(0, prev - 1))}
                          disabled={pageArticulos === 0}
                          sx={{
                            bgcolor: verde.primary,
                            color: 'white',
                            '&:hover': { bgcolor: verde.primaryHover },
                            '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                          }}
                        >
                          <Icon icon="mdi:chevron-left" />
                        </IconButton>
                        <Typography variant="body2" sx={{ px: 2, py: 1, bgcolor: verde.chipBg, borderRadius: 1, color: verde.textStrong }}>
                          {pageArticulos + 1} de {Math.ceil(articulosFiltrados.length / rowsPerPageArticulos)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setPageArticulos(prev => Math.min(Math.ceil(articulosFiltrados.length / rowsPerPageArticulos) - 1, prev + 1))}
                          disabled={pageArticulos >= Math.ceil(articulosFiltrados.length / rowsPerPageArticulos) - 1}
                          sx={{
                            bgcolor: verde.primary,
                            color: 'white',
                            '&:hover': { bgcolor: verde.primaryHover },
                            '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                          }}
                        >
                          <Icon icon="mdi:chevron-right" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="body2" color={verde.textStrong}>
                        Mostrando {articulosFiltrados.length} de {articulosRubro.length} artículos
                      </Typography>
                    </Box>

                    {articulosSeleccionados.length > 0 && (
                      <Box mt={2}>
                        <Button variant="contained" color="error" startIcon={<IconTrash />} onClick={() => setModalEliminarArticuloAbierto(true)} sx={{ textTransform: 'none' }}>
                          Eliminar {articulosSeleccionados.length} artículo(s) seleccionado(s)
                        </Button>
                      </Box>
                    )}
              </Box>
            )}
            {error && (<Typography variant="body2" color="error">{error}</Typography>)}
            {validacionError && (<Typography variant="body2" color="error">{validacionError}</Typography>)}
          </Box>
        </DialogContent>

        <DialogActions sx={{
          px: 3,
          py: 2,
          gap: 1.5,
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
            top: -8,
            height: 8,
            background: 'linear-gradient(to top, rgba(0,0,0,0.08), rgba(0,0,0,0))',
            pointerEvents: 'none'
          }
        }}>
          <Button onClick={handleClose} variant="contained" size="small" sx={{ textTransform: 'none', borderRadius: 2, px: 2, bgcolor: 'grey.100', color: 'text.primary', boxShadow: 'none', '&:hover': { bgcolor: 'grey.200', boxShadow: 'none' } }}>
            Cancelar
          </Button>
          <Button 
            onClick={onGuardar} 
            variant="contained" 
            size="small" 
            disabled={!botonActualizarHabilitado}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2, 
              px: 2, 
              bgcolor: botonActualizarHabilitado ? rosa.primary : 'grey.300',
              color: botonActualizarHabilitado ? 'white' : 'grey.500',
              '&:hover': { 
                bgcolor: botonActualizarHabilitado ? rosa.primaryHover : 'grey.300' 
              },
              '&:disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            {rubroEditando ? 'Actualizar Rubro' : 'Crear Rubro'}
          </Button>
        </DialogActions>
        </Box>
      </TexturedPanel>
    </Dialog>
  );
}
