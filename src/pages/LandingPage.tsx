import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProductStore } from '@/store/productStore'
import { Topbar } from '@/components/layout/Topbar'
import { CATEGORY_EMOJI } from '@/components/products/ProductTable'

export default function LandingPage() {
  const { currentUser } = useAuthStore()
  const { fetchAllProducts, loading, allProducts } = useProductStore()
  
  useEffect(() => {
    fetchAllProducts()
  }, [])

  const active    = allProducts.filter(p => p.isActive).length
  const lowStock  = allProducts.filter(p => p.stock > 0 && p.stock < 10).length
  const outStock  = allProducts.filter(p => p.stock === 0).length
  const totalVal  = allProducts.reduce((s, p) => s + p.stock * p.pricePerUnit, 0)

  if (loading) return <div>Se încarcă...</div>
  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Acasă" subtitle={`— bun venit, ${currentUser?.firstName}!`} />

      <div className="flex-1 p-8 page-enter">
        {/* Hero */}
        <div className="mb-8 bg-brown rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(ellipse at 80% 50%, #C9A84C, transparent 60%)' }} />
          <div className="relative z-10 px-10 py-10 flex items-center justify-between gap-8">
            <div>
              <div className="font-display text-4xl font-semibold text-white mb-2">
                Dulce <span className="text-gold">Stoc</span>
              </div>
              <p className="font-display italic text-lg text-white/50 mb-4">— evidența afacerii tale, simplă</p>
              <p className="text-sm text-white/40 leading-relaxed max-w-md">
                Platformă de gestiune pentru patiserii și cofetării mici. Ține evidența
                produselor, stocurilor și prețurilor — fără foi de calcul, fără bătăi de cap.
              </p>
              <div className="flex gap-3 mt-6">
                <Link to="/app/products"
                  className="inline-flex items-center gap-2 bg-caramel text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
                  Mergi la produse →
                </Link>
                <Link to="/app/statistics"
                  className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">
                  Vezi statistici
                </Link>
              </div>
            </div>
            <div className="hidden xl:block text-8xl opacity-20 select-none">🧁</div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total produse',   value: allProducts.length, sub: `${active} active`,      color: 'text-brown' },
            { label: 'Valoare stoc',    value: `${totalVal.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`, sub: 'în inventar', color: 'text-caramel' },
            { label: 'Stoc critic',     value: lowStock, sub: 'sub 10 bucăți',              color: lowStock > 0 ? 'text-amber-600' : 'text-green-700' },
            { label: 'Epuizate',        value: outStock, sub: 'produse fără stoc',           color: outStock > 0 ? 'text-red-600' : 'text-green-700' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-surface border border-border rounded-xl p-5">
              <div className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-2">{label}</div>
              <div className={`font-display text-3xl font-semibold ${color} leading-none`}>{value}</div>
              <div className="text-xs text-muted mt-1">{sub}</div>
            </div>
          ))}
        </div>

        {/* Recent products preview */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-brown">Produse recente</span>
            <Link to="/app/products" className="text-xs text-caramel hover:text-brown-mid font-medium">
              Vezi toate →
            </Link>
          </div>
          {allProducts.slice(0, 5).map(p => (
            <Link key={p.id} to={`/app/products/${p.id}`}
              className="flex items-center gap-3 px-6 py-3 border-b border-border/50 last:border-0 hover:bg-caramel/[0.04] transition-colors">
              <div className="w-8 h-8 rounded-md bg-paper border border-border flex items-center justify-center text-lg flex-shrink-0">
                {CATEGORY_EMOJI[p.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-brown truncate">{p.name}</div>
                <div className="text-xs text-muted">{p.category}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-brown">{p.pricePerUnit.toFixed(2)} lei</div>
                <div className={`text-xs ${p.stock === 0 ? 'text-red-500' : 'text-muted'}`}>{p.stock} buc.</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
