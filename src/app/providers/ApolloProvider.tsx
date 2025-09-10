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
  
  console.log('🚀 [APOLLO] Configurando headers para GraphQL request');
  console.log('🚀 [APOLLO] X-Secret-Key presente:', secretKey ? 'SÍ' : 'NO');
  console.log('🚀 [APOLLO] Headers actuales:', headers);
  
  const finalHeaders = {
    ...headers,
    ...(secretKey ? { 'X-Secret-Key': secretKey } : {}),
  };
  
  console.log('🚀 [APOLLO] Headers finales:', finalHeaders);
  
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
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
});

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloClientProvider client={client}>{children}</ApolloClientProvider>;
}
