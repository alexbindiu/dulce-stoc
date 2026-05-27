import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { useProductStore } from '@/store/productStore'
import { Category, type Product } from '@/types/product'
import { saveSearchPreference, saveCategoryPreference } from '@/utils/useCookieTracker'

export const CATEGORY_EMOJI: Record<Category, string> = {
  [Category.Tort]: '🎂', [Category.Ecler]: '🍫',
  [Category.Croissant]: '🥐', [Category.Prajitura]: '🍰', [Category.Tarta]: '🥧',
}

interface Props {
  onEdit:   (p: Product) => void
  onDelete: (p: Product) => void
  onAdd:    () => void
}

export function ProductTable({ onEdit, onDelete, onAdd }: Props) {
  const navigate = useNavigate()
  const {
    products,
    filters,
    currentPage,
    pageSize,
    totalPages,
    total,
    setPage,
    setFilters,
    resetFilters,
  } = useProductStore()

  const hasFilters = !!(filters.search || filters.category || filters.activeOnly)

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2 flex-1 min-w-[180px] max-w-xs focus-within:border-caramel">
          <span className="text-muted text-sm">🔍</span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => {
              setFilters({ search: e.target.value })
              saveSearchPreference(e.target.value)
            }}
            placeholder="Caută produs…"
            aria-label="Caută produs"
            data-testid="search-input"
            className="flex-1 bg-transparent text-sm text-brown outline-none placeholder:text-muted placeholder:opacity-60"
          />
          {filters.search && (
            <button onClick={() => setFilters({ search: '' })} className="text-muted hover:text-brown text-xs">✕</button>
          )}
        </div>

        <select
          value={filters.category}
          data-testid="category-filter"
          onChange={(e) => {
            const val = e.target.value as Category | ''
            setFilters({ category: val })
            saveCategoryPreference(val)
          }}
          aria-label="Filtrează categorie"
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-brown-soft outline-none focus:border-caramel cursor-pointer"
        >
          <option value="">Toate categoriile</option>
          {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-brown-soft">
          <input
            type="checkbox"
            checked={filters.activeOnly}
            onChange={e => setFilters({ activeOnly: e.target.checked })}
            data-testid="active-filter"
            className="accent-caramel w-4 h-4"
          />
          Doar active
        </label>

        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-caramel hover:text-brown-mid">
            Resetează
          </button>
        )}

        <span className="text-xs text-muted ml-auto" data-testid="results-count">
          {total} produse
        </span>

        <Button onClick={onAdd} size="sm" data-testid="add-button">+ Produs nou</Button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden mb-4">
        {products.length === 0 ? (
          <div className="py-16 text-center text-muted text-sm">
            {hasFilters ? 'Niciun produs nu corespunde filtrelor.' : 'Nu există produse. Adaugă primul produs!'}
          </div>
        ) : (
          <table className="w-full border-collapse" role="table">
            <thead>
              <tr className="bg-paper border-b border-border">
                {['Produs', 'Categorie', 'Preț / buc.', 'Stoc', 'Status', 'Acțiuni'].map(h => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] font-semibold tracking-widest uppercase text-muted ${
                      h === 'Preț / buc.' || h === 'Stoc'
                        ? 'text-right'
                        : h === 'Status' || h === 'Acțiuni'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/app/products/${p.id}`)}
                  data-testid={`product-row-${p.id}`}
                  className="border-b border-border/50 last:border-0 hover:bg-caramel/[0.04] cursor-pointer animate-fadeIn"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-paper border border-border flex items-center justify-center text-xl flex-shrink-0">
                        {CATEGORY_EMOJI[p.category]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-brown">{p.name}</div>
                        <div className="text-xs text-muted">#{p.id.slice(0, 6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><CategoryBadge category={p.category} /></td>
                  <td className="px-5 py-3.5 text-right text-sm font-semibold">{p.pricePerUnit.toFixed(2)} lei</td>
                  <td className="px-5 py-3.5 text-right text-sm">
                    <span className={p.stock === 0 ? 'text-red-600 font-semibold' : ''}>{p.stock} buc.</span>
                  </td>
                  <td className="px-5 py-3.5 text-center"><StatusBadge active={p.isActive} /></td>
                  <td className="px-5 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {[
                        { icon: '👁', label: 'Detalii',  fn: () => navigate(`/app/products/${p.id}`), test: `view-btn-${p.id}` },
                        { icon: '✏️', label: 'Editează', fn: () => onEdit(p),                          test: `edit-btn-${p.id}` },
                        { icon: '🗑', label: 'Șterge',   fn: () => onDelete(p),                        test: `delete-btn-${p.id}`, danger: true },
                      ].map(({ icon, label, fn, test, danger }) => (
                        <button
                          key={label}
                          onClick={fn}
                          aria-label={`${label} ${p.name}`}
                          data-testid={test}
                          className={`w-7 h-7 rounded border border-border flex items-center justify-center text-sm text-muted transition-colors ${
                            danger ? 'hover:border-red-400 hover:text-red-500' : 'hover:border-caramel hover:text-caramel'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={total}
        pageSize={pageSize}
      />
    </div>
  )
}
