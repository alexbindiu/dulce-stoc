import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Modal } from '@/components/ui/Modal'

interface CatalogItem { name: string; price: number; emoji: string }
interface Business {
  name: string
  county: string
  type: string
  rating: string
  catalog: CatalogItem[]
}

export default function ClientHomePage() {
  const { currentUser } = useAuthStore()
  const [selected, setSelected] = useState<Business | null>(null)

  // Afaceri hardcodate pentru demo vizual (cum a cerut profu: doar layout-ul)
  const businesses: Business[] = [
    {
      name: 'Patiseria Anei', county: 'Cluj', type: 'Patiserie', rating: '4.9',
      catalog: [
        { name: 'Croissant cu unt', price: 6.5, emoji: '🥐' },
        { name: 'Plăcintă cu mere', price: 8.0, emoji: '🥧' },
        { name: 'Cornuri cu ciocolată', price: 5.0, emoji: '🥐' },
        { name: 'Tartă cu fructe de pădure', price: 12.0, emoji: '🍓' },
      ],
    },
    {
      name: 'Laboratorul de Dulce', county: 'București', type: 'Cofetărie', rating: '4.7',
      catalog: [
        { name: 'Tort Red Velvet (felie)', price: 18.0, emoji: '🍰' },
        { name: 'Eclere cu vanilie', price: 7.5, emoji: '🧁' },
        { name: 'Macarons (6 buc.)', price: 30.0, emoji: '🍬' },
        { name: 'Cheesecake', price: 15.0, emoji: '🍰' },
      ],
    },
    {
      name: 'Brutăria Tradițională', county: 'Brașov', type: 'Brutărie', rating: '5.0',
      catalog: [
        { name: 'Pâine de casă', price: 9.0, emoji: '🍞' },
        { name: 'Covrigi (5 buc.)', price: 10.0, emoji: '🥨' },
        { name: 'Baghetă franțuzească', price: 7.0, emoji: '🥖' },
        { name: 'Chifle cu susan', price: 4.0, emoji: '🥯' },
      ],
    },
  ]

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-4xl font-semibold text-brown mb-2">Bun venit, {currentUser?.firstName}!</h1>
        <p className="text-muted">Descoperă cele mai bune dulciuri și produse de panificație de la partenerii noștri locali.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((b, i) => (
          <div
            key={i}
            onClick={() => setSelected(b)}
            className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg hover:border-caramel transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-caramel/10 flex items-center justify-center text-xl mb-4">
              {b.type === 'Patiserie' ? '🥐' : b.type === 'Cofetărie' ? '🍰' : '🥖'}
            </div>
            <h3 className="font-display text-xl font-semibold text-brown">{b.name}</h3>
            <p className="text-sm text-muted mb-4">{b.type} • {b.county}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="text-xs font-semibold text-caramel">⭐ {b.rating}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(b) }}
                className="text-xs font-semibold text-brown hover:text-caramel"
              >
                Vezi catalog →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Catalog modal */}
      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Catalog — ${selected.name}` : ''}
        maxWidth="max-w-lg"
      >
        {selected && (
          <div className="space-y-2">
            <p className="text-sm text-muted mb-3">{selected.type} • {selected.county} • ⭐ {selected.rating}</p>
            {selected.catalog.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-paper border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-medium text-brown">{item.name}</span>
                </div>
                <span className="font-semibold text-caramel">{item.price.toFixed(2)} lei</span>
              </div>
            ))}
            <p className="text-xs text-muted text-center pt-3">
              Catalog demonstrativ — comenzile online vor fi disponibile în curând.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
