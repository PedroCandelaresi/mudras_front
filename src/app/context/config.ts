const config = {
  activeDir: "ltr", // This can be ltr or rtl
  activeMode: "light", // This can be light or dark
  activeTheme: "MUDRAS_THEME", // MUDRAS_THEME, BLUE_THEME, GREEN_THEME, AQUA_THEME, PURPLE_THEME, ORANGE_THEME
  activeLayout: "vertical", // This can be vertical or horizontal
  isLayout: "boxed", // This can be full or boxed
  isSidebarHover: true,
  isCollapse: "mini-sidebar",
  // Si true, la sidebar queda fija y el contenido se redimensiona;
  // si false, la sidebar funciona en modo auto-ocultar (overlay).
  isSidebarPinned: false,
  isLanguage: "en",
  isCardShadow: true,
  isMobileSidebar: false,
  isHorizontal: false,
  isBorderRadius: 7,
  sidebarWidth: 230,
  miniSidebarWidth: 80,
  topbarHeight: 56,
  // Configuración de transiciones sincronizadas
  transitionDuration: 300, // milisegundos
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design standard
};

export default config;
