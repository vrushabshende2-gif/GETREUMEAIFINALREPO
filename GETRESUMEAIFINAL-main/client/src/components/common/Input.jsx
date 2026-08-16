import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs ${
          error 
            ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
            : 'border-black/10 hover:border-black/20 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
        } disabled:opacity-60 disabled:bg-slate-50`}
        {...props}
      />
      {error && (
        <span className="flex items-center gap-1 text-xs font-bold text-rose-500 mt-1 ml-1 animate-in fade-in duration-200">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;

