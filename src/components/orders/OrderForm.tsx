import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Order, OrderStatus } from '@/pages/OrdersPage';

interface Product { id: string; name: string; pricePerUnit: number; stock: number; }

interface Props {
  order?: Order;
  products: Product[];
  editMode?: boolean;
  onSubmit: (input: any) => void;
  onCancel: () => void;
}

export function OrderForm({ order, products, editMode, onSubmit, onCancel }: Props) {
  const [customerName, setCustomerName]   = useState(order?.customerName ?? '');
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone ?? '');
  const [notes, setNotes]                 = useState(order?.notes ?? '');
  const [status, setStatus]               = useState<OrderStatus>(order?.status ?? 'PENDING');
  const [items, setItems]                 = useState<{ productId: string; quantity: number }[]>(
    editMode ? [] : [{ productId: products[0]?.id ?? '', quantity: 1 }],
  );

  const STATUS_LABELS = { PENDING: 'În așteptare', CONFIRMED: 'Confirmată', COMPLETED: 'Finalizată', CANCELLED: 'Anulată' };

  function addItem() {
    setItems((prev) => [...prev, { productId: products[0]?.id ?? '', quantity: 1 }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: 'productId' | 'quantity', value: string | number) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  const totalPreview = items.reduce((sum, item) => {
    const p = products.find((pr) => pr.id === item.productId);
    return sum + (p ? p.pricePerUnit * item.quantity : 0);
  }, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) return;
    const input: any = { customerName, customerPhone: customerPhone || undefined, notes: notes || undefined, status };
    if (!editMode) input.items = items.filter((i) => i.productId && i.quantity > 0);
    onSubmit(input);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-brown-soft block mb-1">Nume client *</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-brown outline-none focus:border-caramel"
            placeholder="Ex: Ana Ionescu"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-brown-soft block mb-1">Telefon</label>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-brown outline-none focus:border-caramel"
            placeholder="07xx-xxx-xxx"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-brown-soft block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-brown outline-none focus:border-caramel"
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-brown-soft block mb-1">Observații</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-brown outline-none focus:border-caramel resize-none"
            placeholder="Ex: Livrare după ora 16:00"
          />
        </div>
      </div>

      {!editMode && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-brown-soft">Produse</span>
            <button type="button" onClick={addItem} className="text-xs text-caramel hover:text-brown-mid">+ Adaugă produs</button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const selectedProduct = products.find((p) => p.id === item.productId);
              return (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                    className="flex-1 bg-paper border border-border rounded-md px-2 py-1.5 text-sm text-brown outline-none focus:border-caramel"
                  >
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input
                    type="number" min={1} value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 bg-paper border border-border rounded-md px-2 py-1.5 text-sm text-brown outline-none focus:border-caramel text-center"
                  />
                  <span className="text-xs text-muted w-20 text-right">
                    {selectedProduct ? `${(selectedProduct.pricePerUnit * item.quantity).toFixed(2)} lei` : '—'}
                  </span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                  )}
                </div>
              );
            })}
          </div>

          {items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex justify-end">
              <span className="text-sm font-semibold text-brown">Total: {totalPreview.toFixed(2)} lei</span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel}>Anulează</Button>
        <Button type="submit">{editMode ? '💾 Salvează' : '+ Crează comandă'}</Button>
      </div>
    </form>
  );
}
