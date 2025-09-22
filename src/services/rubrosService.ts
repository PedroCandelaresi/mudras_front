import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { 
  BUSCAR_RUBROS, 
  CREAR_RUBRO, 
  ACTUALIZAR_RUBRO, 
  ELIMINAR_RUBRO,
  GET_PROVEEDORES_POR_RUBRO,
  GET_ARTICULOS_POR_RUBRO,
  ELIMINAR_PROVEEDOR_DE_RUBRO,
  ELIMINAR_ARTICULO_DE_RUBRO,
  ELIMINAR_ARTICULOS_DE_RUBRO
} from '@/queries/rubros';

export interface RubrosServiceConfig {
  client: any;
  cacheTtl?: number; // TTL en milisegundos
}

export class RubrosService {
  private client: any;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTtl: number;

  constructor(config: RubrosServiceConfig) {
    this.client = config.client;
    this.cacheTtl = config.cacheTtl || 5 * 60 * 1000; // 5 minutos por defecto
  }

  // ==========================================
  // MÉTODOS DE CACHE
  // ==========================================

  private getCacheKey(operation: string, variables: any): string {
    return `${operation}_${JSON.stringify(variables)}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTtl;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(pattern?: string): void {
    if (pattern) {
      const keys = Array.from(this.cache.keys());
      for (const key of keys) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ==========================================
  // OPERACIONES CRUD
  // ==========================================

  async buscarRubros(variables: { pagina: number; limite: number; busqueda?: string }) {
    const cacheKey = this.getCacheKey('buscarRubros', variables);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await this.client.query({
        query: BUSCAR_RUBROS,
        variables,
        fetchPolicy: 'cache-first'
      });

      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Error al buscar rubros:', error);
      throw error;
    }
  }

  async crearRubro(variables: { 
    nombre: string; 
    codigo?: string; 
    porcentajeRecargo?: number; 
    porcentajeDescuento?: number; 
  }) {
    try {
      const result = await this.client.mutate({
        mutation: CREAR_RUBRO,
        variables,
        refetchQueries: [{ query: BUSCAR_RUBROS }]
      });

      // Invalidar cache relacionado
      this.invalidateCache('buscarRubros');
      
      return result.data;
    } catch (error) {
      console.error('Error al crear rubro:', error);
      throw error;
    }
  }

  async actualizarRubro(variables: { 
    id: number; 
    nombre: string; 
    codigo?: string; 
    porcentajeRecargo?: number; 
    porcentajeDescuento?: number; 
  }) {
    try {
      const result = await this.client.mutate({
        mutation: ACTUALIZAR_RUBRO,
        variables,
        refetchQueries: [{ query: BUSCAR_RUBROS }]
      });

      // Invalidar cache relacionado
      this.invalidateCache('buscarRubros');
      this.invalidateCache(`proveedores_${variables.id}`);
      this.invalidateCache(`articulos_${variables.id}`);
      
      return result.data;
    } catch (error) {
      console.error('Error al actualizar rubro:', error);
      throw error;
    }
  }

  async eliminarRubro(id: number) {
    try {
      const result = await this.client.mutate({
        mutation: ELIMINAR_RUBRO,
        variables: { id },
        refetchQueries: [{ query: BUSCAR_RUBROS }]
      });

      // Invalidar cache relacionado
      this.invalidateCache('buscarRubros');
      this.invalidateCache(`proveedores_${id}`);
      this.invalidateCache(`articulos_${id}`);
      
      return result.data;
    } catch (error) {
      console.error('Error al eliminar rubro:', error);
      throw error;
    }
  }

  // ==========================================
  // OPERACIONES DE DETALLE
  // ==========================================

  async getProveedoresPorRubro(rubroId: number) {
    const cacheKey = this.getCacheKey('proveedores', { rubroId });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await this.client.query({
        query: GET_PROVEEDORES_POR_RUBRO,
        variables: { rubroId },
        fetchPolicy: 'cache-first'
      });

      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw error;
    }
  }

  async getArticulosPorRubro(variables: { 
    rubroId: number; 
    filtro?: string; 
    offset?: number; 
    limit?: number; 
  }) {
    const cacheKey = this.getCacheKey('articulos', variables);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await this.client.query({
        query: GET_ARTICULOS_POR_RUBRO,
        variables,
        fetchPolicy: 'cache-first'
      });

      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Error al obtener artículos:', error);
      throw error;
    }
  }

  // ==========================================
  // OPERACIONES DE ELIMINACIÓN
  // ==========================================

  async eliminarProveedorDeRubro(proveedorId: number, rubroNombre: string, rubroId: number) {
    try {
      const result = await this.client.mutate({
        mutation: ELIMINAR_PROVEEDOR_DE_RUBRO,
        variables: { proveedorId, rubroNombre }
      });

      // Invalidar cache relacionado
      this.invalidateCache(`proveedores_${rubroId}`);
      this.invalidateCache(`articulos_${rubroId}`);
      this.invalidateCache('buscarRubros');
      
      return result.data;
    } catch (error) {
      console.error('Error al eliminar proveedor del rubro:', error);
      throw error;
    }
  }

  async eliminarArticuloDeRubro(articuloId: number, rubroId: number) {
    try {
      const result = await this.client.mutate({
        mutation: ELIMINAR_ARTICULO_DE_RUBRO,
        variables: { articuloId }
      });

      // Invalidar cache relacionado
      this.invalidateCache(`articulos_${rubroId}`);
      this.invalidateCache('buscarRubros');
      
      return result.data;
    } catch (error) {
      console.error('Error al eliminar artículo del rubro:', error);
      throw error;
    }
  }

  async eliminarArticulosDeRubro(articuloIds: number[], rubroId: number) {
    try {
      const result = await this.client.mutate({
        mutation: ELIMINAR_ARTICULOS_DE_RUBRO,
        variables: { articuloIds }
      });

      // Invalidar cache relacionado
      this.invalidateCache(`articulos_${rubroId}`);
      this.invalidateCache('buscarRubros');
      
      return result.data;
    } catch (error) {
      console.error('Error al eliminar artículos del rubro:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  async refrescarDatos(rubroId?: number) {
    if (rubroId) {
      this.invalidateCache(`proveedores_${rubroId}`);
      this.invalidateCache(`articulos_${rubroId}`);
    }
    this.invalidateCache('buscarRubros');
  }

  limpiarCache() {
    this.cache.clear();
  }

  getEstadisticasCache() {
    const total = this.cache.size;
    const validos = Array.from(this.cache.values())
      .filter(item => this.isValidCache(item.timestamp)).length;
    
    return {
      total,
      validos,
      expirados: total - validos,
      tamaño: `${(JSON.stringify(Array.from(this.cache.entries())).length / 1024).toFixed(2)} KB`
    };
  }
}

// Singleton para uso global
let rubrosServiceInstance: RubrosService | null = null;

export function getRubrosService(client?: any): RubrosService {
  if (!rubrosServiceInstance && client) {
    rubrosServiceInstance = new RubrosService({ client });
  }
  
  if (!rubrosServiceInstance) {
    throw new Error('RubrosService no inicializado. Proporciona un cliente Apollo.');
  }
  
  return rubrosServiceInstance;
}
