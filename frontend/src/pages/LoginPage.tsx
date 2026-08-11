import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Building2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('Password123!');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0f1117] p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#4834d4] text-white shadow-xl shadow-[#6c63ff]/20">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Mini ERP + CRM</h2>
          <p className="text-xs text-[#9aa0ac]">Sign in to access your operations portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-[#9aa0ac]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@minierp.com"
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#9aa0ac]/50 focus:border-[#6c63ff] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-[#9aa0ac]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#9aa0ac]/50 focus:border-[#6c63ff] focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6c63ff] py-3 text-sm font-semibold text-white shadow-lg shadow-[#6c63ff]/25 hover:bg-[#5a52e0] focus:outline-none disabled:opacity-50 transition"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Seed User Demo Account Helpers */}
        <div className="pt-4 border-t border-[#2a2e3a]">
          <p className="text-[11px] font-semibold text-[#9aa0ac] uppercase tracking-wider mb-2 text-center">
            Demo Accounts (Click to Autofill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin@minierp.com')}
              className="p-2 rounded-lg bg-[#22262f] text-left text-[#e8eaed] hover:bg-[#2a2e3a] transition"
            >
              <span className="font-bold block text-[#6c63ff]">ADMIN</span>
              admin@minierp.com
            </button>
            <button
              onClick={() => handleQuickLogin('sales@minierp.com')}
              className="p-2 rounded-lg bg-[#22262f] text-left text-[#e8eaed] hover:bg-[#2a2e3a] transition"
            >
              <span className="font-bold block text-emerald-400">SALES</span>
              sales@minierp.com
            </button>
            <button
              onClick={() => handleQuickLogin('warehouse@minierp.com')}
              className="p-2 rounded-lg bg-[#22262f] text-left text-[#e8eaed] hover:bg-[#2a2e3a] transition"
            >
              <span className="font-bold block text-amber-400">WAREHOUSE</span>
              warehouse@minierp.com
            </button>
            <button
              onClick={() => handleQuickLogin('accounts@minierp.com')}
              className="p-2 rounded-lg bg-[#22262f] text-left text-[#e8eaed] hover:bg-[#2a2e3a] transition"
            >
              <span className="font-bold block text-sky-400">ACCOUNTS</span>
              accounts@minierp.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
