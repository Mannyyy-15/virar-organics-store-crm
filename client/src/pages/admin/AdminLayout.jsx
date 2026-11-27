import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-stone-500">Checking permissions...</div>;
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SALES_EXECUTIVE')) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'ADMIN';

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/leads', label: 'Leads (CRM)', icon: Users },
    ...(isAdmin
      ? [
          { to: '/admin/products', label: 'Products & Stock', icon: Package },
          { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isAdmin ? 'Admin Panel & Mini CRM' : 'Sales Executive CRM'}
          </h1>
          <p className="text-xs text-stone-500">
            Signed in as <strong>{user.name}</strong> ({user.role})
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-700 text-white'
                    : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
