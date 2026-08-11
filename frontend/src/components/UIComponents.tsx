import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2e3a]">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#9aa0ac] hover:bg-[#22262f] hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const Badge: React.FC<{
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  children: React.ReactNode;
}> = ({ variant = 'primary', children }) => {
  const styles = {
    primary: 'bg-[#6c63ff]/15 text-[#6c63ff] border-[#6c63ff]/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    secondary: 'bg-[#22262f] text-[#9aa0ac] border-[#2a2e3a]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading data...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6c63ff] border-t-transparent"></div>
    <p className="mt-3 text-xs font-medium text-[#9aa0ac]">{message}</p>
  </div>
);
