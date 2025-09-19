import { gql } from '@apollo/client';

// Interfaces para Ventas
export interface ItemVenta {
  articuloId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CrearVentaInput {
  puntoVentaId: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'qr';
  montoRecibido?: number;
  cambio?: number;
  items: ItemVenta[];
}

export interface CrearMovimientoStockVentaInput {
  articuloId: number;
  puntoMudrasId: number;
  cantidad: number;
  referenciaExterna?: string;
  motivo?: string;
}

export interface ItemVentaStockInput {
  articuloId: number;
  cantidad: number;
}

export interface Venta {
  id: number;
  numeroVenta: string;
  puntoVentaId: number;
  total: number;
  metodoPago: string;
  montoRecibido?: number;
  cambio?: number;
  fechaVenta: string;
  items: ItemVenta[];
}

// Queries para Artículos
export const GET_ARTICULOS = gql`
  query GetArticulos {
    articulos {
      id
      Codigo
      Rubro
      Descripcion
      Marca
      PrecioVenta
      PrecioCompra
      Deposito
      StockMinimo
      EnPromocion
      proveedor {
        IdProveedor
        Nombre
      }
    }
  }
`;

// Promociones
export const GET_PROMOCIONES = gql`
  query GetPromociones {
    promociones {
      id
      nombre
      inicio
      fin
      estado
      descuento
    }
  }
`;

export const CREAR_PROMOCION = gql`
  mutation CrearPromocion($input: CrearPromocionInput!) {
    crearPromocion(input: $input) {
      id
      nombre
      inicio
      fin
      estado
      descuento
    }
  }
`;

export const ACTUALIZAR_PROMOCION = gql`
  mutation ActualizarPromocion($id: ID!, $input: ActualizarPromocionInput!) {
    actualizarPromocion(id: $id, input: $input) {
      id
      nombre
      inicio
      fin
      estado
      descuento
    }
  }
`;

export const ELIMINAR_PROMOCION = gql`
  mutation EliminarPromocion($id: ID!) {
    eliminarPromocion(id: $id)
  }
`;

export const BUSCAR_ARTICULOS = gql`
  query BuscarArticulos($filtros: FiltrosArticuloDto!) {
    buscarArticulos(filtros: $filtros) {
      total
      articulos {
        id
        Codigo
        Rubro
        Descripcion
        Marca
        PrecioVenta
        PrecioCompra
        Deposito
        StockMinimo
        EnPromocion
        Unidad
        proveedor {
          IdProveedor
          Nombre
        }
      }
    }
  }
`;

export const GET_ARTICULOS_CON_STOCK = gql`
  query GetArticulosConStock {
    articulosConStock {
      id
      Codigo
      Descripcion
      Deposito
      PrecioVenta
      Rubro
      proveedor {
        Nombre
      }
    }
  }
`;

export const GET_ARTICULOS_STOCK_BAJO = gql`
  query GetArticulosStockBajo {
    articulosStockBajo {
      id
      Codigo
      Descripcion
      Deposito
      StockMinimo
      Rubro
      proveedor {
        Nombre
      }
    }
  }
`;

export const GET_ARTICULOS_EN_PROMOCION = gql`
  query GetArticulosEnPromocion {
    articulosEnPromocion {
      id
      Codigo
      Descripcion
      PrecioVenta
      Deposito
      Rubro
    }
  }
`;

// Queries para Proveedores
export const GET_PROVEEDORES = gql`
  query GetProveedores {
    proveedores {
      IdProveedor
      Codigo
      Nombre
      Contacto
      Telefono
      Mail
      Localidad
      Provincia
      CUIT
      Saldo
    }
  }
`;

// Queries para Stock
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

// Queries para Rubros
export const GET_RUBROS = gql`
  query GetRubros {
    rubros {
      Id
      Rubro
      Codigo
    }
  }
`;

// Query para estadísticas del dashboard
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

// Queries para Puntos Mudras de Venta
export const GET_PUNTOS_VENTA = gql`
  query GetPuntosVenta {
    obtenerPuntosMudras(filtros: { tipo: "venta", activo: true }) {
      total
      puntos {
        id
        nombre
        tipo
        descripcion
        direccion
        activo
        permiteVentasOnline
      }
    }
  }
`;

// Mutations para Ventas
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

// Mutation para crear movimiento de stock de salida
export const CREAR_MOVIMIENTO_STOCK_VENTA = gql`
  mutation CrearMovimientoStockVenta($input: CrearMovimientoStockVentaInput!) {
    crearMovimientoStockVenta(input: $input) {
      id
      articuloId
      puntoMudrasId
      tipoMovimiento
      cantidad
      cantidadAnterior
      cantidadNueva
      referenciaExterna
      fechaMovimiento
    }
  }
`;

// Mutation para actualizar stock después de venta
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
