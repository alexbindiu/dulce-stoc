import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  GET_ORDERS, CREATE_ORDER, UPDATE_ORDER, DELETE_ORDER,
  ADD_ORDER_ITEM, UPDATE_ORDER_ITEM, REMOVE_ORDER_ITEM,
  ON_ORDER_CREATED, ON_ORDER_UPDATED, ON_ORDER_DELETED,
} from '@/services/gql/orders.gql';
import { GET_PRODUCTS } from '@/services/gql/products.gql';
import { apolloClient } from '@/services/graphql-client';
import { OrderForm } from '@/components/orders/OrderForm';
import { OrderDetail } from '@/components/orders/OrderDetail';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string; orderId: string; productId: string;
  quantity: number; unitPrice: number; subtotal: number;
  product?: { id: string; name: string; category: string; pricePerUnit: number };
}

export interface Order {
  id: string; customerName: string; customerPhone?: string;
  notes?: string; status: OrderStatus;
  items: OrderItem[]; totalValue: number; totalItems: number;
  createdAt: string; updatedAt: string;
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

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'detail'; order: Order }
  | { type: 'edit'; order: Order }
  | { type: 'delete'; order: Order };

export default function OrdersPage() {
  const [modal, setModal]       = useState<ModalState>({ type: 'none' });
  const [statusFilter, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage]           = useState(1);

  const { data, loading, refetch } = useQuery(GET_ORDERS, {
    variables: { page, pageSize: 10, status: statusFilter || undefined },
    notifyOnNetworkStatusChange: true,
  });

  const { data: productsData } = useQuery(GET_PRODUCTS, {
    // pageSize max acceptat de backend este 100; 1000 pica la validare și
    // lăsa dropdown-ul de produse gol.
    variables: { query: { page: 1, pageSize: 100 } },
  });

  const allProducts = productsData?.products?.data ?? [];
  const orders: Order[] = data?.orders?.data ?? [];
  const total      = data?.orders?.total ?? 0;
  const totalPages = data?.orders?.totalPages ?? 1;

  const refetchAll = () => {
    apolloClient.cache.evict({ fieldName: 'orders' });
    refetch();
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [createOrder]     = useMutation(CREATE_ORDER,      { onCompleted: () => { setModal({ type: 'none' }); refetchAll(); } });
  const [updateOrder]     = useMutation(UPDATE_ORDER,      { onCompleted: () => { setModal({ type: 'none' }); refetchAll(); } });
  const [deleteOrder]     = useMutation(DELETE_ORDER,      { onCompleted: () => { setModal({ type: 'none' }); refetchAll(); } });
  const [addItem]         = useMutation(ADD_ORDER_ITEM,    { onCompleted: refetchAll });
  const [updateItem]      = useMutation(UPDATE_ORDER_ITEM, { onCompleted: refetchAll });
  const [removeItem]      = useMutation(REMOVE_ORDER_ITEM, { onCompleted: refetchAll });

  // ── Live subscriptions ─────────────────────────────────────────────────────
  useSubscription(ON_ORDER_CREATED, { onData: () => refetchAll() });
  useSubscription(ON_ORDER_UPDATED, { onData: () => refetchAll() });
  useSubscription(ON_ORDER_DELETED, { onData: () => refetchAll() });

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Comenzi" subtitle="— gestiune comenzi clienți" />

      <div className="flex-1 p-6">
        {/* Header bar */}
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          <select
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(1); }}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-brown-soft outline-none focus:border-caramel"
          >
            <option value="">Toate statusurile</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <span className="text-xs text-muted ml-auto">{total} comenzi</span>
          <Button onClick={() => setModal({ type: 'add' })} size="sm">+ Comandă nouă</Button>
        </div>

        {/* Orders table */}
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-caramel border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-muted text-sm">
            Nicio comandă. Creează prima comandă!
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-paper border-b border-border">
                  {['Client', 'Status', 'Produse', 'Valoare', 'Data', 'Acțiuni'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 last:border-0 hover:bg-caramel/[0.03] cursor-pointer"
                    onClick={() => setModal({ type: 'detail', order })}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-brown">{order.customerName}</div>
                      {order.customerPhone && <div className="text-xs text-muted">{order.customerPhone}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{order.totalItems} buc.</td>
                    <td className="px-5 py-3.5 font-semibold text-brown">{order.totalValue.toFixed(2)} lei</td>
                    <td className="px-5 py-3.5 text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setModal({ type: 'edit', order })}
                          className="w-7 h-7 rounded border border-border flex items-center justify-center text-xs text-muted hover:border-caramel hover:text-caramel"
                        >✏️</button>
                        <button
                          onClick={() => setModal({ type: 'delete', order })}
                          className="w-7 h-7 rounded border border-border flex items-center justify-center text-xs text-muted hover:border-red-400 hover:text-red-500"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted">Pagina {page} din {totalPages}</span>
                <div className="flex gap-1">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs border border-border rounded-md disabled:opacity-40 hover:border-caramel">←</button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs border border-border rounded-md disabled:opacity-40 hover:border-caramel">→</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal isOpen={modal.type === 'add'} onClose={() => setModal({ type: 'none' })} title="Comandă nouă" maxWidth="max-w-2xl">
        <OrderForm
          products={allProducts}
          onSubmit={(input) => createOrder({ variables: { input } })}
          onCancel={() => setModal({ type: 'none' })}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal.type === 'edit'} onClose={() => setModal({ type: 'none' })} title="Editează comandă" maxWidth="max-w-lg">
        {modal.type === 'edit' && (
          <OrderForm
            order={modal.order}
            products={allProducts}
            editMode
            onSubmit={(input) => updateOrder({ variables: { id: modal.order.id, input } })}
            onCancel={() => setModal({ type: 'none' })}
          />
        )}
      </Modal>

      {/* Detail modal */}
      <Modal isOpen={modal.type === 'detail'} onClose={() => setModal({ type: 'none' })} title="Detalii comandă" maxWidth="max-w-2xl">
        {modal.type === 'detail' && (
          <OrderDetail
            order={modal.order}
            products={allProducts}
            onAddItem={(productId, quantity) => addItem({ variables: { orderId: modal.order.id, productId, quantity } })}
            onUpdateItem={(itemId, quantity) => updateItem({ variables: { itemId, quantity } })}
            onRemoveItem={(itemId) => removeItem({ variables: { itemId } })}
            onUpdateStatus={(status) => updateOrder({ variables: { id: modal.order.id, input: { status } } })}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      {modal.type === 'delete' && (
        <Modal isOpen onClose={() => setModal({ type: 'none' })} title="Șterge comandă" maxWidth="max-w-sm">
          <div className="p-4">
            <p className="text-sm text-brown mb-4">
              Ești sigur că vrei să ștergi comanda lui <strong>{modal.order.customerName}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setModal({ type: 'none' })}>Anulează</Button>
              <Button onClick={() => deleteOrder({ variables: { id: modal.order.id } })} className="bg-red-600 text-white border-red-600 hover:bg-red-700">
                Șterge
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
