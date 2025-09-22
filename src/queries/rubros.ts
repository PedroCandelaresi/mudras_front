import { gql } from '@apollo/client';

export const BUSCAR_RUBROS = gql`
  query BuscarRubros($filtro: String, $offset: Int, $limit: Int) {
    buscarRubros(filtro: $filtro, offset: $offset, limit: $limit) {
      rubros {
        Id
        Rubro
        Codigo
        PorcentajeRecargo
        PorcentajeDescuento
        cantidadArticulos
        cantidadProveedores
      }
      total
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

export const GET_RUBRO_DETALLES = gql`
  query GetRubroDetalles($id: Int!) {
    rubro(id: $id) {
      Id
      Rubro
      Codigo
      PorcentajeRecargo
      PorcentajeDescuento
      cantidadArticulos
      cantidadProveedores
    }
  }
`;

export const ACTUALIZAR_RUBRO = gql`
  mutation ActualizarRubro($id: Int!, $nombre: String!, $codigo: String, $porcentajeRecargo: Float, $porcentajeDescuento: Float) {
    actualizarRubro(id: $id, nombre: $nombre, codigo: $codigo, porcentajeRecargo: $porcentajeRecargo, porcentajeDescuento: $porcentajeDescuento) {
      Id
      Rubro
      Codigo
      PorcentajeRecargo
      PorcentajeDescuento
    }
  }
`;

export const CREAR_RUBRO = gql`
  mutation CrearRubro($nombre: String!, $codigo: String, $porcentajeRecargo: Float, $porcentajeDescuento: Float) {
    crearRubro(nombre: $nombre, codigo: $codigo, porcentajeRecargo: $porcentajeRecargo, porcentajeDescuento: $porcentajeDescuento) {
      Id
      Rubro
      Codigo
      PorcentajeRecargo
      PorcentajeDescuento
    }
  }
`;

export const ELIMINAR_RUBRO = gql`
  mutation EliminarRubro($id: Int!) {
    eliminarRubro(id: $id)
  }
`;

export const ELIMINAR_PROVEEDOR_DE_RUBRO = gql`
  mutation EliminarProveedorDeRubro($proveedorId: Int!, $rubroNombre: String!) {
    eliminarProveedorDeRubro(proveedorId: $proveedorId, rubroNombre: $rubroNombre)
  }
`;

export const ELIMINAR_ARTICULO_DE_RUBRO = gql`
  mutation EliminarArticuloDeRubro($articuloId: Int!) {
    eliminarArticuloDeRubro(articuloId: $articuloId)
  }
`;

export const ELIMINAR_ARTICULOS_DE_RUBRO = gql`
  mutation EliminarArticulosDeRubro($articuloIds: [Int!]!) {
    eliminarArticulosDeRubro(articuloIds: $articuloIds)
  }
`;
