'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const typeStyles: Record<ToastType, { icon: React.ReactNode; bg: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    bg: 'bg-green-500/10 border-green-500/30',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    bg: 'bg-red-500/10 border-red-500/30',
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-400" />,
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
};

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = typeStyles[type];

  return (
    <div className={`toast-enter fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} max-w-sm shadow-lg`}>
      {style.icon}
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="text-muted hover:text-white transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastState {
  message: string;
  type: ToastType;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null);

  function showToast(message: string, type: ToastType = 'info') {
    setToast({ message, type });
  }

  return (
    <>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Expose showToast globally via a simple hook pattern */}
      <button
        className="hidden"
        data-toast-show={true}
        onClick={() => showToast('Test toast', 'success')}
        aria-hidden="true"
      />
    </>
  );
}

// Simple global toast function — attach to window for easy use
declare global {
  interface Window {
    showToast: (message: string, type?: ToastType) => void;
  }
}

// We'll use a simple state management approach instead
let currentToast: { message: string; type: ToastType } | null = null;
let listeners: Array<(toast: typeof currentToast) => void> = [];

export function useToast() {
  const [toast, setToast] = useState<typeof currentToast>(null);

  useEffect(() => {
    const listener = (t: typeof currentToast) => setToast(t);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  function showToast(message: string, type: ToastType = 'info') {
    currentToast = { message, type };
    listeners.forEach(l => l(currentToast));
  }

  function hideToast() {
    currentToast = null;
    listeners.forEach(l => l(null));
  }

  return { toast, showToast, hideToast };
}

export function ToastContainer() {
  const { toast, hideToast } = useToast();

  if (!toast) return null;

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
    />
  );
}
