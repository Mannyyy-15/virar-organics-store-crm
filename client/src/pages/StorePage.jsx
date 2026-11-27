import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Check, AlertCircle, Sprout } from 'lucide-react';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    apiFetch('/products/categories')
      .then((res) => setCategories(['All', ...res.categories]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (search.trim()) params.set('search', search.trim());

    apiFetch(`/products?${params.toString()}`)
      .then((res) => setProducts(res.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  function handleAdd(product) {
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero Banner */}
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-sm sm:p-10">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-emerald-100">
            <Sprout className="h-3.5 w-3.5" />
            100% Certified Organic • Direct from Virar & Sahyadri Farms
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pure, Unadulterated Organic Foods
          </h1>
          <p className="mt-3 text-sm text-emerald-100 sm:text-base">
            Cold-pressed oils, A2 Bilona ghee, raw forest honey, and heirloom grains — delivered fresh with live stock tracking.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/bulk-enquiry"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
            >
              Request Bulk / Wholesale Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white'
                  : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search honey, ghee, oil..."
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl border border-stone-200 bg-stone-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
          <p className="text-stone-600">No organic products matched your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const outOfStock = product.stock <= 0;
            const lowStock = product.stock > 0 && product.stock <= 3;

            return (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                <Link to={`/products/${product.id}`} className="relative block h-48 bg-stone-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">
                      <Sprout className="h-10 w-10" />
                    </div>
                  )}
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-stone-700 backdrop-blur">
                    {product.category}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <Link
                    to={`/products/${product.id}`}
                    className="font-semibold text-stone-900 hover:text-emerald-700"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 line-clamp-2 flex-1 text-xs text-stone-500">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-stone-900">₹{product.price}</span>
                      <span className="ml-1 text-xs text-stone-500">/ {product.unit}</span>
                    </div>
                    {outOfStock ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        <AlertCircle className="h-3 w-3" /> Out of stock
                      </span>
                    ) : lowStock ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        Only {product.stock} left!
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        In stock ({product.stock})
                      </span>
                    )}
                  </div>

                  <button
                    disabled={outOfStock}
                    onClick={() => handleAdd(product)}
                    className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                      outOfStock
                        ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                        : addedId === product.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    {addedId === product.id ? (
                      <>
                        <Check className="h-4 w-4" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" /> {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
