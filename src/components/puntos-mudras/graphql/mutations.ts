import { gql } from '@apollo/client';

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

export const MODIFICAR_STOCK_PUNTO = gql`
  mutation ModificarStockPunto($puntoMudrasId: Int!, $articuloId: Int!, $nuevaCantidad: Float!) {
    modificarStockPunto(
      puntoMudrasId: $puntoMudrasId
      articuloId: $articuloId
      nuevaCantidad: $nuevaCantidad
    )
  }
`;

export interface CrearPuntoMudrasInput {
  nombre: string;
  tipo: 'venta' | 'deposito';
  descripcion?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo?: boolean;
  permiteVentasOnline?: boolean;
  manejaStockFisico?: boolean;
  requiereAutorizacion?: boolean;
}

export interface ActualizarPuntoMudrasInput {
  id: number;
  nombre?: string | null;
  descripcion?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo?: boolean;
  permiteVentasOnline?: boolean;
  manejaStockFisico?: boolean;
  requiereAutorizacion?: boolean;
}

export interface CrearPuntoMudrasResponse {
  crearPuntoMudras: import('./queries').PuntoMudras;
}

export interface ActualizarPuntoMudrasResponse {
  actualizarPuntoMudras: import('./queries').PuntoMudras;
}

export interface EliminarPuntoMudrasResponse {
  eliminarPuntoMudras: boolean;
}

export interface ModificarStockPuntoResponse {
  modificarStockPunto: boolean;
}
