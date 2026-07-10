import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { useCityStore } from '@/store/cityStore'
import { GET_RESCUE_DEALS } from '@/services/gql/marketplace.gql'

interface Deal {
  id: string; name: string; category: string; description?: string
  originalPrice: number; finalPrice: number; discountPercent: number
  expiryDate?: string; stock: number
  businessId: string; businessName: string; businessType: string; county: string
}

const CAT_EMOJI: Record<string, string> = {
  'Tort': '🎂', 'Ecler': '🍫', 'Croissant': '🥐', 'Prăjitură': '🍰', 'Tartă': '🥧',
}

function expiryTarget(d?: string): number | null {
  if (!d) return null
  const t = new Date(`${d}T23:59:59`).getTime()
  return isNaN(t) ? null : t
}

function fmt(diff: number): { label: string; urgent: boolean } {
  if (diff <= 0) return { label: 'Ultima șansă!', urgent: true }
  const days = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000) % 24
  const m = Math.floor(diff / 60000) % 60
  const s = Math.floor(diff / 1000) % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (days > 0) return { label: `${days}z ${pad(h)}h ${pad(m)}m ${pad(s)}s`, urgent: days === 0 }
  return { label: `${pad(h)}h ${pad(m)}m ${pad(s)}s`, urgent: h < 12 }
}

export default function RescuePage() {
  const navigate = useNavigate()
  const { city } = useCityStore()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const { data, loading } = useQuery<{ rescueDeals: Deal[] }>(GET_RESCUE_DEALS, {
    variables: { city: city || undefined },
    fetchPolicy: 'cache-and-network',
  })
  const deals = data?.rescueDeals ?? []

  return (
    <div className="page-enter">
      <div className="mb-6 text-center">
        <div className="text-4xl mb-2 inline-block animate-float">🌱</div>
        <h1 className="font-display text-3xl font-semibold text-brown">Dulce Rescue</h1>
        <p className="text-muted text-sm mt-1 max-w-xl mx-auto">
          Salvează un desert de la risipă — produse aproape de expirare, la preț redus.
          {city ? ` În ${city}.` : ' Alege un oraș de pe pagina principală pentru rezultate locale.'}
        </p>
      </div>

      {loading && deals.length === 0 ? (
        <div className="py-20 text-center text-muted text-sm">Se încarcă ofertele…</div>
      ) : deals.length === 0 ? (
        <div className="py-20 text-center text-muted text-sm">
          Momentan nu sunt oferte de salvat{city ? ` în ${city}` : ''}. Revino curând! 🧁
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-center gap-2 text-sm text-green-700">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
            {deals.length} deserturi de salvat chiar acum
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {deals.map((d) => {
              const target = expiryTarget(d.expiryDate)
              const c = target !== null ? fmt(target - now) : { label: 'Ofertă limitată', urgent: false }
              return (
                <div
                  key={d.id}
                  onClick={() => navigate(`/client/business/${d.businessId}`)}
                  className="group relative bg-surface border border-border rounded-2xl p-5 cursor-pointer hover-lift hover:border-green-400 overflow-hidden"
                >
                  {/* discount badge */}
                  <div className="absolute top-0 right-0 bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-bl-2xl">
                    −{d.discountPercent}%
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      {CAT_EMOJI[d.category] ?? '🍽️'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold text-brown truncate">{d.name}</p>
                      <p className="text-xs text-muted truncate">{d.category} · {d.businessName}</p>
                    </div>
                  </div>

                  {d.description && (
                    <p className="text-xs text-muted mb-3 line-clamp-2">{d.description}</p>
                  )}

                  {/* price */}
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-2xl font-bold text-green-700">{d.finalPrice.toFixed(2)} lei</span>
                    <span className="text-sm text-muted line-through mb-0.5">{d.originalPrice.toFixed(2)} lei</span>
                  </div>

                  {/* countdown */}
                  <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${c.urgent ? 'bg-red-50 border border-red-200' : 'bg-paper border border-border'}`}>
                    <span className="text-[11px] uppercase tracking-wide text-muted">Expiră în</span>
                    <span className={`font-mono text-sm font-semibold tabular-nums ${c.urgent ? 'text-red-600' : 'text-brown'}`}>
                      {c.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted">{d.county} · {d.stock} buc.</span>
                    <span className="text-xs font-semibold text-green-700 group-hover:translate-x-1 transition-transform duration-300 inline-block">
                      Vezi patiseria →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
