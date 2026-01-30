
import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box } from '@mui/material';
import type { RolItem, PermisoItem } from './RolesTable';
import { azul } from '@/ui/colores';
import PermissionTreeEditor from '../permisos/PermissionTreeEditor';

interface Props {
  open: boolean;
  rol: RolItem | null;
  onClose: () => void;
  onSubmit: (permissionIds: string[]) => void;
  cargarPermisos: () => Promise<PermisoItem[]>;
}

export function AssignPermisosModal({ open, rol, onClose, onSubmit, cargarPermisos }: Props) {
  const [allPermisos, setAllPermisos] = useState<PermisoItem[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    cargarPermisos().then((lista) => {
      setAllPermisos(lista);
      // Extraer IDs de permisos asignados
      const currentIds = (rol?.rolePermissions || []).map((rp) => rp.permission.id);

      // Mapear a los strings completos (resource:action:field) para el editor?
      // El editor usa strings simples 'resource:action' como keys.
      // Pero nuestro backend (y PermisoItem) tiene id UUID y resource/action separados.
      // Necesitamos un mapa inverso: 'resource:action' -> UUID
      // O hacer que el editor trabaje con lo que tenemos.

      // El editor SITE_PERMISSION_TREE define los permisos esperados (strings: 'productos:read').
      // Necesitamos machear esos strings con los UUIDs reales de la base de datos.

      // Vamos a construir una lista de strings seleccionados basados en lo que tiene el rol.
      const selectedStrings: string[] = [];

      // Recorremos los permisos reales del rol
      currentIds.forEach(id => {
        const p = lista.find(x => x.id === id);
        if (p) {
          // Reconstruir string: resource:action
          // Si action contiene ':', es un field permission: 'update:precios' -> resource='productos', action='update:precios'
          // String final: 'productos:update:precios'
          selectedStrings.push(`${p.resource}:${p.action}`);
        }
      });

      setSelectedPerms(selectedStrings);
    });
  }, [open, rol, cargarPermisos]);

  const handleToggle = (permString: string) => {
    setSelectedPerms(prev => {
      if (prev.includes(permString)) return prev.filter(p => p !== permString);
      return [...prev, permString];
    });
  };

  const submit = () => {
    // Convertir selectedStrings back to UUIDs
    // Para cada string seleccionado, buscamos si existe en allPermisos.
    // Si existe, tomamos su ID.
    // Si NO existe (ej: nuevo permiso definido en Tree pero no en DB todavía), lo ignoramos o lanzamos warning.

    const idsToSave: string[] = [];
    selectedPerms.forEach(permString => {
      const [resource, ...actionParts] = permString.split(':');
      const action = actionParts.join(':'); // 'read' or 'update:precios'

      const found = allPermisos.find(p => p.resource === resource && p.action === action);
      if (found) {
        idsToSave.push(found.id);
      } else {
        console.warn(`Permiso seleccionado '${permString}' no encontrado en base de datos. Asegúrate de correr el seed.`);
      }
    });

    onSubmit(idsToSave);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none', height: '80vh' } }}
    >
      <DialogTitle sx={{ bgcolor: azul.headerBg, color: azul.headerText, borderBottom: `1px solid ${azul.headerBorder}`, fontWeight: 700 }}>
        Asignar permisos al rol: {rol?.name}
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5' }}>
        <Box sx={{ p: 2, height: '100%' }}>
          <PermissionTreeEditor
            assignedPermissions={selectedPerms}
            onTogglePermission={handleToggle}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: azul.toolbarBg, borderTop: `1px solid ${azul.toolbarBorder}` }}>
        <Button onClick={onClose} sx={{ borderRadius: 0, fontWeight: 600, color: azul.textStrong }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={submit}
          disableElevation
          sx={{ borderRadius: 0, fontWeight: 600, bgcolor: azul.primary, '&:hover': { bgcolor: azul.primaryHover } }}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}
