'use client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client/react';
import { ReactNode } from 'react';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || (typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:4000/graphql`
    : 'http://localhost:4000/graphql'),
});

const authLink = setContext((_, { headers }) => {
  const secretKey = process.env.NEXT_PUBLIC_X_SECRET_KEY;
  
  return {
    headers: {
      ...headers,
      'X-Secret-Key': secretKey,
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          articulos: {
            merge: false,
          },
          proveedores: {
            merge: false,
          },
          movimientosStock: {
            merge: false,
          },
          rubros: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return <ApolloClientProvider client={client}>{children}</ApolloClientProvider>;
}
