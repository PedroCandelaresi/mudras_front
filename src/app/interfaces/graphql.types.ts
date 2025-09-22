// Tipos específicos para las respuestas de GraphQL
import { Articulo, Proveedor, Stock, Rubro } from './mudras.types';

export interface ArticulosResponse {
  articulos: Articulo[];
}

export interface ProveedoresResponse {
  proveedores: Proveedor[];
}

export interface MovimientosStockResponse {
  movimientosStock: Stock[];
}

export interface RubrosResponse {
  obtenerRubros: RubroConEstadisticas[];
}

export interface BuscarRubrosResponse {
  buscarRubros: {
    total: number;
    rubros: RubroConEstadisticas[];
  };
}

export interface RubroConEstadisticas {
  id: number;
  nombre: string;
  codigo?: string;
  cantidadArticulos: number;
  cantidadProveedores: number;
}

export interface DashboardStatsResponse {
  articulos: Articulo[];
  proveedores: Proveedor[];
  articulosConStock: Articulo[];
  articulosStockBajo: Articulo[];
  articulosSinStock: Articulo[];
  articulosEnPromocion: Articulo[];
}

export interface BuscarArticulosResponse {
  buscarArticulos: {
    total: number;
    articulos: Articulo[];
  };
}
