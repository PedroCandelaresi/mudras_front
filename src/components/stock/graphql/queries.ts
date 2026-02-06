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
        nombre
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

export const CREAR_ASIGNACION_STOCK = gql`
  mutation CrearAsignacionStock($input: CrearAsignacionStockInput!) {
    crearAsignacionStock(input: $input) {
      id
      articuloId
      puntoVentaId
      cantidadAsignada
      stockMinimo
      stockMaximo
      precioVenta
      tipoAjuste
      porcentajeAjuste
      observaciones
      fechaCreacion
    }
  }
`;

export const DESAFECTAR_STOCK = gql`
  mutation DesafectarStock(
    $articuloId: Int!
    $puntoVentaId: Int!
    $cantidad: Int!
  ) {
    desafectarStock(
      articuloId: $articuloId
      puntoVentaId: $puntoVentaId
      cantidad: $cantidad
    ) {
      success
      message
      stockDisponible
    }
  }
`;

export const REASIGNAR_STOCK = gql`
  mutation ReasignarStock(
    $articuloId: Int!
    $puntoVentaOrigen: Int!
    $puntoVentaDestino: Int!
    $cantidad: Int!
  ) {
    reasignarStock(
      articuloId: $articuloId
      puntoVentaOrigen: $puntoVentaOrigen
      puntoVentaDestino: $puntoVentaDestino
      cantidad: $cantidad
    ) {
      success
      message
    }
  }
`;

export const BUSCAR_ARTICULOS_PARA_ASIGNACION = gql`
  query BuscarArticulosParaAsignacion($busqueda: String, $proveedorId: Int, $rubro: String) {
    buscarArticulosParaAsignacion(busqueda: $busqueda, proveedorId: $proveedorId, rubro: $rubro) {
      id
      nombre
      codigo
      precio
      stockTotal
      stockAsignado
      stockDisponible
      stockEnDestino
      rubro
      proveedor
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
    rubro?: {
      id: number;
      nombre: string;
    } | null;
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

export interface CrearAsignacionStockInput {
  articuloId: number;
  puntoVentaId: number;
  tipoAsignacion: 'cantidad' | 'porcentaje';
  cantidad?: number;
  porcentaje?: number;
  stockMinimo: number;
  stockMaximo?: number;
  precioPersonalizado: boolean;
  precioVenta?: number;
  tipoAjuste: 'ninguno' | 'descuento' | 'recargo';
  porcentajeAjuste?: number;
  observaciones?: string;
}

export interface AsignacionStock {
  id: number;
  articuloId: number;
  puntoVentaId: number;
  cantidadAsignada: number;
  stockMinimo: number;
  stockMaximo?: number;
  precioVenta?: number;
  tipoAjuste: 'ninguno' | 'descuento' | 'recargo';
  porcentajeAjuste?: number;
  observaciones?: string;
  fechaCreacion: string;
}

export interface CrearAsignacionResponse {
  crearAsignacionStock: AsignacionStock;
}

export interface DesafectarStockResponse {
  desafectarStock: {
    success: boolean;
    message: string;
    stockDisponible: number;
  };
}

export interface ReasignarStockResponse {
  reasignarStock: {
    success: boolean;
    message: string;
  };
}

export interface ArticuloFiltrado {
  id: string; // The backend defines ID! which is usually string
  nombre: string;
  codigo: string;
  precio: number;
  stockTotal: number;
  stockAsignado: number;
  stockDisponible: number;
  stockEnDestino: number;
  rubro: string;
  proveedor: string;
}

export interface BuscarArticulosParaAsignacionResponse {
  buscarArticulosParaAsignacion: ArticuloFiltrado[];
}


