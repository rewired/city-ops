import { createContext, useContext, useState, useCallback, type ReactNode, type ReactElement } from 'react';
import type { Toast, ToastVariant } from './toastTypes';

interface ToastContextValue {
  readonly toasts: readonly Toast[];
  readonly pushToast: (toast: Omit<Toast, 'id'>) => void;
  readonly dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Exposes the toast management API to consumer components.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  readonly children: ReactNode;
}

const DEFAULT_TOAST_DURATION_MS = 5000;

/**
 * Manages the stack of active toast notifications and provides the logic for auto-dismissal.
 */
export function ToastProvider({ children }: ToastProviderProps): ReactElement {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    
    setToasts((current) => [...current, newToast]);

    const duration = toast.durationMs ?? DEFAULT_TOAST_DURATION_MS;
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, pushToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}
