import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Leaf, LogIn, UserPlus, Eye, EyeOff, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(email, password);
      } else {
        user = await register(name, email, password, phone);
      }
      if (user.role === 'ADMIN' || user.role === 'SALES_EXECUTIVE') {
        navigate('/admin');
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-[#ececec] bg-white shadow-sm md:grid-cols-12">
        {/* Left Brand Panel */}
        <div className="flex flex-col justify-between bg-[#d8f1e5] p-8 md:col-span-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3bb77e] text-white">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold text-[#253d4e]">
                Virar <span className="text-[#3bb77e]">Organics</span>
              </span>
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-[#253d4e]">
              {mode === 'login' ? 'Welcome back!' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-[#5c6b66]">
              Sign in to place orders, track deliveries in real time, and manage your organic pantry.
            </p>
          </div>

          <ul className="mt-8 space-y-3 text-xs font-semibold text-[#253d4e]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3bb77e]" /> 100% Certified Organic Products
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#3bb77e]" /> Fast Delivery Across Virar &amp; Mumbai
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#3bb77e]" /> Secure Online &amp; COD Checkout
            </li>
          </ul>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:col-span-7">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-stone-100 p-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-lg py-2 transition-colors ${
                mode === 'login' ? 'bg-white text-[#253d4e] shadow-2xs' : 'text-[#7e7e7e] hover:text-[#253d4e]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`rounded-lg py-2 transition-colors ${
                mode === 'register' ? 'bg-white text-[#253d4e] shadow-2xs' : 'text-[#7e7e7e] hover:text-[#253d4e]'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#253d4e]">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Mehta"
                    className="mt-1 w-full rounded-lg border border-[#ececec] px-3.5 py-2.5 text-sm focus:border-[#3bb77e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#253d4e]">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="mt-1 w-full rounded-lg border border-[#ececec] px-3.5 py-2.5 text-sm focus:border-[#3bb77e] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#253d4e]">Email Address *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-[#ececec] px-3.5 py-2.5 text-sm focus:border-[#3bb77e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#253d4e]">Password *</label>
              <div className="relative mt-1">
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#ececec] px-3.5 py-2.5 pr-10 text-sm focus:border-[#3bb77e] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7e7e7e] hover:text-[#253d4e]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3bb77e] py-3 text-sm font-bold text-white transition-colors hover:bg-[#29a56c] disabled:opacity-60"
            >
              {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#7e7e7e]">
            Need wholesale or bulk pricing?{' '}
            <Link to="/bulk-enquiry" className="font-bold text-[#3bb77e] hover:underline">
              Submit a Bulk Enquiry
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
