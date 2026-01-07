// Interfaces para las entidades de Mudras
import type { UnidadMedida } from '@/app/utils/unidades';
export interface Articulo {
  id: number;
  Codigo: string;
  Rubro?: string;
  Descripcion?: string;
  Marca?: string;
  PrecioVenta?: number;
  PrecioCompra?: number;
  StockMinimo?: number;
  Stock?: number;
  totalStock?: number;
  ImagenUrl?: string;
  AlicuotaIva?: number;
  Deposito?: number;
  FechaCompra?: Date;
  idProveedor?: number;
  Lista2?: number;
  Lista3?: number;
  Unidad?: UnidadMedida; // unidad de medida del artículo (ej. 'gramo', 'unidad')
  Lista4?: number;
  PorcentajeGanancia?: number;
  Calculado?: boolean;
  CodigoProv?: string;
  CostoPromedio?: number;
  CostoEnDolares?: boolean;
  FechaModif?: Date;
  PrecioListaProveedor?: number;
  StockInicial?: number;
  Ubicacion?: string;
  Lista1EnDolares?: boolean;
  Dto1?: number;
  Dto2?: number;
  Dto3?: number;
  Impuesto?: number;
  EnPromocion?: boolean;
  UsaTalle?: boolean;
  Compuesto?: boolean;
  Combustible?: boolean;
  ImpuestoPorcentual?: boolean;
  proveedor?: Proveedor;
  rubro?: Rubro;
}

export interface Proveedor {
  IdProveedor: number;
  Codigo?: number;
  Nombre?: string;
  Contacto?: string;
  Direccion?: string;
  Localidad?: string;
  Provincia?: string;
  CP?: string;
  Telefono?: string;
  Celular?: string;
  TipoIva?: number;
  CUIT?: string;
  Observaciones?: string;
  Web?: string;
  Mail?: string;
  Rubro?: string;
  Saldo?: number;
  Pais?: string;
  Fax?: string;
  FechaModif?: Date;
  PorcentajeRecargoProveedor?: number;
  PorcentajeDescuentoProveedor?: number;
  rubroId?: number;
}

export interface Stock {
  Id: number;
  Fecha?: Date;
  Codigo?: string;
  Stock?: number;
  StockAnterior?: number;
  Usuario?: number;
}

export interface Rubro {
  Id: number;
  Rubro?: string;
  Codigo?: string;
  UnidadPorDefecto?: UnidadMedida; // Unidad sugerida para los artículos de este rubro
  PorcentajeRecargo?: number;
  PorcentajeDescuento?: number;
}
