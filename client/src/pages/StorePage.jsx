import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShoppingCart,
  Check,
  ArrowRight,
  Sprout,
  Droplets,
  Wheat,
  Sparkles,
  Flame,
  Package,
} from 'lucide-react';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';

const CATEGORY_META = {
  'Honey & Sweeteners': { bg: 'bg-amber-50 hover:border-amber-300', icon: Sparkles, color: 'text-amber-600' },
  'Ghee & Dairy': { bg: 'bg-orange-50 hover:border-orange-300', icon: Droplets, color: 'text-orange-600' },
  'Cold-Pressed Oils': { bg: 'bg-emerald-50 hover:border-emerald-300', icon: Sprout, color: 'text-emerald-600' },
  'Grains & Flours': { bg: 'bg-lime-50 hover:border-lime-300', icon: Wheat, color: 'text-lime-700' },
  'Spices & Herbs': { bg: 'bg-rose-50 hover:border-rose-300', icon: Flame, color: 'text-rose-600' },
};

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'All';
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addItem } = useCart();

  // Load categories and all products once for category counts & Daily Best Sells
  useEffect(() => {
    apiFetch('/products/categories')
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
    apiFetch('/products')
      .then((res) => setAllProducts(res.products || []))
      .catch(() => {});
  }, []);

  // Load filtered products whenever URL params change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (urlCategory !== 'All') params.set('category', urlCategory);
    if (urlSearch.trim()) params.set('search', urlSearch.trim());

    apiFetch(`/products?${params.toString()}`)
      .then((res) => setProducts(res.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [urlCategory, urlSearch]);

  function selectCategory(cat) {
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') next.delete('category');
    else next.set('category', cat);
    setSearchParams(next);
  }

  function handleAdd(product) {
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  const bestSellers = allProducts.filter((p) => p.stock > 0).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      {/* Hero Banner (Full-Width Mint Card) */}
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-[#d8f1e5] px-6 py-10 sm:px-12 sm:py-14">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="inline-block rounded-full bg-white/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              100% Certified Organic Store
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl">
              Pure Organic Foods <br className="hidden sm:block" />
              Direct From Farm
            </h1>
            <p className="mt-4 max-w-xl text-base text-stone-600 sm:text-lg">
              Fresh cold-pressed oils, A2 Bilona ghee, raw forest honey, and heirloom grains — with real-time stock accuracy.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#popular-products"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/bulk-enquiry"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-stone-800 shadow-xs transition-colors hover:bg-stone-50"
              >
                Bulk &amp; Wholesale Quote
              </Link>
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
              alt="Fresh Organic Groceries"
              className="h-72 w-full rounded-2xl object-cover shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-bold text-stone-900">Featured Categories</h2>
          {urlCategory !== 'All' && (
            <button
              onClick={() => selectCategory('All')}
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              Show All Categories
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat] || {
              bg: 'bg-stone-50 hover:border-stone-300',
              icon: Package,
              color: 'text-emerald-700',
            };
            const Icon = meta.icon;
            const count = allProducts.filter((p) => p.category === cat).length;
            const active = urlCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => selectCategory(active ? 'All' : cat)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all ${
                  meta.bg
                } ${active ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-stone-200/80'}`}
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-2xs ${meta.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-stone-900">{cat}</span>
                <span className="mt-0.5 text-xs text-stone-500">{count} items</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3 Promotional Banners */}
      <section className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl bg-[#f0e8d5] p-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              Everyday Fresh &amp; Clean with Cold-Pressed Oils
            </h3>
            <p className="mt-1 text-xs text-stone-600">Wood-pressed Lakdi Ghani oils</p>
          </div>
          <button
            onClick={() => selectCategory('Cold-Pressed Oils')}
            className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Shop Now <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-[#f3e8e8] p-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              Make your Breakfast Healthy with A2 Bilona Ghee
            </h3>
            <p className="mt-1 text-xs text-stone-600">Traditional hand-churned purity</p>
          </div>
          <button
            onClick={() => selectCategory('Ghee & Dairy')}
            className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Shop Now <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-[#e7eaf3] p-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              Wholesale &amp; Bulk Orders for Cafes &amp; Societies
            </h3>
            <p className="mt-1 text-xs text-stone-600">Direct farm pricing &amp; CRM tracking</p>
          </div>
          <Link
            to="/bulk-enquiry"
            className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Enquire Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Popular Products */}
      <section id="popular-products" className="mb-14">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">
              {urlSearch ? `Search results for "${urlSearch}"` : 'Popular Products'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  urlCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-emerald-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-stone-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <p className="text-stone-600">No organic products matched your search.</p>
            <button
              onClick={() => setSearchParams({})}
              className="mt-3 text-sm font-semibold text-emerald-700 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => {
              const outOfStock = product.stock <= 0;
              const lastFew = product.stock > 0 && product.stock <= 3;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md"
                >
                  {/* Top-left Nest-style badge */}
                  <span
                    className={`absolute left-0 top-0 z-10 rounded-br-xl px-3 py-1 text-[11px] font-bold text-white ${
                      outOfStock ? 'bg-red-500' : lastFew ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  >
                    {outOfStock ? 'Out of Stock' : lastFew ? `Only ${product.stock} left` : 'In Stock'}
                  </span>

                  <Link to={`/products/${product.id}`} className="mb-3 block overflow-hidden rounded-xl bg-stone-50">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-stone-300">
                        <Sprout className="h-10 w-10" />
                      </div>
                    )}
                  </Link>

                  <span className="text-[11px] font-medium text-stone-400">{product.category}</span>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-1 line-clamp-2 font-bold text-stone-900 hover:text-emerald-700"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-stone-500">
                    By <span className="font-semibold text-emerald-700">Virar Organics</span> • {product.unit}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div>
                      <span className="text-lg font-extrabold text-emerald-600">₹{product.price}</span>
                    </div>

                    <button
                      disabled={outOfStock}
                      onClick={() => handleAdd(product)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                        outOfStock
                          ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                          : addedId === product.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3.5 w-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Daily Best Sells Section (Matching Reference) */}
      {bestSellers.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-5 text-2xl font-bold text-stone-900">Daily Best Sells</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
            {/* Left Nature Promo Card */}
            <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-950 p-6 text-white">
              <div>
                <h3 className="text-2xl font-extrabold leading-snug">
                  Bring nature into your home
                </h3>
                <p className="mt-2 text-xs text-emerald-100">
                  Freshly harvested organic staples restocked every morning.
                </p>
              </div>
              <a
                href="#popular-products"
                className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-400"
              >
                Shop Now <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* 4 Featured Cards with Stock Bar */}
            {bestSellers.map((product) => {
              const pct = Math.min(100, Math.round((product.stock / 50) * 100));
              return (
                <div
                  key={product.id}
                  className="flex flex-col rounded-2xl border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <Link to={`/products/${product.id}`} className="mb-3 block overflow-hidden rounded-xl bg-stone-50">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-40 w-full object-cover"
                    />
                  </Link>
                  <span className="text-[11px] font-medium text-stone-400">{product.category}</span>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-1 line-clamp-1 font-bold text-stone-900 hover:text-emerald-700"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-2 text-lg font-extrabold text-emerald-600">₹{product.price}</div>

                  {/* Stock indicator bar */}
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-stone-500">
                      Available: {product.stock} {product.unit}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAdd(product)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    {addedId === product.id ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                    {addedId === product.id ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
