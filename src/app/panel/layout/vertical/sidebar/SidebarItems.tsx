"use client";
import Menuitems from './MudrasMenuItems';
import { usePathname } from "next/navigation";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CustomizerContext } from '@/app/context/customizerContext';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';
import { useContext, useMemo } from 'react';
import { usePermisos } from '@/lib/permisos';




const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const { isSidebarHover, isCollapse, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : '';

  const { esAdmin, cargando: perfilCargando } = usePermisos();

  const itemsFiltrados = useMemo(() => {
    // Mientras el perfil no esté cargado, no ocultamos nada para evitar falsos negativos
    if (perfilCargando) return Menuitems;
    return Menuitems.filter((item) => {
      // 'Usuarios' siempre visible para facilitar acceso al CRUD; 'Roles' y 'Permisos' solo para admin
      if (!esAdmin && (item.title === 'Roles' || item.title === 'Permisos')) return false;
      return true;
    });
  }, [esAdmin, perfilCargando]);

  return (
    <Box sx={{ px: 1.5 }}>
      <List sx={{ pt: 0, '& .MuiListItemButton-root': { py: 0.5, px: 1, minHeight: 32 } }} className="sidebarNav">
        {itemsFiltrados.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => setIsMobileSidebar(!isMobileSidebar)}
              />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <NavItem item={item} key={item.id} pathDirect={pathDirect} hideMenu={hideMenu} onClick={() => setIsMobileSidebar(!isMobileSidebar)} />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
