export enum TipoPuntoMudras {
  VENTA = 'venta',
  DEPOSITO = 'deposito'
}

export interface PuntoMudras {
  id: number;
  nombre: string;
  tipo: 'venta' | 'deposito';
  direccion?: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  permiteVentasOnline: boolean;
  manejaStockFisico: boolean;
  requiereAutorizacion: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CrearPuntoMudrasInput {
  nombre: string;
  tipo: 'venta' | 'deposito';
  direccion?: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  permiteVentasOnline?: boolean;
  manejaStockFisico?: boolean;
  requiereAutorizacion?: boolean;
}

export interface ActualizarPuntoMudrasInput {
  nombre?: string;
  direccion?: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  permiteVentasOnline?: boolean;
  manejaStockFisico?: boolean;
  requiereAutorizacion?: boolean;
}

export interface FiltrosPuntosMudras {
  tipo?: 'venta' | 'deposito';
  activo?: boolean;
  busqueda?: string;
}

export interface EstadisticasPuntosMudras {
  totalPuntos: number;
  puntosVenta: number;
  depositos: number;
  puntosActivos: number;
}
