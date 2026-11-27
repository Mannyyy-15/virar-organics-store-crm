import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  ShoppingCart,
  LogOut,
  User,
  Search,
  Menu,
  X,
  PackageCheck,
  MessageSquarePlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    apiFetch('/products/categories')
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    navigate(`/?${params.toString()}`);
  }

  function handlePickCategory(cat) {
    setMenuOpen(false);
    navigate(cat === 'All' ? '/' : `/?category=${encodeURIComponent(cat)}`);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e6e0cf] bg-[#fbfaf6]">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12">
        {/* Left: Menu + Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6e0cf] bg-white text-[#1f2e18] hover:bg-[#f7f4eb]"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="font-serif-display text-2xl font-bold tracking-tight text-[#2c4c17]">
                VirarOrganics
              </span>
              <Leaf className="h-4 w-4 text-[#4a7c26]" />
            </div>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.26em] text-[#6d7465]">
              — FARM TO HOME —
            </span>
          </Link>
        </div>

        {/* Center: Pill Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden max-w-xl flex-1 items-center overflow-hidden rounded-full border border-[#dfd9c8] bg-white p-1 shadow-2xs md:flex"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for organic honey, ghee, grains..."
            className="flex-1 bg-transparent px-4 py-1.5 text-sm text-[#1f2e18] placeholder:text-[#8c9184] focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#38661d] text-white transition-colors hover:bg-[#2c5216]"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Right: Bulk Enquiry, Orders, Account, Cart */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/bulk-enquiry"
            className="hidden items-center gap-1.5 rounded-full border border-[#dfd9c8] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2c4c17] hover:bg-[#f7f4eb] lg:flex"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Bulk Enquiry
          </Link>

          {user && (
            <Link
              to="/orders"
              title="My Orders"
              className="flex items-center gap-1.5 rounded-full border border-[#dfd9c8] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2e18] hover:bg-[#f7f4eb]"
            >
              <PackageCheck className="h-4 w-4 text-[#38661d]" />
              <span className="hidden sm:inline">My Orders</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/orders"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfd9c8] bg-white text-[#1f2e18] hover:bg-[#f7f4eb]"
                title={user.name}
              >
                <User className="h-4 w-4" />
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfd9c8] bg-white text-[#6d7465] hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              title="Sign In / Register"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfd9c8] bg-white text-[#1f2e18] hover:bg-[#f7f4eb]"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#dfd9c8] bg-white text-[#1f2e18] hover:bg-[#f7f4eb]"
            title="Shopping Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#38661d] px-1 text-[10px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="border-t border-[#ece7d8] px-4 py-2 md:hidden">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center overflow-hidden rounded-full border border-[#dfd9c8] bg-white p-1"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search organic products..."
            className="flex-1 bg-transparent px-3 py-1 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#38661d] text-white"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Slide-down Navigation Drawer */}
      {menuOpen && (
        <div className="border-t border-[#e6e0cf] bg-white px-4 py-4 shadow-md sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6d7465]">Store</p>
              <ul className="space-y-1.5 text-sm font-medium text-[#1f2e18]">
                <li><Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-[#38661d]">Home</Link></li>
                <li><Link to="/cart" onClick={() => setMenuOpen(false)} className="hover:text-[#38661d]">Shopping Cart</Link></li>
                <li><Link to="/orders" onClick={() => setMenuOpen(false)} className="hover:text-[#38661d]">My Orders</Link></li>
                <li><Link to="/bulk-enquiry" onClick={() => setMenuOpen(false)} className="hover:text-[#38661d]">Bulk Order Enquiry</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6d7465]">Categories</p>
              <ul className="space-y-1.5 text-sm font-medium text-[#1f2e18]">
                <li>
                  <button onClick={() => handlePickCategory('All')} className="hover:text-[#38661d]">
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button onClick={() => handlePickCategory(cat)} className="hover:text-[#38661d]">
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
