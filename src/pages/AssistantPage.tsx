import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client/react'
import { ASK_CONCIERGE } from '@/services/gql/ai.gql'

interface Business {
  id: string; businessName: string; businessType: string; county: string
  productionScale?: string; dietaryOptions?: string[]; productCount: number
}
interface Rec { reason: string; matchedProducts: string[]; business: Business }
interface ConciergeResult { message: string; usedAi: boolean; recommendations: Rec[] }

type Msg =
  | { role: 'user'; text: string }
  | { role: 'ai'; text: string; recs: Rec[] }

const SUGGESTIONS = [
  'Vreau ceva vegan 🌱',
  'Tort de casă pentru o aniversare',
  'Produse fără gluten',
  'Cele mai proaspete croissante de azi',
]

const TYPE_EMOJI: Record<string, string> = { Patiserie: '🥐', 'Cofetărie': '🍰', 'Brutărie': '🥖', Altele: '🍽️' }

export default function AssistantPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const [run, { loading }] = useLazyQuery<{ askConcierge: ConciergeResult }>(ASK_CONCIERGE, {
    fetchPolicy: 'no-cache',
  })

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function send(text: string) {
    const q = text.trim()
    if (!q || loading) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    try {
      const { data } = await run({ variables: { query: q } })
      const res = data?.askConcierge
      setMessages((m) => [...m, { role: 'ai', text: res?.message ?? 'Hmm, n-am găsit nimic acum.', recs: res?.recommendations ?? [] }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Asistentul nu e disponibil momentan. Mai încearcă o dată.', recs: [] }])
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <div className="text-4xl mb-2 inline-block animate-float">✨</div>
        <h1 className="font-display text-3xl font-semibold text-brown">Asistentul Dulce</h1>
        <p className="text-muted text-sm mt-1">Spune-mi ce poftești, iar eu îți recomand patiseriile potrivite.</p>
      </div>

      <div className="space-y-4 mb-6">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-sm bg-surface border border-border rounded-full px-4 py-2 text-brown hover:border-caramel hover:text-caramel hover:-translate-y-0.5 transition-all">
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => m.role === 'user' ? (
          <div key={i} className="flex justify-end animate-fade-in-up">
            <div className="bg-caramel text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] text-sm">{m.text}</div>
          </div>
        ) : (
          <div key={i} className="space-y-3 stagger-children">
            <div className="flex justify-start">
              <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm text-brown leading-relaxed">
                <span className="mr-1">🤖</span>{m.text}
              </div>
            </div>
            {m.recs.map((r) => (
              <button
                key={r.business.id}
                onClick={() => navigate(`/client/business/${r.business.id}`)}
                className="group w-full text-left bg-surface border border-border rounded-xl p-4 hover:border-caramel hover-lift"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-caramel/10 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 group-hover:bg-caramel/20 transition-all duration-300">
                    {TYPE_EMOJI[r.business.businessType] ?? '🍽️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display font-semibold text-brown">{r.business.businessName}</p>
                      <span className="text-xs text-muted flex-shrink-0">{r.business.county} →</span>
                    </div>
                    <p className="text-xs text-muted">
                      {r.business.businessType}{r.business.productionScale ? ` • ${r.business.productionScale}` : ''}
                    </p>
                    <p className="text-sm text-brown-soft mt-1.5">{r.reason}</p>
                    {r.matchedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.matchedProducts.map((p) => (
                          <span key={p} className="text-[11px] bg-paper border border-border rounded-full px-2 py-0.5 text-caramel">{p}</span>
                        ))}
                      </div>
                    )}
                    {(r.business.dietaryOptions?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {r.business.dietaryOptions!.map((d) => (
                          <span key={d} className="text-[10px] bg-green-50 border border-green-200 text-green-700 rounded-full px-2 py-0.5">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 bg-caramel rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="sticky bottom-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: vreau eclere vegane azi…"
          className="flex-1 bg-surface border border-border rounded-full px-5 py-3 text-sm text-brown outline-none focus:border-caramel shadow-sm"
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="bg-caramel text-white w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 flex-shrink-0 shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100">
          ➤
        </button>
      </form>
    </div>
  )
}
