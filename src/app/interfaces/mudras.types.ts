// Interfaces para las entidades de Mudras
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
  AlicuotaIva?: number;
  Deposito?: number;
  FechaCompra?: Date;
  idProveedor?: number;
  Lista2?: number;
  Lista3?: number;
  Unidad?: string;
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
}
