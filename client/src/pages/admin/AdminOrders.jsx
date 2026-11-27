import { useEffect, useState } from 'react';
import { apiFetch } from '../../api';

const ORDER_STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    setLoading(true);
    try {
      const q = statusFilter !== 'All' ? `?status=${statusFilter}` : '';
      const res = await apiFetch(`/admin/orders${q}`);
      setOrders(res.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function handleStatusChange(order, newStatus) {
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
      const ok = window.confirm(
        `Cancel order ${order.order_number}? This will automatically return all item quantities back to product stock.`
      );
      if (!ok) return;
    }

    setError('');
    try {
      const res = await apiFetch(`/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? res.order : o)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-stone-900">Orders ({orders.length})</h2>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...ORDER_STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusFilter === st
                  ? 'bg-emerald-700 text-white'
                  : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-stone-500">Loading orders...</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <span className="font-bold text-stone-900">{order.order_number}</span>
                  <span className="ml-2 text-xs text-stone-500">
                    {order.customer_name} ({order.customer_phone})
                  </span>
                  <p className="text-xs text-stone-500">
                    {order.shipping_address}, {order.city} - {order.pincode}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                    {order.payment_method} • {order.payment_status}
                  </span>
                  <select
                    disabled={order.status === 'Cancelled'}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-800 disabled:opacity-60"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                <div>
                  {order.items?.map((i) => `${i.product_name} × ${i.quantity}`).join(' • ')}
                </div>
                <span className="text-sm font-bold text-stone-900">₹{order.total_amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
