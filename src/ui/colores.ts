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
  alternateRow: '#f5ede9', // ✅ agregado para coherencia visual con verde
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
  chipBg: '#b7d1b7',
  chipText: '#2f3e2e',
  rowHover: '#eaf3ea',
  actionHover: '#c8e6c9',
  alternateRow: '#f1f8e9',
};

export type Paleta = typeof marron | typeof verde;
export type PaletaVerde = typeof verde;

export const azul = {
  headerBg: '#0f2a44',
  headerText: '#e1ecf4',
  headerBorder: '#2d5aa0',
  toolbarBg: '#FFFFFF',
  toolbarBorder: '#b8d4ea',
  borderOuter: '#2d5aa0',
  borderInner: '#b8d4ea',
  primary: '#1565c0',
  primaryHover: '#0d47a1',
  textStrong: '#0a1929',
  chipBg: '#b8d4ea',
  chipText: '#0a1929',
  rowHover: '#FFFFFF',
  alternateRow: '#f0f7ff',
  actionHover: '#cce7ff',
  tableHeader: '#4FC3F7', // Celeste claro más blanco/fuerte
  tableStriped: '#e1f5fe', // Celeste pastel sutil
};

export type PaletaAzul = typeof azul;


export const naranjaCaja = {
  headerBg: '#6B2B06',
  headerText: '#FFF4E8',
  headerBorder: '#D46A1C',
  toolbarBg: '#FFF0E0',
  toolbarBorder: '#F5C396',
  borderOuter: '#D46A1C',
  borderInner: '#F5C396',
  primary: '#F28C28',
  primaryHover: '#D97A1F',
  textStrong: '#5A2104',
  chipBg: '#F9C89B',
  chipText: '#5A2104',
  rowHover: '#FFE7CC',
  alternateRow: '#FFF3E2',
  actionHover: '#FBD8B2',
};

export type PaletaNaranjaCaja = typeof naranjaCaja;
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
  alternateRow: '#f0fcf9', // ✅ agregado
  actionHover: '#dfece0',
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
  alternateRow: '#f9f1fc', // ✅ agregado
  actionHover: '#f3e5f5',
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
  alternateRow: '#f2f8f2', // ✅ agregado
  actionHover: '#dfece0',
};

export type PaletaGrisVerdoso = typeof grisVerdoso;

export const verdeMilitar = {
  headerBg: '#33401c',
  headerText: '#f1f8e9',
  headerBorder: '#556b2f',
  toolbarBg: '#f6f9f4',
  toolbarBorder: '#c5e1a5',
  borderOuter: '#556b2f',
  borderInner: '#dcedc8',
  primary: '#556b2f',
  primaryHover: '#33401c',
  textStrong: '#33401c',
  chipBg: '#dcedc8',
  chipText: '#33401c',
  rowHover: '#f6f9f4',
  alternateRow: '#f1f8e9',
  actionHover: '#c5e1a5',
  tableHeader: '#68823b', // Lighter military green for table headers
  tableStriped: '#f6f9f4',
};

export type PaletaVerdeMilitar = typeof verdeMilitar;

// Rojo = Eliminar / Peligro
export const rojo = {
  headerBg: '#c62828',
  headerText: '#ffebee',
  headerBorder: '#b71c1c',
  toolbarBg: '#ffebee',
  toolbarBorder: '#ffcdd2',
  borderOuter: '#b71c1c',
  borderInner: '#ffcdd2',
  primary: '#d32f2f',
  primaryHover: '#b71c1c',
  textStrong: '#b71c1c',
  chipBg: '#ffcdd2',
  chipText: '#b71c1c',
  rowHover: '#ffebee',
  alternateRow: '#fff5f5',
  actionHover: '#ffcdd2',
};

export type PaletaRojo = typeof rojo;

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
  alternateRow: '#f8efef', // ✅ agregado
  actionHover: '#efe0e0',
};

export type PaletaGrisRojizo = typeof grisRojizo;

// Borgoña oscuro = logística / movimientos de stock
export const borgoña = {
  headerBg: '#4A0E21',
  headerText: '#FBE9EB',
  headerBorder: '#7A2A3A',
  toolbarBg: '#F7EAEA',
  toolbarBorder: '#E2C6C6',
  borderOuter: '#7A2A3A',
  borderInner: '#E2C6C6',
  primary: '#6B1E2C',
  primaryHover: '#4A0E21',
  textStrong: '#3B0B18',
  chipBg: '#E2C6C6',
  chipText: '#3B0B18',
  rowHover: '#F7EAEA',
  alternateRow: '#FAF0F0',
  actionHover: '#F2D8D8',
  tableHeader: '#8b2639', // Lighter burgundy for table headers
  tableStriped: '#FAF0F0',
};

