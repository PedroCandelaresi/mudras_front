import { gql } from '@apollo/client';

export const GET_ORDENES_COMPRA = gql`
  query OrdenesCompra($estado: String, $proveedorId: Int) {
    ordenesCompra(estado: $estado, proveedorId: $proveedorId) {
      id
      proveedorId
      estado
      observaciones
      creadoEn
      fechaEmision
      fechaRecepcion
      proveedor { IdProveedor Nombre }
    }
  }
`;

export interface OrdenCompraResumen {
  id: number;
  proveedorId?: number | null;
  estado?: string | null;
  observaciones?: string | null;
  creadoEn?: string | null;
  fechaEmision?: string | null;
  fechaRecepcion?: string | null;
  proveedor?: {
    IdProveedor: number;
    Nombre?: string | null;
  } | null;
}

export interface OrdenesCompraResponse {
  ordenesCompra: OrdenCompraResumen[];
}

export const GET_ORDEN_COMPRA = gql`
  query OrdenCompra($id: Int!) {
    ordenCompra(id: $id) {
      id
      proveedorId
      estado
      observaciones
      creadoEn
      fechaEmision
      fechaRecepcion
      proveedor { IdProveedor Nombre }
      detalles {
        id
        articuloId
        cantidad
        precioUnitario
        cantidadRecibida
        costoUnitarioRecepcion
      }
    }
  }
`;
