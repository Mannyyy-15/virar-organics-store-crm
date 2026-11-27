import { Link, useLocation } from 'react-router-dom';
import { Leaf, ShoppingBag, ShieldCheck, LogOut, User, PackageCheck, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const location = useLocation();

  const isStaff = user && (user.role === 'ADMIN' || user.role === 'SALES_EXECUTIVE');

  const navLinkClass = (path) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-emerald-800 text-white'
        : 'text-stone-700 hover:bg-emerald-50 hover:text-emerald-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-stone-900">Virar Organics</span>
            <span className="hidden text-xs text-stone-500 sm:block">Farm-to-Home Pure Foods</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/" className={navLinkClass('/')}>
            Store
          </Link>
          <Link to="/bulk-enquiry" className={navLinkClass('/bulk-enquiry')}>
            <span className="hidden sm:inline">Bulk Enquiry</span>
            <MessageSquarePlus className="h-4 w-4 sm:hidden" />
          </Link>
          {user && (
            <Link to="/orders" className={navLinkClass('/orders')}>
              <span className="hidden sm:inline">My Orders</span>
              <PackageCheck className="h-4 w-4 sm:hidden" />
            </Link>
          )}
          {isStaff && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{user.role === 'ADMIN' ? 'Admin' : 'CRM'}</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-700" />
            <span className="hidden sm:inline">Cart</span>
            {totalCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-xs font-semibold text-white">
                {totalCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs font-medium text-stone-700 md:flex">
                <User className="h-3.5 w-3.5" />
                {user.name}
              </span>
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
