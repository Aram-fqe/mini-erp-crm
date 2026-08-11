import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-[#2a2e3a] bg-[#1a1d27] px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[#6c63ff]" />
        <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">
          Enterprise Node Session: Active
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-lg text-[#9aa0ac] hover:bg-[#22262f] hover:text-white transition"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-[#2a2e3a]"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-white">{user?.email}</p>
            <p className="text-[10px] text-[#9aa0ac] capitalize">{user?.role} Access</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition"
            title="Sign out of system"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
