import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf,
  ShoppingCart,
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
    <header className="sticky top-0 z-40 w-full bg-white">
      {/* Top Utility Bar */}
      <div className="hidden border-b border-[#ececec] bg-white text-xs text-[#7e7e7e] lg:block">
        <div className="flex w-full items-center justify-between px-4 py-2 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:text-[#3bb77e]">About Us</Link>
            <span className="text-[#dedfe2]">|</span>
            <Link to={user ? '/orders' : '/login'} className="hover:text-[#3bb77e]">My Account</Link>
            <span className="text-[#dedfe2]">|</span>
            <Link to="/orders" className="hover:text-[#3bb77e]">Order Tracking</Link>
            <span className="text-[#dedfe2]">|</span>
            <Link to="/bulk-enquiry" className="hover:text-[#3bb77e]">Wholesale Enquiry</Link>
          </div>
          <p className="font-medium text-[#3bb77e]">
            100% Certified Organic • Direct from Virar &amp; Sahyadri Farms
          </p>
          <div className="flex items-center gap-3">
            <span>
              Need help? Call Us: <strong className="text-[#3bb77e]">+91 98200 11111</strong>
            </span>
            <span className="text-[#dedfe2]">|</span>
            <span>INR ₹</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-[#ececec]">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8 lg:px-12">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3bb77e] text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-[#253d4e]">
                Virar <span className="text-[#3bb77e]">Organics</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#7e7e7e]">
                Mart &amp; Grocery
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="order-3 flex w-full items-center overflow-hidden rounded-md border-2 border-[#bce3c9] bg-white lg:order-2 lg:max-w-2xl lg:flex-1 lg:mx-8"
          >
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="hidden border-r border-[#ececec] bg-white px-3.5 py-2.5 text-xs font-bold text-[#253d4e] focus:outline-none sm:block"
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
              placeholder="Search for items..."
              className="flex-1 px-4 py-2 text-sm text-[#253d4e] placeholder:text-[#999] focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#3bb77e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#29a56c]"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Right Actions (Pure Customer Storefront - No Admin Clutter) */}
          <div className="order-2 flex items-center gap-5 lg:order-3">
            <Link
              to="/bulk-enquiry"
              className="hidden items-center gap-1.5 rounded-md border border-[#ececec] bg-white px-3.5 py-2 text-xs font-semibold text-[#3bb77e] shadow-2xs transition-colors hover:border-[#3bb77e] xl:flex"
            >
              Bulk Order →
            </Link>

            {user && (
              <Link
                to="/orders"
                className="flex items-center gap-1.5 text-sm font-medium text-[#253d4e] hover:text-[#3bb77e]"
              >
                <PackageCheck className="h-5 w-5 text-[#253d4e]" />
                <span className="hidden text-xs font-medium text-[#7e7e7e] sm:inline">Orders</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex items-center gap-2 text-sm font-medium text-[#253d4e] hover:text-[#3bb77e]"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-[#253d4e]" />
                {totalCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3bb77e] px-1 text-[10px] font-bold text-white">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="hidden text-xs font-medium text-[#7e7e7e] sm:inline">
                Cart <strong className="text-[#253d4e]">₹{totalAmount.toFixed(0)}</strong>
              </span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/orders"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#253d4e] hover:text-[#3bb77e]"
                >
                  <User className="h-5 w-5 text-[#253d4e]" />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="rounded-md border border-[#ececec] p-1.5 text-[#7e7e7e] hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#253d4e] hover:text-[#3bb77e]"
              >
                <User className="h-5 w-5 text-[#253d4e]" />
                <span>Account</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Category & Nav Bar */}
      <div className="hidden border-b border-[#ececec] bg-white md:block">
        <div className="flex w-full items-center justify-between px-4 py-2.5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-8">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md bg-[#3bb77e] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#29a56c]"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Browse All Categories</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {catMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-[#ececec] bg-white p-2 shadow-lg">
                  <button
                    onClick={() => handleCategoryPick('All')}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#253d4e] hover:bg-[#def9ec] hover:text-[#3bb77e]"
                  >
                    All Organic Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryPick(cat)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#253d4e] hover:bg-[#def9ec] hover:text-[#3bb77e]"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex items-center gap-7 text-sm font-bold text-[#253d4e]">
              <Link
                to="/"
                className={location.pathname === '/' ? 'text-[#3bb77e]' : 'hover:text-[#3bb77e]'}
              >
                Home
              </Link>
              <a href="/#popular-products" className="hover:text-[#3bb77e]">
                Shop
              </a>
              <Link
                to="/bulk-enquiry"
                className={location.pathname === '/bulk-enquiry' ? 'text-[#3bb77e]' : 'hover:text-[#3bb77e]'}
              >
                Bulk Enquiry
              </Link>
              <Link
                to="/orders"
                className={location.pathname === '/orders' ? 'text-[#3bb77e]' : 'hover:text-[#3bb77e]'}
              >
                My Orders
              </Link>
              <Link
                to="/cart"
                className={location.pathname === '/cart' ? 'text-[#3bb77e]' : 'hover:text-[#3bb77e]'}
              >
                Cart
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Headphones className="h-7 w-7 text-[#253d4e]" />
            <div className="leading-tight">
              <span className="block text-lg font-extrabold text-[#3bb77e]">1800-888-123</span>
              <span className="block text-[11px] font-medium text-[#7e7e7e]">24/7 Support Center</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
