import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types/product'

interface Props {
  product: Product | null
  onConfirm: (id: string) => void
  onClose: () => void
}

export function DeleteModal({ product, onConfirm, onClose }: Props) {
  return (
    <Modal isOpen={product !== null} onClose={onClose} title="Ștergi produsul?">
      <div className="text-center">
        <div className="text-4xl mb-4">🗑️</div>
        <p className="text-sm text-muted leading-relaxed mb-6">
          Ești sigur că vrei să ștergi{' '}
          <strong className="text-brown">{product?.name}</strong>?{' '}
          Această acțiune nu poate fi anulată.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="ghost" onClick={onClose}>Anulează</Button>
          <Button variant="danger" onClick={() => product && onConfirm(product.id)}>
            Da, șterge
          </Button>
        </div>
      </div>
    </Modal>
  )
}
