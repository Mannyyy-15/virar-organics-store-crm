import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Sprout,
  Droplets,
  Wheat,
  Sparkles,
  Flame,
  Package,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Leaf,
  Award,
} from 'lucide-react';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';

const CATEGORY_CARDS = {
  'Honey & Sweeteners': { sub: 'Raw & Unprocessed', icon: Sparkles },
  'Ghee & Dairy': { sub: 'A2 Bilona Purity', icon: Droplets },
  'Cold-Pressed Oils': { sub: 'Wood-Pressed Oils', icon: Sprout },
  'Grains & Flours': { sub: 'Heirloom Staples', icon: Wheat },
  'Spices & Herbs': { sub: 'Single Origin', icon: Flame },
};

const RECIPES = [
  {
    title: 'Golden Turmeric Milk',
    time: '5 mins',
    img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'A2 Ghee & Honey Toast',
    time: '5 mins',
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Indrayani Rice Khichdi',
    time: '20 mins',
    img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Sprouted Ragi Porridge',
    time: '10 mins',
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  },
];

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'All';
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items: cartItems, addItem, updateQuantity } = useCart();

  function getCartQty(productId) {
    return cartItems.find((i) => i.product.id === productId)?.quantity || 0;
  }

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
  }

  const quickReorderItems = allProducts.filter((p) => p.stock > 0).slice(0, 5);

  return (
    <div className="w-full bg-white">
      {/* Full-Width 100vh Full-Bleed Hero Section (Responsive: stacked on mobile, full-bleed on desktop) */}
      <section className="relative w-full overflow-hidden border-b border-[#e6e0cf] bg-[#f7f4eb] lg:flex lg:min-h-[calc(100vh-66px)] lg:items-center">
        {/* Desktop Full-bleed background image */}
        <img
          src="/images/hero-bg.jpg"
          alt="Fresh Organic Farm Produce"
          className="hidden lg:block lg:absolute lg:inset-0 lg:h-full lg:w-full lg:object-cover lg:object-right"
        />
        {/* Smooth cream gradient that blends the left 45% seamlessly into the kitchen counter */}
        <div className="hidden lg:block lg:absolute lg:inset-0 lg:bg-gradient-to-r lg:from-[#f7f4eb] lg:via-[#f7f4eb]/95 lg:via-42% lg:to-transparent" />

        <div className="relative z-10 flex w-full flex-col justify-between px-4 py-8 sm:px-8 lg:px-12 lg:py-16">
          <div className="max-w-xl">
            <h1 className="font-serif-display text-4xl font-bold leading-[1.08] tracking-tight text-[#1f2e18] sm:text-5xl xl:text-[68px]">
              Fresh Groceries, <br />
              Better Living. <Leaf className="inline h-7 w-7 text-[#4a7c26] sm:h-9 sm:w-9" />
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#3f4a38] sm:mt-5 sm:text-lg">
              Farm-fresh organic staples, cold-pressed oils, A2 Bilona ghee &amp; more – delivered fresh to your home.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
              <a
                href="#bestsellers"
                className="inline-flex items-center gap-2 rounded-full bg-[#38661d] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#2c5216] sm:px-7 sm:py-3.5"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/bulk-enquiry"
                className="inline-flex items-center gap-2 rounded-full border border-[#38661d] bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#38661d] transition-colors hover:bg-[#f0ede2] sm:px-7 sm:py-3.5"
              >
                Bulk Enquiry
              </Link>
            </div>
          </div>

          {/* Mobile Hero Image (cleanly stacked below CTA on phones/tablets) */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#e6e0cf] bg-white shadow-xs lg:hidden">
            <img
              src="/images/hero-bg.jpg"
              alt="Fresh Organic Farm Produce"
              className="h-56 w-full object-cover object-right sm:h-72"
            />
          </div>

          {/* Floating Trust Strip at bottom-left of Hero */}
          <div className="mt-6 grid max-w-2xl grid-cols-2 gap-3 rounded-2xl border border-[#e6e0cf] bg-white/95 p-3.5 shadow-sm backdrop-blur-xs sm:mt-10 sm:grid-cols-4 sm:gap-4 sm:p-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 shrink-0 text-[#38661d]" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-[#1f2e18]">Farm Fresh</p>
                <p className="text-[10px] text-[#6d7465]">Sourced Daily</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 shrink-0 text-[#38661d]" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-[#1f2e18]">Best Quality</p>
                <p className="text-[10px] text-[#6d7465]">Handpicked</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 shrink-0 text-[#38661d]" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-[#1f2e18]">Fast Delivery</p>
                <p className="text-[10px] text-[#6d7465]">On Time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 shrink-0 text-[#38661d]" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-[#1f2e18]">Easy Returns</p>
                <p className="text-[10px] text-[#6d7465]">Hassle Free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container (Full Width) */}
      <div className="w-full space-y-10 px-4 py-8 sm:px-8 lg:px-12">
        {/* Category Strip — Cream Bordered Cards */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => {
              const meta = CATEGORY_CARDS[cat] || { sub: 'Certified Organic', icon: Package };
              const Icon = meta.icon;
              const active = urlCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => selectCategory(active ? 'All' : cat)}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center transition-all hover:shadow-sm ${
                    active
                      ? 'border-[#38661d] bg-[#eef5e8] ring-2 ring-[#38661d]/20'
                      : 'border-[#cfc6ad] bg-[#f7f4eb] hover:border-[#38661d]/60'
                  }`}
                >
                  <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full border border-[#cfc6ad] bg-white text-[#38661d]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-[#1f2e18]">{cat}</span>
                  <span className="mt-0.5 text-[11px] text-[#6d7465]">{meta.sub}</span>
                </button>
              );
            })}

            {/* 6th Tile: Bulk / Wholesale */}
            <Link
              to="/bulk-enquiry"
              className="flex flex-col items-center rounded-2xl border border-[#cfc6ad] bg-[#f7f4eb] p-4 text-center transition-all hover:border-[#38661d] hover:shadow-sm"
            >
              <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full border border-[#cfc6ad] bg-white text-[#38661d]">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-[#1f2e18]">Bulk Orders</span>
              <span className="mt-0.5 text-[11px] text-[#6d7465]">Wholesale Quotes</span>
            </Link>
          </div>
        </section>

        {/* 2-Column Promo Banners: Weekly Deals + Healthy Picks */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Dark Forest Green Weekly Deals */}
          <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#2c5216] bg-[#38661d] p-7 text-white">
            <div className="z-10 max-w-[55%]">
              <h2 className="font-serif-display text-3xl font-extrabold uppercase leading-none text-[#f3c63f]">
                Weekly <br /> Deals
              </h2>
              <p className="mt-2 text-sm text-emerald-100">Fresh savings every week on organic staples!</p>
              <a
                href="#bestsellers"
                className="mt-5 inline-block rounded-full bg-[#f3c63f] px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-[#1f2e18] hover:bg-[#e5b832]"
              >
                Shop Deals
              </a>
            </div>

            <div className="relative flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-[#f3c63f] text-center text-[#1f2e18] shadow-md">
                <span className="text-[10px] font-bold uppercase">Up To</span>
                <span className="text-xl font-extrabold leading-none">30%</span>
                <span className="text-[10px] font-bold uppercase">Off</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80"
                alt="Weekly Organic Deals"
                className="hidden h-36 w-36 rounded-xl border-2 border-white/20 object-cover sm:block"
              />
            </div>
          </div>

          {/* Right: Soft Mint/Cream Healthy Picks */}
          <div className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#dce3d4] bg-[#edf2e9] p-7">
            <div className="max-w-[55%]">
              <h2 className="font-serif-display text-3xl font-bold uppercase leading-tight text-[#1f2e18]">
                Healthy Picks
              </h2>
              <p className="mt-2 text-sm text-[#4f5947]">
                Good for you, <br /> Good for life.
              </p>
              <button
                onClick={() => selectCategory('Cold-Pressed Oils')}
                className="mt-5 inline-block rounded-full border border-[#1f2e18] bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#1f2e18] transition-colors hover:bg-[#1f2e18] hover:text-white"
              >
                Explore Now
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"
              alt="Healthy Organic Picks"
              className="h-36 w-36 rounded-xl border border-[#dce3d4] object-cover sm:w-44"
            />
          </div>
        </section>

        {/* WHAT'S COOKING? Editorial Strip */}
        <section className="rounded-2xl border border-[#e6e0cf] bg-[#f7f4eb] p-6">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <h2 className="font-serif-display text-2xl font-bold uppercase tracking-tight text-[#1f2e18]">
                What&apos;s Cooking?
              </h2>
              <p className="mt-2 text-sm text-[#6d7465]">
                Easy &amp; healthy organic recipes for every day.
              </p>
              <a
                href="#bestsellers"
                className="mt-5 inline-block rounded-full border border-[#dfd9c8] bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#1f2e18] hover:border-[#38661d]"
              >
                Shop Ingredients
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-9">
              {RECIPES.map((rec) => (
                <div
                  key={rec.title}
                  className="overflow-hidden rounded-xl border border-[#e6e0cf] bg-white p-3 transition-shadow hover:shadow-sm"
                >
                  <img
                    src={rec.img}
                    alt={rec.title}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-xs font-bold text-[#1f2e18]">{rec.title}</span>
                    <span className="shrink-0 rounded border border-[#e6e0cf] bg-[#f7f4eb] px-1.5 py-0.5 text-[10px] font-semibold text-[#6d7465]">
                      {rec.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BESTSELLERS — 6-Column Crisp Bordered Product Grid */}
        <section id="bestsellers">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e0cf] pb-3">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-extrabold uppercase tracking-wide text-[#1f2e18]">
                {urlSearch ? `Search: "${urlSearch}"` : urlCategory !== 'All' ? urlCategory : 'Bestsellers'}
              </h2>
              {urlCategory !== 'All' && (
                <button
                  onClick={() => selectCategory('All')}
                  className="rounded-full border border-[#e6e0cf] bg-[#f7f4eb] px-3 py-1 text-xs font-semibold text-[#38661d]"
                >
                  Clear Filter ×
                </button>
              )}
            </div>

            <div className="flex w-full items-center gap-3 overflow-x-auto pb-1 md:w-auto">
              <div className="flex gap-2">
                {['All', ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => selectCategory(cat)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      urlCategory === cat
                        ? 'bg-[#38661d] text-white'
                        : 'border border-[#e6e0cf] bg-white text-[#4f5947] hover:bg-[#f7f4eb]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectCategory('All')}
                className="shrink-0 text-xs font-bold uppercase tracking-wider text-[#38661d] hover:underline"
              >
                View All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl border border-[#e6e0cf] bg-[#f7f4eb]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-[#e6e0cf] bg-[#f7f4eb] p-10 text-center">
              <p className="text-sm text-[#6d7465]">No products matched your search.</p>
              <button
                onClick={() => setSearchParams({})}
                className="mt-3 text-xs font-bold uppercase text-[#38661d] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {products.map((product) => {
                const outOfStock = product.stock <= 0;
                const lowStock = product.stock > 0 && product.stock <= 3;
                const cartQty = getCartQty(product.id);

                return (
                  <div
                    key={product.id}
                    className="flex flex-col rounded-xl border border-[#cfc6ad] bg-white p-3.5 shadow-[0_1px_4px_rgba(31,46,24,0.06)] transition-all hover:border-[#38661d] hover:shadow-md"
                  >
                    <Link
                      to={`/products/${product.id}`}
                      className="relative mb-3 block overflow-hidden rounded-lg border border-[#dfd9c8] bg-[#faf9f5]"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-36 w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center text-stone-300">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                      {lowStock && (
                        <span className="absolute left-2 top-2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Only {product.stock} left
                        </span>
                      )}
                      {outOfStock && (
                        <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Out of Stock
                        </span>
                      )}
                    </Link>

                    <Link
                      to={`/products/${product.id}`}
                      className="line-clamp-2 text-sm font-bold leading-snug text-[#1f2e18] hover:text-[#38661d]"
                    >
                      {product.name}
                    </Link>
                    <span className="mt-0.5 text-xs text-[#6d7465]">{product.unit}</span>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-sm font-extrabold text-[#1f2e18]">Rs. {product.price}</span>
                      {outOfStock ? (
                        <button
                          disabled
                          className="cursor-not-allowed rounded-md bg-stone-100 px-3.5 py-1.5 text-xs font-bold uppercase text-stone-400"
                        >
                          Sold
                        </button>
                      ) : cartQty > 0 ? (
                        <div className="inline-flex items-center overflow-hidden rounded-md border border-[#38661d] bg-[#38661d] text-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, cartQty - 1)}
                            aria-label="Decrease quantity"
                            className="px-2 py-1.5 hover:bg-[#2c5216]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-extrabold">{cartQty}</span>
                          <button
                            type="button"
                            disabled={cartQty >= product.stock}
                            onClick={() => updateQuantity(product.id, cartQty + 1)}
                            aria-label="Increase quantity"
                            className="px-2 py-1.5 hover:bg-[#2c5216] disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAdd(product)}
                          className="rounded-md bg-[#38661d] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#2c5216]"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* QUICK REORDER Strip */}
        {quickReorderItems.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold uppercase tracking-wide text-[#1f2e18]">
                Quick Reorder
              </h2>
              <a
                href="#bestsellers"
                className="text-xs font-bold uppercase tracking-wider text-[#38661d] hover:underline"
              >
                View All
              </a>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {quickReorderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#cfc6ad] bg-white p-3 shadow-[0_1px_3px_rgba(31,46,24,0.05)] transition-colors hover:border-[#38661d]"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-12 w-12 shrink-0 rounded-lg border border-[#f0ece0] object-cover"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/products/${item.id}`}
                        className="block truncate text-xs font-bold text-[#1f2e18] hover:text-[#38661d]"
                      >
                        {item.name}
                      </Link>
                      <span className="text-[11px] text-[#6d7465]">
                        {item.unit} • Rs. {item.price}
                      </span>
                    </div>
                  </div>
                  {getCartQty(item.id) > 0 ? (
                    <div className="inline-flex shrink-0 items-center overflow-hidden rounded-full bg-[#38661d] text-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, getCartQty(item.id) - 1)}
                        className="px-2 py-1 hover:bg-[#2c5216]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-5 text-center text-xs font-bold">{getCartQty(item.id)}</span>
                      <button
                        type="button"
                        disabled={getCartQty(item.id) >= item.stock}
                        onClick={() => updateQuantity(item.id, getCartQty(item.id) + 1)}
                        className="px-2 py-1 hover:bg-[#2c5216] disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(item)}
                      title="Quick Add"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#38661d] text-white hover:bg-[#2c5216]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom 4-Column Trust Bar */}
        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-[#cfc6ad] bg-[#f7f4eb] p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <Leaf className="mt-0.5 h-7 w-7 shrink-0 text-[#38661d]" />
            <div>
              <h3 className="text-sm font-bold text-[#1f2e18]">Freshness Guaranteed</h3>
              <p className="mt-0.5 text-xs text-[#6d7465]">Sourced daily from trusted Virar &amp; Sahyadri farms.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-7 w-7 shrink-0 text-[#38661d]" />
            <div>
              <h3 className="text-sm font-bold text-[#1f2e18]">Secure Payments</h3>
              <p className="mt-0.5 text-xs text-[#6d7465]">100% safe online &amp; Cash on Delivery checkout.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-7 w-7 shrink-0 text-[#38661d]" />
            <div>
              <h3 className="text-sm font-bold text-[#1f2e18]">Fast &amp; Reliable Delivery</h3>
              <p className="mt-0.5 text-xs text-[#6d7465]">On-time delivery across Virar, Vasai &amp; Mumbai.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="mt-0.5 h-7 w-7 shrink-0 text-[#38661d]" />
            <div>
              <h3 className="text-sm font-bold text-[#1f2e18]">Hassle-Free Returns</h3>
              <p className="mt-0.5 text-xs text-[#6d7465]">Easy order cancellation &amp; instant stock sync.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
