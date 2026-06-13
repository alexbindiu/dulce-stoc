import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useSubscription } from '@apollo/client/react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/products/ProductForm';
import { DeleteModal } from '@/components/products/DeleteModal';
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, ON_BATCH_ADDED } from '@/services/gql/products.gql';
import { apolloClient } from '@/services/graphql-client';
import { Category, type Product, type ProductFormData } from '@/types/product';

const CATEGORY_EMOJI: Record<Category, string> = {
  [Category.Tort]: '🎂', [Category.Ecler]: '🍫',
  [Category.Croissant]: '🥐', [Category.Prajitura]: '🍰', [Category.Tarta]: '🥧',
};

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; product: Product }
  | { type: 'delete'; product: Product };

export default function ProductsPageGql() {
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [modal, setModal]         = useState<ModalState>({ type: 'none' });
  const [newBatchCount, setNewBatchCount] = useState(0);

  const filters = {
    search: search || undefined,
    category: (category as Category) || undefined,
    activeOnly: activeOnly || undefined,
  };

  const { products, total, hasNextPage, loading, sentinelRef, refetch } =
    useInfiniteProducts(filters);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => { apolloClient.cache.evict({ fieldName: 'products' }); refetch(); setModal({ type: 'none' }); },
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => { apolloClient.cache.evict({ fieldName: 'products' }); refetch(); setModal({ type: 'none' }); },
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => { apolloClient.cache.evict({ fieldName: 'products' }); refetch(); setModal({ type: 'none' }); },
  });

  // ── Real-time batch subscription ──────────────────────────────────────────
  useSubscription(ON_BATCH_ADDED, {
    onData: ({ data }) => {
      const count = data.data?.productsBatchAdded?.products?.length ?? 0;
      if (count > 0) {
        setNewBatchCount((n) => n + count);
        apolloClient.cache.evict({ fieldName: 'products' });
      }
    },
  });

  async function handleAdd(data: ProductFormData) {
    await createProduct({ variables: { input: data } });
  }

  async function handleEdit(data: ProductFormData) {
    if (modal.type !== 'edit') return;
    await updateProduct({ variables: { id: modal.product.id, input: data } });
  }

  async function handleDelete(id: string) {
    await deleteProduct({ variables: { id } });
  }

  const hasFilters = !!(search || category || activeOnly);

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Produse" subtitle="— catalog complet" />

      <div className="flex-1 p-6">
        {/* New batch banner */}
        {newBatchCount > 0 && (
          <button
            onClick={() => { setNewBatchCount(0); apolloClient.cache.evict({ fieldName: 'products' }); refetch(); }}
            className="w-full mb-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-semibold hover:bg-green-100 transition-colors animate-fade-in-up"
          >
            ↑ {newBatchCount} produse noi generate — click pentru a actualiza lista
          </button>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2 flex-1 min-w-[180px] max-w-xs focus-within:border-caramel">
            <span className="text-muted text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută produs…"
              data-testid="search-input"
              className="flex-1 bg-transparent text-sm text-brown outline-none placeholder:text-muted"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted hover:text-brown text-xs">✕</button>
            )}
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-brown-soft outline-none focus:border-caramel cursor-pointer"
          >
            <option value="">Toate categoriile</option>
            {Object.values(Category).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-brown-soft">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="accent-caramel w-4 h-4" />
            Doar active
          </label>

          {hasFilters && (
            <button onClick={() => { setSearch(''); setCategory(''); setActiveOnly(false); }} className="text-xs text-caramel hover:text-brown-mid">
              Resetează
            </button>
          )}

          <span className="text-xs text-muted ml-auto">{total} produse</span>
          <Button onClick={() => setModal({ type: 'add' })} size="sm">+ Produs nou</Button>
        </div>

        {/* Product grid — infinite scroll */}
        {products.length === 0 && !loading ? (
          <div className="py-20 text-center text-muted text-sm">
            {hasFilters ? 'Niciun produs nu corespunde filtrelor.' : 'Nu există produse.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
            {products.map((p: Product) => (
              <div
                key={p.id}
                onClick={() => navigate(`/app/products/${p.id}`)}
                className="bg-surface border border-border rounded-xl p-4 cursor-pointer hover:border-caramel/50 hover-lift group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl inline-block group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">{CATEGORY_EMOJI[p.category]}</span>
                  <StatusBadge active={p.isActive} />
                </div>
                <p className="font-semibold text-brown text-sm leading-tight mb-1">{p.name}</p>
                <CategoryBadge category={p.category} />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-sm font-semibold text-brown">{p.pricePerUnit.toFixed(2)} lei</span>
                  <span className={`text-xs font-medium ${p.stock === 0 ? 'text-red-500' : 'text-muted'}`}>
                    {p.stock === 0 ? 'Epuizat' : `${p.stock} buc.`}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setModal({ type: 'edit', product: p })} className="flex-1 py-1 text-xs border border-border rounded-md hover:border-caramel hover:text-caramel text-muted transition-colors">✏️ Edit</button>
                  <button onClick={() => setModal({ type: 'delete', product: p })} className="flex-1 py-1 text-xs border border-border rounded-md hover:border-red-400 hover:text-red-500 text-muted transition-colors">🗑 Șterge</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4 mt-4" />

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-6 gap-2">
            {[0,1,2].map((i) => (
              <div key={i} className="w-2 h-2 bg-caramel rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {!hasNextPage && products.length > 0 && !loading && (
          <p className="text-center text-xs text-muted py-4">Toate {total} produsele au fost încărcate</p>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={modal.type === 'add'} onClose={() => setModal({ type: 'none' })} title="Produs nou" maxWidth="max-w-lg">
        <ProductForm onSubmit={handleAdd} onCancel={() => setModal({ type: 'none' })} />
      </Modal>

      <Modal isOpen={modal.type === 'edit'} onClose={() => setModal({ type: 'none' })} title="Editează produs" maxWidth="max-w-lg">
        {modal.type === 'edit' && (
          <ProductForm initialData={modal.product} onSubmit={handleEdit} onCancel={() => setModal({ type: 'none' })} />
        )}
      </Modal>

      <DeleteModal
        product={modal.type === 'delete' ? modal.product : null}
        onConfirm={handleDelete}
        onClose={() => setModal({ type: 'none' })}
      />
    </div>
  );
}
