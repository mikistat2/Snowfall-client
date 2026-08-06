import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { useMobileShell } from '../../hooks/useIsMobile';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DURATION_MS = 3200;

const toneClass: Record<ToastTone, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-900 text-white dark:bg-slate-700',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), DURATION_MS);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

/** Anchored above the bottom tab bar so a toast never covers navigation. */
function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  const mobile = useMobileShell();
  if (toasts.length === 0) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 ${
        mobile ? 'bottom-tabbar mb-3' : 'bottom-4'
      }`}
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto max-w-sm rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg ${
            toneClass[toast.tone]
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
