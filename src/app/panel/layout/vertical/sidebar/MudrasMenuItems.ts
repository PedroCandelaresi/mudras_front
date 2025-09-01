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
    href: "/panel",
  },

  {
    navlabel: true,
    subheader: "Gestión de Inventario",
  },
  {
    id: uniqueId(),
    title: "Artículos",
    icon: IconPackage,
    href: "/panel/articulos",
  },
  {
    id: uniqueId(),
    title: "Proveedores",
    icon: IconUsers,
    href: "/panel/proveedores",
  },
  {
    id: uniqueId(),
    title: "Rubros",
    icon: IconCategory,
    href: "/panel/rubros",
  },

  {
    navlabel: true,
    subheader: "Ventas y Comercial",
  },
  {
    id: uniqueId(),
    title: "Caja Registradora",
    icon: IconCash,
    href: "/panel/caja",
  },
  {
    id: uniqueId(),
    title: "Ventas",
    icon: IconShoppingCart,
    href: "/panel/ventas",
  },
  {
    id: uniqueId(),
    title: "Tienda Online",
    icon: IconWorld,
    href: "/panel/tienda",
  },
  {
    id: uniqueId(),
    title: "Promociones",
    icon: IconStar,
    href: "/panel/promociones",
  },
  {
    id: uniqueId(),
    title: "Pedidos",
    icon: IconReceipt,
    href: "/panel/pedidos",
  },

  {
    navlabel: true,
    subheader: "Administración",
  },
  {
    id: uniqueId(),
    title: "Usuarios",
    icon: IconUser,
    href: "/panel/usuarios",
  },
  {
    id: uniqueId(),
    title: "Contaduría",
    icon: IconFileText,
    href: "/panel/contaduria",
  },
];

export default MudrasMenuItems;
