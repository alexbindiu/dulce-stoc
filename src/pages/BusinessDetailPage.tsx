import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { useAuthStore } from '@/store/authStore'
import { GET_BUSINESS, GET_BUSINESS_PRODUCTS } from '@/services/gql/marketplace.gql'
import { useRoomChat, ChatMeta } from '@/hooks/useRoomChat'
import { ChatPanel } from '@/components/chat/ChatPanel'

interface Business {
  id: string; businessName: string; businessType: string; county: string
  phone?: string; description?: string; productCount: number
  productionScale?: string; dietaryOptions?: string[]; specialties?: string
}
interface CatalogProduct {
  id: string; name: string; category: string; pricePerUnit: number; stock: number
  description?: string; expiryDate?: string
}

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()

  const { data: bizData, loading } = useQuery<{ business: Business }>(GET_BUSINESS, { variables: { id }, skip: !id })
  const { data: prodData } = useQuery<{ businessProducts: CatalogProduct[] }>(GET_BUSINESS_PRODUCTS, { variables: { businessId: id }, skip: !id })

  const business = bizData?.business
  const products = prodData?.businessProducts ?? []

  const room = business && currentUser ? `dm:${business.id}:${currentUser.id}` : null
  const meta: ChatMeta | null = useMemo(() => {
    if (!business || !currentUser) return null
    return {
      kind: 'DM',
      senderId: currentUser.id,
      senderName: currentUser.firstName,
      senderRole: 'CLIENT',
      businessId: business.id,
      businessName: business.businessName,
      clientId: currentUser.id,
      clientName: currentUser.firstName,
    }
  }, [business, currentUser])

  const { messages, sendMessage } = useRoomChat(room, meta)

  if (loading) return <div className="py-20 text-center text-muted text-sm">Se încarcă…</div>
  if (!business) return <div className="py-20 text-center text-muted text-sm">Afacerea nu a fost găsită.</div>

  return (
    <div className="page-enter">
      <button onClick={() => navigate('/client')} className="group inline-flex items-center gap-1 text-sm text-caramel hover:text-brown mb-4 transition-colors">
        <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span> Înapoi la afaceri
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile + catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h1 className="font-display text-3xl font-semibold text-brown">{business.businessName}</h1>
            <p className="text-sm text-muted">{business.businessType} • {business.county}</p>
            {business.phone && <p className="text-sm text-brown mt-2">📞 {business.phone}</p>}
            {business.description && <p className="text-sm text-muted mt-3 leading-relaxed">{business.description}</p>}
            {(business.productionScale || business.specialties || (business.dietaryOptions?.length ?? 0) > 0) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {business.productionScale && (
                  <span className="text-xs bg-paper border border-border rounded-full px-2.5 py-1 text-brown-soft">🏠 {business.productionScale}</span>
                )}
                {business.specialties && (
                  <span className="text-xs bg-paper border border-border rounded-full px-2.5 py-1 text-brown-soft">⭐ {business.specialties}</span>
                )}
                {business.dietaryOptions?.map((d) => (
                  <span key={d} className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-full px-2.5 py-1">{d}</span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold text-brown mb-4">Produse disponibile ({products.length})</h2>
            {products.length === 0 ? (
              <p className="text-sm text-muted">Această afacere nu are produse disponibile momentan.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
                {products.map((p) => (
                  <div key={p.id} className="border border-border rounded-lg p-3 flex items-start justify-between hover:border-caramel hover-lift">
                    <div className="min-w-0">
                      <p className="font-semibold text-brown text-sm">{p.name}</p>
                      <p className="text-xs text-muted">{p.category}</p>
                      {p.description && <p className="text-xs text-muted mt-1 line-clamp-2">{p.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-semibold text-brown">{p.pricePerUnit.toFixed(2)} lei</p>
                      <p className={`text-xs ${p.stock === 0 ? 'text-red-500' : 'text-muted'}`}>
                        {p.stock === 0 ? 'Epuizat' : `${p.stock} buc.`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Direct chat with the business */}
        <div className="lg:col-span-1">
          <ChatPanel
            title={`Chat cu ${business.businessName}`}
            subtitle="Întreabă direct afacerea"
            messages={messages}
            meId={currentUser?.id ?? ''}
            onSend={sendMessage}
            emptyText="Trimite un mesaj — afacerea îți va răspunde aici."
            className="h-[32rem]"
          />
        </div>
      </div>
    </div>
  )
}
