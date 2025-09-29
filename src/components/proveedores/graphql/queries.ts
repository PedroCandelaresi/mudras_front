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
      Saldo
      Pais
      Fax
      FechaModif
    }
  }
`;

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
