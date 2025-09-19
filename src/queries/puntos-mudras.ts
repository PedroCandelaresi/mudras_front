import { gql } from '@apollo/client';

// Interfaces TypeScript
export interface PuntoMudras {
  id: number;
  nombre: string;
  tipo: 'venta' | 'deposito';
  descripcion: string;
  direccion: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  permiteVentasOnline: boolean;
  manejaStockFisico: boolean;
  requiereAutorizacion: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface StockPuntoMudras {
  id: number;
  puntoMudrasId: number;
  articuloId: number;
  cantidad: number;
  stockMinimo: number;
  stockMaximo?: number;
  fechaActualizacion: string;
  articulo: {
    id: number;
    Codigo: string;
    Descripcion: string;
    Rubro: string;
    PrecioVenta: number;
  };
}

export interface MovimientoStockPunto {
  id: number;
  puntoMudrasOrigenId?: number;
  puntoMudrasDestinoId?: number;
  articuloId: number;
  tipoMovimiento: 'entrada' | 'salida' | 'transferencia' | 'ajuste' | 'venta' | 'devolucion';
  cantidad: number;
  cantidadAnterior?: number;
  cantidadNueva?: number;
  motivo?: string;
  referenciaExterna?: string;
  usuarioId?: number;
  fechaMovimiento: string;
  articulo: {
    Codigo: string;
    Descripcion: string;
  };
  puntoOrigen?: {
    nombre: string;
  };
  puntoDestino?: {
    nombre: string;
  };
}

export interface FiltrosPuntosMudras {
  tipo?: 'venta' | 'deposito';
  activo?: boolean;
  busqueda?: string;
  limite?: number;
  offset?: number;
}

export interface CrearPuntoMudrasInput {
  nombre: string;
  tipo: 'venta' | 'deposito';
  descripcion: string;
  direccion: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  permiteVentasOnline?: boolean;
  manejaStockFisico?: boolean;
  requiereAutorizacion?: boolean;
}

export interface ActualizarPuntoMudrasInput {
  id: number;
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  permiteVentasOnline?: boolean;
  manejaStockFisico?: boolean;
  requiereAutorizacion?: boolean;
}

export interface TransferirStockInput {
  puntoOrigenId: number;
  puntoDestinoId: number;
  articuloId: number;
  cantidad: number;
  motivo?: string;
}

// Queries GraphQL
export const OBTENER_PUNTOS_MUDRAS = gql`
  query ObtenerPuntosMudras($filtros: FiltrosPuntosMudrasInput) {
    obtenerPuntosMudras(filtros: $filtros) {
      total
      puntos {
        id
        nombre
        tipo
        descripcion
        direccion
        telefono
        email
        activo
        permiteVentasOnline
        manejaStockFisico
        requiereAutorizacion
        fechaCreacion
        fechaActualizacion
      }
    }
  }
`;

export const OBTENER_PUNTO_MUDRAS_POR_ID = gql`
  query ObtenerPuntoMudrasPorId($id: Int!) {
    obtenerPuntoMudrasPorId(id: $id) {
      id
      nombre
      tipo
      descripcion
      direccion
      telefono
      email
      activo
      permiteVentasOnline
      manejaStockFisico
      requiereAutorizacion
      fechaCreacion
      fechaActualizacion
    }
  }
`;

export const OBTENER_STOCK_PUNTO_MUDRAS = gql`
  query ObtenerStockPuntoMudras($puntoMudrasId: Int!, $filtros: FiltrosStockInput) {
    obtenerStockPuntoMudras(puntoMudrasId: $puntoMudrasId, filtros: $filtros) {
      total
      stock {
        id
        puntoMudrasId
        articuloId
        cantidad
        stockMinimo
        stockMaximo
        fechaActualizacion
        articulo {
          id
          Codigo
          Descripcion
          Rubro
          PrecioVenta
        }
      }
    }
  }
`;

export const OBTENER_MOVIMIENTOS_STOCK_PUNTO = gql`
  query ObtenerMovimientosStockPunto($puntoMudrasId: Int, $filtros: FiltrosMovimientosInput) {
    obtenerMovimientosStockPunto(puntoMudrasId: $puntoMudrasId, filtros: $filtros) {
      total
      movimientos {
        id
        puntoMudrasOrigenId
        puntoMudrasDestinoId
        articuloId
        tipoMovimiento
        cantidad
        cantidadAnterior
        cantidadNueva
        motivo
        referenciaExterna
        usuarioId
        fechaMovimiento
        articulo {
          Codigo
          Descripcion
        }
        puntoOrigen {
          nombre
        }
        puntoDestino {
          nombre
        }
      }
    }
  }
`;

export const OBTENER_ESTADISTICAS_PUNTOS_MUDRAS = gql`
  query ObtenerEstadisticasPuntosMudras {
    obtenerEstadisticasPuntosMudras {
      totalPuntos
      puntosVenta
      depositos
      puntosActivos
      articulosConStock
      valorTotalInventario
      movimientosHoy
    }
  }
`;

// Mutations
export const CREAR_PUNTO_MUDRAS = gql`
  mutation CrearPuntoMudras($input: CrearPuntoMudrasInput!) {
    crearPuntoMudras(input: $input) {
      id
      nombre
      tipo
      descripcion
      direccion
      telefono
      email
      activo
      permiteVentasOnline
      manejaStockFisico
      requiereAutorizacion
      fechaCreacion
      fechaActualizacion
    }
  }
`;

export const ACTUALIZAR_PUNTO_MUDRAS = gql`
  mutation ActualizarPuntoMudras($input: ActualizarPuntoMudrasInput!) {
    actualizarPuntoMudras(input: $input) {
      id
      nombre
      tipo
      descripcion
      direccion
      telefono
      email
      activo
      permiteVentasOnline
      manejaStockFisico
      requiereAutorizacion
      fechaActualizacion
    }
  }
`;

export const ELIMINAR_PUNTO_MUDRAS = gql`
  mutation EliminarPuntoMudras($id: Int!) {
    eliminarPuntoMudras(id: $id)
  }
`;

export const TRANSFERIR_STOCK_ENTRE_PUNTOS = gql`
  mutation TransferirStockEntrePuntos($input: TransferirStockInput!) {
    transferirStockEntrePuntos(input: $input) {
      id
      puntoMudrasOrigenId
      puntoMudrasDestinoId
      articuloId
      tipoMovimiento
      cantidad
      motivo
      fechaMovimiento
    }
  }
`;

export const AJUSTAR_STOCK_PUNTO = gql`
  mutation AjustarStockPunto($puntoMudrasId: Int!, $articuloId: Int!, $nuevaCantidad: Float!, $motivo: String) {
    ajustarStockPunto(
      puntoMudrasId: $puntoMudrasId
      articuloId: $articuloId
      nuevaCantidad: $nuevaCantidad
      motivo: $motivo
    ) {
      id
      puntoMudrasId
      articuloId
      cantidad
      fechaActualizacion
    }
  }
`;

export const INICIALIZAR_STOCK_PUNTO = gql`
  mutation InicializarStockPunto($puntoMudrasId: Int!) {
    inicializarStockPunto(puntoMudrasId: $puntoMudrasId) {
      mensaje
      articulosInicializados
    }
  }
`;

// Responses para TypeScript
export interface ObtenerPuntosMudrasResponse {
  obtenerPuntosMudras: {
    total: number;
    puntos: PuntoMudras[];
  };
}

export interface ObtenerPuntoMudrasPorIdResponse {
  obtenerPuntoMudrasPorId: PuntoMudras;
}

export interface ObtenerStockPuntoMudrasResponse {
  obtenerStockPuntoMudras: {
    total: number;
    stock: StockPuntoMudras[];
  };
}

export interface ObtenerMovimientosStockPuntoResponse {
  obtenerMovimientosStockPunto: {
    total: number;
    movimientos: MovimientoStockPunto[];
  };
}

export interface ObtenerEstadisticasPuntosMudrasResponse {
  obtenerEstadisticasPuntosMudras: {
    totalPuntos: number;
    puntosVenta: number;
    depositos: number;
    puntosActivos: number;
    articulosConStock: number;
    valorTotalInventario: number;
    movimientosHoy: number;
  };
}

export interface CrearPuntoMudrasResponse {
  crearPuntoMudras: PuntoMudras;
}

export interface ActualizarPuntoMudrasResponse {
  actualizarPuntoMudras: PuntoMudras;
}

export interface TransferirStockEntrePuntosResponse {
  transferirStockEntrePuntos: MovimientoStockPunto;
}
