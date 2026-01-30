import React, { useState } from 'react';
import {
    Box,
    Checkbox,
    Collapse,
    FormControlLabel,
    IconButton,
    Paper,
    Typography,
    Grid,
    Chip
} from '@mui/material';
import {
    IconChevronDown,
    IconChevronRight,
    IconEye,
    IconEdit,
    IconTrash,
    IconPlus,
    IconFolder,
    IconLock
} from '@tabler/icons-react';
import { alpha } from '@mui/material/styles';
import { azul, grisNeutro } from '@/ui/colores';

export interface PermissionNode {
    label: string;
    resource: string;
    actions?: {
        read?: string;
        create?: string;
        update?: string;
        delete?: string;
    };
    fields?: {
        label: string;
        permission: string; // e.g. 'productos:update:precios'
    }[];
    children?: PermissionNode[];
}

// Definition of the Site Tree for Permissions
export const SITE_PERMISSION_TREE: PermissionNode[] = [
    {
        label: 'Dashboard',
        resource: 'dashboard',
        actions: { read: 'dashboard:read' }
    },
    {
        label: 'Catálogo y Productos',
        resource: 'productos',
        actions: { read: 'productos:read', create: 'productos:create', delete: 'productos:delete', update: 'productos:update' },
        fields: [
            { label: 'Información Básica', permission: 'productos:update:info' },
            { label: 'Precios y Económico', permission: 'productos:update:precios' },
            { label: 'Costos y Proveedores', permission: 'productos:update:costos' },
            { label: 'Ajustes de Stock', permission: 'productos:update:stock' },
        ]
    },
    {
        label: 'Inventario',
        resource: 'stock',
        children: [
            { label: 'Movimientos de Stock', resource: 'stock', actions: { read: 'stock:read', update: 'stock:update' } },
            { label: 'Depósitos', resource: 'depositos', actions: { read: 'depositos:read', create: 'depositos:create', update: 'depositos:update' } },
            { label: 'Puntos de Venta', resource: 'puntos_venta', actions: { read: 'puntos_venta:read', create: 'puntos_venta:create', update: 'puntos_venta:update' } },
            { label: 'Rubros', resource: 'rubros', actions: { read: 'rubros:read', create: 'rubros:create', update: 'rubros:update' } },
        ]
    },
    {
        label: 'Ventas y Comercial',
        resource: 'ventas',
        children: [
            { label: 'Historial de Ventas', resource: 'ventas', actions: { read: 'ventas:read', create: 'ventas:create', delete: 'ventas:delete' } },
            { label: 'Caja Registradora', resource: 'caja', actions: { read: 'caja:read', create: 'caja:create', update: 'caja:update' } },
            { label: 'Clientes', resource: 'clientes', actions: { read: 'clientes:read', create: 'clientes:create', update: 'clientes:update' } },
            { label: 'Pedidos Pendientes', resource: 'pedidos', actions: { read: 'pedidos:read', create: 'pedidos:create', update: 'pedidos:update' } },
        ]
    },
    {
        label: 'Tienda Online',
        resource: 'tienda_online',
        actions: { read: 'tienda_online:read', update: 'tienda_online:update' },
        children: [
            { label: 'Promociones', resource: 'promociones', actions: { read: 'promociones:read', create: 'promociones:create', update: 'promociones:update' } },
        ]
    },
    {
        label: 'Compras y Proveedores',
        resource: 'compras',
        children: [
            { label: 'Proveedores', resource: 'proveedores', actions: { read: 'proveedores:read', create: 'proveedores:create', update: 'proveedores:update', delete: 'proveedores:delete' } },
            { label: 'Órdenes de Compra', resource: 'compras', actions: { read: 'compras:read', create: 'compras:create', update: 'compras:update' } },
            { label: 'Gastos', resource: 'gastos', actions: { read: 'gastos:read', create: 'gastos:create', update: 'gastos:update' } },
        ]
    },
    {
        label: 'Administración',
        resource: 'admin',
        children: [
            { label: 'Usuarios', resource: 'usuarios', actions: { read: 'usuarios:read', create: 'usuarios:create', update: 'usuarios:update', delete: 'usuarios:delete' } },
            { label: 'Roles y Permisos', resource: 'roles', actions: { read: 'roles:read', create: 'roles:create', update: 'roles:update', delete: 'roles:delete' } },
            { label: 'Contabilidad', resource: 'contabilidad', actions: { read: 'contabilidad:read', create: 'contabilidad:create', update: 'contabilidad:update' } },
        ]
    }
];

