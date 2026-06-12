import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { useAuthStore } from '@/store/authStore'
import { useCityStore } from '@/store/cityStore'
import { GET_CITIES, GET_BUSINESSES } from '@/services/gql/marketplace.gql'
import { CitySelect } from '@/components/client/CitySelect'
import { CityChat } from '@/components/chat/CityChat'

interface Business {
  id: string
  firstName: string
  lastName: string
  businessName: string
  businessType: string
  county: string
  phone?: string
  description?: string
  productCount: number
}

const TYPE_EMOJI: Record<string, string> = {
  Patiserie: '🥐', 'Cofetărie': '🍰', 'Brutărie': '🥖', Altele: '🍽️',
}

export default function ClientHomePage() {
  const { currentUser } = useAuthStore()
  const { city, setCity } = useCityStore()
  const navigate = useNavigate()

  const { data: citiesData } = useQuery<{ cities: string[] }>(GET_CITIES)
  const cities = citiesData?.cities ?? []

  const { data: bizData, loading } = useQuery<{ businesses: Business[] }>(GET_BUSINESSES, {
    variables: { city: city || undefined },
    skip: !city,
  })
  const businesses = bizData?.businesses ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-brown mb-2">Bun venit, {currentUser?.firstName}!</h1>
        <p className="text-muted mb-5">Alege orașul tău și descoperă afacerile locale.</p>
        <CitySelect cities={cities} value={city} onChange={setCity} />
      </div>

      {/* AI assistant entry */}
      <button
        onClick={() => navigate('/client/assistant')}
        className="w-full mb-8 flex items-center gap-4 text-left bg-gradient-to-r from-caramel/15 to-gold/10 border border-caramel/30 rounded-2xl px-5 py-4 hover:shadow-md hover:border-caramel transition-all"
      >
        <span className="text-3xl">✨</span>
        <div className="flex-1">
          <p className="font-display text-lg font-semibold text-brown">Asistentul Dulce</p>
          <p className="text-sm text-muted">Întreabă-mă ce poftești — „ceva vegan”, „tort de casă” — și-ți găsesc patiseria potrivită.</p>
        </div>
        <span className="text-caramel font-semibold hidden sm:block">Întreabă →</span>
      </button>

      {!city ? (
        <div className="py-20 text-center text-muted text-sm">Selectează un oraș pentru a vedea afacerile disponibile.</div>
      ) : loading ? (
        <div className="py-20 text-center text-muted text-sm">Se încarcă afacerile…</div>
      ) : businesses.length === 0 ? (
        <div className="py-20 text-center text-muted text-sm">Nicio afacere înregistrată în {city} momentan.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/client/business/${b.id}`)}
              className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg hover:border-caramel transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-caramel/10 flex items-center justify-center text-xl mb-4">
                {TYPE_EMOJI[b.businessType] ?? '🍽️'}
              </div>
              <h3 className="font-display text-xl font-semibold text-brown">{b.businessName}</h3>
              <p className="text-sm text-muted mb-3">{b.businessType} • {b.county}</p>
              {b.description && <p className="text-xs text-muted mb-3 line-clamp-2">{b.description}</p>}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-xs font-semibold text-caramel">{b.productCount} produse</span>
                <span className="text-xs font-semibold text-brown">Vezi detalii →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {city && <CityChat city={city} />}
    </div>
  )
}
