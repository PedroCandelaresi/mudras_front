export interface Proveedor {
  id: number;
  nombre: string;
  codigo?: string;
  email?: string;
  telefono?: string;
}

export interface Articulo {
  id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
  proveedor?: {
    id: number;
    nombre: string;
  };
}

export interface RubroDetalles {
  id: number;
  nombre: string;
  codigo?: string;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

export interface ArticulosPorRubroResponse {
  articulosPorRubro: {
    articulos: Articulo[];
    total: number;
  };
}

export interface ProveedoresPorRubroResponse {
  proveedoresPorRubro: Proveedor[];
}

export interface RubroDetallesResponse {
  rubro: RubroDetalles;
}
