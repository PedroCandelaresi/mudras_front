import { gql } from '@apollo/client';
import { ARTICULO_FRAGMENT } from './queries';

export const CREAR_ARTICULO = gql`
  ${ARTICULO_FRAGMENT}
  mutation CrearArticulo($crearArticuloDto: CrearArticuloDto!) {
    crearArticulo(crearArticuloDto: $crearArticuloDto) {
      ...ArticuloFragment
    }
  }
`;

export const ACTUALIZAR_ARTICULO = gql`
  ${ARTICULO_FRAGMENT}
  mutation ActualizarArticulo($actualizarArticuloDto: ActualizarArticuloDto!) {
    actualizarArticulo(actualizarArticuloDto: $actualizarArticuloDto) {
      ...ArticuloFragment
    }
  }
`;

export const ELIMINAR_ARTICULO = gql`
  mutation EliminarArticulo($id: Int!) {
    eliminarArticulo(id: $id)
  }
`;

export const ACTUALIZAR_STOCK_ARTICULO = gql`
  ${ARTICULO_FRAGMENT}
  mutation ActualizarStockArticulo($id: Int!, $nuevoStock: Float!) {
    actualizarStockArticulo(id: $id, nuevoStock: $nuevoStock) {
      ...ArticuloFragment
    }
  }
`;
