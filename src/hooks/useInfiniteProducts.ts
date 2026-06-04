import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client/react';
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
  const filterKey = `${filters.search ?? ''}|${filters.category ?? ''}|${filters.activeOnly ?? false}`;
  const [page, setPage] = useState(1);

  // Resetează pagina SINCRON când se schimbă filtrele, înainte ca query-ul să
  // ruleze. Altfel căutarea pornea cu o pagină veche (ex: 3) și rezultatele se
  // adăugau sub produsele deja încărcate, în loc să le înlocuiască.
  const prevKey = useRef(filterKey);
  let activePage = page;
  if (prevKey.current !== filterKey) {
    prevKey.current = filterKey;
    activePage = 1;
    if (page !== 1) setPage(1);
  }

  const variables = {
    query: { ...filters, page: activePage, pageSize: PAGE_SIZE },
  };

  const { data, loading, refetch } = useQuery<GetProductsQueryData>(GET_PRODUCTS, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const products    = data?.products?.data        ?? [];
  const total       = data?.products?.total       ?? 0;
  const totalPages  = data?.products?.totalPages  ?? 1;
  const hasNextPage = data?.products?.hasNextPage ?? false;

  // ── Load more (infinite scroll) — incrementăm pagina; useQuery refetchează,
  //    iar field policy-ul din cache adaugă pagina nouă în listă. ─────────────
  const loadMore = useCallback(() => {
    if (!hasNextPage || loading) return;
    setPage((p) => p + 1);
  }, [hasNextPage, loading]);

  // ── IntersectionObserver sentinel ─────────────────────────────────────────
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
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, loading, loadMore]);

  // ── Refetch curat: revine la pagina 1 și reîncarcă (folosit după
  //    add/edit/delete ca lista să reflecte starea reală din backend). ────────
  const reset = useCallback(() => {
    setPage(1);
    return refetch({ query: { ...filters, page: 1, pageSize: PAGE_SIZE } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, filterKey]);

  return {
    products,
    total,
    totalPages,
    hasNextPage,
    loading,
    page,
    sentinelRef,
    refetch: reset,
  };
}
