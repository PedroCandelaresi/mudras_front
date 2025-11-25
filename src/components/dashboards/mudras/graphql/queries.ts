import { gql } from '@apollo/client';

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    articulos {
      id
      totalStock
      Rubro
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
    totalStock?: number;
    Rubro?: string;
    StockMinimo?: number;
    EnPromocion?: boolean;
  }>;
  proveedores: Array<{ IdProveedor: number }>;
}
