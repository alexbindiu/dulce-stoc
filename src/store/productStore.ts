import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { api, isOnline, onConnectionChange } from '@/services/api';
import { offlineQueue } from '@/services/offline-queue';
import { onBatchAdded } from '@/services/websocket';
import type { Product, ProductFormData, ProductFilters } from '@/types/product';

interface PaginatedResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ProductState {
  // Paginated (ProductTable)
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;

  // Full list (Statistics, Inventar, Charts)
  allProducts: Product[];

  // Filters
  filters: ProductFilters;

  // Connectivity
  online: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchAllProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product>;
  addProduct: (data: ProductFormData) => Promise<Product>;
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (f: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;

  // Internal
  _appendBatch: (newProducts: Product[], serverTotal: number) => void;
  _refreshPendingCount: () => void;
}

const DEFAULT_FILTERS: ProductFilters = { search: '', category: '', activeOnly: false };

function buildParams(filters: ProductFilters, page: number, pageSize: number): URLSearchParams {
  const p = new URLSearchParams();
  p.set('page', String(page));
  p.set('pageSize', String(pageSize));
  if (filters.search)     p.set('search', filters.search);
  if (filters.category)   p.set('category', filters.category);
  if (filters.activeOnly) p.set('activeOnly', 'true');
  return p;
}

export const useProductStore = create<ProductState>((set, get) => {
  // Wire connection-change listener once at store creation
  onConnectionChange((online) => {
    set({ online });
    if (online) {
      setTimeout(async () => {
        await get().fetchProducts();
        await get().fetchAllProducts();
        get()._refreshPendingCount();
      }, 500);
    }
  });

  // Re-fetch once the offline queue has been drained
  window.addEventListener('offline-queue-synced', () => {
    get().fetchProducts();
    get().fetchAllProducts();
    get()._refreshPendingCount();
    set({ lastSyncedAt: new Date().toISOString() });
  });

  return {
    products: [],
    allProducts: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 6,
    loading: false,
    filters: DEFAULT_FILTERS,
    online: navigator.onLine,
    pendingCount: 0,
    lastSyncedAt: null,

    // ── Fetch paginated page ──────────────────────────────────────────────────
    fetchProducts: async () => {
      const { filters, currentPage, pageSize } = get();
      set({ loading: true });
      try {
        const params = buildParams(filters, currentPage, pageSize);
        const res = await api.get<PaginatedResponse>(`/products?${params}`);
        set({ products: res.data, total: res.total, totalPages: res.totalPages, loading: false });
      } catch {
        set({ loading: false });
      }
    },

    // ── Fetch all (for statistics / inventar / charts) ────────────────────────
    fetchAllProducts: async () => {
      try {
        const res = await api.get<PaginatedResponse>(`/products?page=1&pageSize=100`);
        set({ allProducts: res.data });
      } catch {
        // keep stale data if fetch fails
      }
    },

    getProductById: (id) => api.get<Product>(`/products/${id}`),

    // ── Create ────────────────────────────────────────────────────────────────
    addProduct: async (data) => {
      if (!isOnline()) {
        const tempId = `offline-${uuidv4()}`;
        const now = new Date().toISOString();
        const optimistic: Product = { ...data, id: tempId, createdAt: now, updatedAt: now };
        set((s) => ({
          products: [optimistic, ...s.products],
          allProducts: [optimistic, ...s.allProducts],
          total: s.total + 1,
        }));
        await api.post('/products', data, tempId);
        get()._refreshPendingCount();
        return optimistic;
      }

      const product = await api.post<Product>('/products', data);
      await get().fetchProducts();
      await get().fetchAllProducts();
      return product!;
    },

    // ── Update ────────────────────────────────────────────────────────────────
    updateProduct: async (id, data) => {
      const now = new Date().toISOString();
      // Optimistic
      set((s) => ({
        products:    s.products.map((p)    => p.id === id ? { ...p, ...data, updatedAt: now } : p),
        allProducts: s.allProducts.map((p) => p.id === id ? { ...p, ...data, updatedAt: now } : p),
      }));

      await api.patch(`/products/${id}`, data);

      if (isOnline()) {
        await get().fetchProducts();
        await get().fetchAllProducts();
      } else {
        get()._refreshPendingCount();
      }
    },

    // ── Delete ────────────────────────────────────────────────────────────────
    deleteProduct: async (id) => {
      // Optimistic
      set((s) => ({
        products:    s.products.filter((p)    => p.id !== id),
        allProducts: s.allProducts.filter((p) => p.id !== id),
        total: Math.max(0, s.total - 1),
      }));

      await api.delete(`/products/${id}`);

      if (isOnline()) {
        await get().fetchProducts();
        await get().fetchAllProducts();
      } else {
        get()._refreshPendingCount();
      }
    },

    // ── Filters / pagination ──────────────────────────────────────────────────
    setFilters: (partial) => {
      set((s) => ({ filters: { ...s.filters, ...partial }, currentPage: 1 }));
      get().fetchProducts();
    },

    resetFilters: () => {
      set({ filters: DEFAULT_FILTERS, currentPage: 1 });
      get().fetchProducts();
    },

    setPage: (p) => {
      set({ currentPage: p });
      get().fetchProducts();
    },

    setPageSize: (s) => {
      set({ pageSize: s, currentPage: 1 });
      get().fetchProducts();
    },

    // ── WebSocket batch handler ───────────────────────────────────────────────
    _appendBatch: (newProducts, serverTotal) => {
      set((s) => {
        const existingIds = new Set(s.allProducts.map((p) => p.id));
        const fresh = newProducts.filter((p) => !existingIds.has(p.id));

        const newTotalPages = Math.max(1, Math.ceil(serverTotal / s.pageSize));
        let updatedProducts = s.products;

        // Only prepend to visible page if we're on page 1
        if (s.currentPage === 1 && fresh.length > 0) {
          updatedProducts = [...fresh, ...s.products].slice(0, s.pageSize);
        }

        return {
          allProducts: [...s.allProducts, ...fresh],
          products: updatedProducts,
          total: serverTotal,
          totalPages: newTotalPages,
        };
      });
    },

    _refreshPendingCount: () => {
      set({ pendingCount: offlineQueue.size() });
    },
  };
});

// Subscribe to WebSocket batch events — single global listener
onBatchAdded(({ products, stats }) => {
  useProductStore.getState()._appendBatch(products, stats.total);
});
