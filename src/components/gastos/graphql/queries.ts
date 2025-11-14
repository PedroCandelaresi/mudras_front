import { gql } from '@apollo/client';

export const GET_GASTOS = gql`
  query Gastos($desde: String, $hasta: String, $categoriaId: Int, $proveedorId: Int) {
    gastos(desde: $desde, hasta: $hasta, categoriaId: $categoriaId, proveedorId: $proveedorId) {
      id
      fecha
      montoNeto
      alicuotaIva
      montoIva
      total
      descripcion
      proveedor { IdProveedor Nombre }
      categoria { id nombre }
    }
  }
`;

export interface GastoItem {
  id: number;
  fecha?: string | null;
  montoNeto?: number | null;
  alicuotaIva?: number | null;
  montoIva?: number | null;
  total?: number | null;
  descripcion?: string | null;
  proveedor?: {
    IdProveedor: number;
    Nombre?: string | null;
  } | null;
  categoria?: {
    id: number;
    nombre?: string | null;
  } | null;
}

export interface GastosResponse {
  gastos: GastoItem[];
}

export const GET_CATEGORIAS_GASTO = gql`
  query CategoriasGasto {
    categoriasGasto { id nombre descripcion }
  }
`;
