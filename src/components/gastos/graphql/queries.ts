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

export const GET_CATEGORIAS_GASTO = gql`
  query CategoriasGasto {
    categoriasGasto { id nombre descripcion }
  }
`;

