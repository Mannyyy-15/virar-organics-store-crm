import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ExternalLink, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-stone-500">Checking permissions...</div>;
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SALES_EXECUTIVE')) {
    return <Navigate to="/admin/login" replace />;
  }

  const isAdmin = user.role === 'ADMIN';

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/leads', label: 'Leads (Mini CRM)', icon: Users },
    ...(isAdmin
      ? [
          { to: '/admin/products', label: 'Products & Stock', icon: Package },
          { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f4f6f8]">
      {/* Dedicated Staff Portal Top Bar (Separate from Customer Storefront) */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
        <div className="flex w-full items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#253d4e] text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#253d4e]">
                {isAdmin ? 'Virar Organics — Admin & CRM' : 'Virar Organics — Sales CRM'}
              </h1>
              <p className="text-[11px] text-[#7e7e7e]">
                Signed in as <strong>{user.name}</strong> ({user.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 sm:flex"
            >
              View Storefront <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:px-8 lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full shrink-0 lg:w-60">
          <nav className="flex flex-wrap gap-2 lg:flex-col">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#3bb77e] text-white shadow-xs'
                      : 'bg-white text-[#253d4e] border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
