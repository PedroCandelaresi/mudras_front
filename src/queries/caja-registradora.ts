import { gql } from '@apollo/client';

// Queries
export const BUSCAR_ARTICULOS_CAJA = gql`
  query BuscarArticulosCaja($filtros: FiltrosArticuloDto!) {
    buscarArticulos(filtros: $filtros) {
      total
      articulos {
        id
        Codigo
        Descripcion
        PrecioVenta
        Deposito
        StockMinimo
        EnPromocion
        Unidad
        Rubro
        proveedor {
          IdProveedor
          Nombre
        }
      }
    }
  }
`;

export const OBTENER_PUESTOS_VENTA = gql`
  query ObtenerPuestosVenta {
    obtenerPuestosVenta {
      id
      nombre
      descripcion
      activo
      descontarStock
      permitirVentaSinStock
      requiereCliente
      emitirComprobanteAfip
      puntoVentaAfip
    }
  }
`;

export const OBTENER_HISTORIAL_VENTAS = gql`
  query ObtenerHistorialVentas($filtros: FiltrosHistorialInput!) {
    obtenerHistorialVentas(filtros: $filtros) {
      ventas {
        id
        numeroVenta
        fecha
        tipoVenta
        estado
        total
        cliente {
          id
          Nombre
          Apellido
        }
        usuario {
          id
          Nombre
        }
        puestoVenta {
          id
          nombre
        }
      }
      totalRegistros
      totalPaginas
      paginaActual
      resumen {
        totalVentas
        montoTotal
        ventasPorEstado {
          estado
          cantidad
          monto
        }
      }
    }
  }
`;

export const OBTENER_DETALLE_VENTA = gql`
  query ObtenerDetalleVenta($id: Int!) {
    obtenerDetalleVenta(id: $id) {
      id
      numeroVenta
      fecha
      tipoVenta
      estado
      subtotal
      descuentoPorcentaje
      descuentoMonto
      impuestos
      total
      cambio
      observaciones
      puestoVenta {
        id
        nombre
      }
      cliente {
        id
        Nombre
        Apellido
        Email
        Telefono
      }
      usuario {
        id
        Nombre
      }
      detalles {
        id
        cantidad
        precioUnitario
        descuentoPorcentaje
        descuentoMonto
        subtotal
        observaciones
        articulo {
          id
          Codigo
          Descripcion
          rubro {
            id
            Descripcion
          }
        }
      }
      pagos {
        id
        metodoPago
        monto
        referencia
        numeroTarjetaUltimos4
        tipoTarjeta
        numeroCuotas
        observaciones
      }
      comprobantesAfip {
        id
        tipoComprobante
        puntoVenta
        numeroComprobante
        estado
        cae
        fechaVencimientoCae
        fechaEmision
        importeTotal
        urlPdf
        mensajeError
      }
      ventaOriginal {
        id
        numeroVenta
      }
    }
  }
`;

// Mutations
export const CREAR_VENTA_CAJA = gql`
  mutation CrearVentaCaja($input: CrearVentaCajaInput!) {
    crearVentaCaja(input: $input) {
      id
      numeroVenta
      fecha
      tipoVenta
      estado
      total
      observaciones
    }
  }
`;

export const CANCELAR_VENTA_CAJA = gql`
  mutation CancelarVentaCaja($id: Int!, $motivo: String) {
    cancelarVentaCaja(id: $id, motivo: $motivo) {
      id
      numeroVenta
      estado
      observaciones
    }
  }
`;

export const PROCESAR_DEVOLUCION = gql`
  mutation ProcesarDevolucion($ventaOriginalId: Int!, $articulosDevolver: String!, $motivo: String) {
    procesarDevolucion(ventaOriginalId: $ventaOriginalId, articulosDevolver: $articulosDevolver, motivo: $motivo) {
      id
      numeroVenta
      fecha
      estado
      total
      observaciones
      ventaOriginal {
        id
        numeroVenta
      }
    }
  }
`;

export const REINTENTAR_EMISION_AFIP = gql`
  mutation ReintentarEmisionAfip($comprobanteId: Int!) {
    reintentarEmisionAfip(comprobanteId: $comprobanteId) {
      id
      estado
      cae
      mensajeError
      intentosEmision
    }
  }
`;

// Types para TypeScript
export interface ArticuloConStock {
  id: number;
  Codigo: string;
  Descripcion: string;
  PrecioVenta: number;
  Deposito: number;
  StockMinimo: number;
  EnPromocion: boolean;
  stockDisponible: number;
  stockDespuesVenta: number;
  alertaStock: boolean;
  rubro: {
    id: number;
    Descripcion: string;
  };
}

export interface PuestoVenta {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  descontarStock: boolean;
  permitirVentaSinStock: boolean;
  requiereCliente: boolean;
  emitirComprobanteAfip: boolean;
  puntoVentaAfip?: number;
}

