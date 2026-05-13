import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const { user, loading, login, register } = useAuthStore();

  if (user) return <Navigate to="/app" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-surface p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold text-text mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm text-muted mb-6">
          {mode === 'login' ? 'Sign in to continue to Webimic.' : 'Start analyzing websites in minutes.'}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Full name"
              required
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-text"
            />
          )}

          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            placeholder="Email"
            required
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-text"
          />

          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            placeholder="Password"
            required
            minLength={8}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-text"
          />

          {localError && (
            <div className="text-danger text-xs bg-danger/[0.05] border border-danger/20 rounded-lg p-3">
              {localError}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
          className="mt-4 text-sm text-primary hover:text-primary/80"
        >
          {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
        </button>
      </motion.div>
    </div>
  );
}
