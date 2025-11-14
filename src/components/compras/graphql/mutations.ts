import { gql } from '@apollo/client';

export const CREAR_ORDEN_COMPRA = gql`
  mutation CrearOrdenCompra($input: CrearOrdenCompraDto!) {
    crearOrdenCompra(input: $input) {
      id
      proveedorId
      estado
      observaciones
    }
  }
`;

export const AGREGAR_DETALLE_OC = gql`
  mutation AgregarDetalleOrden($input: AgregarDetalleOcDto!) {
    agregarDetalleOrden(input: $input) {
      id
      ordenId
      articuloId
      cantidad
      precioUnitario
    }
  }
`;

export const ELIMINAR_DETALLE_OC = gql`
  mutation EliminarDetalleOrden($detalleId: Int!) {
    eliminarDetalleOrden(detalleId: $detalleId)
  }
`;

export const EMITIR_ORDEN_COMPRA = gql`
  mutation EmitirOrdenCompra($id: Int!) {
    emitirOrdenCompra(id: $id) {
      id
      estado
      fechaEmision
    }
  }
`;

export const RECEPCIONAR_ORDEN_COMPRA = gql`
  mutation RecepcionarOrdenCompra($input: RecepcionarOrdenDto!) {
    recepcionarOrdenCompra(input: $input) {
      id
      estado
      fechaRecepcion
    }
  }
`;

