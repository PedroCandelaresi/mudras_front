export interface Articulo {
  id: number;
  Codigo: string;
  Rubro?: string;
  Descripcion?: string;
  Marca?: string;
  PrecioVenta?: number;
  PrecioCompra?: number;
  StockMinimo?: number;
  AlicuotaIva?: number;
  Deposito?: number;
  FechaCompra?: string;
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
  FechaModif?: string;
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
  // Propiedades adicionales para el formulario
  stock?: number;
  stockMinimo?: number;
  precioVenta?: number;
  unidadMedida?: string;
  cantidadPorEmpaque?: number;
  tipoEmpaque?: string;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  fechaInicioPromocion?: string;
  fechaFinPromocion?: string;
  publicadoEnTienda?: boolean;
  descripcionTienda?: string;
  codigoBarras?: string;
  manejaStock?: boolean;
  rubroId?: number;
  estado?: EstadoArticulo;
  imagenesUrls?: string[];
  proveedor?: {
    IdProveedor: number;
    Nombre?: string;
    PorcentajeRecargoProveedor?: number;
    PorcentajeDescuentoProveedor?: number;
  };
  rubro?: {
    Id: number;
    Rubro?: string;
    PorcentajeRecargo?: number;
    PorcentajeDescuento?: number;
  };
}

export enum EstadoArticulo {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  DESCONTINUADO = 'descontinuado'
}

export interface CrearArticuloDto {
  Codigo: string;
  Rubro?: string;
  Descripcion?: string;
  Marca?: string;
  PrecioVenta?: number;
  PrecioCompra?: number;
  StockMinimo?: number;
  AlicuotaIva?: number;
  Deposito?: number;
  FechaCompra?: string;
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
  FechaModif?: string;
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
  // Propiedades adicionales para el formulario
  stock?: number;
  stockMinimo?: number;
  precioVenta?: number;
  unidadMedida?: string;
  cantidadPorEmpaque?: number;
  tipoEmpaque?: string;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  fechaInicioPromocion?: string;
  fechaFinPromocion?: string;
  publicadoEnTienda?: boolean;
  descripcionTienda?: string;
  codigoBarras?: string;
  manejaStock?: boolean;
  rubroId?: number;
  estado?: EstadoArticulo;
  imagenesUrls?: string[];
}

export interface ActualizarArticuloDto extends Partial<CrearArticuloDto> {
  id: number;
}

export interface FiltrosArticulo {
  busqueda?: string;
  codigo?: string;
  descripcion?: string;
  marca?: string;
  rubroId?: number;
  proveedorId?: number;
  estado?: EstadoArticulo;
  soloConStock?: boolean;
  soloStockBajo?: boolean;
  soloEnPromocion?: boolean;
  soloPublicadosEnTienda?: boolean;
  precioMinimo?: number;
  precioMaximo?: number;
  pagina: number;
  limite: number;
  ordenarPor: string;
  direccionOrden: 'ASC' | 'DESC';
}

export interface ArticulosConPaginacion {
  articulos: Articulo[];
  total: number;
}

export interface EstadisticasArticulos {
  totalArticulos: number;
  articulosActivos: number;
  articulosConStock: number;
  articulosSinStock: number;
  articulosStockBajo: number;
  articulosEnPromocion: number;
  articulosPublicadosEnTienda: number;
  valorTotalStock: number;
}

export const UNIDADES_MEDIDA = [
  'unidad',
  'kg',
  'gramo',
  'litro',
  'ml',
  'metro',
  'cm',
  'pack',
  'caja',
  'bolsa'
];

export const TIPOS_EMPAQUE = [
  'unidad',
  'docena',
  'pack',
  'caja',
  'bolsa',
  'pallet',
  'display'
];

// Interfaces para las respuestas de GraphQL
export interface BuscarArticulosResponse {
  buscarArticulos: ArticulosConPaginacion;
}

export interface EstadisticasArticulosResponse {
  estadisticasArticulos: EstadisticasArticulos;
}
