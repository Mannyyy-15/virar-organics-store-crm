import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
  Star,
  Send,
} from 'lucide-react';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';

const CATEGORY_TILES = [
  { bg: 'bg-[#f2fce4]', icon: Sparkles, color: 'text-amber-600' },
  { bg: 'bg-[#fffceb]', icon: Droplets, color: 'text-orange-600' },
  { bg: 'bg-[#ecffec]', icon: Sprout, color: 'text-emerald-600' },
  { bg: 'bg-[#feefea]', icon: Wheat, color: 'text-amber-700' },
  { bg: 'bg-[#fff3ff]', icon: Flame, color: 'text-rose-600' },
];

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlCategory = searchParams.get('category') || 'All';
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [heroEmail, setHeroEmail] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    apiFetch('/products/categories')
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
    apiFetch('/products')
      .then((res) => setAllProducts(res.products || []))
      .catch(() => {});
  }, []);

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

  function handleHeroSubscribe(e) {
    e.preventDefault();
    navigate(`/bulk-enquiry${heroEmail ? `?email=${encodeURIComponent(heroEmail)}` : ''}`);
  }

  const bestSellers = allProducts.filter((p) => p.stock > 0).slice(0, 4);

  return (
    <div className="w-full px-4 py-6 sm:px-8 lg:px-12">
      {/* Hero Banner — Full Width Nest Style */}
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-[#d8f1e5] px-6 py-10 sm:px-14 sm:py-16">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#253d4e] sm:text-5xl xl:text-6xl">
              Fresh Organic Foods <br />
              Direct From Farm
            </h1>
            <p className="mt-4 text-base text-[#7e7e7e] sm:text-xl">
              Save up to 30% on farm-direct staples &amp; wholesale orders
            </p>

            {/* Nest-style Pill Input */}
            <form
              onSubmit={handleHeroSubscribe}
              className="mt-8 flex max-w-md items-center overflow-hidden rounded-full bg-white p-1.5 shadow-sm"
            >
              <Send className="ml-3.5 h-4 w-4 shrink-0 text-[#7e7e7e]" />
              <input
                type="email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                placeholder="Your email for wholesale deals"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-[#253d4e] placeholder:text-[#999] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-[#3bb77e] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#29a56c]"
              >
                Get Quote
              </button>
            </form>
          </div>

          <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
              alt="Fresh Organic Vegetables & Groceries"
              className="h-80 w-full max-w-lg rounded-2xl object-cover shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-6">
            <h2 className="text-2xl font-extrabold text-[#253d4e]">Featured Categories</h2>
            <div className="hidden gap-4 text-sm font-semibold text-[#253d4e] md:flex">
              {categories.slice(0, 4).map((c) => (
                <button
                  key={c}
                  onClick={() => selectCategory(c)}
                  className="hover:text-[#3bb77e]"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {urlCategory !== 'All' && (
            <button
              onClick={() => selectCategory('All')}
              className="text-sm font-bold text-[#3bb77e] hover:underline"
            >
              Show All →
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, idx) => {
            const tile = CATEGORY_TILES[idx % CATEGORY_TILES.length];
            const Icon = tile.icon;
            const count = allProducts.filter((p) => p.category === cat).length;
            const active = urlCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => selectCategory(active ? 'All' : cat)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center transition-all hover:shadow-sm ${
                  tile.bg
                } ${active ? 'border-[#3bb77e] ring-2 ring-[#3bb77e]/25' : 'border-[#ececec]'}`}
              >
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-2xs ${tile.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold text-[#253d4e]">{cat}</span>
                <span className="mt-1 text-xs text-[#7e7e7e]">{count} items</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3 Promotional Banners */}
      <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[#f0e8d5] p-7">
          <div className="max-w-[60%]">
            <h3 className="text-xl font-extrabold leading-snug text-[#253d4e]">
              Everyday Fresh &amp; Clean with Our Oils
            </h3>
            <button
              onClick={() => selectCategory('Cold-Pressed Oils')}
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[#3bb77e] px-4 py-2 text-xs font-bold text-white hover:bg-[#29a56c]"
            >
              Shop Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <img
            src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80"
            alt="Cold-Pressed Oil"
            className="h-28 w-28 rounded-xl object-cover shadow-xs"
          />
        </div>

        <div className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[#f3e8e8] p-7">
          <div className="max-w-[60%]">
            <h3 className="text-xl font-extrabold leading-snug text-[#253d4e]">
              Make your Breakfast Healthy &amp; Pure
            </h3>
            <button
              onClick={() => selectCategory('Ghee & Dairy')}
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[#3bb77e] px-4 py-2 text-xs font-bold text-white hover:bg-[#29a56c]"
            >
              Shop Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <img
            src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80"
            alt="A2 Bilona Ghee"
            className="h-28 w-28 rounded-xl object-cover shadow-xs"
          />
        </div>

        <div className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[#e7eaf3] p-7">
          <div className="max-w-[60%]">
            <h3 className="text-xl font-extrabold leading-snug text-[#253d4e]">
              The best Organic Products Online
            </h3>
            <Link
              to="/bulk-enquiry"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[#3bb77e] px-4 py-2 text-xs font-bold text-white hover:bg-[#29a56c]"
            >
              Bulk Order <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80"
            alt="Raw Forest Honey"
            className="h-28 w-28 rounded-xl object-cover shadow-xs"
          />
        </div>
      </section>

      {/* Popular Products — 5-Column Nest Grid */}
      <section id="popular-products" className="mb-14">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-extrabold text-[#253d4e]">
            {urlSearch ? `Search results for "${urlSearch}"` : 'Popular Products'}
          </h2>

          <div className="flex flex-wrap gap-2">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`px-2.5 py-1 text-sm font-semibold transition-colors ${
                  urlCategory === cat
                    ? 'text-[#3bb77e]'
                    : 'text-[#253d4e] hover:text-[#3bb77e]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-[#ececec] bg-stone-50" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[#ececec] bg-white p-12 text-center">
            <p className="text-[#7e7e7e]">No organic products matched your search.</p>
            <button
              onClick={() => setSearchParams({})}
              className="mt-3 text-sm font-bold text-[#3bb77e] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => {
              const outOfStock = product.stock <= 0;
              const lastFew = product.stock > 0 && product.stock <= 3;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white p-5 transition-all hover:border-[#bce3c9] hover:shadow-md"
                >
                  {/* Flush Nest-style corner badge */}
                  <span
                    className={`absolute left-0 top-0 z-10 rounded-br-2xl px-3.5 py-1 text-[11px] font-bold text-white ${
                      outOfStock ? 'bg-[#f74b81]' : lastFew ? 'bg-[#f59758]' : 'bg-[#3bb77e]'
                    }`}
                  >
                    {outOfStock ? 'Out of Stock' : lastFew ? `Only ${product.stock} Left` : 'Fresh'}
                  </span>

                  <Link to={`/products/${product.id}`} className="mb-4 mt-3 block overflow-hidden rounded-xl bg-white">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-stone-300">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                  </Link>

                  <span className="text-[11px] font-medium text-[#adadad]">{product.category}</span>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-[#253d4e] hover:text-[#3bb77e]"
                  >
                    {product.name}
                  </Link>

                  <div className="mt-1.5 flex items-center gap-1 text-xs text-[#7e7e7e]">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>(4.8)</span>
                  </div>

                  <p className="mt-1 text-xs text-[#7e7e7e]">
                    By <span className="font-semibold text-[#3bb77e]">Virar Organics</span> • {product.unit}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-lg font-extrabold text-[#3bb77e]">₹{product.price}</span>

                    <button
                      disabled={outOfStock}
                      onClick={() => handleAdd(product)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                        outOfStock
                          ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                          : addedId === product.id
                            ? 'bg-[#3bb77e] text-white'
                            : 'bg-[#def9ec] text-[#3bb77e] hover:bg-[#3bb77e] hover:text-white'
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

      {/* Daily Best Sells */}
      {bestSellers.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-5 text-2xl font-extrabold text-[#253d4e]">Daily Best Sells</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#2a5c45] to-[#133827] p-7 text-white">
              <div>
                <h3 className="text-3xl font-extrabold leading-tight">
                  Bring nature into your home
                </h3>
                <p className="mt-3 text-sm text-emerald-100">
                  Pure, lab-tested organic staples restocked daily.
                </p>
              </div>
              <a
                href="#popular-products"
                className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-md bg-[#3bb77e] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#29a56c]"
              >
                Shop Now <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {bestSellers.map((product) => {
              const pct = Math.min(100, Math.round((product.stock / 50) * 100));
              return (
                <div
                  key={product.id}
                  className="flex flex-col rounded-2xl border border-[#ececec] bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <Link to={`/products/${product.id}`} className="mb-3 block overflow-hidden rounded-xl">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-40 w-full object-cover"
                    />
                  </Link>
                  <span className="text-[11px] font-medium text-[#adadad]">{product.category}</span>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-1 line-clamp-1 font-bold text-[#253d4e] hover:text-[#3bb77e]"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-2 text-lg font-extrabold text-[#3bb77e]">₹{product.price}</div>

                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-[#3bb77e]" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-[#7e7e7e]">
                      Available: {product.stock} {product.unit}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAdd(product)}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#3bb77e] py-2.5 text-xs font-bold text-white hover:bg-[#29a56c]"
                  >
                    {addedId === product.id ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                    {addedId === product.id ? 'Added to Cart' : 'Add To Cart'}
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
