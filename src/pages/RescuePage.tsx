import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { useCityStore } from '@/store/cityStore'
import { GET_RESCUE_DEALS } from '@/services/gql/marketplace.gql'
import { dealStatus, formatCountdown } from '@/utils/deals'

interface Deal {
  id: string; name: string; category: string; description?: string
  originalPrice: number; finalPrice: number; discountPercent: number; free: boolean
  expiryDate?: string; stock: number
  businessId: string; businessName: string; businessType: string; county: string
}

const CAT_EMOJI: Record<string, string> = {
  'Tort': '🎂', 'Ecler': '🍫', 'Croissant': '🥐', 'Prăjitură': '🍰', 'Tartă': '🥧',
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
  const freeCount = deals.filter((d) => dealStatus(d.originalPrice, d.discountPercent, d.expiryDate, now).free).length

  return (
    <div className="page-enter">
      <div className="mb-6 text-center">
        <div className="text-4xl mb-2 inline-block animate-float">🌱</div>
        <h1 className="font-display text-3xl font-semibold text-brown">Dulce Rescue</h1>
        <p className="text-muted text-sm mt-1 max-w-xl mx-auto">
          Salvează un desert de la risipă — produse aproape de expirare, la preț redus.
          În <span className="font-semibold text-green-700">ultimele 24h devin GRATIS</span>.
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
            {deals.length} deserturi de salvat{freeCount > 0 ? ` · ${freeCount} GRATIS acum` : ''}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {deals.map((d) => {
              const st = dealStatus(d.originalPrice, d.discountPercent, d.expiryDate, now)
              const countdown = st.remainingMs !== null ? formatCountdown(st.remainingMs) : 'ofertă limitată'
              return (
                <div
                  key={d.id}
                  onClick={() => navigate(`/client/business/${d.businessId}`)}
                  className="group relative bg-surface border border-border rounded-2xl p-5 cursor-pointer hover-lift hover:border-green-400 overflow-hidden"
                >
                  {/* badge */}
                  <div className={`absolute top-0 right-0 text-white text-sm font-bold px-3 py-1.5 rounded-bl-2xl ${st.free ? 'bg-green-600' : 'bg-caramel'}`}>
                    {st.free ? 'GRATIS' : `−${d.discountPercent}%`}
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
                    {st.free ? (
                      <span className="text-2xl font-extrabold text-green-700">GRATIS</span>
                    ) : (
                      <span className="text-2xl font-bold text-green-700">{st.finalPrice.toFixed(2)} lei</span>
                    )}
                    <span className="text-sm text-muted line-through mb-0.5">{d.originalPrice.toFixed(2)} lei</span>
                  </div>

                  {/* countdown */}
                  <div className={`rounded-lg px-3 py-2 ${st.free ? 'bg-red-50 border border-red-200' : 'bg-paper border border-border'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wide text-muted">Expiră în</span>
                      <span className={`font-mono text-sm font-semibold tabular-nums ${st.free ? 'text-red-600' : 'text-brown'}`}>
                        {countdown}
                      </span>
                    </div>
                    {!st.free && (
                      <p className="text-[11px] text-green-700 mt-1">🎁 devine GRATIS în ultimele 24h</p>
                    )}
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