export interface VentaCaja {
  id: number;
  numeroVenta: string;
  fecha: string;
  tipoVenta: 'MOSTRADOR' | 'DELIVERY' | 'ONLINE' | 'TELEFONICA';
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'DEVUELTA' | 'DEVUELTA_PARCIAL';
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  impuestos: number;
  total: number;
  cambio: number;
  observaciones?: string;
  puestoVenta: PuestoVenta;
  cliente?: {
    id: number;
    Nombre: string;
    Apellido: string;
    Email?: string;
    Telefono?: string;
  };
  usuario: {
    id: number;
    Nombre: string;
  };
  detalles?: DetalleVentaCaja[];
  pagos?: PagoCaja[];
  comprobantesAfip?: ComprobanteAfip[];
  ventaOriginal?: {
    id: number;
    numeroVenta: string;
  };
}

export interface DetalleVentaCaja {
  id: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  subtotal: number;
  observaciones?: string;
  articulo: {
    id: number;
    Codigo: string;
    Descripcion: string;
    rubro: {
      id: number;
      Descripcion: string;
    };
  };
}

export interface PagoCaja {
  id: number;
  metodoPago: 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'CHEQUE' | 'CUENTA_CORRIENTE' | 'OTRO';
  monto: number;
  referencia?: string;
  numeroTarjetaUltimos4?: string;
  tipoTarjeta?: string;
  numeroCuotas?: number;
  observaciones?: string;
}

export interface ComprobanteAfip {
  id: number;
  tipoComprobante: string;
  puntoVenta: number;
  numeroComprobante?: number;
  estado: 'PENDIENTE' | 'AUTORIZADO' | 'RECHAZADO' | 'ERROR';
  cae?: string;
  fechaVencimientoCae?: string;
  fechaEmision?: string;
  importeTotal: number;
  urlPdf?: string;
  mensajeError?: string;
}

export interface FiltrosArticuloDto {
  busqueda?: string;
  codigo?: string;
  descripcion?: string;
  proveedorId?: number;
  soloConStock?: boolean;
  soloStockBajo?: boolean;
  soloSinStock?: boolean;
  soloEnPromocion?: boolean;
  pagina?: number;
  limite?: number;
  ordenarPor?: string;
  direccionOrden?: 'ASC' | 'DESC';
}

export interface CrearVentaCajaInput {
  tipoVenta: 'MOSTRADOR' | 'DELIVERY' | 'ONLINE' | 'TELEFONICA';
  puestoVentaId: number;
  clienteId?: number;
  observaciones?: string;
  detalles: {
    articuloId: number;
    cantidad: number;
    precioUnitario: number;
    descuentoPorcentaje?: number;
    observaciones?: string;
  }[];
  pagos: {
    metodoPago: 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'CHEQUE' | 'CUENTA_CORRIENTE' | 'OTRO';
    monto: number;
    referencia?: string;
    numeroTarjetaUltimos4?: string;
    tipoTarjeta?: string;
    numeroCuotas?: number;
    observaciones?: string;
  }[];
}

export interface FiltrosHistorialInput {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'DEVUELTA' | 'DEVUELTA_PARCIAL';
  puestoVentaId?: number;
  clienteId?: number;
  usuarioId?: number;
  numeroVenta?: string;
  pagina?: number;
  limite?: number;
}

export interface HistorialVentasResponse {
  obtenerHistorialVentas: {
    ventas: VentaCaja[];
    totalRegistros: number;
    totalPaginas: number;
    paginaActual: number;
    resumen: {
      totalVentas: number;
      montoTotal: number;
      ventasPorEstado: {
        estado: string;
        cantidad: number;
        monto: number;
      }[];
    };
  };
}

export interface DetalleVentaResponse {
  obtenerDetalleVenta: VentaCaja;
}

export interface PuestosVentaResponse {
  obtenerPuestosVenta: PuestoVenta[];
}

export interface CrearVentaCajaResponse {
  crearVentaCaja: VentaCaja;
}

export interface ArticuloCaja {
  id: number;
  Codigo: string;
  Descripcion: string;
  PrecioVenta: number;
  Deposito: string;
  StockMinimo: number;
  EnPromocion: boolean;
  Unidad: string;
  Rubro: string;
  proveedor: {
    IdProveedor: number;
    Nombre: string;
  };
}

export interface BuscarArticulosCajaResponse {
  buscarArticulos: {
    total: number;
    articulos: ArticuloCaja[];
  };
}

export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'CHEQUE' | 'CUENTA_CORRIENTE' | 'OTRO';

export interface PagoVenta {
  metodoPago: MetodoPago;
  monto: number;
  referencia?: string;
  numeroTarjetaUltimos4?: string;
  tipoTarjeta?: string;
  numeroCuotas?: number;
  observaciones?: string;
}
