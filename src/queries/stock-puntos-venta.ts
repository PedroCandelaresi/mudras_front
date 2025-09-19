import { gql } from '@apollo/client';

export const OBTENER_STOCK_PUNTO_MUDRAS = gql`
  query ObtenerStockPuntoMudras($puntoMudrasId: Int!) {
    obtenerStockPuntoMudras(puntoMudrasId: $puntoMudrasId) {
      id
      nombre
      codigo
      precio
      stockAsignado
      stockTotal
      rubro {
        id
        Descripcion
      }
    }
  }
`;

export const ACTUALIZAR_STOCK_PUNTO_MUDRAS = gql`
  mutation ActualizarStockPuntoMudras(
    $articuloId: Int!
    $stockGeneral: Int!
    $distribucionStock: [DistribucionStockInput!]!
  ) {
    actualizarStockPuntoMudras(
      articuloId: $articuloId
      stockGeneral: $stockGeneral
      distribucionStock: $distribucionStock
    ) {
      success
      message
    }
  }
`;

// Interfaces para tipado
export interface StockPuntoMudrasResponse {
  obtenerStockPuntoMudras: Array<{
    id: number;
    nombre: string;
    codigo: string;
    precio: number;
    stockAsignado: number;
    stockTotal: number;
    rubro: {
      id: number;
      Descripcion: string;
    };
  }>;
}

export interface DistribucionStockInput {
  puntoVentaId: number;
  cantidad: number;
}

export interface ActualizarStockResponse {
  actualizarStockPuntoMudras: {
    success: boolean;
    message: string;
  };
}
