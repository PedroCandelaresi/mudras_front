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
  rubros: Rubro[];
}

export interface DashboardStatsResponse {
  articulos: Articulo[];
  proveedores: Proveedor[];
  articulosConStock: Articulo[];
  articulosStockBajo: Articulo[];
  articulosSinStock: Articulo[];
  articulosEnPromocion: Articulo[];
}
