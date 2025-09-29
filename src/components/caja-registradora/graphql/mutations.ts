import { gql } from '@apollo/client';

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

export type MetodoPago =
  | 'EFECTIVO'
  | 'TARJETA_DEBITO'
  | 'TARJETA_CREDITO'
  | 'TRANSFERENCIA'
  | 'CHEQUE'
  | 'CUENTA_CORRIENTE'
  | 'OTRO';

export interface CrearVentaCajaInput {
  tipoVenta: string;
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
    metodoPago: MetodoPago;
    monto: number;
    referencia?: string;
    numeroTarjetaUltimos4?: string;
    tipoTarjeta?: string;
    numeroCuotas?: number;
    observaciones?: string;
  }[];
}

export interface CrearVentaCajaResponse {
  crearVentaCaja: {
    id: number;
    numeroVenta: string;
    fecha: string;
    tipoVenta: string;
    estado: string;
    total: number;
    observaciones?: string | null;
  };
}

export interface CancelarVentaCajaResponse {
  cancelarVentaCaja: {
    id: number;
    numeroVenta: string;
    estado: string;
    observaciones?: string | null;
  };
}

export interface ProcesarDevolucionResponse {
  procesarDevolucion: {
    id: number;
    numeroVenta: string;
    fecha: string;
    estado: string;
    total: number;
    observaciones?: string | null;
  };
}

export interface ReintentarEmisionAfipResponse {
  reintentarEmisionAfip: {
    id: number;
    estado: string;
    cae?: string | null;
    mensajeError?: string | null;
    intentosEmision: number;
  };
}

export interface PagoVenta {
  metodoPago: MetodoPago;
  monto: number;
  referencia?: string;
  numeroTarjetaUltimos4?: string;
  tipoTarjeta?: string;
  numeroCuotas?: number;
  observaciones?: string;
}
