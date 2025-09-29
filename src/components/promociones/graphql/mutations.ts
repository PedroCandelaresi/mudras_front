import { gql } from '@apollo/client';

export const CREAR_PROMOCION = gql`
  mutation CrearPromocion($input: CrearPromocionInput!) {
    crearPromocion(input: $input) {
      id
      nombre
      inicio
      fin
      estado
      descuento
      createdAt
      updatedAt
    }
  }
`;

export const ACTUALIZAR_PROMOCION = gql`
  mutation ActualizarPromocion($id: ID!, $input: ActualizarPromocionInput!) {
    actualizarPromocion(id: $id, input: $input) {
      id
      nombre
      inicio
      fin
      estado
      descuento
      createdAt
      updatedAt
    }
  }
`;

export const ELIMINAR_PROMOCION = gql`
  mutation EliminarPromocion($id: ID!) {
    eliminarPromocion(id: $id)
  }
`;
