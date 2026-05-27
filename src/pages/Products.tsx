import React, { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductForm } from '@/components/products/ProductForm'
import { DeleteModal } from '@/components/products/DeleteModal'
import { Modal } from '@/components/ui/Modal'
import { useProductStore } from '@/store/productStore'
import type { Product, ProductFormData } from '@/types/product'

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; product: Product }
  | { type: 'delete'; product: Product }

export default function Products() {
  const { addProduct, updateProduct, deleteProduct } = useProductStore()
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  function handleAdd() {
    setModal({ type: 'add' })
  }

  function handleEdit(product: Product) {
    setModal({ type: 'edit', product })
  }

  function handleDelete(product: Product) {
    setModal({ type: 'delete', product })
  }

  function handleClose() {
    setModal({ type: 'none' })
  }

  function handleSubmitAdd(data: ProductFormData) {
    addProduct(data)
    setModal({ type: 'none' })
  }

  function handleSubmitEdit(data: ProductFormData) {
    if (modal.type !== 'edit') return
    updateProduct(modal.product.id, data)
    setModal({ type: 'none' })
  }

  function handleConfirmDelete(id: string) {
    deleteProduct(id)
    setModal({ type: 'none' })
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Produse"
        subtitle="— catalogul tău"
      />

      <div className="flex-1 p-8">
        <ProductTable
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* ── ADD modal ── */}
      <Modal
        isOpen={modal.type === 'add'}
        onClose={handleClose}
        title="Adaugă produs"
        maxWidth="max-w-lg"
      >
        <ProductForm onSubmit={handleSubmitAdd} onCancel={handleClose} />
      </Modal>

      {/* ── EDIT modal ── */}
      <Modal
        isOpen={modal.type === 'edit'}
        onClose={handleClose}
        title="Editează produs"
        maxWidth="max-w-lg"
      >
        {modal.type === 'edit' && (
          <ProductForm
            initialData={modal.product}
            onSubmit={handleSubmitEdit}
            onCancel={handleClose}
          />
        )}
      </Modal>

      {/* ── DELETE modal ── */}
      <DeleteModal
        product={modal.type === 'delete' ? modal.product : null}
        onConfirm={handleConfirmDelete}
        onClose={handleClose}
      />
    </div>
  )
}
