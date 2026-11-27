import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  AlertCircle,
  Package,
  Leaf,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  ChevronRight,
  MessageSquarePlus,
} from 'lucide-react';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { items: cartItems, addItem, updateQuantity } = useCart();

  const cartItem = product ? cartItems.find((i) => i.product.id === product.id) : null;
  const cartQty = cartItem?.quantity || 0;

  useEffect(() => {
    setLoading(true);
    setQty(1);
    apiFetch(`/products/${id}`)
      .then((res) => {
        setProduct(res.product);
        return apiFetch(`/products?category=${encodeURIComponent(res.product.category)}`);
      })
      .then((relRes) => {
        setRelated((relRes.products || []).filter((p) => String(p.id) !== String(id)).slice(0, 4));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full px-4 py-12 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl border border-[#e6e0cf] bg-[#f7f4eb]" />
          <div className="h-96 animate-pulse rounded-2xl border border-[#e6e0cf] bg-[#f7f4eb]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full px-4 py-16 text-center sm:px-8 lg:px-12">
        <p className="text-lg font-bold text-[#1f2e18]">Product not found.</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#38661d] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  function handleAddToCart() {
    addItem(product, qty);
  }

  function handleBuyNow() {
    if (cartQty === 0) {
      addItem(product, qty);
    }
    navigate('/cart');
  }

  return (
    <div className="w-full bg-white px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-[#6d7465]">
        <Link to="/" className="hover:text-[#38661d]">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-[#38661d]">
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-[#1f2e18]">{product.name}</span>
      </nav>

      {/* Main Product Card */}
      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-[#cfc6ad] bg-white p-4 shadow-sm sm:p-8 lg:grid-cols-12">
        {/* Left: Product Image */}
        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#cfc6ad] bg-[#faf9f5]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-72 w-full object-cover sm:h-[440px]"
              />
            ) : (
              <div className="flex h-72 items-center justify-center text-stone-300 sm:h-[440px]">
                <Package className="h-16 w-16" />
              </div>
            )}

            <span
              className={`absolute left-4 top-4 rounded-full px-3.5 py-1 text-xs font-bold text-white shadow-xs ${
                outOfStock ? 'bg-red-600' : lowStock ? 'bg-amber-500' : 'bg-[#38661d]'
              }`}
            >
              {outOfStock ? 'Out of Stock' : lowStock ? `Only ${product.stock} Left` : '100% Organic'}
            </span>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="flex flex-col justify-between lg:col-span-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full border border-[#e6e0cf] bg-[#f7f4eb] px-3 py-1 text-xs font-bold text-[#38661d]">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#6d7465]">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>4.9 (Verified Farm Batch)</span>
              </div>
            </div>

            <h1 className="font-serif-display mt-4 text-3xl font-bold leading-tight text-[#1f2e18] sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3 border-b border-[#ece7d8] pb-4">
              <span className="text-3xl font-extrabold text-[#38661d]">Rs. {product.price}</span>
              <span className="text-sm font-medium text-[#6d7465]">/ {product.unit}</span>
              <span className="ml-auto text-xs font-semibold text-[#6d7465]">Inclusive of all taxes</span>
            </div>

            {/* Live Stock Status Pill */}
            <div className="mt-4">
              {outOfStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700">
                  <AlertCircle className="h-4 w-4" /> Currently Out of Stock
                </span>
              ) : lowStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600" /> Hurry — Only {product.stock} unit(s) left in stock!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4e2ca] bg-[#eef5e8] px-3.5 py-2 text-xs font-bold text-[#2c4c17]">
                  <Check className="h-4 w-4" /> In Stock — {product.stock} unit(s) ready to ship
                </span>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-[#4f5947] sm:text-base">
              {product.description}
            </p>

            {/* Farm-to-Home Highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-[#e6e0cf] bg-[#f7f4eb] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1f2e18]">
                <Leaf className="h-4 w-4 shrink-0 text-[#38661d]" /> Lab-Tested Purity
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1f2e18]">
                <Truck className="h-4 w-4 shrink-0 text-[#38661d]" /> Same-Day Virar Dispatch
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1f2e18]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#38661d]" /> Secure Online &amp; COD
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1f2e18]">
                <RotateCcw className="h-4 w-4 shrink-0 text-[#38661d]" /> Easy Returns
              </div>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="mt-7 border-t border-[#ece7d8] pt-6">
            {!outOfStock && cartQty === 0 && (
              <div className="mb-4 flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6d7465]">Quantity</span>
                <div className="inline-flex items-center rounded-full border border-[#dfd9c8] bg-[#faf9f5]">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-4 py-1.5 text-base font-bold text-[#1f2e18] hover:text-[#38661d]"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold text-[#1f2e18]">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="px-4 py-1.5 text-base font-bold text-[#1f2e18] hover:text-[#38661d]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              {outOfStock ? (
                <button
                  disabled
                  className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-stone-100 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-400"
                >
                  Out of Stock
                </button>
              ) : cartQty > 0 ? (
                <div className="flex flex-1 items-center gap-3">
                  <div className="inline-flex items-center rounded-full border-2 border-[#38661d] bg-[#38661d] text-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, cartQty - 1)}
                      className="px-4 py-3 text-base font-bold hover:bg-[#2c5216] rounded-l-full"
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center text-sm font-extrabold">{cartQty} in Cart</span>
                    <button
                      type="button"
                      disabled={cartQty >= product.stock}
                      onClick={() => updateQuantity(product.id, cartQty + 1)}
                      className="px-4 py-3 text-base font-bold hover:bg-[#2c5216] rounded-r-full disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <Link
                    to="/cart"
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2c5216] py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1f3b0f]"
                  >
                    <Check className="h-4 w-4" /> View Cart
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#38661d] py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#2c5216]"
                >
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </button>
              )}

              {!outOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="flex flex-1 items-center justify-center rounded-full bg-[#f3c63f] py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#1f2e18] transition-colors hover:bg-[#e5b832]"
                >
                  Buy Now
                </button>
              )}

              <Link
                to={`/bulk-enquiry?productId=${product.id}`}
                className="flex items-center justify-center gap-1.5 rounded-full border border-[#dfd9c8] bg-[#f7f4eb] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1f2e18] hover:border-[#38661d]"
              >
                <MessageSquarePlus className="h-4 w-4 text-[#38661d]" /> Bulk Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between border-b border-[#e6e0cf] pb-3">
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-[#1f2e18]">
              More from {product.category}
            </h2>
            <Link
              to={`/?category=${encodeURIComponent(product.category)}`}
              className="text-xs font-bold uppercase tracking-wider text-[#38661d] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.id}`}
                className="flex flex-col rounded-xl border border-[#e6e0cf] bg-white p-3.5 transition-all hover:border-[#38661d]/50 hover:shadow-sm"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="mb-3 h-36 w-full rounded-lg border border-[#f0ece0] object-cover"
                />
                <span className="line-clamp-1 text-sm font-bold text-[#1f2e18]">{item.name}</span>
                <span className="mt-0.5 text-xs text-[#6d7465]">{item.unit}</span>
                <span className="mt-2 text-sm font-extrabold text-[#38661d]">Rs. {item.price}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
