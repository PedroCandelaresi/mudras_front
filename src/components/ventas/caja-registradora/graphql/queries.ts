import { gql } from '@apollo/client';
import type { ArticuloPrecioContext } from '@/utils/precioVenta';

export const BUSCAR_ARTICULOS_CAJA = gql`
  query BuscarArticulosCaja($input: BuscarArticuloInput!) {
    buscarArticulosCaja(input: $input) {
      id
      Codigo
      Descripcion
      PrecioVenta
      PrecioCompra
      CostoPromedio
      PrecioListaProveedor
      PorcentajeGanancia
      AlicuotaIva
      totalStock
      Deposito
      StockMinimo
      EnPromocion
      Unidad
      Rubro
      rubro {
        Id
        Rubro
        PorcentajeRecargo
        PorcentajeDescuento
      }
      stockDisponible
      stockDespuesVenta
      alertaStock
      proveedor {
        IdProveedor
        Nombre
        PorcentajeRecargoProveedor
        PorcentajeDescuentoProveedor
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
        nombreUsuario
        nombrePuesto
      }
      total
      totalPaginas
      paginaActual
    }
  }
`;
export interface HistorialVentaItem {
  id: number;
  numeroVenta: string;
  fecha: string;
  tipoVenta: string;
  estado: string;
  total: number;
  nombreUsuario?: string | null;
  nombrePuesto?: string | null;
  nombreCliente?: string | null;
}

export interface ResumenHistorialVentas {
  totalVentas?: number;
  montoTotal?: number;
  ventasPorEstado?: Array<{ estado: string; cantidad: number }>;
}

export interface ObtenerHistorialVentasResponse {
  obtenerHistorialVentas: {
    ventas: HistorialVentaItem[];
    total: number;
    totalPaginas: number;
    paginaActual: number;
    totalRegistros?: number;
    resumen?: ResumenHistorialVentas;
  };
}

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
      puntoMudras {
        id
        nombre
      }
      cliente {
        id
        nombre
        apellido
        email
        telefono
      }
      usuarioAuth {
        id
        displayName
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
        medioPago
        monto
        numeroComprobante
        marcaTarjeta
        ultimos4Digitos
        cuotas
        observaciones
        creadoEn
      }
      comprobantesAfip {
        id
        tipoComprobante
        puntoVenta
        numeroComprobante
        estado
        cae
        vencimientoCae
        creadoEn
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

export interface ArticuloCaja extends ArticuloPrecioContext {
  id: number;
  Codigo: string;
  Descripcion: string;
  PrecioVenta: number;
  PrecioCompra?: number;
  CostoPromedio?: number;
  PrecioListaProveedor?: number;
  PorcentajeGanancia?: number;
  AlicuotaIva?: number;
  totalStock?: number;
  Deposito: number;
  StockMinimo: number;
  EnPromocion: boolean;
  Unidad: string;
  Rubro: string;
  rubro?: {
    Id: number;
    Rubro: string;
    PorcentajeRecargo?: number | null;
    PorcentajeDescuento?: number | null;
  } | null;
  stockDisponible: number;
  stockDespuesVenta: number;
  alertaStock: boolean;
  proveedor?: {
    IdProveedor: number;
    Nombre: string;
    PorcentajeRecargoProveedor?: number | null;
    PorcentajeDescuentoProveedor?: number | null;
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
  nombreUsuario: string;
  nombrePuesto: string;
}

export interface HistorialVentasResponse {
  obtenerHistorialVentas: {
    ventas: VentaCajaResumen[];
    total: number;
    totalPaginas: number;
    paginaActual: number;
    totalRegistros?: number;
    resumen?: ResumenHistorialVentas;
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

export interface VentaCaja extends VentaCajaResumen {
  cliente?: {
    Nombre?: string | null;
    Apellido?: string | null;
  } | null;
  puestoVenta?: {
    nombre?: string | null;
  } | null;
}

export interface PuestosVentaResponse {
  obtenerPuestosVenta: PuestoVenta[];
}
