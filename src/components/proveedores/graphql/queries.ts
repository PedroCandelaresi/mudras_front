import { gql } from '@apollo/client';

export const GET_PROVEEDORES = gql`
  query GetProveedores {
    proveedores {
      IdProveedor
      Codigo
      Nombre
      Contacto
      Direccion
      Localidad
      Provincia
      CP
      Telefono
      Celular
      TipoIva
      CUIT
      Observaciones
      Web
      Mail
      Rubro
      PorcentajeRecargoProveedor
      PorcentajeDescuentoProveedor
      Saldo
      Pais
      Fax
      FechaModif
    }
  }
`;

export interface ProveedorBasico {
  IdProveedor: number;
  Codigo?: number | null;
  Nombre?: string | null;
}

export interface GetProveedoresResponse {
  proveedores: ProveedorBasico[];
}

export const GET_PROVEEDOR = gql`
  query GetProveedor($id: Int!) {
    proveedor(id: $id) {
      IdProveedor
      Codigo
      Nombre
      Contacto
      Direccion
      Localidad
      Provincia
      CP
      Telefono
      Celular
      TipoIva
      CUIT
      Observaciones
      Web
      Mail
      Rubro
      PorcentajeRecargoProveedor
      PorcentajeDescuentoProveedor
      rubroId
      rubro {
        Id
        Rubro
        PorcentajeRecargo
        PorcentajeDescuento
      }
      Saldo
      Pais
      Fax
      FechaModif
      articulos {
        id
        Codigo
        Descripcion
        Deposito
        PrecioVenta
        Rubro
        StockMinimo
        EnPromocion
      }
    }
  }
`;

export const GET_ARTICULOS_POR_PROVEEDOR = gql`
  query GetArticulosPorProveedor($proveedorId: Int!, $filtro: String, $offset: Int, $limit: Int) {
    articulosPorProveedor(proveedorId: $proveedorId, filtro: $filtro, offset: $offset, limit: $limit) {
      articulos {
        Id
        Codigo
        Descripcion
        Deposito
        PrecioVenta
        Rubro
        StockMinimo
        EnPromocion
        stock
        precio
        rubro
      }
      total
    }
  }
`;

export const GET_RUBROS_POR_PROVEEDOR = gql`
  query GetRubrosPorProveedor($proveedorId: ID!) {
    obtenerRubrosPorProveedor(proveedorId: $proveedorId) {
      rubro
    }
  }
`;


export const RUBROS_POR_PROVEEDOR = gql`
  query RubrosPorProveedor($proveedorId: ID!) {
    rubrosPorProveedor(proveedorId: $proveedorId) {
      id
      rubroId
      rubroNombre
      cantidadArticulos
    }
  }
`;