interface TreeNodeProps {
    node: PermissionNode;
    level: number;
    assignedPermissions: string[];
    onToggle: (perm: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, assignedPermissions, onToggle }) => {
    const [open, setOpen] = useState(true);

    const hasActions = node.actions && Object.keys(node.actions).length > 0;
    const hasFields = node.fields && node.fields.length > 0;
    const hasChildren = node.children && node.children.length > 0;

    // Render Action Icon helper
    const renderActionCheckbox = (perm: string | undefined, icon: React.ReactNode, tooltip: string) => {
        if (!perm) return null;
        const isChecked = assignedPermissions.includes(perm);
        return (
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isChecked}
                        onChange={() => onToggle(perm)}
                        size="small"
                        icon={<Box sx={{ opacity: 0.3 }}>{icon}</Box>}
                        checkedIcon={<Box sx={{ color: azul.primary }}>{icon}</Box>}
                    />
                }
                label={<Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: isChecked ? 600 : 400 }}>{tooltip}</Typography>}
                sx={{ mr: 1, ml: 0 }}
            />
        );
    };

    return (
        <Box sx={{ ml: level * 2, mb: 1 }}>
            {/* Node Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                {(hasChildren || hasFields) && (
                    <IconButton size="small" onClick={() => setOpen(!open)} sx={{ p: 0, mr: 1 }}>
                        {open ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    </IconButton>
                )}
                <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {level === 0 && <IconFolder size={16} color={azul.primary} />}
                    {node.label}
                </Typography>
            </Box>

            <Collapse in={open}>
                <Box sx={{ ml: (hasChildren || hasFields) ? 3 : 0, p: 1, borderLeft: `1px solid ${grisNeutro.borderInner}`, bgcolor: alpha(azul.primary, 0.02) }}>

                    {/* Actions Row */}
                    {hasActions && (
                        <Box display="flex" flexWrap="wrap" alignItems="center" mb={1}>
                            {renderActionCheckbox(node.actions?.read, <IconEye size={18} />, 'Ver')}
                            {renderActionCheckbox(node.actions?.create, <IconPlus size={18} />, 'Crear')}
                            {renderActionCheckbox(node.actions?.update, <IconEdit size={18} />, 'Editar')}
                            {renderActionCheckbox(node.actions?.delete, <IconTrash size={18} />, 'Eliminar')}
                        </Box>
                    )}

                    {/* Granular Fields Row */}
                    {hasFields && (
                        <Box sx={{ mt: 1, pl: 2, borderLeft: '2px dashed #ddd' }}>
                            <Typography variant="caption" display="block" color="text.secondary" mb={0.5}>
                                <IconLock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Permisos de Campo (Restricciones Especiales)
                            </Typography>
                            <Grid container spacing={1}>
                                {node.fields!.map(field => (
                                    <Grid key={field.permission}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={assignedPermissions.includes(field.permission)}
                                                    onChange={() => onToggle(field.permission)}
                                                />
                                            }
                                            label={<Typography variant="caption">{field.label}</Typography>}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Recursive Children */}
                    {hasChildren && node.children!.map((child) => (
                        <TreeNode
                            key={child.resource + child.label}
                            node={child}
                            level={level + 1}
                            assignedPermissions={assignedPermissions}
                            onToggle={onToggle}
                        />
                    ))}
                </Box>
            </Collapse>
        </Box>
    );
};

interface EditorProps {
    assignedPermissions: string[];
    onTogglePermission: (permission: string) => void;
}

const PermissionTreeEditor: React.FC<EditorProps> = ({ assignedPermissions, onTogglePermission }) => {
    return (
        <Paper variant="outlined" sx={{ p: 2, maxHeight: 600, overflow: 'auto', bgcolor: '#fff' }}>
            {SITE_PERMISSION_TREE.map((node) => (
                <TreeNode
                    key={node.resource + node.label}
                    node={node}
                    level={0}
                    assignedPermissions={assignedPermissions}
                    onToggle={onTogglePermission}
                />
            ))}
        </Paper>
    );
};

export default PermissionTreeEditor;
