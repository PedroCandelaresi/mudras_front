// Enlaces para el menú de la landing principal de Mudras

export interface AppLink {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

export interface PageLink {
  href: string;
  title: string;
}

export const appsLink: AppLink[] = [
  {
    href: '/panel/ventas/caja',
    title: 'Caja Registradora',
    subtext: 'Ventas rápidas en mostrador',
    avatar: '/images/svgs/icon-dd-cart.svg',
  },
  {
    href: '/panel/articulos',
    title: 'Gestión de Artículos',
    subtext: 'Stock, rubros y precios',
    avatar: '/images/svgs/icon-dd-application.svg',
  },
  {
    href: '/panel/proveedores',
    title: 'Proveedores',
    subtext: 'Compras y relaciones',
    avatar: '/images/svgs/icon-dd-mobile.svg',
  },
  {
    href: '/panel/ventas',
    title: 'Historial de Ventas',
    subtext: 'Consulta y reportes básicos',
    avatar: '/images/svgs/icon-dd-date.svg',
  },
];

export const pageLinks: PageLink[] = [
  {
    href: '/panel',
    title: 'Ir al Panel de Gestión',
  },
  {
    href: '/auth/auth1/login',
    title: 'Iniciar sesión',
  },
  {
    href: '/auth/auth1/register',
    title: 'Crear cuenta',
  },
];

