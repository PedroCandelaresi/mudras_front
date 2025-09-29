import { gql } from '@apollo/client';

export const GET_RUBROS = gql`
  query GetRubros {
    obtenerRubros {
      id
      nombre
      codigo
      porcentajeRecargo
      porcentajeDescuento
      cantidadArticulos
      cantidadProveedores
    }
  }
`;

export const BUSCAR_RUBROS = gql`
  query BuscarRubros($pagina: Int!, $limite: Int!, $busqueda: String) {
    buscarRubros(pagina: $pagina, limite: $limite, busqueda: $busqueda) {
      total
      rubros {
        id
        nombre
        codigo
        porcentajeRecargo
        porcentajeDescuento
        cantidadArticulos
        cantidadProveedores
      }
    }
  }
`;

export const GET_RUBRO = gql`
  query GetRubro($id: Int!) {
    rubro(id: $id) {
      Id
      Rubro
      Codigo
      PorcentajeRecargo
      PorcentajeDescuento
    }
  }
`;

export const GET_PROVEEDORES_POR_RUBRO = gql`
  query GetProveedoresPorRubro($rubroId: Int!) {
    proveedoresPorRubro(rubroId: $rubroId) {
      id
      nombre
      codigo
      email
      telefono
    }
  }
`;

export const GET_ARTICULOS_POR_RUBRO = gql`
  query GetArticulosPorRubro($rubroId: Int!, $filtro: String, $offset: Int, $limit: Int) {
    articulosPorRubro(rubroId: $rubroId, filtro: $filtro, offset: $offset, limit: $limit) {
      articulos {
        id
        codigo
        descripcion
        precio
        stock
        proveedor {
          id
          nombre
        }
      }
      total
    }
  }
`;
