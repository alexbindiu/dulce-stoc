import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { ChartsPanel } from '@/components/statistics/ChartsPanel'
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ProductForm } from '@/components/products/ProductForm'
import { DeleteModal } from '@/components/products/DeleteModal'
import { useProductStore } from '@/store/productStore'
import { CATEGORY_EMOJI } from '@/components/products/ProductTable'
import type { Product, ProductFormData } from '@/types/product'

type ModalState = { type: 'none' } | { type: 'edit'; product: Product } | { type: 'delete'; product: Product }

export default function StatisticsPage() {
  const { allProducts, updateProduct, deleteProduct, fetchAllProducts, loading } = useProductStore()
  
  const [modal, setModal]   = useState<ModalState>({ type: 'none' })
  const [highlight, setHL]  = useState<string | null>(null)   // id of last-changed row

  const close = () => setModal({ type: 'none' })

  useEffect(() => {
    fetchAllProducts()
  }, [])

  function handleUpdate(data: ProductFormData) {
    if (modal.type !== 'edit') return
    const id = modal.product.id
    updateProduct(id, data)
    setHL(id)
    setTimeout(() => setHL(null), 1500)
    close()
  }

  function handleDelete(id: string) {
    deleteProduct(id); close()
  }

  if (loading) return <div>Se încarcă...</div>

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Statistici" subtitle="— vizualizare live" />

      <div className="flex-1 p-6 page-enter">
        {/* Explanation banner */}
        <div className="mb-5 px-4 py-3 bg-surface border border-caramel/30 border-l-2 border-l-caramel rounded-lg text-xs text-muted leading-relaxed">
          <span className="font-semibold text-brown">Vizualizare side-by-side</span> — editează sau șterge un produs din tabel
          și graficele din dreapta se actualizează <span className="text-caramel font-semibold">în timp real</span>, automat.
        </div>

        {/* Two-column layout: table left, charts right */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">

          {/* ── LEFT: Tabular view ── */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-paper flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest uppercase text-muted">
                Tabel produse ({allProducts.length})
              </span>
              <span className="text-[10px] text-muted italic">Editează → graficele se actualizează</span>
            </div>

            {allProducts.length === 0 ? (
              <div className="py-12 text-center text-muted text-sm">
                Niciun produs. Adaugă produse din pagina Produse.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Produs', 'Cat.', 'Preț', 'Stoc', 'Status', ''].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest uppercase text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allProducts.map(p => (
                      <tr key={p.id}
                        className={`border-b border-border/40 last:border-0 transition-all duration-700 ${
                          highlight === p.id
                            ? 'bg-gold/10'
                            : 'hover:bg-caramel/[0.03]'
                        }`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{CATEGORY_EMOJI[p.category]}</span>
                            <div>
                              <div className="font-semibold text-brown text-xs leading-tight">{p.name}</div>
                              <div className="text-[10px] text-muted">#{p.id.slice(0, 5)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><CategoryBadge category={p.category} /></td>
                        <td className="px-4 py-3 font-semibold text-xs whitespace-nowrap">{p.pricePerUnit.toFixed(2)} lei</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={p.stock === 0 ? 'text-red-600 font-bold' : ''}>{p.stock}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge active={p.isActive} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setModal({ type: 'edit', product: p })}
                              className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs text-muted hover:border-caramel hover:text-caramel"
                              title="Editează">✏️</button>
                            <button onClick={() => setModal({ type: 'delete', product: p })}
                              className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs text-muted hover:border-red-400 hover:text-red-500"
                              title="Șterge">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mini totals footer */}
            <div className="px-5 py-3 border-t border-border bg-paper grid grid-cols-3 gap-2 text-center">
              {[
                { l: 'Total', v: allProducts.length },
                { l: 'Stoc total', v: allProducts.reduce((s, p) => s + p.stock, 0) + ' buc.' },
                { l: 'Valoare', v: allProducts.reduce((s, p) => s + p.stock * p.pricePerUnit, 0).toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' lei' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="text-[9px] uppercase tracking-widest text-muted">{l}</div>
                  <div className="text-sm font-semibold text-brown">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Charts view ── */}
          <div>
            <div className="px-5 py-3.5 bg-surface border border-border rounded-t-xl border-b-0 flex items-center">
              <span className="text-xs font-semibold tracking-widest uppercase text-muted">
                Grafice live
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted">Sincronizat cu tabelul</span>
              </div>
            </div>
            <div className="bg-surface border border-border border-t-0 rounded-b-xl p-4">
              <ChartsPanel />
            </div>
          </div>

        </div>
      </div>

      {/* Edit modal */}
      <Modal isOpen={modal.type === 'edit'} onClose={close} title="Editează produs" maxWidth="max-w-lg">
        {modal.type === 'edit' && (
          <ProductForm initialData={modal.product} onSubmit={handleUpdate} onCancel={close} />
        )}
      </Modal>

      {/* Delete modal */}
      <DeleteModal
        product={modal.type === 'delete' ? modal.product : null}
        onConfirm={handleDelete}
        onClose={close}
      />
    </div>
  )
}
