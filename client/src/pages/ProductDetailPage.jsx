import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, AlertCircle, Package } from 'lucide-react';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    apiFetch(`/products/${id}`)
      .then((res) => setProduct(res.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-12 text-center text-stone-500">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-stone-600">Product not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
          Back to Store
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>

      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs md:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-stone-100">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-80 w-full object-cover md:h-96" />
          ) : (
            <div className="flex h-80 items-center justify-center text-stone-400">
              <Package className="h-14 w-14" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              {product.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">{product.name}</h1>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-900">₹{product.price}</span>
              <span className="text-sm text-stone-500">per {product.unit}</span>
            </div>

            <div className="mt-3">
              {outOfStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
                  <AlertCircle className="h-4 w-4" /> Currently Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                  In Stock — {product.stock} unit(s) available
                </span>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-stone-600">{product.description}</p>
          </div>

          <div className="mt-8 border-t border-stone-200 pt-5">
            {!outOfStock && (
              <div className="mb-4 flex items-center gap-3">
                <label className="text-sm font-medium text-stone-700">Quantity:</label>
                <div className="flex items-center rounded-lg border border-stone-300">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-stone-700 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 text-stone-700 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                disabled={outOfStock}
                onClick={handleAddToCart}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors ${
                  outOfStock
                    ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                    : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                {outOfStock ? 'Out of Stock' : added ? 'Added to Cart!' : 'Add to Cart'}
              </button>

              <Link
                to={`/bulk-enquiry?productId=${product.id}`}
                className="flex items-center justify-center rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Need Bulk Order?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
