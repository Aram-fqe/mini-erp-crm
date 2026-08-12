import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Building2, AlertCircle, User } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0f1117] p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#4834d4] text-white shadow-xl shadow-[#6c63ff]/20">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Create Account</h2>
          <p className="text-xs text-[#9aa0ac]">Join the operations portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-[#9aa0ac]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#9aa0ac]/50 focus:border-[#6c63ff] focus:outline-none transition"
              />
            </div>
          </div>

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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#2a2e3a] text-center">
          <p className="text-sm text-[#9aa0ac]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#6c63ff] hover:text-[#5a52e0] transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
