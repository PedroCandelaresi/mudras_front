// Utilidades de unidades de medida para Mudras
// Mantener Spanish-first y tipos explícitos

export type UnidadMedida =
  | 'unidad'
  | 'gramo'
  | 'kilogramo'
  | 'mililitro'
  | 'litro'
  | 'centimetro'
  | 'metro';

export interface DefinicionUnidad {
  clave: UnidadMedida;
  etiqueta: string;
  abreviatura: string;
  factorBase?: number; // Para conversión a unidad base (ej. gramo->kilogramo)
}

export const UNIDADES: Readonly<DefinicionUnidad[]> = [
  { clave: 'unidad', etiqueta: 'Unidad', abreviatura: 'u' },
  { clave: 'gramo', etiqueta: 'Gramo', abreviatura: 'g', factorBase: 1 },
  { clave: 'kilogramo', etiqueta: 'Kilogramo', abreviatura: 'kg', factorBase: 1000 },
  { clave: 'mililitro', etiqueta: 'Mililitro', abreviatura: 'ml', factorBase: 1 },
  { clave: 'litro', etiqueta: 'Litro', abreviatura: 'l', factorBase: 1000 },
  { clave: 'centimetro', etiqueta: 'Centímetro', abreviatura: 'cm' },
  { clave: 'metro', etiqueta: 'Metro', abreviatura: 'm' },
] as const;

export const UNIDADES_POR_DEFECTO_POR_RUBRO: Record<string, UnidadMedida> = {
  cristales: 'gramo',
  inciensos: 'unidad',
  aceites: 'mililitro',
  velas: 'unidad',
  joyeria: 'unidad',
};

export function etiquetaUnidad(unidad: UnidadMedida | undefined): string {
  const u = UNIDADES.find((x) => x.clave === unidad);
  return u ? u.etiqueta : '';
}

export function abrevUnidad(unidad: UnidadMedida | undefined): string {
  const u = UNIDADES.find((x) => x.clave === unidad);
  return u ? u.abreviatura : '';
}

export function formatearCantidad(valor: number | undefined, unidad: UnidadMedida | undefined): string {
  if (valor == null || Number.isNaN(valor)) return '';
  const abrev = abrevUnidad(unidad);
  return abrev ? `${valor} ${abrev}` : String(valor);
}

export function formatearPrecioPorUnidad(precio: number | undefined, unidad: UnidadMedida | undefined): string {
  if (precio == null || Number.isNaN(precio)) return '';
  const abrev = abrevUnidad(unidad);
  return abrev ? `$ ${precio} / ${abrev}` : `$ ${precio}`;
}
