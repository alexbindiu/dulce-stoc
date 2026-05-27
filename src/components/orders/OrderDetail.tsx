import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Order, OrderItem, OrderStatus } from '@/pages/OrdersPage';

interface Product { id: string; name: string; pricePerUnit: number; }

interface Props {
  order: Order;
  products: Product[];
  onAddItem: (productId: string, quantity: number) => void;
  onUpdateItem: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateStatus: (status: OrderStatus) => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'În așteptare', CONFIRMED: 'Confirmată',
  COMPLETED: 'Finalizată', CANCELLED: 'Anulată',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'CONFIRMED', CONFIRMED: 'COMPLETED',
};

export function OrderDetail({ order, products, onAddItem, onUpdateItem, onRemoveItem, onUpdateStatus }: Props) {
  const [addProductId, setAddProductId] = useState(products[0]?.id ?? '');
  const [addQuantity, setAddQuantity]   = useState(1);
  const [editingItem, setEditingItem]   = useState<string | null>(null);
  const [editQty, setEditQty]           = useState(1);

  const canEdit = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div className="p-1 space-y-5">
      {/* Header info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-paper border border-border rounded-lg p-3">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Client</p>
          <p className="font-semibold text-brown">{order.customerName}</p>
          {order.customerPhone && <p className="text-xs text-muted">{order.customerPhone}</p>}
        </div>
        <div className="bg-paper border border-border rounded-lg p-3">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Status</p>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <div className="bg-paper border border-border rounded-lg p-3">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Valoare totală</p>
          <p className="text-lg font-semibold text-brown">{order.totalValue.toFixed(2)} lei</p>
        </div>
        <div className="bg-paper border border-border rounded-lg p-3">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Data</p>
          <p className="text-sm text-brown">{new Date(order.createdAt).toLocaleDateString('ro-RO')}</p>
        </div>
      </div>

      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          📝 {order.notes}
        </div>
      )}

      {/* Items list */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Produse ({order.items.length})</p>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper border-b border-border">
                {['Produs', 'Preț/buc.', 'Cantitate', 'Subtotal', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-brown">{item.product?.name ?? '—'}</td>
                  <td className="px-3 py-2.5 text-muted">{item.unitPrice.toFixed(2)} lei</td>
                  <td className="px-3 py-2.5">
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min={1} value={editQty}
                          onChange={(e) => setEditQty(parseInt(e.target.value) || 1)}
                          className="w-16 bg-paper border border-caramel rounded px-2 py-0.5 text-sm text-center"
                        />
                        <button onClick={() => { onUpdateItem(item.id, editQty); setEditingItem(null); }}
                          className="text-green-600 text-xs hover:text-green-700">✓</button>
                        <button onClick={() => setEditingItem(null)}
                          className="text-muted text-xs hover:text-brown">✕</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => canEdit && (setEditingItem(item.id), setEditQty(item.quantity))}
                        className={`font-semibold ${canEdit ? 'cursor-pointer hover:text-caramel' : ''}`}
                      >
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-semibold">{item.subtotal.toFixed(2)} lei</td>
                  <td className="px-3 py-2.5">
                    {canEdit && (
                      <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add item row */}
      {canEdit && products.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Adaugă produs</p>
          <div className="flex gap-2 items-center">
            <select
              value={addProductId}
              onChange={(e) => setAddProductId(e.target.value)}
              className="flex-1 bg-paper border border-border rounded-md px-3 py-1.5 text-sm text-brown outline-none focus:border-caramel"
            >
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.pricePerUnit.toFixed(2)} lei</option>)}
            </select>
            <input
              type="number" min={1} value={addQuantity}
              onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)}
              className="w-20 bg-paper border border-border rounded-md px-2 py-1.5 text-sm text-center outline-none focus:border-caramel"
            />
            <Button
              size="sm"
              onClick={() => { onAddItem(addProductId, addQuantity); setAddQuantity(1); }}
            >
              + Adaugă
            </Button>
          </div>
        </div>
      )}

      {/* Status transition */}
      {nextStatus && (
        <div className="flex justify-end pt-2 border-t border-border">
          <Button onClick={() => onUpdateStatus(nextStatus)}>
            → Marchează {STATUS_LABELS[nextStatus].toLowerCase()}
          </Button>
        </div>
      )}
      {order.status === 'PENDING' && (
        <div className="flex justify-end">
          <button onClick={() => onUpdateStatus('CANCELLED')} className="text-xs text-red-500 hover:text-red-700 underline">
            Anulează comanda
          </button>
        </div>
      )}
    </div>
  );
}