export type PaletaBorgoña = typeof borgoña;

// Azul oscuro = para vistas “dark blue”
export const azulOscuro = {
  headerBg: '#0B1426',       // navy bien oscuro
  headerText: '#E7EEF8',     // texto claro
  headerBorder: '#214A86',   // borde del header
  toolbarBg: '#E9F1FB',      // fondo claro para toolbars
  toolbarBorder: '#C3D6EE',
  borderOuter: '#214A86',
  borderInner: '#C3D6EE',
  primary: '#0E3A8A',        // acción principal (más intensa que el azul normal)
  primaryHover: '#0A2E6D',
  textStrong: '#091324',     // texto fuerte, casi negro azulado
  chipBg: '#C3D6EE',
  chipText: '#091324',
  rowHover: '#E9F1FB',       // hover de fila sutil y coherente
  alternateRow: '#F1F6FD',   // zebra alterna
  actionHover: '#D5E4F7',    // hover de acciones suave
};

export type PaletaAzulOscuro = typeof azulOscuro;

// Modal de asignación (elegante negro + dorado)
export const oroNegro = {
  headerBg: '#0d0b0a',
  headerText: '#f7f1e3',
  headerBorder: '#b88a2d',
  toolbarBg: '#151210',
  toolbarBorder: '#c7a64f',
  borderOuter: '#b88a2d',
  borderInner: '#d8b157',
  primary: '#c7a027',        // dorado principal
  primaryHover: '#b0881f',
  textStrong: '#0d0b0a',
  chipBg: '#e7cf8a',
  chipText: '#3a2a08',
  rowHover: '#19140f',
  alternateRow: '#1f1a14',
  actionHover: '#e7cf8a',
  dark: '#9c7218',           // dorado profundo para secundarios/cancelar
  darkHover: '#805d13',
};

export type PaletaOroNegro = typeof oroNegro;

// Oro blanco / tono champagne suave para la portada del panel
export const oroBlanco = {
  headerBg: '#6d5c3b',
  headerText: '#fffaf1',
  headerBorder: '#d0c09a',
  toolbarBg: '#f6f1e7',
  toolbarBorder: '#e1d5bf',
  borderOuter: '#d0c09a',
  borderInner: '#e1d5bf',
  primary: '#c2b79b',       // tono principal “oro blanco”
  primaryHover: '#b3a88e',
  textStrong: '#4e4532',
  rowHover: '#f6f1e7',
  alternateRow: '#f9f4eb',
  actionHover: '#efe4d2',
};

export type PaletaOroBlanco = typeof oroBlanco;

// Azul Marino (Depósitos)
export const azulMarino = {
  headerBg: '#0d47a1', // Azul fuerte para header
  headerText: '#e3f2fd', // Celeste muy claro para texto header
  headerBorder: '#1565c0',
  toolbarBg: '#e3f2fd',
  toolbarBorder: '#bbdefb',
  borderOuter: '#1565c0',
  borderInner: '#bbdefb',
  primary: '#1565c0',
  primaryHover: '#0d47a1',
  textStrong: '#0d47a1',
  chipBg: '#bbdefb',
  chipText: '#0d47a1',
  rowHover: '#e3f2fd',
  alternateRow: '#f5faff',
  actionHover: '#bbdefb',
};

export type PaletaAzulMarino = typeof azulMarino;

// Verde Oliva (Puntos de Venta)
export const verdeOliva = {
  headerBg: '#556b2f', // Olive green para header
  headerText: '#f1f8e9', // Verde muy claro para texto header
  headerBorder: '#6b8e23',
  toolbarBg: '#f9fbe7',
  toolbarBorder: '#dcedc8',
  borderOuter: '#6b8e23',
  borderInner: '#dcedc8',
  primary: '#6b8e23', // Olive drab
  primaryHover: '#556b2f',
  textStrong: '#33691e',
  chipBg: '#dcedc8',
  chipText: '#33691e',
  rowHover: '#f9fbe7',
  alternateRow: '#f1f8e9',
  actionHover: '#c5e1a5',
};


// Gris Neutro (Usuarios)
export const grisNeutro = {
  headerBg: '#424242',
  headerText: '#f5f5f5',
  headerBorder: '#616161',
  toolbarBg: '#f5f5f5',
  toolbarBorder: '#e0e0e0',
  borderOuter: '#616161',
  borderInner: '#e0e0e0',
  primary: '#616161',
  primaryHover: '#424242',
  textStrong: '#212121',
  chipBg: '#e0e0e0',
  chipText: '#212121',
  rowHover: '#eeeeee',
  alternateRow: '#fafafa',
  actionHover: '#bdbdbd',
  tableHeader: '#757575',
  tableStriped: '#fafafa',
};

export type PaletaGrisNeutro = typeof grisNeutro;

