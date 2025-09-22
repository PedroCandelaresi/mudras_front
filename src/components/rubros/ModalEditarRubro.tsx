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
  rubro?: Rubro | null;
  onSuccess?: () => void;
}

export const ModalEditarRubro: React.FC<Props> = ({ open, onClose, rubro, onSuccess }) => {
  // Estado interno del modal
  const [formData, setFormData] = React.useState<FormRubro>({
    nombre: '',
    codigo: '',
    porcentajeRecargo: 0,
    porcentajeDescuento: 0
  });
  
  const [error, setError] = React.useState('');
  const [validacionError, setValidacionError] = React.useState('');
  
  // Estados para proveedores y artículos (simulados por ahora)
  const [proveedoresRubro] = React.useState<any[]>([]);
  const [articulosRubro] = React.useState<any[]>([]);
  const [filtroArticulos, setFiltroArticulos] = React.useState('');
  const [articulosSeleccionados, setArticulosSeleccionados] = React.useState<number[]>([]);
  const [pageArticulos, setPageArticulos] = React.useState(0);
  const [rowsPerPageArticulos, setRowsPerPageArticulos] = React.useState(50);
  const [setProveedorAEliminar] = React.useState(() => (p: any) => {});
  const [setModalEliminarProveedorAbierto] = React.useState(() => (v: boolean) => {});
  const [setArticuloAEliminar] = React.useState(() => (a: any) => {});
  const [setModalEliminarArticuloAbierto] = React.useState(() => (v: boolean) => {});

  // Inicializar formulario cuando se abre el modal
  React.useEffect(() => {
    if (open) {
      if (rubro) {
        setFormData({
          nombre: rubro.nombre || '',
          codigo: rubro.codigo || '',
          porcentajeRecargo: rubro.porcentajeRecargo || 0,
          porcentajeDescuento: rubro.porcentajeDescuento || 0
        });
      } else {
        setFormData({
          nombre: '',
          codigo: '',
          porcentajeRecargo: 0,
          porcentajeDescuento: 0
        });
      }
      setError('');
      setValidacionError('');
      setFiltroArticulos('');
      setPageArticulos(0);
    }
  }, [open, rubro]);

  const rubroEditando = !!rubro;

  const articulosFiltrados = articulosRubro.filter((a) => {
    if (!filtroArticulos) return true;
    return (
      a.descripcion?.toLowerCase().includes(filtroArticulos.toLowerCase()) ||
      a.codigo?.toLowerCase().includes(filtroArticulos.toLowerCase()) ||
      a.proveedor?.nombre?.toLowerCase().includes(filtroArticulos.toLowerCase())
    );
  });

  const handleCloseModal = () => {
    setFiltroArticulos('');
    setPageArticulos(0);
    onClose();
  };

  const onGuardar = async () => {
    try {
      // Validación básica
      if (!formData.nombre.trim()) {
        setValidacionError('El nombre es requerido');
        return;
      }

      // TODO: Implementar guardado real con GraphQL
      console.log('Guardando rubro:', formData);
      
      if (onSuccess) {
        onSuccess();
      }
      handleCloseModal();
    } catch (err) {
      setError('Error al guardar el rubro');
    }
  };

  const botonActualizarHabilitado = formData.nombre.trim().length > 0;

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="lg" fullWidth scroll="body" PaperProps={{sx:{borderRadius:3, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', maxHeight:'85vh', bgcolor:'transparent', overflow:'hidden'}}}>
      <TexturedPanel accent={rosa.primary} radius={12} contentPadding={0} bgTintPercent={10} bgAlpha={1} textureBaseOpacity={0.18} textureBoostOpacity={0.14} textureBrightness={1.1} tintOpacity={0.35}>
        <Box sx={{display:'flex', flexDirection:'column', height:'85vh'}}>
          <DialogTitle sx={{display:'flex', alignItems:'center', gap:2, pb:2, borderBottom:'1px solid rgba(0,0,0,0.08)'}}>
            <Icon icon="material-symbols:category" style={{fontSize:28, color:rosa.primary}} />
            <Typography variant="h5" fontWeight={700} color={rosa.textStrong}>
              {rubroEditando ? `Editar Rubro: ${rubro?.nombre}` : 'Nuevo Rubro'}
            </Typography>
            {rubroEditando && (
              <Box display="flex" gap={1} ml="auto">
                <Chip label={`${rubro?.cantidadProveedores || 0} proveedores`} size="small" sx={{bgcolor:rosa.chipBg, color:rosa.textStrong}} />
                <Chip label={`${rubro?.cantidadArticulos || 0} artículos`} size="small" sx={{bgcolor:rosa.chipBg, color:rosa.textStrong}} />
              </Box>
            )}
          </DialogTitle>

          <DialogContent sx={{flex:1, overflow:'auto', p:3}}>
            <Box display="flex" flexDirection="column" gap={2.5} py={2}>
              <Box display="flex" gap={2} sx={{flexDirection:{xs:'column', md:'row'}}}>
                <Box sx={{flex:1}}>
                  <TextField
                    fullWidth
                    label="Nombre del Rubro"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    variant="outlined"
                    required
                    sx={{'& .MuiOutlinedInput-root': {borderRadius:2, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor:rosa.primary}, '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor:rosa.primary}}, '& .MuiInputLabel-root.Mui-focused': {color:rosa.primary}}}
                  />
                </Box>
                <Box sx={{flex:1}}>
                  <TextField
                    fullWidth
                    label="Código"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    variant="outlined"
                    sx={{'& .MuiOutlinedInput-root': {borderRadius:2, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor:rosa.primary}, '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor:rosa.primary}}, '& .MuiInputLabel-root.Mui-focused': {color:rosa.primary}}}
                  />
                </Box>
              </Box>

              <Box display="flex" gap={2} sx={{flexDirection:{xs:'column', md:'row'}}}>
                <Box sx={{flex:1}}>
                  <TextField
                    fullWidth
                    label="Porcentaje de Recargo (%)"
                    type="number"
                    value={formData.porcentajeRecargo}
                    onChange={(e) => setFormData({...formData, porcentajeRecargo: parseFloat(e.target.value) || 0})}
                    variant="outlined"
                    inputProps={{min:0, max:100, step:0.01}}
                    helperText="Porcentaje que se suma al precio base"
                    sx={{'& .MuiOutlinedInput-root': {borderRadius:2, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor:rosa.primary}, '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor:rosa.primary}}, '& .MuiInputLabel-root.Mui-focused': {color:rosa.primary}}}
                  />
                </Box>
                <Box sx={{flex:1}}>
                  <TextField
                    fullWidth
                    label="Porcentaje de Descuento (%)"
                    type="number"
                    value={formData.porcentajeDescuento}
                    onChange={(e) => setFormData({...formData, porcentajeDescuento: parseFloat(e.target.value) || 0})}
                    variant="outlined"
                    inputProps={{min:0, max:100, step:0.01}}
                    helperText="Porcentaje que se resta del precio base"
                    sx={{'& .MuiOutlinedInput-root': {borderRadius:2, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor:rosa.primary}, '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor:rosa.primary}}, '& .MuiInputLabel-root.Mui-focused': {color:rosa.primary}}}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={600} color={rosa.textStrong} sx={{display:'flex', alignItems:'center', gap:1, mb:2}}>
                  <IconUsers size={20} />
                  Proveedores Asignados ({proveedoresRubro.length})
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {proveedoresRubro.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{fontStyle:'italic'}}>
                      No hay proveedores asignados a este rubro
                    </Typography>
                  ) : (
                    proveedoresRubro.map((proveedor) => (
                      <Chip
                        key={proveedor.id}
                        label={proveedor.nombre}
                        onDelete={() => {setProveedorAEliminar(proveedor); setModalEliminarProveedorAbierto(true);}}
                        deleteIcon={<IconX size={16} style={{color:'#f44336'}} />}
                        sx={{bgcolor:rosa.chipBg, color:rosa.textStrong, '& .MuiChip-deleteIcon': {color:'#f44336', '&:hover': {color:'#d32f2f'}}}}
                      />
                    ))
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{mt:1, display:'block'}}>
                  Los proveedores se asignan automáticamente cuando tienen artículos en este rubro
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={600} color={rosa.textStrong} sx={{display:'flex', alignItems:'center', gap:1, mb:2}}>
                  <IconTag size={20} />
                  Artículos del Rubro ({articulosRubro.length})
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar artículos por descripción, código o proveedor..."
                  value={filtroArticulos}
                  onChange={(e) => {setFiltroArticulos(e.target.value); setPageArticulos(0);}}
                  InputProps={{startAdornment: <InputAdornment position="start"><IconSearch size={18} /></InputAdornment>}}
                  sx={{mb:2, '& .MuiOutlinedInput-root': {borderRadius:2}}}
                />

                <Paper elevation={0} sx={{border:'1px solid rgba(0,0,0,0.08)', borderRadius:2, overflow:'hidden'}}>
                  <TableContainer sx={{maxHeight:300}}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{bgcolor:'rgba(0,0,0,0.02)', fontWeight:600, fontSize:'0.75rem'}}>Código</TableCell>
                          <TableCell sx={{bgcolor:'rgba(0,0,0,0.02)', fontWeight:600, fontSize:'0.75rem'}}>Descripción</TableCell>
                          <TableCell sx={{bgcolor:'rgba(0,0,0,0.02)', fontWeight:600, fontSize:'0.75rem'}}>Proveedor</TableCell>
                          <TableCell sx={{bgcolor:'rgba(0,0,0,0.02)', fontWeight:600, fontSize:'0.75rem'}}>Precio</TableCell>
                          <TableCell sx={{bgcolor:'rgba(0,0,0,0.02)', fontWeight:600, fontSize:'0.75rem'}}>Stock</TableCell>
                          <TableCell sx={{bgcolor:'rgba(0,0,0,0.02)', fontWeight:600, fontSize:'0.75rem', textAlign:'center'}}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {articulosFiltrados.slice(pageArticulos * rowsPerPageArticulos, pageArticulos * rowsPerPageArticulos + rowsPerPageArticulos).map((articulo) => (
                          <TableRow key={articulo.id} hover>
                            <TableCell sx={{fontSize:'0.75rem'}}>{articulo.codigo}</TableCell>
                            <TableCell sx={{fontSize:'0.75rem'}}>{articulo.descripcion}</TableCell>
                            <TableCell sx={{fontSize:'0.75rem'}}>{articulo.proveedor?.nombre}</TableCell>
                            <TableCell sx={{fontSize:'0.75rem'}}>${articulo.precio?.toFixed(2)}</TableCell>
                            <TableCell sx={{fontSize:'0.75rem'}}>{articulo.stock}</TableCell>
                            <TableCell sx={{textAlign:'center'}}>
                              <Box display="flex" gap={0.5} justifyContent="center">
                                <Tooltip title="Ver detalles del artículo">
                                  <IconButton size="small" sx={{bgcolor:azul.primary, color:'white', borderRadius:1.5, width:32, height:32, '&:hover': {bgcolor:azul.primaryHover}}}>
                                    <IconEye size={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar artículo">
                                  <IconButton size="small" sx={{bgcolor:verde.primary, color:'white', borderRadius:1.5, width:32, height:32, '&:hover': {bgcolor:verde.primaryHover}}}>
                                    <IconEdit size={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar artículo del rubro">
                                  <IconButton size="small" onClick={() => {setArticuloAEliminar(articulo); setModalEliminarArticuloAbierto(true);}} sx={{bgcolor:'#d32f2f', color:'white', borderRadius:1.5, width:32, height:32, '&:hover': {bgcolor:'#c62828'}}}>
                                    <IconTrash size={18} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {articulosRubro.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{py:3}}>
                              <Typography variant="caption" color="text.secondary">No hay artículos para mostrar</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{px:2, py:1.25}}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Typography variant="body2" color="text.secondary">Filas por página:</Typography>
                    <TextField select size="small" value={rowsPerPageArticulos} onChange={(e) => {setRowsPerPageArticulos(parseInt(e.target.value, 10)); setPageArticulos(0);}} sx={{minWidth:70}}>
                      {[50, 100, 150].map((option) => (<option key={option} value={option}>{option}</option>))}
                    </TextField>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton size="small" onClick={() => setPageArticulos(prev => Math.max(0, prev - 1))} disabled={pageArticulos === 0} sx={{bgcolor:verde.primary, color:'white', '&:hover': {bgcolor:verde.primaryHover}, '&:disabled': {bgcolor:'grey.300', color:'grey.500'}}}>
                      <Icon icon="mdi:chevron-left" />
                    </IconButton>
                    <Typography variant="body2" sx={{px:2, py:1, bgcolor:verde.chipBg, borderRadius:1, color:verde.textStrong}}>
                      {pageArticulos + 1} de {Math.ceil(articulosFiltrados.length / rowsPerPageArticulos)}
                    </Typography>
                    <IconButton size="small" onClick={() => setPageArticulos(prev => Math.min(Math.ceil(articulosFiltrados.length / rowsPerPageArticulos) - 1, prev + 1))} disabled={pageArticulos >= Math.ceil(articulosFiltrados.length / rowsPerPageArticulos) - 1} sx={{bgcolor:verde.primary, color:'white', '&:hover': {bgcolor:verde.primaryHover}, '&:disabled': {bgcolor:'grey.300', color:'grey.500'}}}>
                      <Icon icon="mdi:chevron-right" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mt:2}}>
                  <Typography variant="body2" color={verde.textStrong}>
                    Mostrando {articulosFiltrados.length} de {articulosRubro.length} artículos
                  </Typography>
                </Box>

                {articulosSeleccionados.length > 0 && (
                  <Box mt={2}>
                    <Button variant="contained" color="error" startIcon={<IconTrash />} onClick={() => setModalEliminarArticuloAbierto(true)} sx={{textTransform:'none'}}>
                      Eliminar {articulosSeleccionados.length} artículo(s) seleccionado(s)
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
            {error && (<Typography variant="body2" color="error">{error}</Typography>)}
            {validacionError && (<Typography variant="body2" color="error">{validacionError}</Typography>)}
          </DialogContent>

          <DialogActions sx={{px:3, py:2, gap:1.5, bgcolor:'transparent', borderTop:'none', justifyContent:'flex-end', flex:'0 0 auto', position:'relative', '::before': {content:'""', position:'absolute', left:0, right:0, top:-8, height:8, background:'linear-gradient(to top, rgba(0,0,0,0.08), rgba(0,0,0,0))', pointerEvents:'none'}}}>
            <Button onClick={handleCloseModal} variant="contained" size="small" sx={{textTransform:'none', borderRadius:2, px:2, bgcolor:'grey.100', color:'text.primary', boxShadow:'none', '&:hover': {bgcolor:'grey.200', boxShadow:'none'}}}>
              Cancelar
            </Button>
            <Button onClick={onGuardar} variant="contained" size="small" disabled={!botonActualizarHabilitado} sx={{textTransform:'none', borderRadius:2, px:2, bgcolor:botonActualizarHabilitado ? rosa.primary : 'grey.300', color:botonActualizarHabilitado ? 'white' : 'grey.500', '&:hover': {bgcolor:botonActualizarHabilitado ? rosa.primaryHover : 'grey.300'}, '&:disabled': {bgcolor:'grey.300', color:'grey.500'}}}>
              {rubroEditando ? 'Actualizar Rubro' : 'Crear Rubro'}
            </Button>
          </DialogActions>
        </Box>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalEditarRubro;
