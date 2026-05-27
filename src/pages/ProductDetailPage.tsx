import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/Topbar'
import { ProductForm } from '@/components/products/ProductForm'
import { DeleteModal } from '@/components/products/DeleteModal'
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useProductStore } from '@/store/productStore'
import { CATEGORY_EMOJI } from '@/components/products/ProductTable'
import type { ProductFormData } from '@/types/product'
import { saveLastProduct } from '@/utils/useCookieTracker'
import type { Product } from '@/types/product'

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { getProductById, updateProduct, deleteProduct } = useProductStore()
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (id) getProductById(id).then(setProduct)
  }, [id])

  useEffect(() => {
    if (product) {
      saveLastProduct(product.id, product.name)
    }
  }, [product])
  
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleUpdate(data: ProductFormData) { updateProduct(product!.id, data); setEditOpen(false) }
  function handleDelete(deletedId: string) { deleteProduct(deletedId); navigate('/app/products') }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })

  if (!product) {
    return (
      <div className="flex flex-col min-h-full">
        <Topbar title="Produs negăsit" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted">
          <span className="text-5xl">🔍</span>
          <p className="text-sm">Produsul cu ID-ul specificat nu există.</p>
          <Button variant="ghost" onClick={() => navigate('/app/products')}>← Înapoi la produse</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title={product.name}
        subtitle={`— #${product.id.slice(0, 6)}`}
        actions={
          <>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>🗑 Șterge</Button>
            <Button size="sm" onClick={() => setEditOpen(true)}>✏️ Editează</Button>
          </>
        }
      />

      <div className="flex-1 p-8 page-enter">
        <button onClick={() => navigate('/app/products')}
          className="flex items-center gap-1 text-xs text-muted hover:text-caramel mb-6 uppercase tracking-wide font-semibold">
          ← Înapoi
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 max-w-3xl">
          {/* Image */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-border to-[#D4B896] flex items-center justify-center text-8xl relative">
              {CATEGORY_EMOJI[product.category]}
              <div className="absolute top-3 right-3"><StatusBadge active={product.isActive} /></div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="font-display text-2xl font-semibold text-brown mb-1">{product.name}</h2>
              <p className="text-xs text-muted">Adăugat {fmtDate(product.createdAt)}</p>
              <div className="flex items-baseline gap-1.5 mt-4">
                <span className="font-display text-4xl font-semibold text-brown">{product.pricePerUnit.toFixed(2)}</span>
                <span className="text-sm text-muted">lei / bucată</span>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-border flex gap-8">
              <div>
                <div className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-1.5">Categorie</div>
                <CategoryBadge category={product.category} />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-1.5">Stoc</div>
                <span className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-brown'}`}>
                  {product.stock} bucăți
                </span>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-1.5">Status</div>
                <StatusBadge active={product.isActive} />
              </div>
            </div>

            {product.description && (
              <div className="px-6 py-4 border-b border-border">
                <div className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-2">Descriere</div>
                <p className="text-sm text-muted leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.ingredients.length > 0 && (
              <div className="px-6 py-4">
                <div className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">Ingrediente</div>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map(ing => (
                    <span key={ing} className="px-2.5 py-0.5 bg-paper border border-border rounded-full text-xs text-brown-mid">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Editează produs" maxWidth="max-w-lg">
        <ProductForm initialData={product} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} />
      </Modal>

      <DeleteModal
        product={deleteOpen ? product : null}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}
