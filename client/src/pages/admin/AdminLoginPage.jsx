import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'ADMIN' && user.role !== 'SALES_EXECUTIVE') {
        setError('Access denied: This portal is for Admin and Sales Executive staff only.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f6f8] px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#253d4e] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold text-[#253d4e]">Virar Organics — Staff Portal</h1>
          <p className="mt-1 text-xs text-[#7e7e7e]">Admin &amp; Sales Executive CRM Login</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#253d4e]">Staff Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@virarorganics.in"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:border-[#3bb77e] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#253d4e]">Password</label>
            <div className="relative mt-1">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 pr-10 text-sm focus:border-[#3bb77e] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#253d4e] py-2.5 text-sm font-bold text-white hover:bg-[#1a2c38] disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {submitting ? 'Signing in...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="mt-6 border-t border-stone-100 pt-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7e7e7e] hover:text-[#3bb77e]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
