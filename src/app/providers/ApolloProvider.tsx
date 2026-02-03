'use client';

import { ApolloClient, InMemoryCache, createHttpLink, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client/react';
import type { ReactNode } from 'react';

// Utility to wrap a Promise in an Observable (since fromPromise is not exported in v4)
function fromPromise<T>(promise: Promise<T>): Observable<T> {
  return new Observable((observer) => {
    promise
      .then((value) => {
        observer.next(value);
        observer.complete();
      })
      .catch((err) => {
        observer.error(err);
      });
  });
}

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

let refreshPromise: Promise<void> | null = null;

const errorLink = onError((error: any) => {
  const { graphQLErrors, networkError, operation, forward } = error;
  let isAuthError = false;

  const statusCode =
    (networkError as any)?.statusCode ??
    (networkError as any)?.status ??
    (networkError as any)?.response?.status;

  if (statusCode === 401 || statusCode === 403) {
    isAuthError = true;
  }

  if (!isAuthError && graphQLErrors && graphQLErrors.length > 0) {
    isAuthError = graphQLErrors.some((err) => {
      const code = (err.extensions as any)?.code;
      const message = (err.message || '').toLowerCase();
      return (
        code === 'UNAUTHENTICATED' ||
        code === 'FORBIDDEN' ||
        message.includes('unauthorized') ||
        message.includes('no autenticado')
      );
    });
  }

  if (isAuthError) {
    if (typeof window === 'undefined') return; // server side, can't refresh cookies reliably this way

    if (!refreshPromise) {
      refreshPromise = fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) throw new Error('Refresh failed');
          return res.json(); // Consumir body para completar request
        })
        .then(() => {
          // Success
          refreshPromise = null;
        })
        .catch((err) => {
          refreshPromise = null;
          // Si falla refresh, redirigir a login
          const nextPath = window.location.pathname || '/panel';
          const search = window.location.search || '';
          const siguiente = encodeURIComponent(`${nextPath}${search}`);
          window.location.href = `/login?siguiente=${siguiente}`;
          throw err; // Propagate error to queue
        });
    }

    // Return observable that waits for refresh, then attempts retry
    return new Observable((observer) => {
      refreshPromise!
        .then(() => {
          const subscriber = forward(operation).subscribe(observer);
          return subscriber;
        })
        .catch((err) => {
          observer.error(err);
        });
    });
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
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
