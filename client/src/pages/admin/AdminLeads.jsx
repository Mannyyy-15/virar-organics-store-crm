import { useEffect, useState } from 'react';
import { CalendarClock, Search, Save } from 'lucide-react';
import { apiFetch } from '../../api';

const LEAD_STATUSES = ['New', 'Contacted', 'Converted', 'Lost'];

const STATUS_STYLE = {
  New: 'bg-sky-50 text-sky-800 border-sky-200',
  Contacted: 'bg-amber-50 text-amber-800 border-amber-200',
  Converted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Lost: 'bg-stone-100 text-stone-600 border-stone-200',
};

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [todayOnly, setTodayOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);

  async function loadLeads() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (todayOnly) params.set('todayFollowUps', 'true');
      if (search.trim()) params.set('search', search.trim());
      const res = await apiFetch(`/crm/leads?${params.toString()}`);
      setLeads(res.leads);
      const initialEdits = {};
      res.leads.forEach((l) => {
        initialEdits[l.id] = {
          status: l.status,
          notes: l.notes || '',
          follow_up_date: l.follow_up_date || '',
        };
      });
      setEdits(initialEdits);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, [statusFilter, todayOnly, search]);

  function updateField(id, field, value) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function saveLead(id) {
    setSavingId(id);
    setError('');
    try {
      const res = await apiFetch(`/crm/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(edits[id]),
      });
      setLeads((prev) => prev.map((l) => (l.id === id ? res.lead : l)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['All', ...LEAD_STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusFilter === st
                  ? 'bg-emerald-700 text-white'
                  : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={() => setTodayOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              todayOnly
                ? 'bg-amber-600 text-white'
                : 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Today&apos;s Follow-ups
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, product..."
            className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-stone-500">Loading leads...</p>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
          No leads match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const draft = edits[lead.id] || {
              status: lead.status,
              notes: lead.notes || '',
              follow_up_date: lead.follow_up_date || '',
            };
            return (
              <div key={lead.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900">{lead.name}</h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          STATUS_STYLE[lead.status] || ''
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-stone-600">
                      {lead.phone} • {lead.email}
                    </p>
                    <p className="mt-1 text-sm font-medium text-emerald-800">
                      Enquiry: {lead.product_name} — Qty: {lead.quantity}
                    </p>
                    {lead.message && (
                      <p className="mt-1 text-xs italic text-stone-600">&ldquo;{lead.message}&rdquo;</p>
                    )}
                  </div>

                  <div className="text-right text-xs text-stone-400">
                    <div>Created: {new Date(lead.created_at).toLocaleDateString()}</div>
                    {lead.assigned_to_name && <div>Staff: {lead.assigned_to_name}</div>}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-stone-100 pt-3 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-stone-500">Status</label>
                    <select
                      value={draft.status}
                      onChange={(e) => updateField(lead.id, 'status', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm"
                    >
                      {LEAD_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-stone-500">Follow-up Date</label>
                    <input
                      type="date"
                      value={draft.follow_up_date}
                      onChange={(e) => updateField(lead.id, 'follow_up_date', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-stone-500">Notes</label>
                    <input
                      type="text"
                      value={draft.notes}
                      onChange={(e) => updateField(lead.id, 'notes', e.target.value)}
                      placeholder="Call summary, quote sent..."
                      className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm"
                    />
                  </div>

                  <div className="flex items-end md:col-span-2">
                    <button
                      disabled={savingId === lead.id}
                      onClick={() => saveLead(lead.id)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {savingId === lead.id ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
