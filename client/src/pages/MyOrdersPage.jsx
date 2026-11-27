import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../api';

const STATUS_BADGE = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Paid: 'bg-sky-50 text-sky-800 border-sky-200',
  Shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const orderParam = searchParams.get('order') || searchParams.get('placed');

  useEffect(() => {
    apiFetch('/orders/my')
      .then((res) => setOrders(res.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">My Orders</h1>

      {(paymentSuccess || orderParam) && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            Order <strong>{orderParam}</strong> has been {paymentSuccess ? 'paid and confirmed!' : 'placed!'}
          </span>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-stone-500">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-3 text-stone-600">You haven&apos;t placed any orders yet.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <span className="font-bold text-stone-900">{order.order_number}</span>
                  <span className="ml-3 text-xs text-stone-500">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                    {order.payment_method} • {order.payment_status}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${
                      STATUS_BADGE[order.status] || 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-stone-700">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-sm">
                <span className="text-xs text-stone-500">
                  Deliver to: {order.shipping_address}, {order.city} - {order.pincode}
                </span>
                <span className="font-bold text-stone-900">Total: ₹{order.total_amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
