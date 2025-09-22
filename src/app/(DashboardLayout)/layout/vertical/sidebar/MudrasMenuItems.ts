import { uniqueId } from "lodash";

import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconPackage,
  IconUsers,
  IconTrendingUp,
  IconCategory,
  IconEye,
  IconPlus,
  IconAlertTriangle,
  IconShoppingCart,
  IconStar,
  IconFileText,
  IconSettings,
  IconChartBar,
  IconDownload,
  IconUpload,
  IconHistory,
  IconUser,
  IconShield,
  IconCash,
  IconWorld,
  IconHome,
  IconReceipt,
  IconPercentage,
  IconChartLine,
  IconPoint,
  IconClipboardList,
  IconTags,
  IconCurrencyDollar,
  IconTruck,
  IconEdit,
  IconFilter,
  IconDatabase,
  IconBell,
  IconLogout,
  IconChartPie,
  IconReportAnalytics,
  IconBoxSeam,
  IconShoppingBag,
  IconDiscount2,
  IconCalendarEvent,
  IconFileInvoice,
} from "@tabler/icons-react";
import { ElementType } from "react-spring";
import { NavGroup } from "@/app/(DashboardLayout)/types/layout/sidebar";

const MudrasMenuItems: NavGroup[] = [
  {
    navlabel: true,
    subheader: "Inicio",
  },
  {
    id: uniqueId(),
    title: "Inicio",
    icon: IconHome,
    href: "/",
  },

  {
    navlabel: true,
    subheader: "Gestión de Inventario",
  },
  {
    id: uniqueId(),
    title: "Artículos",
    icon: IconPackage,
    href: "/gestion/articulos",
    children: [
      {
        id: uniqueId(),
        title: "Ver Todos",
        icon: IconEye,
        href: "/gestion/articulos",
      },
      {
        id: uniqueId(),
        title: "Agregar Nuevo",
        icon: IconPlus,
        href: "/gestion/articulos/nuevo",
      },
      {
        id: uniqueId(),
        title: "Stock Bajo",
        icon: IconAlertTriangle,
        href: "/gestion/articulos/stock-bajo",
      },
      {
        id: uniqueId(),
        title: "Sin Stock",
        icon: IconAlertTriangle,
        href: "/gestion/articulos/sin-stock",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Proveedores",
    icon: IconUsers,
    href: "/gestion/proveedores",
    children: [
      {
        id: uniqueId(),
        title: "Ver Todos",
        icon: IconEye,
        href: "/gestion/proveedores",
      },
      {
        id: uniqueId(),
        title: "Agregar Nuevo",
        icon: IconPlus,
        href: "/gestion/proveedores/nuevo",
      },
      {
        id: uniqueId(),
        title: "Rubros por Proveedor",
        icon: IconTags,
        href: "/gestion/proveedores/rubros",
      },
      {
        id: uniqueId(),
        title: "Cuentas Corrientes",
        icon: IconCurrencyDollar,
        href: "/gestion/proveedores/cuentas",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Stock",
    icon: IconBoxSeam,
    href: "/stock",
  },
  {
    id: uniqueId(),
    title: "Control de Stock",
    icon: IconTrendingUp,
    href: "/gestion/stock",
    children: [
      {
        id: uniqueId(),
        title: "Movimientos",
        icon: IconHistory,
        href: "/gestion/stock/movimientos",
      },
      {
        id: uniqueId(),
        title: "Ajustes de Stock",
        icon: IconEdit,
        href: "/gestion/stock/ajustes",
      },
      {
        id: uniqueId(),
        title: "Inventario",
        icon: IconClipboardList,
        href: "/gestion/stock/inventario",
      },
    ],
  },

  {
    navlabel: true,
    subheader: "Ventas y Comercial",
  },
  {
    id: uniqueId(),
    title: "Caja Registradora",
    icon: IconCash,
    href: "/ventas/caja",
  },
  {
    id: uniqueId(),
    title: "Ventas",
    icon: IconShoppingCart,
    href: "/ventas",
    children: [
      {
        id: uniqueId(),
        title: "Nueva Venta",
        icon: IconPlus,
        href: "/ventas/nueva",
      },
      {
        id: uniqueId(),
        title: "Historial",
        icon: IconHistory,
        href: "/ventas/historial",
      },
      {
        id: uniqueId(),
        title: "Reportes",
        icon: IconChartBar,
        href: "/ventas/reportes",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Tienda Online",
    icon: IconWorld,
    href: "/comercial/tienda",
    children: [
      {
        id: uniqueId(),
        title: "Productos",
        icon: IconPackage,
        href: "/comercial/tienda/productos",
      },
      {
        id: uniqueId(),
        title: "Configuración",
        icon: IconSettings,
        href: "/comercial/tienda/config",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Promociones",
    icon: IconStar,
    href: "/promociones",
    children: [
      {
        id: uniqueId(),
        title: "Ofertas Activas",
        icon: IconPercentage,
        href: "/promociones/activas",
      },
      {
        id: uniqueId(),
        title: "Crear Promoción",
        icon: IconPlus,
        href: "/promociones/nueva",
      },
      {
        id: uniqueId(),
        title: "Descuentos",
        icon: IconDiscount2,
        href: "/promociones/descuentos",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Pedidos",
    icon: IconReceipt,
    href: "/pedidos",
    children: [
      {
        id: uniqueId(),
        title: "Todos los Pedidos",
        icon: IconClipboardList,
        href: "/pedidos",
      },
      {
        id: uniqueId(),
        title: "Pendientes",
        icon: IconCalendarEvent,
        href: "/pedidos/pendientes",
      },
      {
        id: uniqueId(),
        title: "Completados",
        icon: IconFileInvoice,
        href: "/pedidos/completados",
      },
    ],
  },

  {
    navlabel: true,
    subheader: "Reportes y Análisis",
  },
  {
    id: uniqueId(),
    title: "Reportes",
    icon: IconReportAnalytics,
    href: "/reportes",
    children: [
      {
        id: uniqueId(),
        title: "Ventas",
        icon: IconChartLine,
        href: "/reportes/ventas",
      },
      {
        id: uniqueId(),
        title: "Inventario",
        icon: IconChartBar,
        href: "/reportes/inventario",
      },
      {
        id: uniqueId(),
        title: "Proveedores",
        icon: IconChartPie,
        href: "/reportes/proveedores",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Exportar Datos",
    icon: IconDownload,
    href: "/exportar",
    children: [
      {
        id: uniqueId(),
        title: "Artículos",
        icon: IconPackage,
        href: "/exportar/articulos",
      },
      {
        id: uniqueId(),
        title: "Movimientos Stock",
        icon: IconTrendingUp,
        href: "/exportar/stock",
      },
      {
        id: uniqueId(),
        title: "Proveedores",
        icon: IconUsers,
        href: "/exportar/proveedores",
      },
    ],
  },

  {
    navlabel: true,
    subheader: "Administración",
  },
  {
    id: uniqueId(),
    title: "Configuración",
    icon: IconSettings,
    href: "/configuracion",
    children: [
      {
        id: uniqueId(),
        title: "General",
        icon: IconSettings,
        href: "/configuracion/general",
      },
      {
        id: uniqueId(),
        title: "Base de Datos",
        icon: IconDatabase,
        href: "/configuracion/database",
      },
      {
        id: uniqueId(),
        title: "Importar Datos",
        icon: IconUpload,
        href: "/configuracion/importar",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Usuarios",
    icon: IconUser,
    href: "/panel/usuarios",
  },
];

export default MudrasMenuItems;
