import { useState, useCallback } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import { BUSCAR_RUBROS } from '@/components/rubros/graphql/queries';
import {
  CREAR_RUBRO,
  ACTUALIZAR_RUBRO,
  ELIMINAR_RUBRO,
  ELIMINAR_PROVEEDOR_DE_RUBRO,
  ELIMINAR_ARTICULO_DE_RUBRO,
  ELIMINAR_ARTICULOS_DE_RUBRO,
} from '@/components/rubros/graphql/mutations';

export interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

export interface FormRubro {
  nombre: string;
  codigo: string;
  porcentajeRecargo: number;
  porcentajeDescuento: number;
}

export interface UseRubrosOptions {
  pagina?: number;
  limite?: number;
  busqueda?: string;
  autoFetch?: boolean;
}

export interface UseRubrosReturn {
  // Estado
  rubros: Rubro[];
  loading: boolean;
  error: string;
  total: number;
  
  // Acciones CRUD
  crearRubro: (data: FormRubro) => Promise<void>;
  actualizarRubro: (id: number, data: FormRubro) => Promise<void>;
  eliminarRubro: (id: number) => Promise<void>;
  
  // Funciones de utilidad
  refetch: () => void;
  buscarRubros: (busqueda: string) => void;
  cambiarPagina: (nuevaPagina: number) => void;
}

export function useRubros(options: UseRubrosOptions = {}): UseRubrosReturn {
  const {
    pagina = 0,
    limite = 50,
    busqueda = '',
    autoFetch = true
  } = options;

  const [error, setError] = useState('');

  // Query principal
  const { data, loading, error: queryError, refetch } = useQuery(BUSCAR_RUBROS, {
    variables: { pagina, limite, busqueda },
    skip: !autoFetch,
    errorPolicy: 'all'
  });

  // Mutaciones
  const [crearRubroMutation] = useMutation(CREAR_RUBRO, {
    refetchQueries: [{ query: BUSCAR_RUBROS, variables: { pagina, limite, busqueda } }],
    onError: (error) => setError(error.message)
  });

  const [actualizarRubroMutation] = useMutation(ACTUALIZAR_RUBRO, {
    refetchQueries: [{ query: BUSCAR_RUBROS, variables: { pagina, limite, busqueda } }],
    onError: (error) => setError(error.message)
  });

  const [eliminarRubroMutation] = useMutation(ELIMINAR_RUBRO, {
    refetchQueries: [{ query: BUSCAR_RUBROS, variables: { pagina, limite, busqueda } }],
    onError: (error) => setError(error.message)
  });

  // Funciones de acción
  const crearRubro = useCallback(async (data: FormRubro) => {
    try {
      setError('');
      await crearRubroMutation({
        variables: {
          nombre: data.nombre,
          codigo: data.codigo || null,
          porcentajeRecargo: data.porcentajeRecargo,
          porcentajeDescuento: data.porcentajeDescuento
        }
      });
    } catch (err) {
      throw err;
    }
  }, [crearRubroMutation]);

  const actualizarRubro = useCallback(async (id: number, data: FormRubro) => {
    try {
      setError('');
      await actualizarRubroMutation({
        variables: {
          id,
          nombre: data.nombre,
          codigo: data.codigo || null,
          porcentajeRecargo: data.porcentajeRecargo,
          porcentajeDescuento: data.porcentajeDescuento
        }
      });
    } catch (err) {
      throw err;
    }
  }, [actualizarRubroMutation]);

  const eliminarRubro = useCallback(async (id: number) => {
    try {
      setError('');
      await eliminarRubroMutation({ variables: { id } });
    } catch (err) {
      throw err;
    }
  }, [eliminarRubroMutation]);

  const buscarRubros = useCallback((nuevaBusqueda: string) => {
    refetch({ pagina: 0, limite, busqueda: nuevaBusqueda });
  }, [refetch, limite]);

  const cambiarPagina = useCallback((nuevaPagina: number) => {
    refetch({ pagina: nuevaPagina, limite, busqueda });
  }, [refetch, limite, busqueda]);

  return {
    rubros: (data as any)?.buscarRubros?.rubros || [],
    loading,
    error,
    total: (data as any)?.buscarRubros?.total || 0,
    crearRubro,
    actualizarRubro,
    eliminarRubro,
    refetch: () => refetch(),
    buscarRubros,
    cambiarPagina
  };
}
