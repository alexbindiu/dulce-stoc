import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getToken } from './api';
import { GRAPHQL_HTTP, GRAPHQL_WS } from './config';

// ── HTTP link (queries + mutations) ──────────────────────────────────────────
const httpLink = createHttpLink({
  uri: GRAPHQL_HTTP
});

const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
      url: GRAPHQL_WS,
      connectionParams: () => {
      const token = getToken();
      return token ? { authorization: `Bearer ${token}` } : {};
    },
    retryAttempts: Infinity,
    shouldRetry: () => true,
  }),
);

// ── Split: subscriptions go over WS, everything else over HTTP ───────────────
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

// ── Cache ─────────────────────────────────────────────────────────────────────
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Merge pages for infinite scroll.
          // keyArgs as a function => fiecare combinație de filtre + pageSize are
          // propria listă în cache (altfel căutarea/pageSize-ul se amestecau).
          products: {
            keyArgs: (args: any) => {
              const q = args?.query ?? {};
              return `${q.search ?? ''}|${q.category ?? ''}|${q.activeOnly ?? false}|${q.pageSize ?? 12}`;
            },
            merge(existing: any, incoming: any, { args }: any) {
              const page = args?.query?.page ?? 1;
              const incomingData = incoming?.data ?? [];
              // Page 1 = încărcare nouă (filtru schimbat / refetch) => înlocuiește
              if (page <= 1) return { ...incoming, data: incomingData };
              // Paginile următoare se adaugă, fără duplicate
              const existingData = existing?.data ?? [];
              const seen = new Set(existingData.map((p: any) => p.__ref ?? p.id));
              const deduped = incomingData.filter((p: any) => !seen.has(p.__ref ?? p.id));
              return { ...incoming, data: [...existingData, ...deduped] };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
