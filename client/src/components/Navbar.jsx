import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf,
  ShoppingCart,
  ShieldCheck,
  LogOut,
  User,
  Search,
  Headphones,
  LayoutGrid,
  ChevronDown,
  PackageCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount, totalAmount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  const isStaff = user && (user.role === 'ADMIN' || user.role === 'SALES_EXECUTIVE');

  useEffect(() => {
    apiFetch('/products/categories')
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCat && selectedCat !== 'All') params.set('category', selectedCat);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    navigate(`/?${params.toString()}`);
  }

  function handleCategoryPick(cat) {
    setCatMenuOpen(false);
    setSelectedCat(cat);
    const params = new URLSearchParams();
    if (cat !== 'All') params.set('category', cat);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    navigate(`/?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* Top Utility Bar */}
      <div className="hidden border-b border-stone-200 bg-white text-xs text-stone-500 lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-emerald-700">About Us</Link>
            <span className="text-stone-300">|</span>
            <Link to={user ? '/orders' : '/login'} className="hover:text-emerald-700">My Account</Link>
            <span className="text-stone-300">|</span>
            <Link to="/orders" className="hover:text-emerald-700">Order Tracking</Link>
            <span className="text-stone-300">|</span>
            <Link to="/bulk-enquiry" className="hover:text-emerald-700">Wholesale Enquiry</Link>
          </div>
          <p className="font-medium text-emerald-700">
            100% Certified Organic • Direct from Virar &amp; Sahyadri Farms
          </p>
          <div className="flex items-center gap-4">
            <span>
              Need help? Call Us: <strong className="text-emerald-700">+91 98200 11111</strong>
            </span>
            <span className="text-stone-300">|</span>
            <span>INR (₹)</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-stone-200">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900">
                Virar <span className="text-emerald-600">Organics</span>
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-stone-400">
                Mart &amp; Pure Foods
              </span>
            </div>
          </Link>

          {/* Full-Width Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="order-3 flex w-full items-center overflow-hidden rounded-lg border-2 border-emerald-500/80 bg-white lg:order-2 lg:max-w-xl xl:max-w-2xl"
          >
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="hidden border-r border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-700 focus:outline-none sm:block"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for organic honey, A2 ghee, cold-pressed oils..."
              className="flex-1 px-4 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Right Actions */}
          <div className="order-2 flex items-center gap-3 lg:order-3">
            <Link
              to="/bulk-enquiry"
              className="hidden items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-2xs transition-colors hover:bg-emerald-50 xl:flex"
            >
              Bulk Order →
            </Link>

            {user && (
              <Link
                to="/orders"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-700 hover:text-emerald-700"
              >
                <PackageCheck className="h-5 w-5 text-stone-600" />
                <span className="hidden sm:inline">Orders</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-700 hover:text-emerald-700"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-stone-700" />
                {totalCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {totalCount}
                  </span>
                )}
              </div>
              <div className="hidden text-left leading-tight sm:block">
                <span className="block text-[11px] text-stone-400">Cart</span>
                <span className="text-xs font-bold text-stone-800">₹{totalAmount.toFixed(0)}</span>
              </div>
            </Link>

            {isStaff && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{user.role === 'ADMIN' ? 'Admin' : 'CRM'}</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
                <div className="hidden items-center gap-1.5 text-xs font-semibold text-stone-700 md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <User className="h-4 w-4" />
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="rounded-lg border border-stone-200 p-2 text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <User className="h-4 w-4" />
                <span>Account</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Nav Bar */}
      <div className="hidden border-b border-stone-200 bg-white md:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Browse All Categories</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {catMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                  <button
                    onClick={() => handleCategoryPick('All')}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    All Organic Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryPick(cat)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex items-center gap-6 text-sm font-semibold text-stone-700">
              <Link
                to="/"
                className={location.pathname === '/' ? 'text-emerald-600' : 'hover:text-emerald-600'}
              >
                Home
              </Link>
              <Link
                to="/bulk-enquiry"
                className={location.pathname === '/bulk-enquiry' ? 'text-emerald-600' : 'hover:text-emerald-600'}
              >
                Bulk Enquiry
              </Link>
              <Link
                to="/orders"
                className={location.pathname === '/orders' ? 'text-emerald-600' : 'hover:text-emerald-600'}
              >
                My Orders
              </Link>
              <Link
                to="/cart"
                className={location.pathname === '/cart' ? 'text-emerald-600' : 'hover:text-emerald-600'}
              >
                Cart
              </Link>
              {isStaff && (
                <Link
                  to="/admin"
                  className={location.pathname.startsWith('/admin') ? 'text-amber-700' : 'text-amber-700 hover:underline'}
                >
                  {user.role === 'ADMIN' ? 'Admin Panel' : 'CRM Portal'}
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Headphones className="h-7 w-7 text-stone-700" />
            <div className="leading-tight">
              <span className="block text-base font-bold text-emerald-600">1800-888-123</span>
              <span className="block text-[11px] text-stone-500">24/7 Support Center</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
