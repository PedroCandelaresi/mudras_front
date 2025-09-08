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
