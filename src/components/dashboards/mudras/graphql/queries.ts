import { gql } from '@apollo/client';

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    articulos {
      id
      Deposito
      StockMinimo
      EnPromocion
    }
    proveedores {
      IdProveedor
    }
  }
`;

export interface DashboardStatsResponse {
  articulos: Array<{
    id: number;
    Deposito: number;
    StockMinimo: number;
    EnPromocion: boolean;
  }>;
  proveedores: Array<{ IdProveedor: number }>;
}
