import { gql } from '@apollo/client';

export const CREAR_GASTO = gql`
  mutation CrearGasto($input: CrearGastoDto!) {
    crearGasto(input: $input) {
      id
      fecha
      total
    }
  }
`;

export const ACTUALIZAR_GASTO = gql`
  mutation ActualizarGasto($input: ActualizarGastoDto!) {
    actualizarGasto(input: $input) {
      id
      total
    }
  }
`;

export const ELIMINAR_GASTO = gql`
  mutation EliminarGasto($id: Int!) { eliminarGasto(id: $id) }
`;

export const CREAR_CATEGORIA_GASTO = gql`
  mutation CrearCategoriaGasto($input: CrearCategoriaGastoDto!) {
    crearCategoriaGasto(input: $input) { id nombre }
  }
`;

