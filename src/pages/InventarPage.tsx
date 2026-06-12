import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { useProductStore } from '@/store/productStore'
import { CATEGORY_EMOJI } from '@/types/product'

type Screen = 'intro' | 'cards' | 'summary'

interface Answer { productId: string; productName: string; oldStock: number; newStock: number }

export default function InventarPage() {
  const { fetchAllProducts, loading, allProducts, updateProduct } = useProductStore()

  useEffect(() => {
    fetchAllProducts()
  }, [])

  const [screen, setScreen]   = useState<Screen>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [qty, setQty]         = useState<number>(0)
  const [animDir, setAnimDir] = useState<'enter' | 'exit'>('enter')

  const list = allProducts // all products

  function start() {
    if (list.length === 0) return
    setAnswers([]); setCurrent(0); setQty(list[0]?.stock ?? 0)
    setScreen('cards')
  }

  function next() {
    const p = list[current]
    const newAnswers = [...answers, { productId: p.id, productName: p.name, oldStock: p.stock, newStock: qty }]
    setAnswers(newAnswers)
    setAnimDir('exit')
    setTimeout(() => {
      if (current + 1 >= list.length) {
        // Apply all updates
        newAnswers.forEach(a => {
          if (a.newStock !== a.oldStock) {
            const prod = allProducts.find(pp => pp.id === a.productId)
            // PATCH doar câmpul modificat; trimiterea întregului produs (id, userId,
            // createdAt…) pica la validare (forbidNonWhitelisted => 400).
            if (prod) updateProduct(a.productId, { stock: a.newStock })
          }
        })
        setScreen('summary')
      } else {
        setCurrent(c => c + 1)
        setQty(list[current + 1]?.stock ?? 0)
        setAnimDir('enter')
      }
    }, 250)
  }

  function adjust(delta: number) { setQty(q => Math.max(0, q + delta)) }

  const pct = list.length > 0 ? Math.round((current / list.length) * 100) : 0

  if (loading) return <div>Se încarcă...</div>

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Inventar Rapid" subtitle="— actualizare stoc" />

      <div className="flex-1 flex flex-col items-center justify-center p-8 page-enter">

        {/* INTRO */}
        {screen === 'intro' && (
          <div className="text-center max-w-sm animate-slideUp">
            <div className="text-5xl mb-5">⚡</div>
            <h2 className="font-display text-2xl font-semibold text-brown mb-3">Inventar în 60 de secunde</h2>
            <p className="text-sm text-muted leading-relaxed mb-8">
              Introduci numărul actual de bucăți pentru fiecare produs, pe rând.
              La final stocurile se actualizează automat în catalog.
            </p>
            <Button onClick={start} size="lg" className="justify-center">
              {list.length === 0 ? 'Niciun produs' : `Începe inventarul (${list.length} produse) →`}
            </Button>
          </div>
        )}

        {/* CARDS */}
        {screen === 'cards' && list[current] && (
          <div className="w-full max-w-sm">
            {/* Progress */}
            <div className="mb-6">
              <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2">
                <div className="h-full bg-caramel rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>{current} din {list.length} verificate</span>
                <span>{pct}%</span>
              </div>
            </div>

            {/* Card */}
            <div className={`bg-surface border-2 border-border rounded-2xl p-8 text-center shadow-lg mb-6 transition-all duration-250 ${animDir === 'exit' ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'}`}>
              <div className="text-6xl mb-3">{CATEGORY_EMOJI[list[current].category]}</div>
              <div className="font-display text-2xl font-semibold text-brown mb-1">{list[current].name}</div>
              <div className="text-xs text-muted uppercase tracking-wide mb-5">{list[current].category}</div>
              <div className="inline-flex items-center gap-1.5 bg-paper border border-border rounded-full px-4 py-1.5 text-xs text-muted mb-6">
                Stoc anterior: <span className="font-semibold text-brown">{list[current].stock} buc.</span>
              </div>
              {/* Number input */}
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => adjust(-1)}
                  className="w-11 h-11 rounded-full border-2 border-border bg-paper text-brown-soft text-xl font-light hover:border-caramel hover:text-caramel transition-colors">
                  −
                </button>
                <input type="number" value={qty} min={0}
                  onChange={e => setQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-24 text-center font-display text-3xl font-semibold text-brown bg-paper border-2 border-border rounded-xl py-2 outline-none focus:border-caramel [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                <button onClick={() => adjust(1)}
                  className="w-11 h-11 rounded-full border-2 border-border bg-paper text-brown-soft text-xl font-light hover:border-caramel hover:text-caramel transition-colors">
                  +
                </button>
              </div>
            </div>

            <Button onClick={next} className="w-full justify-center py-3">
              {current + 1 >= list.length ? 'Finalizează inventarul ✓' : 'Următorul produs →'}
            </Button>
          </div>
        )}

        {/* SUMMARY */}
        {screen === 'summary' && (
          <div className="w-full max-w-lg animate-slideUp">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="font-display text-2xl font-semibold text-brown">Inventar finalizat!</h2>
              <p className="text-sm text-muted mt-1">Stocurile au fost actualizate în catalog.</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3 justify-center mb-5">
              {[
                { l: 'Verificate', v: answers.length },
                { l: 'Modificate', v: answers.filter(a => a.newStock !== a.oldStock).length, col: 'text-caramel' },
                { l: 'Epuizate', v: answers.filter(a => a.newStock === 0).length, col: 'text-red-600' },
              ].map(({ l, v, col }) => (
                <div key={l} className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-center">
                  <div className={`font-display text-2xl font-semibold ${col ?? 'text-brown'}`}>{v}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wide">{l}</div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-surface border border-border rounded-lg overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-paper border-b border-border">
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">Produs</th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted">Anterior</th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted">Nou</th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map(a => {
                    const diff = a.newStock - a.oldStock
                    return (
                      <tr key={a.productId} className="border-b border-border/40 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-brown text-xs">{a.productName}</td>
                        <td className="px-4 py-2.5 text-right text-xs text-muted">{a.oldStock}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-semibold">
                          <span className={a.newStock === 0 ? 'text-red-600' : 'text-brown'}>{a.newStock}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-semibold">
                          {diff === 0
                            ? <span className="text-muted">—</span>
                            : <span className={diff > 0 ? 'text-green-600' : 'text-red-500'}>{diff > 0 ? '+' : ''}{diff}</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={start} className="flex-1 justify-center">Reîncepe</Button>
              <Button onClick={() => setScreen('intro')} className="flex-1 justify-center">Termină</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
