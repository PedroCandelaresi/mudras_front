import { gql } from '@apollo/client';

export const CREAR_VENTA = gql`
  mutation CrearVenta($input: CrearVentaInput!) {
    crearVenta(input: $input) {
      id
      numeroVenta
      puntoVentaId
      total
      metodoPago
      fechaVenta
      items {
        articuloId
        cantidad
        precioUnitario
        subtotal
      }
    }
  }
`;

export const ACTUALIZAR_STOCK_VENTA = gql`
  mutation ActualizarStockVenta($items: [ItemVentaStockInput!]!, $puntoVentaId: Int!) {
    actualizarStockVenta(items: $items, puntoVentaId: $puntoVentaId) {
      success
      message
      stockActualizado {
        articuloId
        cantidadAnterior
        cantidadNueva
      }
    }
  }
`;

export interface CrearVentaInput {
  puntoVentaId: number;
  metodoPago: string;
  montoRecibido?: number;
  cambio?: number;
  items: Array<{
    articuloId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
}

export interface ItemVentaStockInput {
  articuloId: number;
  cantidad: number;
}

export interface CrearVentaResponse {
  crearVenta: {
    id: number;
    numeroVenta: string;
    puntoVentaId: number;
    total: number;
    metodoPago: string;
    fechaVenta: string;
    items: Array<{
      articuloId: number;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
  };
}

export interface ActualizarStockVentaResponse {
  actualizarStockVenta: {
    success: boolean;
    message: string;
    stockActualizado: Array<{
      articuloId: number;
      cantidadAnterior: number;
      cantidadNueva: number;
    }>;
  };
}
