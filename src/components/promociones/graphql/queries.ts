import { gql } from '@apollo/client';

export const GET_PROMOCIONES = gql`
  query GetPromociones {
    promociones {
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
