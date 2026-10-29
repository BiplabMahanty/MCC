import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle size={16} className="text-success shrink-0" />,
  error: <XCircle size={16} className="text-error shrink-0" />,
  warning: <AlertTriangle size={16} className="text-warning shrink-0" />,
  info: <Info size={16} className="text-icon-blue shrink-0" />,
};

const styles = {
  success: 'border-l-4 border-success bg-success-surface',
  error: 'border-l-4 border-error bg-error-surface',
  warning: 'border-l-4 border-warning bg-warning-surface',
  info: 'border-l-4 border-icon-blue bg-icon-bg-blue',
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type, message, duration = 4000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const toast = {
    success: (msg) => show('success', msg),
    error: (msg) => show('error', msg),
    warning: (msg) => show('warning', msg),
    info: (msg) => show('info', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg bg-card border border-border',
              styles[t.type]
            )}
          >
            {icons[t.type]}
            <p className="flex-1 text-sm text-text-primary">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-text-muted hover:text-text-primary shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
