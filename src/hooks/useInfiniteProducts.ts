import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { apolloClient } from '@/services/graphql-client';
import { GET_PRODUCTS } from '@/services/gql/products.gql';

export interface ProductFiltersGql {
  search?: string;
  category?: string;
  activeOnly?: boolean;
}

interface GetProductsQueryData {
  products?: {
    data?: unknown[];
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
  };
}

const PAGE_SIZE = 12;

export function useInfiniteProducts(filters: ProductFiltersGql = {}) {
  const [page, setPage] = useState(1);

  // Build query variables — page 1 always on filter change
  const variables = {
    query: {
      ...filters,
      page,
      pageSize: PAGE_SIZE,
    },
  };

  const { data, loading, fetchMore, refetch } = useQuery<GetProductsQueryData>(GET_PRODUCTS, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const products   = data?.products?.data        ?? [];
  const total      = data?.products?.total       ?? 0;
  const totalPages = data?.products?.totalPages  ?? 1;
  const hasNextPage = data?.products?.hasNextPage ?? false;

  // ── Prefetch next page ────────────────────────────────────────────────────
  useEffect(() => {
    if (hasNextPage) {
      apolloClient.query({
        query: GET_PRODUCTS,
        variables: {
          query: { ...filters, page: page + 1, pageSize: PAGE_SIZE },
        },
      }).catch(() => {}); // silent — it just warms the cache
    }
  }, [page, hasNextPage, JSON.stringify(filters)]);

  // ── Load more (infinite scroll trigger) ──────────────────────────────────
  const loadMore = useCallback(() => {
    if (!hasNextPage || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMore({
      variables: {
        query: { ...filters, page: nextPage, pageSize: PAGE_SIZE },
      },
    });
  }, [hasNextPage, loading, page, filters, fetchMore]);

  // ── Reset when filters change ─────────────────────────────────────────────
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.category, filters.activeOnly]);

  // ── IntersectionObserver sentinel ref ────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loading) {
          loadMore();
        }
      },
      { rootMargin: '200px' }, // trigger 200px before sentinel enters viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, loading, loadMore]);

  return {
    products,
    total,
    totalPages,
    hasNextPage,
    loading,
    page,
    sentinelRef,
    refetch,
  };
}
