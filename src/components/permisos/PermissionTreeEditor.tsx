import React, { useState, useMemo } from 'react';
import {
    Box,
    Checkbox,
    Collapse,
    FormControlLabel,
    IconButton,
    Typography,
    Grid,
    Divider,
    Switch,
    Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    IconChevronDown,
    IconChevronRight,
    IconEye,
    IconEdit,
    IconTrash,
    IconPlus,
    IconLock,
    IconShieldCheck
} from '@tabler/icons-react';
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
        permission: string;
    }[];
    children?: PermissionNode[];
}

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
            { label: 'Editar Información (Desc., Fotos)', permission: 'productos:update:info' },
            { label: 'Editar Precios y Ganancia', permission: 'productos:update:precios' },
            { label: 'Editar Costos y Proveedores', permission: 'productos:update:costos' },
            { label: 'Ajuste Manual de Stock', permission: 'productos:update:stock' },
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
            { label: 'Pedidos', resource: 'pedidos', actions: { read: 'pedidos:read', create: 'pedidos:create', update: 'pedidos:update' } },
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
    onToggleAll?: (perms: string[], active: boolean) => void;
}

const PermissionRow: React.FC<TreeNodeProps> = ({ node, level, assignedPermissions, onToggle, onToggleAll }) => {
    const [expanded, setExpanded] = useState(true);

    const hasChildren = node.children && node.children.length > 0;
    const hasActions = node.actions && Object.keys(node.actions).length > 0;
    const hasFields = node.fields && node.fields.length > 0;

    // Collect all child permissions for "Select All" logic
    const allNodePermissions = useMemo(() => {
        const perms: string[] = [];
        if (node.actions) Object.values(node.actions).forEach(p => perms.push(p));
        if (node.fields) node.fields.forEach(f => perms.push(f.permission));
        // Recursive children check would be complex, keeping it shallow for now or just main actions
        return perms;
    }, [node]);

    const allChecked = allNodePermissions.length > 0 && allNodePermissions.every(p => assignedPermissions.includes(p));
    const indeterminate = allNodePermissions.some(p => assignedPermissions.includes(p)) && !allChecked;

    const handleMasterToggle = () => {
        if (onToggleAll) {
            onToggleAll(allNodePermissions, !allChecked);
        }
    };

    return (
        <Box sx={{ mb: 0.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    px: 2,
                    pl: level * 3 + 2,
                    bgcolor: (level === 0) ? alpha(grisNeutro.primary, 0.03) : 'transparent',
                    borderBottom: level === 0 ? `1px solid ${grisNeutro.borderInner}` : 'none',
                    '&:hover': { bgcolor: alpha(azul.primary, 0.02) },
                    transition: 'background-color 0.2s'
                }}
            >
                {/* Expander */}
                {(hasChildren || hasFields) ? (
                    <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ mr: 1, color: grisNeutro.icon }}>
                        {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                    </IconButton>
                ) : (
                    <Box sx={{ width: 28, mr: 1 }} />
                )}

                {/* Label */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={level === 0 ? 700 : 500} color={grisNeutro.textStrong}>
                        {node.label}
                    </Typography>
                    {/* Master Switch for this resource actions */}
                    {hasActions && (
                        <Tooltip title={allChecked ? "Quitar todo" : "Seleccionar todo"}>
                            <Checkbox
                                size="small"
                                checked={allChecked}
                                indeterminate={indeterminate}
                                onChange={handleMasterToggle}
                                sx={{ ml: 1, color: grisNeutro.borderInput, '&.Mui-checked': { color: azul.primary }, '&.MuiCheckbox-indeterminate': { color: azul.primary } }}
                            />
                        </Tooltip>
                    )}
                </Box>

                {/* Standard Actions Columns */}
                {hasActions && (
                    <Box display="flex" gap={1}>
                        {[
                            { key: 'read', icon: <IconEye size={16} />, label: 'Ver' },
                            { key: 'create', icon: <IconPlus size={16} />, label: 'Crear' },
                            { key: 'update', icon: <IconEdit size={16} />, label: 'Editar' },
                            { key: 'delete', icon: <IconTrash size={16} />, label: 'Borrar' },
                        ].map(({ key, icon, label }) => {
                            const permString = (node.actions as any)[key];
                            if (!permString) return <Box key={key} sx={{ width: 32 }} />; // Placefolder alignment

                            const isChecked = assignedPermissions.includes(permString);
                            return (
                                <Tooltip title={label} key={key}>
                                    <Box
                                        onClick={() => onToggle(permString)}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            bgcolor: isChecked ? alpha(azul.primary, 0.1) : 'transparent',
                                            color: isChecked ? azul.primary : grisNeutro.icon,
                                            border: `1px solid ${isChecked ? azul.primary : 'transparent'}`,
                                            '&:hover': { bgcolor: alpha(azul.primary, 0.05) }
                                        }}
                                    >
                                        {icon}
                                    </Box>
                                </Tooltip>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Granular Fields & Children */}
            <Collapse in={expanded}>
                {hasFields && (
                    <Box sx={{ pl: level * 3 + 6, pr: 2, pb: 1 }}>
                        <Typography variant="caption" sx={{ color: grisNeutro.textWeak, fontWeight: 600, display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
                            <IconLock size={14} style={{ marginRight: 6 }} /> Restricciones de Campo Específicas
                        </Typography>
                        <Grid container spacing={1}>
                            {node.fields!.map((field) => (
                                <Grid key={field.permission} size={{ xs: 12, sm: 6 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={assignedPermissions.includes(field.permission)}
                                                onChange={() => onToggle(field.permission)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: azul.primary },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: azul.primary },
                                                }}
                                            />
                                        }
                                        label={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{field.label}</Typography>}
                                        sx={{ ml: 0, mr: 0, width: '100%' }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {hasChildren && node.children!.map((child) => (
                    <PermissionRow
                        key={child.resource + child.label}
                        node={child}
                        level={level + 1}
                        assignedPermissions={assignedPermissions}
                        onToggle={onToggle}
                        onToggleAll={onToggleAll}
                    />
                ))}
            </Collapse>
        </Box>
    );
};

interface EditorProps {
    assignedPermissions: string[];
    onTogglePermission: (permission: string) => void;
}

const PermissionTreeEditor: React.FC<EditorProps> = ({ assignedPermissions, onTogglePermission }) => {

    const handleToggleAll = (perms: string[], active: boolean) => {
        // If active=true, add all that are not present. If false, remove all.
        perms.forEach(p => {
            const hasIt = assignedPermissions.includes(p);
            if (active && !hasIt) onTogglePermission(p);
            if (!active && hasIt) onTogglePermission(p);
        });
    };

    return (
        <Box sx={{
            bgcolor: '#ffffff',
            borderRadius: 0,
            border: `1px solid ${grisNeutro.borderOuter}`,
            maxHeight: '65vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: '#f5f5f5' },
            '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: '3px' }
        }}>
            {SITE_PERMISSION_TREE.map((node) => (
                <PermissionRow
                    key={node.resource + node.label}
                    node={node}
                    level={0}
                    assignedPermissions={assignedPermissions}
                    onToggle={onTogglePermission}
                    onToggleAll={handleToggleAll}
                />
            ))}
        </Box>
    );
};

export default PermissionTreeEditor;
