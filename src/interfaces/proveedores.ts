export interface Proveedor {
  IdProveedor: number;
  Codigo?: string;
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
  rubroId?: number;
  rubro?: {
    Id: number;
    PorcentajeRecargo?: number;
    PorcentajeDescuento?: number;
  } | null;
  rubros?: {
    Id: number;
    Rubro: string;
  }[];
  PorcentajeRecargoProveedor?: number;
  PorcentajeDescuentoProveedor?: number;
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
  Codigo?: string;
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
  PorcentajeRecargoProveedor?: number;
  PorcentajeDescuentoProveedor?: number;
  Saldo?: number;
  Pais?: string;
  Fax?: string;
  rubrosIds?: number[];
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

export interface RubrosPorProveedorResponse {
  obtenerRubrosPorProveedor: RubroBasico[];
}

export interface RubroBasico {
  rubro: string;
}

export interface RubroPorProveedor {
  id: number;
  rubroId?: number | null;
  rubroNombre?: string | null;
  cantidadArticulos?: number | null;
}

export interface RubrosPorProveedorListResponse {
  rubrosPorProveedor: RubroPorProveedor[];
}

export interface ArticulosPorProveedorResponse {
  articulosPorProveedor: {
    articulos: Articulo[];
    total: number;
  };
}
