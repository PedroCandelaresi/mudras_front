import { gql } from '@apollo/client';
import { ARTICULO_FRAGMENT } from '@/components/articulos/graphql/queries';
import type { Articulo } from '@/app/interfaces/mudras.types';

export const OBTENER_PUNTOS_MUDRAS = gql`
  query ObtenerPuntosMudras {
    obtenerPuntosMudras {
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
      totalArticulos
      valorInventario
    }
  }
`;

export const OBTENER_PUNTO_MUDRAS_POR_ID = gql`
  query ObtenerPuntoMudrasPorId($id: Int!) {
    obtenerPuntoMudrasPorId(id: $id) {
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
      totalArticulos
      valorInventario
    }
  }
`;

export const OBTENER_ESTADISTICAS_PUNTOS_MUDRAS = gql`
  query ObtenerEstadisticasPuntosMudras {
    obtenerEstadisticasPuntosMudras {
      totalPuntos
      puntosVenta
      depositos
      puntosActivos
      articulosConStock
      valorTotalInventario
      movimientosHoy
    }
  }
`;

export const OBTENER_STOCK_PUNTO_MUDRAS = gql`
  ${ARTICULO_FRAGMENT}
  query ObtenerStockPuntoMudras($puntoMudrasId: Int!) {
    obtenerStockPuntoMudras(puntoMudrasId: $puntoMudrasId) {
      id
      nombre
      codigo
      precio
      stockAsignado
      stockTotal
      rubro {
        id
        nombre
      }
      articulo {
        ...ArticuloFragment
      }
    }
  }
`;

export const OBTENER_PROVEEDORES_CON_STOCK = gql`
  query ObtenerProveedoresConStock {
    obtenerProveedoresConStock {
      id
      nombre
      codigo
    }
  }
`;

export const OBTENER_RUBROS_POR_PROVEEDOR = gql`
  query ObtenerRubrosPorProveedor($proveedorId: ID!) {
    obtenerRubrosPorProveedor(proveedorId: $proveedorId) {
      rubro
    }
  }
`;

export const BUSCAR_ARTICULOS_PARA_ASIGNACION = gql`
  query BuscarArticulosParaAsignacion($proveedorId: Int, $rubro: String, $busqueda: String, $destinoId: Int) {
    buscarArticulosParaAsignacion(
      proveedorId: $proveedorId
      rubro: $rubro
      busqueda: $busqueda
      destinoId: $destinoId
    ) {
      id
      nombre
      codigo
      precio
      stockTotal
      stockAsignado
      stockDisponible
      stockEnDestino
      rubro
      proveedor
    }
  }
`;

export const OBTENER_RELACIONES_PROVEEDOR_RUBRO = gql`
  query ObtenerRelacionesProveedorRubro {
    obtenerRelacionesProveedorRubro {
      id
      proveedorId
      proveedorNombre
      rubroNombre
      cantidadArticulos
    }
  }
`;

export const OBTENER_ESTADISTICAS_PROVEEDOR_RUBRO = gql`
  query ObtenerEstadisticasProveedorRubro {
    obtenerEstadisticasProveedorRubro {
      totalRelaciones
      proveedoresUnicos
      rubrosUnicos
      totalArticulos
    }
  }
`;

export interface PuntoMudras {
  id: number;
  nombre: string;
  tipo: TipoPuntoMudras;
  descripcion?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo: boolean;
  permiteVentasOnline: boolean;
  manejaStockFisico: boolean;
  requiereAutorizacion: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  totalArticulos?: number | null;
  valorInventario?: number | null;
}

export interface ArticuloConStockPuntoMudras {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stockAsignado: number;
  stockTotal: number;
  rubro?: {
    id: number;
    nombre: string;
  } | null;
  articulo?: Articulo | null;
}

export interface ProveedorBasico {
  id: number;
  nombre: string;
  codigo?: number | null;
}

export interface RubroBasico {
  rubro: string;
}

export interface ArticuloFiltrado {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stockTotal: number;
  stockAsignado: number;
  stockDisponible: number;
  stockEnDestino?: number;
  rubro: string;
  proveedor: string;
}

export interface RelacionProveedorRubro {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  rubroNombre: string;
  cantidadArticulos: number;
}

export interface EstadisticasProveedorRubro {
  totalRelaciones: number;
  proveedoresUnicos: number;
  rubrosUnicos: number;
  totalArticulos: number;
}

export interface ObtenerPuntosMudrasResponse {
  obtenerPuntosMudras: PuntoMudras[];
}

export type TipoPuntoMudras = 'venta' | 'deposito';

export interface ObtenerEstadisticasPuntosMudrasResponse {
  obtenerEstadisticasPuntosMudras: {
    totalPuntos: number;
    puntosVenta: number;
    depositos: number;
    puntosActivos: number;
    articulosConStock: number;
    valorTotalInventario: number;
    movimientosHoy: number;
  };
}

export interface ObtenerStockPuntoMudrasResponse {
  obtenerStockPuntoMudras: ArticuloConStockPuntoMudras[];
}

export interface ObtenerProveedoresConStockResponse {
  obtenerProveedoresConStock: ProveedorBasico[];
}

export interface ObtenerRubrosPorProveedorResponse {
  obtenerRubrosPorProveedor: RubroBasico[];
}

export interface BuscarArticulosParaAsignacionResponse {
  buscarArticulosParaAsignacion: ArticuloFiltrado[];
}

export interface ObtenerRelacionesProveedorRubroResponse {
  obtenerRelacionesProveedorRubro: RelacionProveedorRubro[];
}

export interface ObtenerEstadisticasProveedorRubroResponse {
  obtenerEstadisticasProveedorRubro: EstadisticasProveedorRubro;
}

export const OBTENER_MATRIZ_STOCK = gql`
  query ObtenerMatrizStock($busqueda: String, $rubro: String, $proveedorId: Int) {
    obtenerMatrizStock(busqueda: $busqueda, rubro: $rubro, proveedorId: $proveedorId) {
      id
      codigo
      nombre
      rubro
      stockTotal
      stockPorPunto {
        puntoId
        puntoNombre
        cantidad
      }
    }
  }
`;

export interface MatrizStockItem {
  id: string;
  codigo: string;
  nombre: string;
  rubro: string;
  stockTotal: number;
  stockPorPunto: {
    puntoId: string;
    puntoNombre: string;
    cantidad: number;
  }[];
}

export interface ObtenerMatrizStockResponse {
  obtenerMatrizStock: MatrizStockItem[];
}
