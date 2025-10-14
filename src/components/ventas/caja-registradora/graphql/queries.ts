import { gql } from '@apollo/client';

export const BUSCAR_ARTICULOS_CAJA = gql`
  query BuscarArticulosCaja($input: BuscarArticuloInput!) {
    buscarArticulosCaja(input: $input) {
      id
      Codigo
      Descripcion
      PrecioVenta
      Deposito
      StockMinimo
      EnPromocion
      Unidad
      Rubro
      rubro {
        Id
        Rubro
      }
      stockDisponible
      stockDespuesVenta
      alertaStock
      proveedor {
        IdProveedor
        Nombre
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
      configuracion
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
            Id
            Rubro
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

export const OBTENER_COMPROBANTES_AFIP = gql`
  query ObtenerComprobantesAfip($ventaId: Int!) {
    obtenerComprobantesAfip(ventaId: $ventaId) {
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
  }
`;

export const OBTENER_COMPROBANTES_PENDIENTES = gql`
  query ObtenerComprobantesPendientes {
    obtenerComprobantesPendientes {
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
  }
`;

export interface ArticuloCaja {
  id: number;
  Codigo: string;
  Descripcion: string;
  PrecioVenta: number;
  Deposito: number;
  StockMinimo: number;
  EnPromocion: boolean;
  Unidad: string;
  Rubro: string;
  rubro?: {
    Id: number;
    Rubro: string;
  } | null;
  stockDisponible: number;
  stockDespuesVenta: number;
  alertaStock: boolean;
  proveedor?: {
    IdProveedor: number;
    Nombre: string;
  } | null;
}

export interface BuscarArticulosCajaResponse {
  buscarArticulosCaja: ArticuloCaja[];
}

export interface PuestoVenta {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  descontarStock: boolean;
  permitirVentaSinStock: boolean;
  requiereCliente: boolean;
  emitirComprobanteAfip: boolean;
  puntoVentaAfip?: number | null;
  configuracion?: string | null;
}

export const OBTENER_CLIENTES_VENTA = gql`
  query ObtenerClientesVenta {
    clientes {
      id
      nombre
      apellido
      razonSocial
    }
  }
`;

export interface ClienteVenta {
  id: number;
  nombre?: string | null;
  apellido?: string | null;
  razonSocial?: string | null;
}

export interface ClientesVentaResponse {
  clientes: ClienteVenta[];
}

export interface VentaCajaResumen {
  id: number;
  numeroVenta: string;
  fecha: string;
  tipoVenta: string;
  estado: string;
  total: number;
  cliente?: {
    id: number;
    Nombre: string;
    Apellido: string;
  } | null;
  usuario: {
    id: number;
    Nombre: string;
  };
  puestoVenta: {
    id: number;
    nombre: string;
  };
}

export interface HistorialVentasResponse {
  obtenerHistorialVentas: {
    ventas: VentaCajaResumen[];
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
  obtenerDetalleVenta: any;
}

export interface ComprobanteAfip {
  id: number;
  tipoComprobante: string;
  puntoVenta: number;
  numeroComprobante?: number | null;
  estado: string;
  cae?: string | null;
  fechaVencimientoCae?: string | null;
  fechaEmision?: string | null;
  importeTotal: number;
  urlPdf?: string | null;
  mensajeError?: string | null;
}

export interface ObtenerComprobantesAfipResponse {
  obtenerComprobantesAfip: ComprobanteAfip[];
}

export interface ObtenerComprobantesPendientesResponse {
  obtenerComprobantesPendientes: ComprobanteAfip[];
}

export interface FiltrosHistorialInput {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  puestoVentaId?: number;
  clienteId?: number;
  usuarioId?: number;
  numeroVenta?: string;
  pagina?: number;
  limite?: number;
}

export interface VentaCajaDetalle {
  id: number;
  numeroVenta: string;
  fecha: string;
  tipoVenta: string;
  estado: string;
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  impuestos: number;
  total: number;
  cambio: number;
  observaciones?: string | null;
  puestoVenta: PuestoVenta;
}

export interface VentaCaja extends VentaCajaResumen {}

export interface PuestosVentaResponse {
  obtenerPuestosVenta: PuestoVenta[];
}
