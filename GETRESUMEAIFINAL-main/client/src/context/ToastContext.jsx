import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title, message) => addToast({ title, message, type: 'success' }),
    error: (title, message) => addToast({ title, message, type: 'error' }),
    info: (title, message) => addToast({ title, message, type: 'info' }),
    ai: (title, message) => addToast({ title, message, type: 'ai' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? 'bg-zinc-950 text-white border-emerald-500/30'
                : t.type === 'error'
                ? 'bg-zinc-950 text-white border-red-500/30'
                : t.type === 'ai'
                ? 'bg-zinc-950 text-white border-orange-500/40 shadow-orange-500/10'
                : 'bg-zinc-950 text-white border-zinc-700'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="text-emerald-400" size={20} />}
              {t.type === 'error' && <AlertCircle className="text-red-400" size={20} />}
              {t.type === 'ai' && <Sparkles className="text-orange-400 animate-pulse" size={20} />}
              {t.type === 'info' && <Info className="text-sky-400" size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-xs font-black tracking-wide uppercase text-zinc-200">{t.title}</h4>}
              {t.message && <p className="text-xs text-zinc-400 font-medium mt-0.5 leading-relaxed">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
