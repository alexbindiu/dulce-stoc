import React from 'react'
import { useAuthStore } from '@/store/authStore'

export default function ClientHomePage() {
  const { currentUser } = useAuthStore()

  // Afaceri hardcodate pentru demo vizual (cum a cerut profu: doar layout-ul)
  const businesses = [
    { name: "Patiseria Anei", county: "Cluj", type: "Patiserie", rating: "4.9" },
    { name: "Laboratorul de Dulce", county: "București", type: "Cofetărie", rating: "4.7" },
    { name: "Brutăria Tradițională", county: "Brașov", type: "Brutărie", rating: "5.0" },
  ]

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-4xl font-semibold text-brown mb-2">Bun venit, {currentUser?.firstName}!</h1>
        <p className="text-muted">Descoperă cele mai bune dulciuri și produse de panificație de la partenerii noștri locali.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((b, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg hover:border-caramel transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-caramel/10 flex items-center justify-center text-xl mb-4">
              {b.type === 'Patiserie' ? '🥐' : b.type === 'Cofetărie' ? '🍰' : '🥖'}
            </div>
            <h3 className="font-display text-xl font-semibold text-brown">{b.name}</h3>
            <p className="text-sm text-muted mb-4">{b.type} • {b.county}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="text-xs font-semibold text-caramel">⭐ {b.rating}</span>
              <button className="text-xs font-semibold text-brown hover:text-caramel">Vezi catalog →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}