import React from 'react';
import { useNotification, ToastType } from '../../context/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-50',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          border: 'border-amber-500/30',
          bg: 'bg-amber-50 dark:bg-amber-950/90 text-amber-950 dark:text-amber-50',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          border: 'border-rose-500/30',
          bg: 'bg-rose-50 dark:bg-rose-950/90 text-rose-950 dark:text-rose-50',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
          border: 'border-blue-500/30',
          bg: 'bg-blue-50 dark:bg-blue-950/90 text-blue-950 dark:text-blue-50',
        };
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const config = getToastConfig(toast.type);
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${config.bg} ${config.border}`}
          >
            {config.icon}
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold leading-tight">{toast.title}</h5>
              {toast.message && (
                <p className="text-xs opacity-90 mt-0.5 leading-snug line-clamp-3">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
