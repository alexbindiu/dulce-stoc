import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductForm } from '@/components/products/ProductForm'
import { DeleteModal } from '@/components/products/DeleteModal'
import { Modal } from '@/components/ui/Modal'
import { useProductStore } from '@/store/productStore'
import type { Product, ProductFormData } from '@/types/product'
import { GeneratorPanel } from '@/components/generator/GeneratorPanel'

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; product: Product }
  | { type: 'delete'; product: Product }

export default function ProductsPage() {
  const { fetchProducts, loading, updateProduct, addProduct, deleteProduct} = useProductStore()

  useEffect(() => {
    fetchProducts()
  }, [])

  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const close = () => setModal({ type: 'none' })

  function handleSubmitAdd(data: ProductFormData) { addProduct(data); close() }
  function handleSubmitEdit(data: ProductFormData) {
    if (modal.type !== 'edit') return
    updateProduct(modal.product.id, data); close()
  }
  function handleConfirmDelete(id: string) { deleteProduct(id); close() }

  if (loading) return <div>Se încarcă...</div>
  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Produse" subtitle="— catalogul tău" />

      <div className="flex-1 p-8 page-enter">
        <ProductTable
          onAdd={() => setModal({ type: 'add' })}
          onEdit={p => setModal({ type: 'edit', product: p })}
          onDelete={p => setModal({ type: 'delete', product: p })}
        />
      </div>

      <div className="mb-6">
        <GeneratorPanel />
      </div>

      <Modal isOpen={modal.type === 'add'} onClose={close} title="Adaugă produs" maxWidth="max-w-lg">
        <ProductForm onSubmit={handleSubmitAdd} onCancel={close} />
      </Modal>

      <Modal isOpen={modal.type === 'edit'} onClose={close} title="Editează produs" maxWidth="max-w-lg">
        {modal.type === 'edit' && (
          <ProductForm initialData={modal.product} onSubmit={handleSubmitEdit} onCancel={close} />
        )}
      </Modal>

      <DeleteModal
        product={modal.type === 'delete' ? modal.product : null}
        onConfirm={handleConfirmDelete}
        onClose={close}
      />
    </div>
  )
}
