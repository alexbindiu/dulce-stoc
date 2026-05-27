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

// ── HTTP link (queries + mutations) ──────────────────────────────────────────
const httpLink = createHttpLink({ 
  uri: `https://dulce-stoc-api.onrender.com/graphql` 
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
      url: `wss://dulce-stoc-api.onrender.com/graphql`,
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
          // Merge pages for infinite scroll
          products: {
            keyArgs: ['query', ['search', 'category', 'activeOnly']],
            merge(existing, incoming, { args }) {
              const page = args?.query?.page ?? 1;
              const existingData = existing?.data ?? [];
              const incomingData = incoming?.data ?? [];
              // Page 1 = fresh load (filter changed), else append
              const merged = page === 1 ? incomingData : [...existingData, ...incomingData];
              return { ...incoming, data: merged };
            },
            read(existing) {
              return existing;
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
