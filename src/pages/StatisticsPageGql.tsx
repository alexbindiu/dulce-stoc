import React, { useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Topbar } from '@/components/layout/Topbar';
import { GET_STATISTICS } from '@/services/gql/statistics.gql';
import { ON_BATCH_ADDED } from '@/services/gql/products.gql';
import { ON_ORDER_CREATED, ON_ORDER_UPDATED, ON_ORDER_DELETED } from '@/services/gql/orders.gql';
import { apolloClient } from '@/services/graphql-client';
import { GeneratorPanel } from '@/components/generator/GeneratorPanel';
import { Category } from '@/types/product';

const CAT_COLORS: Record<string, string> = {
  [Category.Tort]: '#C47A3A', [Category.Ecler]: '#8B5E3C',
  [Category.Croissant]: '#C9A84C', [Category.Prajitura]: '#A07050', [Category.Tarta]: '#6B4226',
};

const ORDER_STATUS_COLORS = ['#C9A84C', '#378ADD', '#1D9E75', '#888780'];

const tooltipStyle = { backgroundColor: '#FDFAF5', border: '1px solid #E2D5C0', borderRadius: '6px', fontSize: '12px' };

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-surface border rounded-lg p-4 hover-lift ${accent ? 'border-caramel/40' : 'border-border'}`}>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-1">{label}</div>
      <div className={`font-display text-2xl font-semibold leading-none ${accent ? 'text-caramel' : 'text-brown'}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

export default function StatisticsPageGql() {
  const { data, loading, refetch } = useQuery(GET_STATISTICS, { fetchPolicy: 'cache-and-network' });

  const refetchStats = () => {
    apolloClient.cache.evict({ fieldName: 'statistics' });
    refetch();
  };

  // Re-fetch on any live event
  useSubscription(ON_BATCH_ADDED,    { onData: refetchStats });
  useSubscription(ON_ORDER_CREATED,  { onData: refetchStats });
  useSubscription(ON_ORDER_UPDATED,  { onData: refetchStats });
  useSubscription(ON_ORDER_DELETED,  { onData: refetchStats });

  const s = data?.statistics;
  if (loading && !s) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-caramel border-t-transparent rounded-full animate-spin" /></div>;

  const stockData = s?.byCategory?.map((c: any) => ({ name: c.category, stock: c.totalStock, fill: CAT_COLORS[c.category] ?? '#888' })) ?? [];
  const pieData   = s?.byCategory?.map((c: any) => ({ name: c.category, value: c.count,       fill: CAT_COLORS[c.category] ?? '#888' })) ?? [];
  const orderPieData = s ? [
    { name: 'În așteptare', value: s.orders.pendingOrders },
    { name: 'Confirmate',   value: s.orders.confirmedOrders },
    { name: 'Finalizate',   value: s.orders.completedOrders },
    { name: 'Anulate',      value: s.orders.cancelledOrders },
  ].filter((d) => d.value > 0) : [];

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Statistici" subtitle="— live dashboard" />
      <div className="flex-1 p-6 space-y-6">

        {/* Product KPIs */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Produse</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 stagger-children">
            <KpiCard label="Total produse" value={String(s?.totalProducts ?? 0)} sub={`${s?.activeProducts ?? 0} active`} />
            <KpiCard label="Stoc total" value={`${s?.totalStock ?? 0}`} sub="bucăți" />
            <KpiCard label="Valoare stoc" value={`${(s?.totalStockValue ?? 0).toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`} accent />
            <KpiCard label="Preț mediu" value={`${s?.averagePrice ?? 0} lei`} sub="per bucată" />
          </div>
        </div>

        {/* Order KPIs */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Comenzi</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 stagger-children">
            <KpiCard label="Total comenzi"   value={String(s?.orders?.totalOrders ?? 0)} />
            <KpiCard label="În așteptare"    value={String(s?.orders?.pendingOrders ?? 0)} />
            <KpiCard label="Venit total"     value={`${(s?.orders?.totalRevenue ?? 0).toFixed(2)} lei`} accent />
            <KpiCard label="Valoare medie"   value={`${(s?.orders?.averageOrderValue ?? 0).toFixed(2)} lei`} sub="per comandă" />
          </div>
        </div>

        {/* Charts row 1: stock + category distribution */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">Stoc per categorie</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stockData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9A8070' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9A8070' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="stock" radius={[3,3,0,0]}>
                  {stockData.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">Distribuție produse</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" nameKey="name" paddingAngle={2}>
                  {pieData.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ fontSize: 11, color: '#2E1A0E' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2: orders status + top products by revenue */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">Status comenzi</p>
            {orderPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={orderPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" nameKey="name" paddingAngle={2}>
                    {orderPieData.map((_: any, i: number) => <Cell key={i} fill={ORDER_STATUS_COLORS[i % ORDER_STATUS_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ fontSize: 11, color: '#2E1A0E' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted text-sm">Fără date</div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-caramel mb-3">Top produse după vânzări</p>
            {(s?.orders?.revenueByProduct?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {s.orders.revenueByProduct.slice(0, 6).map((item: any, i: number) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-brown truncate">{item.productName}</div>
                      <div className="text-[10px] text-muted">{item.totalQuantity} buc. vândute</div>
                    </div>
                    <span className="text-sm font-semibold text-caramel whitespace-nowrap">{item.totalRevenue.toFixed(2)} lei</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted text-sm">Nicio comandă finalizată</div>
            )}
          </div>
        </div>

        {/* Generator de date — sub statistici */}
        <GeneratorPanel />

      </div>
    </div>
  );
}
