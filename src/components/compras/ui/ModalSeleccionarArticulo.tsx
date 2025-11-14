'use client';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography } from '@mui/material';
import { useState, useMemo } from 'react';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';
import { TablaArticulos } from '@/components/articulos';

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <TexturedPanel accent={verde.primary} radius={12} contentPadding={0}>
        <DialogTitle>Seleccionar artículo</DialogTitle>
        <DialogContent>
          <TablaArticulos
            columns={columns}
            showToolbar
            showGlobalSearch
            allowCreate={false}
            useInternalModals={false}
            onView={(a) => setSelected(a)}
          />
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Seleccionado: {selected ? `${selected.Codigo ?? ''} — ${selected.Descripcion ?? ''}` : '—'}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <CrystalSoftButton baseColor={verde.primary} onClick={onClose}>Cancelar</CrystalSoftButton>
          <CrystalButton baseColor={verde.primary} disabled={!selected} onClick={() => { if (selected) onSelect(selected); }}>Usar seleccionado</CrystalButton>
        </DialogActions>
      </TexturedPanel>
    </Dialog>
  );
};

export default ModalSeleccionarArticulo;

