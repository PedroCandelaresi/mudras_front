import { gql } from '@apollo/client';

export const AJUSTAR_STOCK = gql`
  mutation AjustarStock($input: AjustarStockInput!) {
    ajustarStock(input: $input)
  }
`;

export interface AjustarStockInput {
  puntoMudrasId: number;
  articuloId: number;
  nuevaCantidad: number;
  motivo: string;
}
