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
  articulos?: Articulo[];
  cuentasCorrientes?: CuentaCorriente[];
}

export interface Articulo {
  id: number;
  codigo?: string;
  descripcion: string;
  stock: number;
  precio?: number;
  proveedor?: {
    IdProveedor: number;
    Nombre: string;
  };
}

export interface CuentaCorriente {
  id: number;
  fecha: Date;
  concepto: string;
  debe?: number;
  haber?: number;
  saldo: number;
}

export interface CreateProveedorInput {
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
}

export interface UpdateProveedorInput extends CreateProveedorInput {
  IdProveedor: number;
}

export interface ProveedoresResponse {
  proveedores: Proveedor[];
}

export interface ProveedorResponse {
  proveedor: Proveedor;
}

export interface ArticulosPorProveedorResponse {
  articulosPorProveedor: {
    articulos: Articulo[];
    total: number;
  };
}
