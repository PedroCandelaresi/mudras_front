import { useState, useCallback, useEffect } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { GET_PROVEEDORES_POR_RUBRO } from '@/components/rubros/graphql/queries';
import {
  ELIMINAR_PROVEEDOR_DE_RUBRO,
  ELIMINAR_ARTICULO_DE_RUBRO,
  ELIMINAR_ARTICULOS_DE_RUBRO,
} from '@/components/rubros/graphql/mutations';
import { BUSCAR_ARTICULOS } from '@/components/articulos/graphql/queries';

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

export interface UseRubroDetalleOptions {
  rubroId?: number;
  autoFetch?: boolean;
}

export interface UseRubroDetalleReturn {
  // Estado proveedores
  proveedores: Proveedor[];
  loadingProveedores: boolean;
  errorProveedores: string;
  
  // Estado artículos
  articulos: Articulo[];
  totalArticulos: number;
  loadingArticulos: boolean;
  errorArticulos: string;
  
  // Acciones
  cargarProveedores: (rubroId: number) => Promise<void>;
  cargarArticulos: (rubroId: number, filtro?: string, offset?: number, limit?: number) => Promise<void>;
  eliminarProveedor: (proveedorId: number, rubroNombre: string) => Promise<void>;
  eliminarArticulo: (articuloId: number) => Promise<void>;
  eliminarArticulos: (articuloIds: number[]) => Promise<void>;
  
  // Utilidades
  refrescarDatos: (rubroId: number) => Promise<void>;
}

export function useRubroDetalle(options: UseRubroDetalleOptions = {}): UseRubroDetalleReturn {
  const { rubroId, autoFetch = false } = options;

  // Estado local
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [totalArticulos, setTotalArticulos] = useState(0);
  const [errorProveedores, setErrorProveedores] = useState('');
  const [errorArticulos, setErrorArticulos] = useState('');

  // Lazy queries
  const [getProveedores, { loading: loadingProveedores, data: dataProveedores, error: errorProveedoresQuery }] = useLazyQuery(GET_PROVEEDORES_POR_RUBRO, {
    errorPolicy: 'all'
  });

  const [getArticulos, { loading: loadingArticulos, data: dataArticulos, error: errorArticulosQuery }] = useLazyQuery(BUSCAR_ARTICULOS, {
    errorPolicy: 'all'
  });

  // Effects para manejar respuestas
  useEffect(() => {
    if (dataProveedores) {
      setProveedores((dataProveedores as any)?.proveedoresPorRubro || []);
      setErrorProveedores('');
    }
  }, [dataProveedores]);

  useEffect(() => {
    if (dataArticulos) {
      const articulosResponse = (dataArticulos as any)?.buscarArticulos ?? {};
      const articulosList = Array.isArray(articulosResponse?.articulos) ? articulosResponse.articulos : [];

      setArticulos(articulosList.map((articulo: any) => ({
        id: articulo?.id ?? 0,
        codigo: articulo?.Codigo ?? '',
        descripcion: articulo?.Descripcion ?? '',
        precio: articulo?.PrecioVenta ?? 0,
        stock: articulo?.Deposito ?? 0,
        proveedor: articulo?.proveedor ? {
          id: articulo.proveedor.IdProveedor ?? 0,
          nombre: articulo.proveedor.Nombre ?? ''
        } : undefined,
      })));
      setTotalArticulos(articulosResponse?.total ?? 0);
      setErrorArticulos('');
    }
  }, [dataArticulos]);

  useEffect(() => {
    if (errorProveedoresQuery) {
      setErrorProveedores(errorProveedoresQuery.message);
    }
  }, [errorProveedoresQuery]);

  useEffect(() => {
    if (errorArticulosQuery) {
      setErrorArticulos(errorArticulosQuery.message);
    }
  }, [errorArticulosQuery]);

  // Mutaciones
  const [eliminarProveedorMutation] = useMutation(ELIMINAR_PROVEEDOR_DE_RUBRO, {
    onError: (error) => setErrorProveedores(error.message)
  });

  const [eliminarArticuloMutation] = useMutation(ELIMINAR_ARTICULO_DE_RUBRO, {
    onError: (error) => setErrorArticulos(error.message)
  });

  const [eliminarArticulosMutation] = useMutation(ELIMINAR_ARTICULOS_DE_RUBRO, {
    onError: (error) => setErrorArticulos(error.message)
  });

  // Funciones de carga
  const cargarProveedores = useCallback(async (rubroId: number) => {
    try {
      setErrorProveedores('');
      await getProveedores({ variables: { rubroId } });
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  }, [getProveedores]);

  const cargarArticulos = useCallback(async (
    rubroId: number, 
    filtro?: string, 
    offset: number = 0, 
    limit: number = 50
  ) => {
    try {
      setErrorArticulos('');
      const pagina = Math.floor((offset ?? 0) / (limit || 1));
      await getArticulos({ 
        variables: { 
          filtros: {
            rubroId,
            busqueda: filtro || undefined,
            pagina,
            limite: limit,
            ordenarPor: 'Descripcion',
            direccionOrden: 'ASC'
          }
        }
      });
    } catch (error) {
      console.error('Error al cargar artículos:', error);
    }
  }, [getArticulos]);

  // Funciones de eliminación
  const eliminarProveedor = useCallback(async (proveedorId: number, rubroNombre: string) => {
    try {
      setErrorProveedores('');
      await eliminarProveedorMutation({ 
        variables: { proveedorId, rubroNombre } 
      });
      
      // Actualizar estado local
      setProveedores(prev => prev.filter(p => p.id !== proveedorId));
      
      // Recargar artículos para reflejar cambios
      if (rubroId) {
        await cargarArticulos(rubroId);
      }
    } catch (error) {
      throw error;
    }
  }, [eliminarProveedorMutation, cargarArticulos, rubroId]);

  const eliminarArticulo = useCallback(async (articuloId: number) => {
    try {
      setErrorArticulos('');
      await eliminarArticuloMutation({ variables: { articuloId } });
      
      // Actualizar estado local
      setArticulos(prev => prev.filter(a => a.id !== articuloId));
      setTotalArticulos(prev => prev - 1);
    } catch (error) {
      throw error;
    }
  }, [eliminarArticuloMutation]);

  const eliminarArticulos = useCallback(async (articuloIds: number[]) => {
    try {
      setErrorArticulos('');
      await eliminarArticulosMutation({ variables: { articuloIds } });
      
      // Actualizar estado local
      setArticulos(prev => prev.filter(a => !articuloIds.includes(a.id)));
      setTotalArticulos(prev => prev - articuloIds.length);
    } catch (error) {
      throw error;
    }
  }, [eliminarArticulosMutation]);

  // Función de refresco
  const refrescarDatos = useCallback(async (rubroId: number) => {
    await Promise.all([
      cargarProveedores(rubroId),
      cargarArticulos(rubroId)
    ]);
  }, [cargarProveedores, cargarArticulos]);

  // Auto-fetch inicial
  useEffect(() => {
    if (autoFetch && rubroId) {
      refrescarDatos(rubroId);
    }
  }, [autoFetch, rubroId, refrescarDatos]);

  return {
    // Estado proveedores
    proveedores,
    loadingProveedores,
    errorProveedores,
    
    // Estado artículos
    articulos,
    totalArticulos,
    loadingArticulos,
    errorArticulos,
    
    // Acciones
    cargarProveedores,
    cargarArticulos,
    eliminarProveedor,
    eliminarArticulo,
    eliminarArticulos,
    
    // Utilidades
    refrescarDatos
  };
}
