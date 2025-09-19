// Paletas de colores centralizadas para Mudras
// Usuarios/Roles/Permisos = marrón | Artículos = verde

export const marron = {
  headerBg: '#4e342e',
  headerText: '#fbe9e7',
  headerBorder: '#a1887f',
  toolbarBg: '#efebe9',
  toolbarBorder: '#d7ccc8',
  borderOuter: '#bcaaa4',
  borderInner: '#d7ccc8',
  primary: '#6d4c41',
  primaryHover: '#5d4037',
  textStrong: '#5d4037',
  chipBg: '#d7ccc8',
  chipText: '#5d4037',
  rowHover: '#efebe9',
};

export const verde = {
  headerBg: '#2f3e2e',
  headerText: '#eef5ee',
  headerBorder: '#6b8f6b',
  toolbarBg: '#eaf3ea',
  toolbarBorder: '#b7d1b7',
  borderOuter: '#6b8f6b',
  borderInner: '#b7d1b7',
  primary: '#2e7d32', // MUI success.main aprox
  primaryHover: '#1b5e20',
  textStrong: '#2f3e2e',
  rowHover: 'success.lighter',
};

export type Paleta = typeof marron | typeof verde;

export const azul = {
  headerBg: '#1e3a5f',
  headerText: '#e6f0ff',
  headerBorder: '#5b8bd9',
  toolbarBg: '#eaf2ff',
  toolbarBorder: '#c7d8f8',
  borderOuter: '#5b8bd9',
  borderInner: '#c7d8f8',
  primary: '#1e88e5',
  primaryHover: '#1565c0',
  textStrong: '#123052',
  rowHover: '#eaf2ff',
};

export type PaletaAzul = typeof azul;

export const teal = {
  headerBg: '#0f4d4b',
  headerText: '#e6fffb',
  headerBorder: '#2aa79f',
  toolbarBg: '#e6faf8',
  toolbarBorder: '#c2ece8',
  borderOuter: '#2aa79f',
  borderInner: '#c2ece8',
  primary: '#00897b',
  primaryHover: '#00695c',
  textStrong: '#0b3a39',
  rowHover: '#e6faf8',
};

export type PaletaTeal = typeof teal;

// Ventas = violeta
export const violeta = {
  headerBg: '#4a148c',
  headerText: '#f3e5f5',
  headerBorder: '#8e24aa',
  toolbarBg: '#f5e9fb',
  toolbarBorder: '#e1ccec',
  borderOuter: '#8e24aa',
  borderInner: '#e1ccec',
  primary: '#7b1fa2',
  primaryHover: '#6a1b9a',
  textStrong: '#4a148c',
  rowHover: '#f5e9fb',
};

export type PaletaVioleta = typeof violeta;

// Puntos de Venta = gris verdoso oscuro
export const grisVerdoso = {
  headerBg: '#2d3e2d',
  headerText: '#e8f5e8',
  headerBorder: '#5a7a5a',
  toolbarBg: '#e8f2e8',
  toolbarBorder: '#b8d0b8',
  borderOuter: '#5a7a5a',
  borderInner: '#b8d0b8',
  primary: '#4a6741',
  primaryHover: '#3d5536',
  textStrong: '#2d3e2d',
  chipBg: '#b8d0b8',
  chipText: '#2d3e2d',
  rowHover: '#e8f2e8',
};

// Depósitos = gris rojizo oscuro
export const grisRojizo = {
  headerBg: '#3e2d2d',
  headerText: '#f5e8e8',
  headerBorder: '#7a5a5a',
  toolbarBg: '#f2e8e8',
  toolbarBorder: '#d0b8b8',
  borderOuter: '#7a5a5a',
  borderInner: '#d0b8b8',
  primary: '#674141',
  primaryHover: '#553636',
  textStrong: '#3e2d2d',
  chipBg: '#d0b8b8',
  chipText: '#3e2d2d',
  rowHover: '#f2e8e8',
};

export type PaletaGrisVerdoso = typeof grisVerdoso;
export type PaletaGrisRojizo = typeof grisRojizo;
