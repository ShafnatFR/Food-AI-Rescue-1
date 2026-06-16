import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

class ToastManager {
  private listener: ((toasts: ToastMessage[]) => void) | null = null;
  private toasts: ToastMessage[] = [];

  subscribe(listener: (toasts: ToastMessage[]) => void) {
    this.listener = listener;
  }

  add(message: string, type: ToastType) {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts = [...this.toasts, { id, message, type }];
    if (this.listener) this.listener([...this.toasts]);

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      if (this.listener) this.listener([...this.toasts]);
    }, 3000);
  }
  
  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    if (this.listener) this.listener([...this.toasts]);
  }
}

export const toastManager = new ToastManager();

export const toast = {
  success: (msg: string) => toastManager.add(msg, 'success'),
  error: (msg: string) => toastManager.add(msg, 'error'),
  warning: (msg: string) => toastManager.add(msg, 'warning'),
  info: (msg: string) => toastManager.add(msg, 'info'),
};

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const bgMap = {
  success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900',
  error: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-900',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-900'
};

const textMap = {
  success: 'text-emerald-800 dark:text-emerald-200',
  error: 'text-red-800 dark:text-red-200',
  warning: 'text-amber-800 dark:text-amber-200',
  info: 'text-blue-800 dark:text-blue-200'
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastManager.subscribe(setToasts);
    return () => toastManager.subscribe(() => {});
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right-8 fade-in ${bgMap[t.type]}`}
        >
          <div className="flex-shrink-0 mt-0.5">{iconMap[t.type]}</div>
          <div className={`flex-1 text-sm font-medium ${textMap[t.type]}`}>
            {t.message}
          </div>
          <button
            onClick={() => toastManager.remove(t.id)}
            className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            <X className={`w-4 h-4 ${textMap[t.type]}`} />
          </button>
        </div>
      ))}
    </div>
  );
};
