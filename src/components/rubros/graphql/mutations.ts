import { gql } from '@apollo/client';

export const CREAR_RUBRO = gql`
  mutation CrearRubro(
    $nombre: String!
    $codigo: String
    $porcentajeRecargo: Float
    $porcentajeDescuento: Float
  ) {
    crearRubro(
      nombre: $nombre
      codigo: $codigo
      porcentajeRecargo: $porcentajeRecargo
      porcentajeDescuento: $porcentajeDescuento
    ) {
      Id
      Rubro
      Codigo
      PorcentajeRecargo
      PorcentajeDescuento
    }
  }
`;

export const ACTUALIZAR_RUBRO = gql`
  mutation ActualizarRubro(
    $id: Int!
    $nombre: String!
    $codigo: String
    $porcentajeRecargo: Float
    $porcentajeDescuento: Float
  ) {
    actualizarRubro(
      id: $id
      nombre: $nombre
      codigo: $codigo
      porcentajeRecargo: $porcentajeRecargo
      porcentajeDescuento: $porcentajeDescuento
    ) {
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
