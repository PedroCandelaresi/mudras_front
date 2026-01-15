'use client';
import { Dialog, DialogContent, DialogActions, Box, Typography, Button, IconButton } from '@mui/material';
import { useState, useMemo } from 'react';
import { TablaArticulos } from '@/components/articulos';
import { Icon } from '@iconify/react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (articulo: any) => void;
};

const ModalSeleccionarArticulo: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [selected, setSelected] = useState<any | null>(null);
  const columns = useMemo(() => ([
    { key: 'descripcion', header: 'Descripción', filterable: true, width: '40%' },
    { key: 'codigo', header: 'Código', filterable: true, width: 160 },
    { key: 'rubro', header: 'Rubro', filterable: true, width: 160 },
    { key: 'precio', header: 'Precio', width: 140 },
  ] as any), []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
          maxHeight: '90vh'
        }
      }}
    >
      <Box sx={{
        bgcolor: '#f5f5f5',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon icon="mdi:magnify" width={24} height={24} color="#546e7a" />
          <Typography variant="h6" fontWeight={700}>
            Seleccionar Artículo
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        <TablaArticulos
          columns={columns}
          showToolbar
          showGlobalSearch
          allowCreate={false}
          useInternalModals={false}
          onView={(a) => setSelected(a)}
        />
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary">
            Seleccionado: <strong>{selected ? `${selected.Codigo ?? ''} — ${selected.Descripcion ?? ''}` : 'Ninguno'}</strong>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!selected}
          onClick={() => { if (selected) onSelect(selected); }}
          sx={{ bgcolor: '#5d4037', borderRadius: 0, px: 3, fontWeight: 700, '&:hover': { bgcolor: '#4e342e' } }}
        >
          Usar seleccionado
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalSeleccionarArticulo;
