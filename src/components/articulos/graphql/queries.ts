import { gql } from '@apollo/client';

export const ARTICULO_FRAGMENT = gql`
  fragment ArticuloFragment on Articulo {
    id
    Codigo
    Rubro
    Descripcion
    Marca
    PrecioVenta
    PrecioCompra
    StockMinimo
    totalStock
    AlicuotaIva
    Deposito
    FechaCompra
    idProveedor
    Lista2
    Lista3
    Unidad
    Lista4
    PorcentajeGanancia
    Calculado
    CodigoProv
    CostoPromedio
    CostoEnDolares
    FechaModif
    PrecioListaProveedor
    StockInicial
    Ubicacion
    Lista1EnDolares
    Dto1
    Dto2
    Dto3
    Impuesto
    EnPromocion
    UsaTalle
    Compuesto
    Combustible
    ImpuestoPorcentual
    proveedor {
      IdProveedor
      Nombre
      PorcentajeRecargoProveedor
      PorcentajeDescuentoProveedor
    }
    rubro {
      Id
      Rubro
      PorcentajeRecargo
      PorcentajeDescuento
    }
  }
`;

export const GET_ARTICULOS = gql`
  ${ARTICULO_FRAGMENT}
  query GetArticulos {
    articulos {
      ...ArticuloFragment
    }
  }
`;

export const GET_ARTICULO = gql`
  ${ARTICULO_FRAGMENT}
  query GetArticulo($id: Int!) {
    articulo(id: $id) {
      ...ArticuloFragment
    }
  }
`;

export const BUSCAR_ARTICULOS = gql`
  ${ARTICULO_FRAGMENT}
  query BuscarArticulos($filtros: FiltrosArticuloDto!) {
    buscarArticulos(filtros: $filtros) {
      articulos {
        ...ArticuloFragment
      }
      total
    }
  }
`;

export const GET_ESTADISTICAS_ARTICULOS = gql`
  query GetEstadisticasArticulos {
    estadisticasArticulos {
      totalArticulos
      articulosActivos
      articulosConStock
      articulosSinStock
      articulosStockBajo
      articulosEnPromocion
      articulosPublicadosEnTienda
      valorTotalStock
    }
  }
`;

export const GET_ARTICULO_POR_CODIGO_BARRAS = gql`
  ${ARTICULO_FRAGMENT}
  query GetArticuloPorCodigoBarras($codigoBarras: String!) {
    articuloPorCodigoBarras(codigoBarras: $codigoBarras) {
      ...ArticuloFragment
    }
  }
`;

export const GET_ARTICULOS_STOCK_BAJO = gql`
  ${ARTICULO_FRAGMENT}
  query GetArticulosStockBajo {
    articulosStockBajo {
      ...ArticuloFragment
    }
  }
`;

export const GET_ARTICULOS_EN_PROMOCION = gql`
  ${ARTICULO_FRAGMENT}
  query GetArticulosEnPromocion {
    articulosEnPromocion {
      ...ArticuloFragment
    }
  }
`;

export const GET_MOVIMIENTOS_STOCK = gql`
  query GetMovimientosStock {
    movimientosStock {
      Id
      Fecha
      Codigo
      Stock
      StockAnterior
      Usuario
    }
  }
`;
