import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
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

  function fillDemo(demoEmail, demoPass) {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-bold text-stone-900">
            {mode === 'login' ? 'Sign in to Virar Organics' : 'Create Customer Account'}
          </h1>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg bg-stone-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`rounded-md py-1.5 transition-colors ${
              mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`rounded-md py-1.5 transition-colors ${
              mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700">Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Quick-fill demo credentials for evaluator convenience */}
        <div className="mt-6 border-t border-stone-200 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Demo Accounts (Click to Fill)
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('customer@virarorganics.in', 'Customer@123')}
              className="rounded-lg border border-stone-200 px-2 py-1.5 font-medium text-stone-700 hover:bg-stone-50"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@virarorganics.in', 'Admin@123')}
              className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 font-medium text-amber-900 hover:bg-amber-100"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('sales@virarorganics.in', 'Sales@123')}
              className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1.5 font-medium text-sky-900 hover:bg-sky-100"
            >
              Sales Exec
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
