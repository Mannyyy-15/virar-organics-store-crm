import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, CreditCard, Banknote, Lock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CartCheckoutPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    shipping_address: '',
    city: 'Virar West',
    pincode: '401303',
    payment_method: 'ONLINE',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Built-in Test Payment Gateway modal state
  const [testGatewaySession, setTestGatewaySession] = useState(null);
  const [gatewayBusy, setGatewayBusy] = useState(false);
  const [browserClosedNotice, setBrowserClosedNotice] = useState(false);

  async function handleCheckout(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        customer_name: form.customer_name || user.name,
        customer_phone: form.customer_phone,
        shipping_address: form.shipping_address,
        city: form.city,
        pincode: form.pincode,
        payment_method: form.payment_method,
      };

      const created = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      clearCart();

      if (form.payment_method === 'COD') {
        navigate('/orders?placed=' + created.order.order_number);
        return;
      }

      // ONLINE payment: create Stripe or Test Gateway session
      const session = await apiFetch('/payments/create-session', {
        method: 'POST',
        body: JSON.stringify({ order_id: created.order.id }),
      });

      if (session.mode === 'stripe' && session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }

      setTestGatewaySession(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTestPayment(simulateBrowserClose) {
    if (!testGatewaySession) return;
    setGatewayBusy(true);
    try {
      await apiFetch('/payments/test-gateway/complete', {
        method: 'POST',
        body: JSON.stringify({
          order_id: testGatewaySession.orderId,
          simulate_browser_close: simulateBrowserClose,
        }),
      });

      if (simulateBrowserClose) {
        setBrowserClosedNotice(true);
        setTestGatewaySession(null);
      } else {
        setTestGatewaySession(null);
        navigate('/orders?payment=success&order=' + testGatewaySession.orderNumber);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGatewayBusy(false);
    }
  }

  if (browserClosedNotice) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-lg font-bold">Simulated Browser Tab Closed!</h2>
              <p className="mt-1 text-sm">
                The customer closed the payment tab before returning to the redirect URL. However, the payment gateway sent a signed server-to-server webhook (`POST /api/webhooks/payment`), so the order was still marked <strong>Paid</strong> automatically!
              </p>
              <Link
                to="/orders"
                className="mt-4 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Verify in My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !testGatewaySession) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-stone-300" />
        <h2 className="mt-4 text-xl font-bold text-stone-900">Your cart is empty</h2>
        <p className="mt-1 text-sm text-stone-500">Add some fresh organic products to get started.</p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Browse Store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Cart & Checkout</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Items */}
        <div className="space-y-3 lg:col-span-7">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div>
                  <Link to={`/products/${product.id}`} className="font-semibold text-stone-900 hover:text-emerald-700">
                    {product.name}
                  </Link>
                  <p className="text-xs text-stone-500">
                    ₹{product.price} / {product.unit} • Stock: {product.stock}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="flex items-center rounded-lg border border-stone-300">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="px-2.5 py-1 text-sm hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="px-2.5 py-1 text-sm hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right font-semibold text-stone-900">
                  ₹{(product.price * quantity).toFixed(0)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(product.id)}
                  className="text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery & Payment Form */}
        <form
          onSubmit={handleCheckout}
          className="h-fit rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-5"
        >
          <h2 className="text-lg font-bold text-stone-900">Delivery Details</h2>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-600">Full Name *</label>
              <input
                required
                type="text"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600">Phone Number *</label>
              <input
                required
                type="tel"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                placeholder="+91 98200 00000"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600">Street Address *</label>
              <textarea
                required
                rows={2}
                value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                placeholder="Flat / Wing / Building / Landmark"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600">City *</label>
                <input
                  required
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600">Pincode *</label>
                <input
                  required
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-medium text-stone-600">Payment Method</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, payment_method: 'ONLINE' })}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-colors ${
                  form.payment_method === 'ONLINE'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="h-4 w-4" /> Online (Test Mode)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, payment_method: 'COD' })}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-colors ${
                  form.payment_method === 'COD'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Banknote className="h-4 w-4" /> Cash on Delivery
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-stone-200 pt-4">
            <div className="flex items-center justify-between text-base font-bold text-stone-900">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {!user
              ? 'Login to Place Order'
              : submitting
                ? 'Processing...'
                : form.payment_method === 'ONLINE'
                  ? `Pay ₹${totalAmount.toFixed(0)} Online`
                  : `Place COD Order (₹${totalAmount.toFixed(0)})`}
          </button>
        </form>
      </div>

      {/* Built-in Test Payment Gateway Modal */}
      {testGatewaySession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-sm font-bold text-stone-900">Virar Pay — TEST MODE</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                TEST
              </span>
            </div>

            <div className="my-5 space-y-1">
              <p className="text-xs text-stone-500">Order: {testGatewaySession.orderNumber}</p>
              <p className="text-2xl font-bold text-stone-900">₹{testGatewaySession.amount}</p>
              <p className="text-xs text-stone-500">
                Payment triggers a signed webhook (`POST /api/webhooks/payment`) with idempotency protection.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                disabled={gatewayBusy}
                onClick={() => handleTestPayment(false)}
                className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {gatewayBusy ? 'Processing...' : 'Complete Payment & Return to Store'}
              </button>

              <button
                disabled={gatewayBusy}
                onClick={() => handleTestPayment(true)}
                className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
              >
                Pay & Simulate Closing Browser Before Return (Problem 2 Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
