'use client';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client/react';
import type { ReactNode } from 'react';

/**
 * Elegimos el endpoint así, SIN usar window ni puertos:
 * 1) NEXT_PUBLIC_GRAPHQL_URL (si lo definís, ej: "/api/graphql")
 * 2) NEXT_PUBLIC_API_URL + "/graphql" (si definís "/api")
 * 3) fallback: "/api/graphql"
 */
// Usamos SIEMPRE el proxy "/api/graphql" para inyectar Authorization desde cookie httpOnly
const graphqlUri = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql';

const httpLink = createHttpLink({ 
  uri: graphqlUri, 
  credentials: 'include',
  fetchOptions: {
    credentials: 'include',
  },
});

const authLink = setContext((_, { headers }) => {
  const secretKey = process.env.NEXT_PUBLIC_X_SECRET_KEY;

  const finalHeaders = {
    ...headers,
    ...(secretKey ? { 'x-secret-key': secretKey } : {}),
  };

  return {
    headers: finalHeaders,
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          articulos: { merge: false },
          proveedores: { merge: false },
          movimientosStock: { merge: false },
          rubros: { merge: false },
          obtenerRubros: { merge: false },
          buscarRubros: { merge: false },
          proveedoresPorRubro: { merge: false },
          articulosPorRubro: { merge: false },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { 
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network'
    },
    query: { 
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    },
    mutate: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache'
    }
  },
});

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloClientProvider client={client}>{children}</ApolloClientProvider>;
}
