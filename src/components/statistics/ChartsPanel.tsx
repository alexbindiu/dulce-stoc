import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useProductStore } from '@/store/productStore'
import { Category } from '@/types/product'

const CAT_COLORS: Record<Category, string> = {
  [Category.Tort]:      '#C47A3A',
  [Category.Ecler]:     '#8B5E3C',
  [Category.Croissant]: '#C9A84C',
  [Category.Prajitura]: '#A07050',
  [Category.Tarta]:     '#6B4226',
}

interface KpiProps { label: string; value: string; sub?: string }
function Kpi({ label, value, sub }: KpiProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-1">{label}</div>
      <div className="font-display text-2xl font-semibold text-brown leading-none">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  )
}

export function ChartsPanel() {
  const { allProducts } = useProductStore()

  // ── Derived stats ─────────────────────────────────
  const active       = allProducts.filter(p => p.isActive)
  const totalStock   = allProducts.reduce((s, p) => s + p.stock, 0)
  const stockValue   = allProducts.reduce((s, p) => s + p.stock * p.pricePerUnit, 0)
  const avgPrice     = allProducts.length
    ? allProducts.reduce((s, p) => s + p.pricePerUnit, 0) / allProducts.length
    : 0

  // Stock per product (bar chart)
  const stockData = [...allProducts]
    .sort((a, b) => b.stock - a.stock)
    .map(p => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name, stock: p.stock, fill: CAT_COLORS[p.category] }))

  // Category distribution (pie)
  const catMap: Partial<Record<Category, number>> = {}
  allProducts.forEach(p => { catMap[p.category] = (catMap[p.category] ?? 0) + 1 })
  const pieData = Object.entries(catMap).map(([cat, count]) => ({
    name: cat, value: count, fill: CAT_COLORS[cat as Category],
  }))

  // Price per product (bar chart)
  const priceData = [...allProducts]
    .sort((a, b) => b.pricePerUnit - a.pricePerUnit)
    .map(p => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name, pret: p.pricePerUnit }))

  // Stock value per product
  const valueData = [...allProducts]
    .sort((a, b) => (b.stock * b.pricePerUnit) - (a.stock * a.pricePerUnit))
    .map(p => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name, valoare: parseFloat((p.stock * p.pricePerUnit).toFixed(2)) }))

  const tooltipStyle = {
    backgroundColor: '#FDFAF5',
    border: '1px solid #E2D5C0',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#2E1A0E',
  }

  const formatLei = (value: unknown, label: string): [string, string] => {
    const raw = Array.isArray(value) ? value[0] : value
    const numeric = typeof raw === 'number' ? raw : Number(raw)
    const safeValue = Number.isFinite(numeric) ? numeric : 0
    return [`${safeValue} lei`, label]
  }

  if (allProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted gap-3">
        <span className="text-4xl">📊</span>
        <p className="text-sm">Adaugă produse pentru a vedea statistici.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Kpi label="Total produse" value={String(allProducts.length)} sub={`${active.length} active`} />
        <Kpi label="Stoc total" value={`${totalStock}`} sub="bucăți" />
        <Kpi label="Valoare stoc" value={`${stockValue.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`} />
        <Kpi label="Preț mediu" value={`${avgPrice.toFixed(2)} lei`} sub="per bucată" />
      </div>

      {/* Row 1: Stock bar + Category pie */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">
            Stoc per produs
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stockData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9A8070' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9A8070' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="stock" radius={[3, 3, 0, 0]}>
                {stockData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">
            Distribuție categorii
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" nameKey="name" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v: string) => <span style={{ fontSize: 11, color: '#2E1A0E' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted text-sm">Fără date</div>
          )}
        </div>
      </div>

      {/* Row 2: Price bar + Value bar */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">
            Preț per produs (lei / buc.)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={priceData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9A8070' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9A8070' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatLei(v, 'Preț')} />
              <Bar dataKey="pret" fill="#C47A3A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">
            Valoare stoc per produs (lei)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={valueData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9A8070' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9A8070' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatLei(v, 'Valoare')} />
              <Bar dataKey="valoare" fill="#C9A84C" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
