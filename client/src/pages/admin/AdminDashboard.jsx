import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, IndianRupee, Users, CalendarClock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [todayLeads, setTodayLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/crm/dashboard'),
      apiFetch('/crm/leads?todayFollowUps=true'),
    ])
      .then(([dashRes, leadsRes]) => {
        setMetrics(dashRes.metrics);
        setTodayLeads(leadsRes.leads);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-stone-500">Loading dashboard...</p>;
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <>
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase">Orders Today</span>
                <ShoppingBag className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-2 text-3xl font-bold text-stone-900">{metrics?.ordersToday ?? 0}</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase">Revenue This Month</span>
                <IndianRupee className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-2 text-3xl font-bold text-stone-900">
                ₹{(metrics?.revenueThisMonth ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
          </>
        )}

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase">New Leads</span>
            <Users className="h-4 w-4 text-sky-700" />
          </div>
          <p className="mt-2 text-3xl font-bold text-stone-900">{metrics?.newLeads ?? 0}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase">Today&apos;s Follow-ups</span>
            <CalendarClock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-stone-900">{metrics?.todayFollowUps ?? 0}</p>
        </div>

        {isAdmin && metrics?.lowStockProducts > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-semibold uppercase">Low Stock Alert</span>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-950">
              {metrics.lowStockProducts} product(s) ≤ 5 units
            </p>
            <Link to="/admin/products" className="mt-1 inline-block text-xs font-semibold text-amber-900 underline">
              Manage Stock →
            </Link>
          </div>
        )}
      </div>

      {/* Today's Follow-ups List */}
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Today&apos;s Follow-ups</h2>
          <Link to="/admin/leads" className="text-sm font-medium text-emerald-700 hover:underline">
            View All Leads →
          </Link>
        </div>

        {todayLeads.length === 0 ? (
          <p className="text-sm text-stone-500">No follow-ups scheduled for today.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {todayLeads.map((lead) => (
              <div key={lead.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold text-stone-900">{lead.name}</p>
                  <p className="text-xs text-stone-500">
                    {lead.phone} • {lead.product_name} (Qty: {lead.quantity})
                  </p>
                  {lead.notes && <p className="mt-1 text-xs text-stone-600">Note: {lead.notes}</p>}
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
